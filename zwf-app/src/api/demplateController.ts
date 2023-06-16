import { db } from '../db';
import { getUtcNow } from '../utils/getUtcNow';

import { EntityManager } from 'typeorm';
import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { handlerWrapper } from '../utils/asyncHandler';
import { getNow } from '../utils/getNow';
import { Demplate } from '../entity/Demplate';
import * as moment from 'moment';
import { uploadToS3 } from '../utils/uploadToS3';
import { File } from '../entity/File';
import * as md5 from 'md5';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { isRole } from '../utils/isRole';
import { Role } from '../types/Role';
import { renderHtmlWithFields } from '../services/genDocService';
import { generatePdfBufferFromHtml } from '../utils/generatePdfBufferFromHtml';

function extractVariables(html: string) {
  const pattern = /\{\{[a-zA-Z0-9 ]+\}\}/ig;
  const all = (html.match(pattern) || []).map(x => x.replace(/^\{\{/, '').replace(/\}\}$/, ''));
  const set = new Set(all);
  return Array.from(set);
}

export const saveDemplate = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);

  const { id, name, description, html } = req.body;
  assert(name, 400, 'name is empty');
  const orgId = getOrgIdFromReq(req);

  const demplate = new Demplate();
  demplate.id = id || uuidv4();
  demplate.orgId = orgId;
  demplate.name = name;
  demplate.description = description;
  demplate.html = html;
  demplate.refFieldNames = extractVariables(html);

  await db.getRepository(Demplate).save(demplate);

  res.json();
});

export const listDemplates = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const orgId = getOrgIdFromReq(req);

  const list = await db.getRepository(Demplate).find({
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

export const getDemplate = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'client', 'agent']);
  const { id } = req.params;
  const query = isRole(req, Role.Client) ? { id } : { id, orgId: getOrgIdFromReq(req) };
  const demplate = await db.getRepository(Demplate).findOne({ where: query });
  assert(demplate, 404);

  res.json(demplate);
});

export const deleteDemplate = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);
  await db.getRepository(Demplate).delete({ id, orgId });

  res.json();
});

export const renameDemplate = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { name } = req.body;
  assert(name, 400, 'name is empty');
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);

  await db.getRepository(Demplate).update({ id, orgId }, { name });

  res.json();
});

async function getUniqueCopyName(m: EntityManager, orgId: string, preferredName: string) {
  let round = 1;
  while (true) {
    const tryName = round === 1 ? preferredName : `${preferredName} (${round})`;
    const existing = await m.findOne(Demplate, { where: { name: tryName, orgId }, select: ['id'] });
    if (!existing) {
      return tryName;
    }
    round++;
  }
}

export const cloneDemplate = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { id } = req.params;
  const { name } = req.body;
  const preferredName = name?.trim();
  assert(preferredName, 400, 'No name provided');
  const orgId = getOrgIdFromReq(req);
  let demplate: Demplate;
  await db.transaction(async m => {
    demplate = await m.findOne(Demplate, { where: { id, orgId } });
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


export const previewDemplatePdf = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { html } = req.body;

  assert(html, 400, 'No html provided');

  const pdfData = await generatePdfBufferFromHtml(html);

  res.setHeader('Content-type', 'application/pdf');
  // res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  // res.setHeader('Content-disposition', `attachment; filename="${fileName}"`);
  // res.json(Buffer.from(pdfData).toJSON());
  res.send(pdfData);
});