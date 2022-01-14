import { EntityManager } from 'typeorm';
import { CreditTransaction } from '../entity/CreditTransaction';
import * as _ from 'lodash';

export async function getCreditBalance(m: EntityManager, orgId: string) {
  const result = await m.getRepository(CreditTransaction)
    .createQueryBuilder()
    .where({ orgId })
    .select('SUM(amount) as total')
    .getRawOne();

  return _.round(+(result?.total) || 0, 2);
}
