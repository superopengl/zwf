import { SubscriptionBlock } from '../../entity/SubscriptionBlock';
import { OrgCurrentSubscriptionInformation } from '../../entity/views/OrgCurrentSubscriptionInformation';
import { getCurrentUnitPricePerTicket } from '../../utils/getCurrentUnitPricePerTicket';
import { SubscriptionBlockType } from '../../types/SubscriptionBlockType';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { calcSubscriptionBlockEnding } from '../../utils/calcSubscriptionBlockEnding';
import { SubscriptionStartingMode } from '../../types/SubscriptionStartingMode';

export function createSubscriptionBlock(
  subInfo: OrgCurrentSubscriptionInformation,
  type: SubscriptionBlockType,
  startingMode: SubscriptionStartingMode) {
  const { orgId, seats, promotionCode, subscriptionId, headBlockId, endingAt } = subInfo;

  const block = new SubscriptionBlock();
  block.id = uuidv4();
  block.orgId = orgId;
  block.parentBlockId = headBlockId;
  block.seats = seats;
  block.promotionCode = promotionCode;
  block.seatPrice = getCurrentUnitPricePerTicket();
  block.subscriptionId = subscriptionId;
  block.type = type;
  block.startingMode = startingMode;
  if (startingMode === SubscriptionStartingMode.Continuously) {
    block.startedAt = endingAt;
    block.endingAt = calcSubscriptionBlockEnding(block.startedAt);
  } else if (startingMode === SubscriptionStartingMode.Rightaway) {
    const now = moment();
    block.startedAt = now.toDate();
    block.endingAt = calcSubscriptionBlockEnding(now);
  }

  return block;
}

