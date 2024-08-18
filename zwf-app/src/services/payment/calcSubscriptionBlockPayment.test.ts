import { SubscriptionBlock } from '../../entity/SubscriptionBlock';
import { OrgCurrentSubscriptionInformation } from '../../entity/views/OrgCurrentSubscriptionInformation';
import { SubscriptionStartingMode } from '../../types/SubscriptionStartingMode';
import { SubscriptionBlockType } from '../../types/SubscriptionBlockType';
import { getCreditBalance } from '../../utils/getCreditBalance';
import { EntityManager, MoreThan } from 'typeorm';
import { assert } from '../../utils/assert';
import { OrgPromotionCode } from '../../entity/OrgPromotionCode';
import { OrgPaymentMethod } from '../../entity/OrgPaymentMethod';
import * as _ from 'lodash';
import { calcSubscriptionBlockPayment } from './calcSubscriptionBlockPayment';
import { getDiscountInfoFromPromotionCode } from './getDiscountInfoFromPromotionCode';
import { calcRefundableCurrentSubscriptionBlock } from './calcRefundableCurrentSubscriptionBlock';
import { createSubscriptionBlock } from './createSubscriptionBlock';
import moment = require('moment');

jest.mock('./getDiscountInfoFromPromotionCode', () => ({
  getDiscountInfoFromPromotionCode: jest.fn()
}))

jest.mock('./calcRefundableCurrentSubscriptionBlock', () => ({
  calcRefundableCurrentSubscriptionBlock: jest.fn()
}))

jest.mock('../../utils/getCreditBalance', () => ({
  getCreditBalance: jest.fn()
}))

