import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import { Subscription } from '../entity/Subscription';
import { SubscriptionBlockType } from '../types/SubscriptionBlockType';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { CreditTransaction } from '../entity/CreditTransaction';
import { calcNewSubscriptionPaymentInfo } from './calcNewSubscriptionPaymentInfo';
import { PaymentStatus } from '../types/PaymentStatus';
import { Payment } from '../entity/Payment';
import { assert } from './assert';
import { chargeStripeForCardPayment, getOrgStripeCustomerId } from '../services/stripeService';
import { db } from '../db';
import { SubscriptionBlock } from '../entity/SubscriptionBlock';
import { OrgCurrentSubscriptionInformation } from '../entity/views/OrgCurrentSubscriptionInformation';
import { refundCurrentSubscriptionBlock } from './refundCurrentSubscriptionBlock';
import { createSubscriptionBlock } from '../../endpoints/helpers/createSubscriptionBlock';
import { paySubscriptionBlock } from './paySubscriptionBlock';

export type PurchaseSubscriptionRequest = {
  orgId: string;
  seats: number;
  promotionCode: string;
};

export async function purchaseNewSubscriptionWithPrimaryCard(request: PurchaseSubscriptionRequest, geoInfo = null) {
  const { orgId, seats, promotionCode } = request;
  assert(orgId, 400, 'orgId is empty');
  assert(seats > 0, 400, 'seats must be positive integer');

  await db.manager.transaction(async m => {
    const subInfo = await m.findOneBy(OrgCurrentSubscriptionInformation, { orgId });

    await refundCurrentSubscriptionBlock(m, subInfo, { real: true });

    const block = createSubscriptionBlock(subInfo, SubscriptionBlockType.Monthly, 'rightaway');
    block.seats = seats;
    block.promotionCode = promotionCode;

    await paySubscriptionBlock(m, block, { real: true });
  });

}




