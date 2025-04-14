import { db } from './../db';
import { getUtcNow } from './../utils/getUtcNow';

import { EntityManager } from 'typeorm';
import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { handlerWrapper } from '../utils/asyncHandler';
import { getNow } from '../utils/getNow';
import { DocTemplate } from '../entity/DocTemplate';
import * as moment from 'moment';
import { uploadToS3 } from '../utils/uploadToS3';
import { File } from '../entity/File';
import * as md5 from 'md5';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { isRole } from '../utils/isRole';
import { Role } from '../types/Role';

function extractVariables(html: string) {
  const pattern = /\{\{[a-zA-Z0-9 ]+\}\}/ig;
  const all = (html.match(pattern) || []).map(x => x.replace(/^\{\{/, '').replace(/\}\}$/, ''));
  const set = new Set(all);
  return Array.from(set);
}

export const saveDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'admin', 'agent']);

  const { id, name, description, html } = req.body;
  assert(name, 400, 'name is empty');
  const orgId = getOrgIdFromReq(req);

  const demplate = new DocTemplate();
  demplate.id = id || uuidv4();
  demplate.orgId = orgId;
  demplate.name = name;
  demplate.description = description;
  demplate.html = html;
  demplate.refFieldNames = extractVariables(html);

  await db.getRepository(DocTemplate).save(demplate);

  res.json();
});

export const listDocTemplates = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'admin', 'agent']);
  const orgId = getOrgIdFromReq(req);

  const list = await db.getRepository(DocTemplate).find({
    where: {
      orgId
    },
    order: {
      name: 'ASC'
    },
    select: {
      id: true,
      name: true,
      description: true,
      refFieldNames: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  res.json(list);
});

export const getDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'admin', 'client', 'agent']);
  const { id } = req.params;
  const query = isRole(req, Role.Client) ? { id } : { id, orgId: getOrgIdFromReq(req) };
  const demplate = await db.getRepository(DocTemplate).findOne({ where: query });
  assert(demplate, 404);

  res.json(demplate);
});

export const deleteDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'admin', 'agent']);
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);
  await db.getRepository(DocTemplate).delete({ id, orgId });

  res.json();
});

export const renameDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'admin', 'agent']);
  const { name } = req.body;
  assert(name, 400, 'name is empty');
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);

  await db.getRepository(DocTemplate).update({ id, orgId }, { name });

  res.json();
});

async function getUniqueCopyName(m: EntityManager, orgId: string, preferredName: string) {
  let round = 1;
  while (true) {
    const tryName = round === 1 ? preferredName : `${preferredName} (${round})`;
    const existing = await m.findOne(DocTemplate, { where: { name: tryName, orgId }, select: ['id'] });
    if (!existing) {
      return tryName;
    }
    round++;
  }
}

export const cloneDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'admin', 'agent']);
  const { id } = req.params;
  const { name } = req.body;
  const preferredName = name?.trim();
  assert(preferredName, 400, 'No name provided');
  const orgId = getOrgIdFromReq(req);
  let demplate: DocTemplate;
  await db.transaction(async m => {
    demplate = await m.findOne(DocTemplate, { where: { id, orgId } });
    assert(demplate, 404);

    const newFemplateId = uuidv4();
    demplate.id = newFemplateId;
    demplate.createdAt = getUtcNow();
    demplate.updatedAt = getUtcNow();
    demplate.name = await getUniqueCopyName(m, orgId, preferredName);

    await m.save(demplate);
  });

  res.json(demplate);
});