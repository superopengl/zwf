import { getConnection, QueryRunner, getManager, EntityManager } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { getUtcNow } from './getUtcNow';
import * as moment from 'moment';
import { Subscription } from '../entity/Subscription';
import { SubscriptionType } from '../types/SubscriptionType';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { CreditTransaction } from '../entity/CreditTransaction';
import { getNewSubscriptionPaymentInfo } from './getNewSubscriptionPaymentInfo';
import { PaymentStatus } from '../types/PaymentStatus';
import { Payment } from '../entity/Payment';
import { assert } from './assert';
import { OrgAliveSubscription } from '../entity/views/OrgAliveSubscription';
import { getRequestGeoInfo } from './getIpGeoLocation';
import { getOrgIdFromReq } from './getOrgIdFromReq';
import { OrgPaymentMethod } from '../entity/OrgPaymentMethod';
import { chargeStripeForCardPayment, getOrgStripeCustomerId } from '../services/stripeService';
import { User } from '../entity/User';

export type PurchaseSubscriptionRequest = {
  orgId: string;
  seats: number;
  promotionCode: string;
};

export async function purchaseNewSubscriptionWithPrimaryCard(request: PurchaseSubscriptionRequest, expressReq: any) {
  const { orgId, seats, promotionCode } = request;
  assert(orgId, 400, 'orgId is empty');
  assert(seats > 0, 400, 'seats must be positive integer');

  const now = moment.utc();
  const start = now.toDate();
  const end = now.add(1, 'month').add(-1, 'day').toDate();

  await getManager().transaction(async m => {
    // Call stripe to pay
    const stripeCustomerId = await getOrgStripeCustomerId(m, orgId);
    const { creditBalance, price, payable, refundable, paymentMethodId, stripePaymentMethodId } = await getNewSubscriptionPaymentInfo(m, orgId, seats, promotionCode);
    const stripeRawResponse = await chargeStripeForCardPayment(payable, stripeCustomerId, stripePaymentMethodId, true);

    // Terminate current subscription
    await m.update(Subscription, {
      orgId,
      status: SubscriptionStatus.Alive
    }, {
      end: now.toDate(),
      status: SubscriptionStatus.Terminated
    });

    // Create new alive subscription
    const subscription = new Subscription();
    subscription.id = uuidv4();
    subscription.orgId = orgId;
    subscription.type = SubscriptionType.Monthly;
    subscription.start = start;
    subscription.seats = seats;
    subscription.recurring = true;
    subscription.status = SubscriptionStatus.Alive;
    await m.save(subscription);

    // Handle refund credit from current unfinished subscrption
    if(refundable > 0) {
      const refundCreditTransaction = new CreditTransaction();
      refundCreditTransaction.orgId = orgId;
      refundCreditTransaction.amount = refundable;
      refundCreditTransaction.type = 'refund';
      await m.save(refundCreditTransaction);
    }

    // Pay with credit as possible
    let creditTransaction = null;
    if (creditBalance > 0) {
      creditTransaction = new CreditTransaction();
      creditTransaction.orgId = orgId;
      creditTransaction.amount = -1 * (price - payable);
      creditTransaction.type = 'deduct';
      await m.save(creditTransaction);
    }

    // Create payment entity
    const payment = new Payment();
    payment.id = uuidv4();
    payment.orgId = orgId;
    payment.start = start;
    payment.end = end;
    payment.rawResponse = stripeRawResponse;
    payment.paidAt = new Date();
    payment.amount = payable;
    payment.status = PaymentStatus.Paid;
    payment.auto = false;
    payment.geo = await getRequestGeoInfo(expressReq);
    payment.orgPaymentMethodId = paymentMethodId;
    payment.creditTransaction = creditTransaction;
    payment.subscription = subscription;

    await m.save(payment);

    // Update org users to paid
    await m.getRepository(User).update({
      orgId,
    }, {
      paid: true
    });
  });
}




