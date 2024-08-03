
import { getRepository, In } from 'typeorm';
import { Tag } from '../entity/Tag';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { generateRandomColorHex } from '../utils/generateRandomColorHex';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';

export const saveTag = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const orgId = getOrgIdFromReq(req);
  const { id, name, colorHex } = req.body;
  const tag = new Tag();
  tag.id = id || uuidv4();
  tag.orgId = orgId;
  tag.name = name;
  tag.colorHex = colorHex || generateRandomColorHex();
  await db.getRepository(Tag).save(tag);
  res.json();
});

export const listTags = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const orgId = getOrgIdFromReq(req);
  const { names } = req.body;
  const list = await db.getRepository(Tag).find({
    where: {
      orgId,
      ...(names?.length ? { names: In(names) } : null),
    },
    select: [
      'id',
      'name',
      'colorHex',
    ],
    order: { createdAt: 'ASC' }
  });
  res.json(list);
});

export const deleteTag = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const orgId = getOrgIdFromReq(req);
  const { id } = req.params;
  await db.getRepository(Tag).delete({
    id,
    orgId
  });
  res.json();
});