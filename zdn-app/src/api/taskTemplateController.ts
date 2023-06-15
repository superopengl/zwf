
import { getRepository } from 'typeorm';
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

export const saveTaskTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const taskTemplate = new TaskTemplate();
  const orgId = getOrgIdFromReq(req);

  const { id, name, description, docTemplateIds, fields } = req.body;
  assert(name, 400, 'name is empty');
  assert(fields?.length || docTemplateIds?.length, 400, 'Neither fields nor doc templates is specified.');

  taskTemplate.id = id || uuidv4();
  taskTemplate.orgId = orgId;
  taskTemplate.name = name;
  taskTemplate.description = description;
  taskTemplate.docTemplateIds = docTemplateIds;
  taskTemplate.fields = fields;

  const repo = getRepository(TaskTemplate);
  await repo.save(taskTemplate);

  res.json();
});

export const listTaskTemplates = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const orgId = getOrgIdFromReq(req);
  const list = await getRepository(TaskTemplate)
    .find({
      where: {
        orgId
      },
      order: {
        name: 'ASC'
      },
      select: [
        'id',
        'name',
        'createdAt',
        'lastUpdatedAt',
        'docTemplateIds'
      ]
    })

  res.json(list);
});

export const getTaskTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client', 'agent');
  const { id } = req.params;
  const query = isRole(req, Role.Client) ? { id } : { id, orgId: getOrgIdFromReq(req) }
  const taskTemplate = await getRepository(TaskTemplate).findOne(query);
  assert(taskTemplate, 404);

  res.json(taskTemplate);
});

export const deleteTaskTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);
  const repo = getRepository(TaskTemplate);
  await repo.delete({ id, orgId });

  res.json();
});