import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import { Subscription } from '../entity/Subscription';
import { SubscriptionType } from '../types/SubscriptionType';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { CreditTransaction } from '../entity/CreditTransaction';
import { calcNewSubscriptionPaymentInfo } from './calcNewSubscriptionPaymentInfo';
import { PaymentStatus } from '../types/PaymentStatus';
import { Payment } from '../entity/Payment';
import { assert } from './assert';
import { getRequestGeoInfo } from './getIpGeoLocation';
import { chargeStripeForCardPayment, getOrgStripeCustomerId } from '../services/stripeService';
import { User } from '../entity/User';
import { AppDataSource } from '../db';

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

  await AppDataSource.manager.transaction(async m => {
    const { 
      creditBalance, 
      deduction, 
      unitPrice, 
      payable, 
      refundable, 
      paymentMethodId, 
      stripePaymentMethodId 
    } = await calcNewSubscriptionPaymentInfo(m, orgId, seats, promotionCode);

    // Call stripe to pay
    const stripeCustomerId = await getOrgStripeCustomerId(m, orgId);
    const stripeRawResponse = await chargeStripeForCardPayment(payable, stripeCustomerId, stripePaymentMethodId, true);

    // Terminate current subscription
    await m.update(Subscription, {
      orgId,
      status: SubscriptionStatus.Alive
    }, {
      end: start,
      status: SubscriptionStatus.Terminated
    });

    // Create new alive subscription
    const subscription = new Subscription();
    subscription.id = uuidv4();
    subscription.orgId = orgId;
    subscription.type = SubscriptionType.Monthly;
    subscription.start = start;
    subscription.seats = seats;
    subscription.unitPrice = unitPrice;
    subscription.recurring = true;
    subscription.status = SubscriptionStatus.Alive;
    await m.save(subscription);

    // Handle refund credit from current unfinished subscrption
    if (refundable > 0) {
      const refundCreditTransaction = new CreditTransaction();
      refundCreditTransaction.orgId = orgId;
      refundCreditTransaction.amount = Math.abs(refundable);
      refundCreditTransaction.type = 'refund';
      await m.save(refundCreditTransaction);
    }

    // Pay with credit as possible
    let deductCreditTransaction = null;
    if (creditBalance > 0) {
      deductCreditTransaction = new CreditTransaction();
      deductCreditTransaction.orgId = orgId;
      deductCreditTransaction.amount = Math.abs(deduction) * -1;
      deductCreditTransaction.type = 'deduct';
      await m.save(deductCreditTransaction);
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
    payment.creditTransaction = deductCreditTransaction;
    payment.promotionCode = promotionCode;
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




