import { EntityManager } from 'typeorm';
import { assert } from '../../utils/assert';
import { CreditTransaction } from '../../entity/CreditTransaction';
import { handleCreditBalance } from './handleCreditBalance';


describe('handleCreditBalance', () => {
  let mockSave = jest.fn();
  let mMock;
  let m: EntityManager;
  const orgId = 'fake-orgId';
  const paymentId = 'fake-paymentId';

  beforeEach(() => {
    mockSave = jest.fn();

    mMock = {
      save: mockSave,
    };
    m = mMock as unknown as EntityManager;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('minor refundable', () => {
    it('should throw', async () => {
      await expect(handleCreditBalance(m, orgId, paymentId, -1, 100)).rejects.toThrow();
    })
  });

  describe('minor deduction', () => {
    it('should throw', async () => {
      await expect(handleCreditBalance(m, orgId, paymentId, 299, -2)).rejects.toThrow();
    })
  });

  describe('0 refundable and 0 deduction', () => {
    it('should save nothing', async () => {
      const refundable = 0;
      const deduction = 0;
      await handleCreditBalance(m, orgId, paymentId, refundable, deduction);
      expect(mockSave).not.toHaveBeenCalled();
    })
  });

  describe('10 refundable and 0 deduction', () => {
    it('should only save refundable', async () => {
      const refundable = 10;
      const deduction = 0;
      await handleCreditBalance(m, orgId, paymentId, refundable, deduction);
      expect(mockSave).toHaveBeenCalledWith([{
        orgId,
        type: 'refund',
        amount: 10
      } as CreditTransaction]);
    })
  });

  describe('0 refundable and 99.9 deduction', () => {
    it('should only save deduction', async () => {
      const refundable = 0;
      const deduction = 99.9;
      await handleCreditBalance(m, orgId, paymentId, refundable, deduction);
      expect(mockSave).toHaveBeenCalledWith([{
        orgId,
        type: 'deduct',
        paymentId,
        amount: -99.9
      } as CreditTransaction]);
    })
  });

  describe('10 refundable and 99.9 deduction', () => {
    it('should save both refundable and deduction', async () => {
      const refundable = 10;
      const deduction = 99.9;
      await handleCreditBalance(m, orgId, paymentId, refundable, deduction);
      expect(mockSave).toHaveBeenCalledWith([
        {
          orgId,
          type: 'refund',
          amount: 10
        } as CreditTransaction, {
          orgId,
          type: 'deduct',
          paymentId,
          amount: -99.9
        } as CreditTransaction]);
    })
  });
})