import { EntityManager } from 'typeorm';
import { getDiscountInfoFromPromotionCode } from './getDiscountInfoFromPromotionCode';

describe('getDiscountInfoFromPromotionCode', () => {
  let mockGetOne;
  let mMock;
  let m: EntityManager;

  beforeEach(() => {
    mockGetOne = jest.fn();

    mMock = {
      getRepository: () => ({
        createQueryBuilder: () => ({
          where: () => ({
            andWhere: () => ({
              getOne: mockGetOne,
            })
          })
        })
      })
    };
    m = mMock as unknown as EntityManager;
  });

  describe('empty promotion code', () => {
    it('should return 0% off', async () => {
      const { promotionDiscountPercentage, isValidPromotionCode } = await getDiscountInfoFromPromotionCode(m, null);

      expect(promotionDiscountPercentage).toBe(0);
      expect(isValidPromotionCode).toBe(false);
    })
  });

  describe('not existing promotion code', () => {
    it('should return 0% off', async () => {
      mockGetOne.mockResolvedValueOnce(null);
      const { promotionDiscountPercentage, isValidPromotionCode } = await getDiscountInfoFromPromotionCode(m, null);

      expect(promotionDiscountPercentage).toBe(0);
      expect(isValidPromotionCode).toBe(false);
    })
  });

  describe('promotion code with minus per off', () => {
    it('should throw', async () => {
      mockGetOne.mockResolvedValueOnce({ percentageOff: -0.1 });
      await expect(getDiscountInfoFromPromotionCode(m, 'somcode')).rejects.toThrow();
    })
  });

  describe('promotion code with 0 per off', () => {
    it('should throw', async () => {
      mockGetOne.mockResolvedValueOnce({ percentageOff: 0 });
      await expect(getDiscountInfoFromPromotionCode(m, 'somcode')).rejects.toThrow();
    })
  });

  describe('promotion code with 100 per off', () => {
    it('should throw', async () => {
      mockGetOne.mockResolvedValueOnce({ percentageOff: 1 });
      await expect(getDiscountInfoFromPromotionCode(m, 'somcode')).rejects.toThrow();
    })
  });

  describe('promotion code with more than 100 per off', () => {
    it('should throw', async () => {
      mockGetOne.mockResolvedValueOnce({ percentageOff: 1.1 });
      await expect(getDiscountInfoFromPromotionCode(m, 'somcode')).rejects.toThrow();
    })
  });

  describe('value promotion code', () => {
    it('should return correct % off', async () => {
      mockGetOne.mockResolvedValueOnce({ percentageOff: 0.3 });
      const { promotionDiscountPercentage, isValidPromotionCode } = await getDiscountInfoFromPromotionCode(m, 'somecode');

      expect(promotionDiscountPercentage).toBe(0.3);
      expect(isValidPromotionCode).toBe(true);
    })
  });
});