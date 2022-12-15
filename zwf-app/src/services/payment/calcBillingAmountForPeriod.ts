import { OrgSubscriptionPeriod } from '../../entity/OrgSubscriptionPeriod';
import { EntityManager } from 'typeorm';
import { OrgPaymentMethod } from '../../entity/OrgPaymentMethod';
import * as _ from 'lodash';
import { PaymentRollupInfo } from './PaymentRollupInfo';
import { rollupTicketUsageInPeriod } from './rollupTicketUsageInPeriod';


export async function calcBillingAmountForPeriod(m: EntityManager, period: OrgSubscriptionPeriod): Promise<PaymentRollupInfo> {
  const { orgId } = period;
  const primaryPaymentMethod = await m.findOneOrFail(OrgPaymentMethod, { where: { orgId, primary: true } });
  const paymentMethodId = primaryPaymentMethod.id;
  const stripePaymentMethodId = primaryPaymentMethod.stripePaymentMethodId;

  const { amount, payable } = await rollupTicketUsageInPeriod(m, period);

  return {
    amount,
    payable,
    paymentMethodId,
    stripePaymentMethodId,
  };
}

