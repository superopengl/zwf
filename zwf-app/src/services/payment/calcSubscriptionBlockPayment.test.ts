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
  const block = createSubscriptionBlock(subInfo, SubscriptionBlockType.Monthly, SubscriptionStartingMode.Continuously);

  beforeEach(() => {
    mockFindOne = jest.fn();

    mMock = {
      findOne: jest.fn().mockResolvedValue({ id: 'fake-paymentMethodId', stripePaymentMethodId: 'fake-stripePaymentMethodId' }),
    };

    m = mMock as unknown as EntityManager;
  });


  describe('no discount, no refund, no credit balance, continueously purchase', () => {
    it('should return', async () => {
      (getDiscountInfoFromPromotionCode as any).mockResolvedValue({promotionDiscountPercentage: 0, isValidPromotionCode: false});
      (calcRefundableCurrentSubscriptionBlock as any).mockResolvedValue(0);
      (getCreditBalance as any).mockResolvedValue(0);
      const result = await calcSubscriptionBlockPayment(m, subInfo, block);

      expect(result).toEqual({
        pricePerSeat: 39,
        refundable: 0,
        fullPriceBeforeDiscount: 39 * 3,
        fullPriceAfterDiscount: 39 * 3,
        isValidPromotionCode: false,
        promotionDiscountPercentage: 0,
        creditBalance: 0,
        deduction: 0,
        payable: 39 * 3,
        paymentMethodId: 'fake-paymentMethodId',
        stripePaymentMethodId: 'fake-stripePaymentMethodId',
      })
    })
  })
});
