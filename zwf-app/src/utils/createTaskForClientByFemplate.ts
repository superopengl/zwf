import { OrgClient } from '../entity/OrgClient';
import { TaskField } from '../entity/TaskField';
import { UserProfile } from '../entity/UserProfile';

import { assert } from './assert';
import * as _ from 'lodash';
import { Task } from '../entity/Task';
import { Femplate } from '../entity/Femplate';
import { TaskStatus } from '../types/TaskStatus';
import { ensureClientOrGuestUser } from './ensureClientOrGuestUser';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { FemplateField } from '../types/FemplateField';
import { generateDeepLinkId } from './generateDeepLinkId';
import { EntityManager } from 'typeorm';

function prefillFemplateFields(femplateFields, varBag: { [key: string]: any }) {
  if (!varBag) return femplateFields;

  const fields = femplateFields.map(f => (
    {
      ...f,
      value: varBag[f.varName]
    }
  ));

  return fields;
}

function generateTaskDefaultName(femplateName, clientAlias: string) {
  return `${femplateName || 'New task'} for ${clientAlias}`;
}

function ensureFileNameExtension(basename: string, ext: string = '.pdf') {
  const n = path.basename(basename, ext);
  return n + ext;
}

const createTaskFieldByFemplateField = (taskId: string, ordinal: number, femplateField: FemplateField) => {
  const field = new TaskField();
  field.id = uuidv4();
  field.taskId = taskId;
  field.ordinal = ordinal;
  field.name = femplateField.name;
  field.description = femplateField.description;
  field.type = femplateField.type;
  field.required = femplateField.required;
  field.value = null;
  field.options = femplateField.options;
  field.official = femplateField.official;
  field.value = femplateField.value;

  return field;
};

export const createTaskForClientByFemplate = async (m: EntityManager, femplateId, taskName, clientId, creatorId: string, id, orgId) => {
  assert(clientId, 400, 'clientId is not specified');

  const femplate = femplateId ? await m.findOne(Femplate, {
    where: {
      id: femplateId
    },
  }) : null;

  const orgClient = await m.findOneByOrFail(OrgClient, {id: clientId, orgId});

  // const { user } = await ensureClientOrGuestUser(m, clientId, orgId);

  const task = new Task();
  task.id = id || uuidv4();
  task.deepLinkId = generateDeepLinkId();
  task.name = taskName || generateTaskDefaultName(femplate?.name, orgClient.clientAlias);
  task.orgClient = orgClient;
  task.orgId = orgId;
  task.status = TaskStatus.TODO;

  // Provision taskFields based on femplate.fields
  const fields = femplate?.fields.map((f, i) => createTaskFieldByFemplateField(task.id, i, f)) ?? [];

  await m.save([task, ...fields]);

  return task;
};