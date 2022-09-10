import { EntityManager } from 'typeorm';
import { assert } from '../../utils/assert';
import { CreditTransaction } from '../../entity/CreditTransaction';


export async function handleCreditBalance(m: EntityManager, orgId: string, paymentId: string, refundable: number, deduction: number) {
  assert(deduction >= 0, 500, 'deduction cannot be a negative number');
  assert(refundable >= 0, 500, 'refundable cannot be a negative number');

  const list: CreditTransaction[] = [];
  if (refundable > 0) {
    // Refund first
    const refundCreditTransaction = new CreditTransaction();
    refundCreditTransaction.orgId = orgId;
    refundCreditTransaction.type = 'refund';
    refundCreditTransaction.amount = refundable;
    list.push(refundCreditTransaction);
  }

  if (deduction > 0) {
    const deductCreditTransaction = new CreditTransaction();
    deductCreditTransaction.orgId = orgId;
    deductCreditTransaction.type = 'deduct';
    deductCreditTransaction.paymentId = paymentId;
    deductCreditTransaction.amount = -1 * deduction;
    list.push(deductCreditTransaction);
  }

  if (list.length) {
    await m.save(list);
  }
}
