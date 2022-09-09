import { SubscriptionBlock } from '../../src/entity/SubscriptionBlock';
import { OrgCurrentSubscriptionInformation } from '../../src/entity/views/OrgCurrentSubscriptionInformation';
import { getCurrentPricePerSeat } from '../../src/utils/getCurrentPricePerSeat';
import { SubscriptionBlockType } from '../../src/types/SubscriptionBlockType';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { calcSubscriptionBlockEnding } from '../../src/utils/calcSubscriptionBlockEnding';

export function createSubscriptionBlock(subInfo: OrgCurrentSubscriptionInformation, type: SubscriptionBlockType, startingMode: 'continuously' | 'rightaway') {
  const { orgId, seats, promotionCode, subscriptionId, headBlockId, endingAt } = subInfo;

  const block = new SubscriptionBlock();
  block.id = uuidv4();
  block.orgId = orgId;
  block.parentBlockId = headBlockId;
  block.seats = seats;
  block.promotionCode = promotionCode;
  block.pricePerSeat = getCurrentPricePerSeat();
  block.subscriptionId = subscriptionId;
  block.type = type;
  if (startingMode === 'continuously') {
    block.startedAt = endingAt;
    block.endingAt = calcSubscriptionBlockEnding(block.startedAt);
  } else if (startingMode === 'rightaway') {
    const now = moment();
    block.startedAt = now.toDate();
    block.endingAt = calcSubscriptionBlockEnding(now);
  }

  return block;
}

