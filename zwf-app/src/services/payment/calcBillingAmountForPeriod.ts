import { OrgSubscriptionPeriod } from '../../entity/OrgSubscriptionPeriod';
import { EntityManager } from 'typeorm';
import * as _ from 'lodash';
import { PaymentRollupInfo } from './PaymentRollupInfo';
import { rollupTicketUsageInPeriod } from './rollupTicketUsageInPeriod';


export async function calcBillingAmountForPeriod(m: EntityManager, period: OrgSubscriptionPeriod): Promise<PaymentRollupInfo> {
  const { amount, payable, payableDays } = await rollupTicketUsageInPeriod(m, period);

  return {
    amount,
    payable,
    payableDays,
  };
}