describe('calcSubscriptionBlockPayment', () => {
  let mockFindOne;
  let mMock;
  let m: EntityManager;
  const subInfo: OrgCurrentSubscriptionInformation = {
    subscriptionId: 'fake-subscriptionId',
    orgId: 'fake-orgId',
    type: SubscriptionBlockType.Monthly,
    promotionCode: 'ABC',
    seats: 3,
    unitPrice: 39,
    startedAt: moment().toDate(),
    endingAt: moment().toDate(),
    headBlockId: 'fake-headBlockId',
    occupiedSeats: 1,
    enabled: true,
  };
  const monthlyContinuouslyBlock = createSubscriptionBlock(subInfo, SubscriptionBlockType.Monthly, SubscriptionStartingMode.Continuously);

  beforeEach(() => {
    mockFindOne = jest.fn();

    mMock = {
      findOne: jest.fn().mockResolvedValue({ id: 'fake-paymentMethodId', stripePaymentMethodId: 'fake-stripePaymentMethodId' }),
    };

    m = mMock as unknown as EntityManager;
  });

  afterEach(() => {
    jest.resetAllMocks();
  })

  describe('a trial block', () => {
    it('should throw', async () => {
      (getDiscountInfoFromPromotionCode as any).mockResolvedValue({ promotionDiscountPercentage: 0, isValidPromotionCode: false });
      (calcRefundableCurrentSubscriptionBlock as any).mockResolvedValue(0);
      (getCreditBalance as any).mockResolvedValue(0);
      const trialBlock = {
        ...monthlyContinuouslyBlock,
        type: SubscriptionBlockType.Trial,
      }
      await expect(calcSubscriptionBlockPayment(m, subInfo, trialBlock)).rejects.toThrow();
    })
  })

  describe('a monthly block', () => {

    describe('no discount, no refund, no credit balance, continueously purchase', () => {
      it('should return', async () => {
        (getDiscountInfoFromPromotionCode as any).mockResolvedValue({ promotionDiscountPercentage: 0, isValidPromotionCode: false });
        (calcRefundableCurrentSubscriptionBlock as any).mockResolvedValue(0);
        (getCreditBalance as any).mockResolvedValue(0);
        const result = await calcSubscriptionBlockPayment(m, subInfo, monthlyContinuouslyBlock);

        expect(result).toEqual({
          pricePerSeat: 39,
          refundable: 0,
          fullPriceBeforeDiscount: 39 * 3,
          fullPriceAfterDiscount: 39 * 3,
          isValidPromotionCode: false,
          promotionDiscountPercentage: 0,
          creditBalanceBefore: 0,
          creditBalanceAfter: 0,
          deduction: 0,
          payable: 39 * 3,
          paymentMethodId: 'fake-paymentMethodId',
          stripePaymentMethodId: 'fake-stripePaymentMethodId',
        })
      })
    })

    describe('13% discount, no refund, no credit balance, continueously purchase', () => {
      it('should return discounted ammount', async () => {
        (getDiscountInfoFromPromotionCode as any).mockResolvedValue({ promotionDiscountPercentage: 0.13, isValidPromotionCode: true });
        (calcRefundableCurrentSubscriptionBlock as any).mockResolvedValue(0);
        (getCreditBalance as any).mockResolvedValue(0);
        const result = await calcSubscriptionBlockPayment(m, subInfo, monthlyContinuouslyBlock);

        expect(result).toEqual({
          pricePerSeat: 39,
          refundable: 0,
          fullPriceBeforeDiscount: 39 * 3,
          fullPriceAfterDiscount: 39 * 3 * (1 - 0.13),
          isValidPromotionCode: true,
          promotionDiscountPercentage: 0.13,
          creditBalanceBefore: 0,
          creditBalanceAfter: 0,
          deduction: 0,
          payable: 39 * 3 * (1 - 0.13),
          paymentMethodId: 'fake-paymentMethodId',
          stripePaymentMethodId: 'fake-stripePaymentMethodId',
        })
      })
    })

    describe('13% discount, 10 refund, no credit balance, continueously purchase', () => {
      it('should return discounted ammount without refund', async () => {
        (getDiscountInfoFromPromotionCode as any).mockResolvedValue({ promotionDiscountPercentage: 0.13, isValidPromotionCode: true });
        (calcRefundableCurrentSubscriptionBlock as any).mockResolvedValueOnce(10);
        (getCreditBalance as any).mockResolvedValue(0);

        const block = {
          ...monthlyContinuouslyBlock,
          startingMode: SubscriptionStartingMode.Continuously,
        }
        const result = await calcSubscriptionBlockPayment(m, subInfo, block);
        expect(result).toEqual({
          pricePerSeat: 39,
          refundable: 0,
          fullPriceBeforeDiscount: 39 * 3,
          fullPriceAfterDiscount: 39 * 3 * (1 - 0.13),
          isValidPromotionCode: true,
          promotionDiscountPercentage: 0.13,
          creditBalanceBefore: 0,
          creditBalanceAfter: 0,
          deduction: 0,
          payable: 39 * 3 * (1 - 0.13),
          paymentMethodId: 'fake-paymentMethodId',
          stripePaymentMethodId: 'fake-stripePaymentMethodId',
        })

        expect(calcRefundableCurrentSubscriptionBlock).not.toHaveBeenCalled();
      })
    })

    describe('13% discount, 0 refund, 1000 credit balance, continueously purchase', () => {
      it('should return discounted ammount without refund', async () => {
        (getDiscountInfoFromPromotionCode as any).mockResolvedValue({ promotionDiscountPercentage: 0.13, isValidPromotionCode: true });
        (calcRefundableCurrentSubscriptionBlock as any).mockResolvedValueOnce(10);
        (getCreditBalance as any).mockResolvedValue(1000);

        const block = {
          ...monthlyContinuouslyBlock,
          startingMode: SubscriptionStartingMode.Continuously,
        }
        const result = await calcSubscriptionBlockPayment(m, subInfo, block);
        expect(result).toEqual({
          pricePerSeat: 39,
          refundable: 0,
          fullPriceBeforeDiscount: 39 * 3,
          fullPriceAfterDiscount: 39 * 3 * (1 - 0.13),
          isValidPromotionCode: true,
          promotionDiscountPercentage: 0.13,
          creditBalanceBefore: 1000,
          creditBalanceAfter: 1000 - 39 * 3 * (1 - 0.13),
          deduction: 39 * 3 * (1 - 0.13),
          payable: 0,
          paymentMethodId: 'fake-paymentMethodId',
          stripePaymentMethodId: 'fake-stripePaymentMethodId',
        })

        expect(calcRefundableCurrentSubscriptionBlock).not.toHaveBeenCalled();
      })
    })

    describe('no discount, 333.3 refund, 1000 credit balance, rightaway purchase', () => {
      it('should return discounted ammount without refund', async () => {
        (getDiscountInfoFromPromotionCode as any).mockResolvedValue({ promotionDiscountPercentage: 0, isValidPromotionCode: false });
        (calcRefundableCurrentSubscriptionBlock as any).mockResolvedValueOnce(333.3);
        (getCreditBalance as any).mockResolvedValue(1000);

        const block = {
          ...monthlyContinuouslyBlock,
          startingMode: SubscriptionStartingMode.Rightaway,
        }
        const result = await calcSubscriptionBlockPayment(m, subInfo, block);
        expect(result).toEqual({
          pricePerSeat: 39,
          refundable: 333.3,
          fullPriceBeforeDiscount: 39 * 3,
          fullPriceAfterDiscount: 39 * 3,
          isValidPromotionCode: false,
          promotionDiscountPercentage: 0,
          creditBalanceBefore: 1000,
          creditBalanceAfter: 1333.3 - 39 * 3,
          deduction: 39 * 3,
          payable: 0,
          paymentMethodId: 'fake-paymentMethodId',
          stripePaymentMethodId: 'fake-stripePaymentMethodId',
        })
      })
    })

    describe('no discount, 100 refund, 9 credit balance, rightaway purchase', () => {
      it('should return discounted ammount without refund', async () => {
        (getDiscountInfoFromPromotionCode as any).mockResolvedValue({ promotionDiscountPercentage: 0, isValidPromotionCode: false });
        (calcRefundableCurrentSubscriptionBlock as any).mockResolvedValueOnce(100);
        (getCreditBalance as any).mockResolvedValue(9);

        const block = {
          ...monthlyContinuouslyBlock,
          startingMode: SubscriptionStartingMode.Rightaway,
        }
        const result = await calcSubscriptionBlockPayment(m, subInfo, block);
        expect(result).toEqual({
          pricePerSeat: 39,
          refundable: 100,
          fullPriceBeforeDiscount: 39 * 3,
          fullPriceAfterDiscount: 39 * 3,
          isValidPromotionCode: false,
          promotionDiscountPercentage: 0,
          creditBalanceBefore: 9,
          creditBalanceAfter: 0,
          deduction: 9 + 100,
          payable: 39 * 3 - (9 + 100),
          paymentMethodId: 'fake-paymentMethodId',
          stripePaymentMethodId: 'fake-stripePaymentMethodId',
        })
      })
    })

    describe('13% discount, 10.9 refund, no credit balance, rightaway purchase', () => {
      it('should return discounted ammount without refund', async () => {
        (getDiscountInfoFromPromotionCode as any).mockResolvedValue({ promotionDiscountPercentage: 0.13, isValidPromotionCode: true });
        (calcRefundableCurrentSubscriptionBlock as any).mockResolvedValueOnce(10.9);
        (getCreditBalance as any).mockResolvedValue(0);

        const block = {
          ...monthlyContinuouslyBlock,
          startingMode: SubscriptionStartingMode.Rightaway,
        }
        const result = await calcSubscriptionBlockPayment(m, subInfo, block);
        expect(result).toEqual({
          pricePerSeat: 39,
          refundable: 10.9,
          fullPriceBeforeDiscount: 39 * 3,
          fullPriceAfterDiscount: 39 * 3 * (1 - 0.13),
          isValidPromotionCode: true,
          promotionDiscountPercentage: 0.13,
          creditBalanceBefore: 0,
          creditBalanceAfter: 0,
          deduction: 10.9,
          payable: 39 * 3 * (1 - 0.13) - 10.9,
          paymentMethodId: 'fake-paymentMethodId',
          stripePaymentMethodId: 'fake-stripePaymentMethodId',
        })
      })
    })



  })

});
