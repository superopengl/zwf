
import { getRepository, In } from 'typeorm';
import { TaskTag } from '../entity/TaskTag';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { generateRandomColorHex } from '../utils/generateRandomColorHex';
import { v4 as uuidv4 } from 'uuid';

export const saveTaskTag = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const orgId = getOrgIdFromReq(req);
  const { id, name, colorHex } = req.body;
  const tag = new TaskTag();
  tag.id = id || uuidv4();
  tag.orgId = orgId;
  tag.name = name;
  tag.colorHex = colorHex || generateRandomColorHex();
  await getRepository(TaskTag).save(tag);
  res.json();
});

export const listTaskTags = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const orgId = getOrgIdFromReq(req);
  const { names } = req.body;
  const list = await getRepository(TaskTag).find({
    where: {
      orgId,
      ...(names?.length ? { names: In(names) } : null),
    },
    select: [
      'id',
      'name',
      'colorHex',
    ],
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