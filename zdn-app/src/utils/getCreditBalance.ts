import { EntityManager } from 'typeorm';
import { CreditTransaction } from '../entity/CreditTransaction';

export async function getCreditBalance(m: EntityManager, orgId: string) {
  const result = await m.getRepository(CreditTransaction)
    .createQueryBuilder()
    .where({ orgId })
    .select('SUM(amount)::NUMERIC(2) as total')
    .getRawOne();

  return +(result?.total) || 0;
}
