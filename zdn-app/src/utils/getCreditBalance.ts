import { getRepository, EntityManager } from 'typeorm';
import { CreditTransaction } from '../entity/CreditTransaction';

export async function getCreditBalance(m: EntityManager, orgId: string) {
  const result = await m.getRepository(CreditTransaction)
    .createQueryBuilder()
    .where({ orgId })
    .select('SUM(amount) as total')
    .execute();

  return +(result[0]?.total) || 0;
}
