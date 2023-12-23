
import { getRepository } from 'typeorm';
import { Blog } from '../entity/Blog';
import { UserTag } from '../entity/UserTag';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';

export const saveUserTag = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const orgId = getOrgIdFromReq(req);
  const tag = new UserTag();
  Object.assign(tag, req.body);
  tag.orgId = orgId;
  await getRepository(UserTag).save(tag);
  res.json();
});

export const listUserTags = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const orgId = getOrgIdFromReq(req);
  const list = await getRepository(UserTag).find({
    where: {
      orgId
    },
    order: { name: 'ASC' }
  });
  res.json(list);
});

export const deleteUserTag = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const orgId = getOrgIdFromReq(req);
  const { id } = req.params;
  await getRepository(UserTag).delete({
    id,
    orgId
  });
  res.json();
});