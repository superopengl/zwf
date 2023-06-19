import { db } from './../db';

import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import { SystemConfig } from '../entity/SystemConfig';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';

export const listConfig = handlerWrapper(async (req, res) => {
  assertRole(req, ['system']);
  const list = await db.getRepository(SystemConfig).find({
    order: { key: 'ASC' }
  });
  res.json(list);
});

export const saveConfig = handlerWrapper(async (req, res) => {
  assertRole(req, ['system']);
  const { key, value } = req.body;
  assert(key?.trim(), 400, 'key is empty');

  await db
    .createQueryBuilder()
    .insert()
    .into(SystemConfig)
    .values({ key, value })
    .orUpdate(['value'], ['key'])
    .execute();

  res.json();
});
