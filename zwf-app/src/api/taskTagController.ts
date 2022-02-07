
import { getRepository } from 'typeorm';
import { Blog } from '../entity/Blog';
import { TaskTag } from '../entity/TaskTag';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';

export const saveTaskTag = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const orgId = getOrgIdFromReq(req);
  const tag = new TaskTag();
  Object.assign(tag, req.body);
  tag.orgId = orgId;
  await getRepository(TaskTag).save(tag);
  res.json();
});

export const listTaskTags = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const orgId = getOrgIdFromReq(req);
  const list = await getRepository(TaskTag).find({
    where: {
      orgId
    },
    order: { name: 'ASC' }
  });
  res.json(list);
});

export const deleteTaskTag = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const orgId = getOrgIdFromReq(req);
  const { id } = req.params;
  await getRepository(TaskTag).delete({
    id,
    orgId
  });
  res.json();
});