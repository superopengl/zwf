import { EntityManager } from 'typeorm';
import { assert } from '../../utils/assert';
import { CreditTransaction } from '../../entity/CreditTransaction';


export async function handleCreditBalance(m: EntityManager, orgId: string, paymentId: string, refundable: number, deduction: number) {
  if (refundable) {
    // Refund first
    const refundCreditTransaction = new CreditTransaction();
    refundCreditTransaction.orgId = orgId;
    refundCreditTransaction.type = 'refund';
    refundCreditTransaction.amount = refundable;
    await m.save(refundCreditTransaction);
  }

  if (deduction === 0) {
    return;
  }

  assert(deduction > 0, 500, 'deduction cannot be a negative number');

  const deductCreditTransaction = new CreditTransaction();
  deductCreditTransaction.orgId = orgId;
  deductCreditTransaction.type = 'deduct';
  deductCreditTransaction.paymentId = paymentId;
  deductCreditTransaction.amount = -1 * deduction;
  await m.save(deductCreditTransaction);
}
