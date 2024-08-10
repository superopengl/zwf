
import { ResourcePage } from '../entity/ResourcePage';
import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import * as moment from 'moment';
import { OrgPromotionCode } from '../entity/OrgPromotionCode';
import * as voucherCodes from 'voucher-code-generator';
import { Subscription } from '../entity/Subscription';
import { Org } from '../entity/Org';
import { db } from '../db';

function generatePromotionCode() {
  const result = voucherCodes.generate({
    length: 8,
    count: 1,
    charset: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  });
  return result[0];
}

export const listPromotionCode = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const {orgId} = req.params;
  const list = await db.getRepository(OrgPromotionCode).findBy({orgId});
  res.json(list);
});

export const savePromotion = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const { code, percentage, endingAt, orgId } = req.body;
  assert(0 < percentage && percentage < 1, 400, `percentage must be between 0 and 1`);
  assert(endingAt && moment(endingAt).isAfter(), 400, 'endingAt must be a future date');

  const promotion = new OrgPromotionCode();
  promotion.code = code;
  promotion.orgId = orgId;
  promotion.percentage = percentage;
  promotion.endingAt = endingAt;
  promotion.createdBy = (req as any).user.id;

  await db.manager.save(promotion);

  res.json();
});

export const newPromotionCode = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');

  let code;
  let existing;
  do {
    code = generatePromotionCode();
    existing = await db.getRepository(OrgPromotionCode).findOne({where: {code}});
  } while (existing);

  res.json(code);
});
