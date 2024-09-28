import { EntityManager } from 'typeorm';
import { OrgPaymentMethod } from '../../entity/OrgPaymentMethod';
import * as _ from 'lodash';
import { PaymentRollupInfo } from './PaymentRollupInfo';
import { Payment } from '../../entity/Payment';
import moment = require('moment');
import { rollupTicketUsageInPeriod } from './rollupTicketUsageInPeriod';


export async function calcBillingAmountForPayment(m: EntityManager, payment: Payment): Promise<PaymentRollupInfo> {
  const { orgId, periodFrom, periodTo } = payment;
  const {amount, payable} = await rollupTicketUsageInPeriod(m, orgId, periodFrom, periodTo);

  const primaryPaymentMethod = await m.findOne(OrgPaymentMethod, { where: { orgId, primary: true } });
  const paymentMethodId = primaryPaymentMethod?.id;
  const stripePaymentMethodId = primaryPaymentMethod?.stripePaymentMethodId;

  return {
    amount,
    payable,
    paymentMethodId,
    stripePaymentMethodId,
  } as PaymentRollupInfo;
}


