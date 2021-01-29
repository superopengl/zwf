
import { getRepository } from 'typeorm';
import { assert, assertRole } from '../utils/assert';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { handlerWrapper } from '../utils/asyncHandler';
import { getNow } from '../utils/getNow';
import { DocTemplate } from '../entity/DocTemplate';
import * as moment from 'moment';
import { uploadToS3 } from '../utils/uploadToS3';
import { File } from '../entity/File';
import * as md5 from 'md5';
import { mdToPdf } from 'md-to-pdf';

function extractVariables(md: string) {
  const pattern = /\{\{[a-zA-Z]+\}\}/ig;
  const all = (md.match(pattern) || []).map(x => x.replace(/^\{\{/, '').replace(/\}\}$/, ''));
  const set = new Set(all);
  return Array.from(set);
}

export const saveDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const docTemplate = new DocTemplate();

  const { id, name, description, md } = req.body;
  assert(name, 400, 'name is empty');
  docTemplate.id = id || uuidv4();
  docTemplate.name = name;
  docTemplate.description = description;
  docTemplate.md = md;
  docTemplate.variables = extractVariables(md);

  const repo = getRepository(DocTemplate);
  await repo.save(docTemplate);

  res.json();
});

export const listDocTemplates = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');

  const list = await getRepository(DocTemplate)
    .createQueryBuilder('x')
    .orderBy('x.createdAt', 'ASC')
    .select(['id', 'name', 'description', 'variables', `"createdAt"`, '"lastUpdatedAt"'])
    .execute();

  res.json(list);
});

export const getDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client', 'agent');
  const { id } = req.params;
  const repo = getRepository(DocTemplate);
  const docTemplate = await repo.findOne(id);
  assert(docTemplate, 404);

  res.json(docTemplate);
});

export const deleteDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const repo = getRepository(DocTemplate);
  await repo.delete({ id });

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
  const pdf = await mdToPdf({
    content: md
  }, {
    launch_options: {
      args: ['--no-sandbox']
    }
  });
  return pdf.content;
}

export const createPdfFromDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const { variables: inboundVariables } = req.body;
  const repo = getRepository(DocTemplate);
  const docTemplate = await repo.findOne(id);
  assert(docTemplate, 404);

  const { name, md, variables } = docTemplate;

  const bakedMd = variables.reduce((pre, cur) => {
    const pattern = new RegExp(`{{${cur}}}`, 'g');
    const replacement = cur === `now` ? moment(getNow()).format('D MMM YYYY') : inboundVariables[cur];

    assert(replacement !== undefined, 400, `Variable '${cur}' is missing`);
    return pre.replace(pattern, replacement);
  }, md);


  const pdfFileId = uuidv4();
  const pdfFileName = `${name}.pdf`;

  const data = await mdToPdfBuffer(bakedMd);

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

