import { getUtcNow } from './../utils/getUtcNow';

import { getRepository, getManager, EntityManager } from 'typeorm';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
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
import { TaskTemplate } from '../entity/TaskTemplate';
import { TaskTemplateDocTemplate } from '../entity/TaskTemplateDocTemplate';

function extractVariables(html: string) {
  const pattern = /\{\{[a-zA-Z]+\}\}/ig;
  const all = (html.match(pattern) || []).map(x => x.replace(/^\{\{/, '').replace(/\}\}$/, ''));
  const set = new Set(all);
  return Array.from(set);
}

export const saveDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');

  const { id, name, description, html } = req.body;
  assert(name, 400, 'name is empty');
  const orgId = getOrgIdFromReq(req);

  const docTemplate = new DocTemplate();
  docTemplate.id = id || uuidv4();
  docTemplate.orgId = orgId;
  docTemplate.name = name;
  docTemplate.description = description;
  docTemplate.html = html;
  docTemplate.variables = extractVariables(html);

  await getRepository(DocTemplate).save(docTemplate);

  res.json();
});

export const listDocTemplates = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);

  const list = await getRepository(DocTemplate).find({
    where: {
      orgId
    },
    order: {
      name: 'ASC'
    },
    select: [
      'id',
      'name',
      'description',
      'variables',
      'createdAt',
      'lastUpdatedAt'
    ]
  });

  res.json(list);
});

export const getDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client', 'agent');
  const { id } = req.params;
  const query = isRole(req, Role.Client) ? { id } : { id, orgId: getOrgIdFromReq(req) }
  const docTemplate = await getRepository(DocTemplate).findOne(query);
  assert(docTemplate, 404);

  res.json(docTemplate);
});

export const deleteDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);
  await getRepository(DocTemplate).delete({ id, orgId });

  res.json();
});

export const applyDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const { variables: inboundVariables } = req.body;
  const repo = getRepository(DocTemplate);
  const docTemplate = await repo.findOne(id);
  assert(docTemplate, 404);

  const { variables, description, name } = docTemplate;

  const usedVars = variables.reduce((pre, cur) => {
    const pattern = `{{${cur}}}`;
    const replacement = pattern === `{{now}}` ? moment(getNow()).format('D MMM YYYY') : _.get(inboundVariables, cur, '');
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

export const createPdfFromDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const { variables: inboundVariables } = req.body;
  const repo = getRepository(DocTemplate);
  const docTemplate = await repo.findOne(id);
  assert(docTemplate, 404);

  const { name, html, variables } = docTemplate;

  const bakedHtml = variables.reduce((pre, cur) => {
    const pattern = new RegExp(`{{${cur}}}`, 'g');
    const replacement = cur === `now` ? moment(getNow()).format('D MMM YYYY') : inboundVariables[cur];

    assert(replacement !== undefined, 400, `Variable '${cur}' is missing`);
    return pre.replace(pattern, replacement);
  }, html);


  const pdfFileId = uuidv4();
  const pdfFileName = `${name}.pdf`;

  const data = await mdToPdfBuffer(bakedHtml);

  const location = await uploadToS3(pdfFileId, pdfFileName, data);

  const file: File = {
    id: pdfFileId,
    fileName: pdfFileName,
    mime: 'application/pdf',
    location,
    md5: md5(data)
  };

  await getRepository(File).save(file);

  res.json(file);
});

async function getUniqueCopyName(m: EntityManager, sourceDocTemplate: DocTemplate) {
  let round = 1;
  const { orgId, name } = sourceDocTemplate;
  while (true) {
    const tryName = round === 1 ? `Copy of ${name}` : `Copy ${round} of ${name}`;
    const existing = await m.findOne(DocTemplate, { name: tryName, orgId });
    if(!existing) {
      return tryName;
    }
    round++;
  }
}

export const cloneDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);
  let docTemplate: DocTemplate;
  await getManager().transaction(async m => {
    docTemplate = await m.findOne(DocTemplate, { id, orgId });
    assert(docTemplate, 404);

    const newTaskTemplateId = uuidv4();
    docTemplate.id = newTaskTemplateId;
    docTemplate.createdAt = getUtcNow();
    docTemplate.lastUpdatedAt = getUtcNow();
    docTemplate.name = await getUniqueCopyName(m, docTemplate);

    await m.save(docTemplate);
  })

  res.json(docTemplate);
});