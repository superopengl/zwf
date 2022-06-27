
import { ResourcePage } from '../entity/ResourcePage';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import * as moment from 'moment';
import { OrgPromotionCode } from '../entity/OrgPromotionCode';
import * as voucherCodes from 'voucher-code-generator';
import { Subscription } from '../entity/Subscription';
import { Org } from '../entity/Org';
import { AppDataSource } from '../db';

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
  const list = await AppDataSource.getRepository(OrgPromotionCode)
    .createQueryBuilder('p')
    .leftJoin(Subscription, 's', 'p.code = s."promotionCode"')
    .leftJoin(Org, 'o', 's."orgId" = o.id')
    .select([
      'p.*',
      `s.type as type`,
      `s.seats as seats`,
      `o.id as "orgId"`,
      `o.name as "orgName"`
    ])
    .execute();
  res.json(list);
});

export const savePromotion = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const { code, percentage, end, orgId } = req.body;
  assert(0 < percentage && percentage < 1, 400, `percentage must be between 0 and 1`);
  assert(moment(end).isAfter(), 400, 'end must be a future date');

  const promotion = new OrgPromotionCode();
  promotion.code = code;
  promotion.orgId = orgId;
  promotion.percentage = percentage;
  promotion.end = end;
  promotion.createdBy = (req as any).user.id;

  await AppDataSource.manager.save(promotion);

  res.json();
});

export const newPromotionCode = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');

  let code;
  let existing;
  do {
    code = generatePromotionCode();
    existing = await AppDataSource.getRepository(OrgPromotionCode).findOne({where: {code}});
  } while (existing);

  res.json(code);
});
