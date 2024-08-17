import { SubscriptionStartingMode } from './../../types/SubscriptionStartingMode';
import { SubscriptionBlockType } from '../../types/SubscriptionBlockType';
import { SubscriptionBlock } from '../../entity/SubscriptionBlock';
import { EntityManager } from 'typeorm';
import { OrgPromotionCode } from '../../entity/OrgPromotionCode';
import { OrgCurrentSubscriptionInformation } from '../../entity/views/OrgCurrentSubscriptionInformation';
import * as _ from 'lodash';
import * as moment from 'moment';
import { calcRefundableCurrentSubscriptionBlock } from './calcRefundableCurrentSubscriptionBlock';

describe('calcRefundableCurrentSubscriptionBlock', () => {

  const mMock = {
    save: jest.fn(),
    findOneBy: jest.fn(),
  }
  const m = mMock as unknown as EntityManager;

  afterEach(() => {
    jest.restoreAllMocks();
  })


  describe('head block is a trial block', () => {
    const subInfo = new OrgCurrentSubscriptionInformation();
    subInfo.type = SubscriptionBlockType.Trial;

    it('should refund 0 without saving db', async () => {
      const result = await calcRefundableCurrentSubscriptionBlock(m, subInfo);

      expect(result).toBe(0);
    })
  });

  describe('head block is an overdued block', () => {
    const subInfo = new OrgCurrentSubscriptionInformation();
    subInfo.type = SubscriptionBlockType.OverduePeacePeriod;

    it('should refund 0 without saving db', async () => {
      const result = await calcRefundableCurrentSubscriptionBlock(m, subInfo);

      expect(result).toBe(0);
    })
  });

  describe('head block is a monthly block', () => {
    let mockHeadBlock: SubscriptionBlock;
    let mockPromotionCode: OrgPromotionCode;

    const subInfo = new OrgCurrentSubscriptionInformation();
    subInfo.type = SubscriptionBlockType.Monthly;
    subInfo.orgId = 'fake-orgId';
    subInfo.headBlockId = 'fake-headBlockId';

    mMock.findOneBy.mockImplementation(async (entity, where) => {
      switch (entity) {
        case SubscriptionBlock:
          return mockHeadBlock;
        case OrgPromotionCode:
          return mockPromotionCode;
        default:
          throw new Error(`Not implemented`);
      }
    });

    beforeEach(() => {
      mockHeadBlock = {
        id: 'fake_id',
        subscriptionId: 'fake-subscriptionId',
        orgId: 'fake-orgId',
        type: SubscriptionBlockType.Monthly,
        seats: 3,
        pricePerSeat: 39,
        startedAt: moment().toDate(),
        startingMode: SubscriptionStartingMode.Continuously,
        endingAt: moment().toDate(),
      };
      mockPromotionCode = {
        code: 'fake-code',
        orgId: 'fake-orgId',
        endingAt: moment().add(1, 'days').toDate(),
        percentageOff: 0.15,
        createdBy: 'fake-createdBy',
      };
    });

    describe('it has ended', () => {
      it('should refund 0 without saving db', async () => {
        const result = await calcRefundableCurrentSubscriptionBlock(m, subInfo);

        expect(result).toBe(0);
      })
    })

    describe('its endingAt is past', () => {

      it('should refund 0 without saving db', async () => {
        mockHeadBlock.endingAt = moment().add(1, 'seconds').toDate();

        const result = await calcRefundableCurrentSubscriptionBlock(m, subInfo);

        expect(result).toBe(0);
      })
    })

    describe('it can refund, no promotion code', () => {

      beforeEach(() => {
        mockHeadBlock.promotionCode = null;
      });

      it('should refund deducting one day price if today is the first day', async () => {
        mockHeadBlock.startedAt = moment().toDate();
        mockHeadBlock.endingAt = moment(mockHeadBlock.startedAt).add(30 - 1, 'days').toDate(); // 30 days
        const result = await calcRefundableCurrentSubscriptionBlock(m, subInfo);

        const expectedRefundable = _.floor(39 * (30 - 1) / 30 * mockHeadBlock.seats);
        expect(result).toBe(expectedRefundable);
      })

      it('should refund 0 if today is the last day', async () => {
        mockHeadBlock.endingAt = moment().toDate();
        mockHeadBlock.startedAt = moment(mockHeadBlock.endingAt).add(-30 + 1, 'days').toDate(); // 30 days

        const result = await calcRefundableCurrentSubscriptionBlock(m, subInfo);

        const expectedRefundable = 0;
        expect(result).toBe(expectedRefundable);
      })


      it('should refund unused day based without saving db', async () => {
        mockHeadBlock.startedAt = moment().add(-7, 'days').toDate();
        mockHeadBlock.endingAt = moment(mockHeadBlock.startedAt).add(30 - 1, 'days').toDate(); // 30 days

        const result = await calcRefundableCurrentSubscriptionBlock(m, subInfo);

        const expectedRefundable = _.floor(39 * (30 - 8) / 30 * mockHeadBlock.seats);
        expect(result).toBe(expectedRefundable);
      })
    })


    describe('it can refund, with 15% off promotion code', () => {

      beforeEach(() => {
        mockHeadBlock.promotionCode = 'fake-code';
      });

      it('should refund by deducting one day price if today is the first day', async () => {
        mockHeadBlock.startedAt = moment().toDate();
        mockHeadBlock.endingAt = moment(mockHeadBlock.startedAt).add(30 - 1, 'days').toDate(); // 30 days
        const result = await calcRefundableCurrentSubscriptionBlock(m, subInfo);

        const expectedRefundable = _.floor(0.85 * 39 * (30 - 1) / 30 * mockHeadBlock.seats);
        expect(result).toBe(expectedRefundable);
      })

      it('should refund 0 if today is the last day', async () => {
        mockHeadBlock.endingAt = moment().toDate();
        mockHeadBlock.startedAt = moment(mockHeadBlock.endingAt).add(-30 + 1, 'days').toDate(); // 30 days

        const result = await calcRefundableCurrentSubscriptionBlock(m, subInfo);

        const expectedRefundable = 0;
        expect(result).toBe(expectedRefundable);
      })


      it('should refund unused day based without saving db', async () => {
        mockHeadBlock.startedAt = moment().add(-7, 'days').toDate();
        mockHeadBlock.endingAt = moment(mockHeadBlock.startedAt).add(30 - 1, 'days').toDate(); // 30 days

        const result = await calcRefundableCurrentSubscriptionBlock(m, subInfo);

        const expectedRefundable = _.floor(0.85 * 39 * (30 - 8) / 30 * mockHeadBlock.seats);
        expect(result).toBe(expectedRefundable);
      })
    })
  });

  
});

