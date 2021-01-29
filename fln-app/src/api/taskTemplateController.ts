
import { getRepository } from 'typeorm';
import { assert, assertRole } from '../utils/assert';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { handlerWrapper } from '../utils/asyncHandler';
import { getNow } from '../utils/getNow';
import { TaskTemplate } from '../entity/TaskTemplate';

export const saveTaskTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const taskTemplate = new TaskTemplate();

  const { id, name, docTemplateIds, fields } = req.body;
  assert(name, 400, 'name is empty');
  assert(fields?.length || docTemplateIds?.length, 400, 'Neither fields nor doc templates is specified.');

  taskTemplate.id = id || uuidv4();
  taskTemplate.name = name;
  taskTemplate.docTemplateIds = docTemplateIds;
  taskTemplate.fields = fields.filter(f => f.name?.trim() && f.type?.trim());

  const repo = getRepository(TaskTemplate);
  await repo.save(taskTemplate);

  res.json();
});

export const listTaskTemplates = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client', 'agent');

  const list = await getRepository(TaskTemplate)
    .createQueryBuilder('x')
    .orderBy('x.createdAt', 'ASC')
    .select(['id', 'name', `"createdAt"`, '"lastUpdatedAt"', `"docTemplateIds"`])
    .execute();

  res.json(list);
});

export const getTaskTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client', 'agent');
  const { id } = req.params;
  const repo = getRepository(TaskTemplate);
  const taskTemplate = await repo.findOne(id);
  assert(taskTemplate, 404);

  res.json(taskTemplate);
});

export const deleteTaskTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const repo = getRepository(TaskTemplate);
  await repo.delete({ id });

  res.json();
});