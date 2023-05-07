import { db } from '../db';
import { DocTemplate } from '../entity/DocTemplate';
import { getUtcNow } from '../utils/getUtcNow';

import { EntityManager, In } from 'typeorm';
import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { handlerWrapper } from '../utils/asyncHandler';
import { getNow } from '../utils/getNow';
import { Femplate } from '../entity/Femplate';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { Role } from '../types/Role';
import { isRole } from '../utils/isRole';
import { validateFormFields } from '../utils/validateFormFields';

export const saveFemplate = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'agent', 'admin']);
  const orgId = getOrgIdFromReq(req);

  const { id, name, description, fields } = req.body;
  assert(name, 400, 'name is empty');
  validateFormFields(fields);

  await db.manager.transaction(async m => {
    const femplate = new Femplate();
    femplate.id = id || uuidv4();
    femplate.orgId = orgId;
    femplate.name = name;
    femplate.description = description;
    femplate.fields = fields;

    await m.save(femplate);
  });

  res.json();
});


export const renameFemplate = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'admin', 'agent']);
  const { name } = req.body;
  assert(name, 400, 'name is empty');
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);

  await db.getRepository(Femplate).update({ id, orgId }, { name });

  res.json();
});


export const listFemplates = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'admin', 'agent']);
  const orgId = getOrgIdFromReq(req);
  const list = await db.getRepository(Femplate)
    .find({
      where: {
        orgId
      },
      order: {
        name: 'ASC'
      }
    });

  res.json(list);
});

export const getFemplate = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'admin', 'client', 'agent']);
  const { id } = req.params;
  const query = isRole(req, Role.Client) ? { id } : { id, orgId: getOrgIdFromReq(req) };
  const femplate = await db.getRepository(Femplate).findOne({ where: query });
  assert(femplate, 404);

  res.json(femplate);
});

export const deleteFemplate = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'admin']);
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);
  const repo = db.getRepository(Femplate);
  await repo.delete({ id, orgId });

  res.json();
});

async function getUniqueCopyName(m: EntityManager, sourceFemplate: Femplate) {
  let round = 1;
  const { orgId, name } = sourceFemplate;
  while (true) {
    const tryName = round === 1 ? `Copy of ${name}` : `Copy ${round} of ${name}`;
    const existing = await m.findOne(Femplate, { where: { name: tryName, orgId } });
    if (!existing) {
      return tryName;
    }
    round++;
  }
}

export const duplicateFemplate = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'admin']);
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);
  let femplate: Femplate;
  await db.transaction(async m => {
    femplate = await m.findOne(Femplate, { where: { id, orgId } });
    assert(femplate, 404);

    const newFemplateId = uuidv4();
    femplate.id = newFemplateId;
    femplate.createdAt = getUtcNow();
    femplate.updatedAt = getUtcNow();
    femplate.name = await getUniqueCopyName(m, femplate);

    await m.save(femplate);
  });

  res.json(femplate);
});


