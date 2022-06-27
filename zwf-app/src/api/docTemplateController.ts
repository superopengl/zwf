import { AppDataSource } from './../db';
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
  assertRole(req, 'admin', 'agent');

  const { id, name, description, html } = req.body;
  assert(name, 400, 'name is empty');
  const orgId = getOrgIdFromReq(req);

  const docTemplate = new DocTemplate();
  docTemplate.id = id || uuidv4();
  docTemplate.orgId = orgId;
  docTemplate.name = name;
  docTemplate.description = description;
  docTemplate.html = html;
  docTemplate.refFields = extractVariables(html);

  await AppDataSource.getRepository(DocTemplate).save(docTemplate);

  res.json();
});

export const listDocTemplates = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const orgId = getOrgIdFromReq(req);

  const list = await AppDataSource.getRepository(DocTemplate).find({
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
      refFields: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  res.json(list);
});

export const getDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client', 'agent');
  const { id } = req.params;
  const query = isRole(req, Role.Client) ? { id } : { id, orgId: getOrgIdFromReq(req) };
  const docTemplate = await AppDataSource.getRepository(DocTemplate).findOne({ where: query });
  assert(docTemplate, 404);

  res.json(docTemplate);
});

export const deleteDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);
  await AppDataSource.getRepository(DocTemplate).delete({ id, orgId });

  res.json();
});

export const renameDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { name } = req.body;
  assert(name, 400, 'name is empty');
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);

  await AppDataSource.getRepository(DocTemplate).update({ id, orgId }, { name });

  res.json();
});


export const applyDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const { refFields: passedInRefFields } = req.body;
  const repo = AppDataSource.getRepository(DocTemplate);
  const docTemplate = await repo.findOne({ where: { id } });
  assert(docTemplate, 404);

  const { refFields, description, name } = docTemplate;

  const usedVars = refFields.reduce((pre, cur) => {
    const pattern = `{{${cur}}}`;
    const replacement = pattern === `{{now}}` ? moment(getNow()).format('D MMM YYYY') : _.get(passedInRefFields, cur, '');
    pre[cur] = replacement;
    return pre;
  }, {});

  res.json({
    name,
    description,
    usedVars,
  });
});

async function mdToPdfBuffer(md) {
  // const pdf = await mdToPdf({
  //   content: md
  // }, {
  //   launch_options: {
  //     args: ['--no-sandbox']
  //   }
  // });
  // return pdf.content;
  return null;
}

async function getUniqueCopyName(m: EntityManager, sourceDocTemplate: DocTemplate) {
  let round = 1;
  const { orgId, name } = sourceDocTemplate;
  while (true) {
    const tryName = round === 1 ? `Copy of ${name}` : `Copy ${round} of ${name}`;
    const existing = await m.findOne(DocTemplate, { where: { name: tryName, orgId } });
    if (!existing) {
      return tryName;
    }
    round++;
  }
}

export const cloneDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);
  let docTemplate: DocTemplate;
  await AppDataSource.transaction(async m => {
    docTemplate = await m.findOne(DocTemplate, { where: { id, orgId } });
    assert(docTemplate, 404);

    const newTaskTemplateId = uuidv4();
    docTemplate.id = newTaskTemplateId;
    docTemplate.createdAt = getUtcNow();
    docTemplate.updatedAt = getUtcNow();
    docTemplate.name = await getUniqueCopyName(m, docTemplate);

    await m.save(docTemplate);
  });

  res.json(docTemplate);
});