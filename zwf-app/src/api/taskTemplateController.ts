import { AppDataSource } from './../db';
import { DocTemplate } from './../entity/DocTemplate';
import { getUtcNow } from './../utils/getUtcNow';

import { EntityManager, In } from 'typeorm';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { handlerWrapper } from '../utils/asyncHandler';
import { getNow } from '../utils/getNow';
import { TaskTemplate } from '../entity/TaskTemplate';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { Role } from '../types/Role';
import { isRole } from '../utils/isRole';
import { TaskTemplateDocTemplate } from '../entity/TaskTemplateDocTemplate';

export const saveTaskTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);

  const { id, name, description, docTemplateIds, fields } = req.body;
  assert(name, 400, 'name is empty');
  assert(fields?.length || docTemplateIds?.length, 400, 'Neither fields nor doc templates is specified.');


  await AppDataSource.manager.transaction(async m => {
    const taskTemplate = new TaskTemplate();
    taskTemplate.id = id || uuidv4();
    taskTemplate.orgId = orgId;
    taskTemplate.name = name;
    taskTemplate.description = description;
    taskTemplate.fields = fields;
    if (docTemplateIds?.length) {
      taskTemplate.docs = await m.find(DocTemplate, { where: { id: In(docTemplateIds) } });
    }

    await m.save(taskTemplate);
  });

  res.json();
});


export const renameTaskTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { name } = req.body;
  assert(name, 400, 'name is empty');
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);

  await AppDataSource.getRepository(TaskTemplate).update({ id, orgId }, { name });

  res.json();
});


export const listTaskTemplates = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const orgId = getOrgIdFromReq(req);
  const list = await AppDataSource.getRepository(TaskTemplate)
    .find({
      where: {
        orgId
      },
      order: {
        name: 'ASC'
      },
      relations: [
        'docs'
      ]
    });

  res.json(list);
});

export const getTaskTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client', 'agent');
  const { id } = req.params;
  const query = isRole(req, Role.Client) ? { id } : { id, orgId: getOrgIdFromReq(req) }
  const taskTemplate = await AppDataSource.getRepository(TaskTemplate).findOne({ where: query, relations: { docs: true } });
  assert(taskTemplate, 404);

  res.json(taskTemplate);
});

export const deleteTaskTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);
  const repo = AppDataSource.getRepository(TaskTemplate);
  await repo.delete({ id, orgId });

  res.json();
});

async function getUniqueCopyName(m: EntityManager, sourceTaskTemplate: TaskTemplate) {
  let round = 1;
  const { orgId, name } = sourceTaskTemplate;
  while (true) {
    const tryName = round === 1 ? `Copy of ${name}` : `Copy ${round} of ${name}`;
    const existing = await m.findOne(TaskTemplate, { where: { name: tryName, orgId } });
    if (!existing) {
      return tryName;
    }
    round++;
  }
}

export const cloneTaskTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);
  let taskTemplate: TaskTemplate;
  await AppDataSource.transaction(async m => {
    taskTemplate = await m.findOne(TaskTemplate, { where: { id, orgId }, relations: { docs: true } });
    assert(taskTemplate, 404);

    const sourceTaskTemplateId = taskTemplate.id;
    const newTaskTemplateId = uuidv4();
    taskTemplate.id = newTaskTemplateId;
    taskTemplate.createdAt = getUtcNow();
    taskTemplate.updatedAt = getUtcNow();
    taskTemplate.name = await getUniqueCopyName(m, taskTemplate);

    const taskTemplateDocTemplateList = await m.find(TaskTemplateDocTemplate, { where: { taskTemplateId: sourceTaskTemplateId }});
    taskTemplateDocTemplateList.forEach(x => {
      x.taskTemplateId = newTaskTemplateId;
    })

    const entities = [taskTemplate, ...taskTemplateDocTemplateList];

    await m.save(entities);
  })

  res.json(taskTemplate);
});