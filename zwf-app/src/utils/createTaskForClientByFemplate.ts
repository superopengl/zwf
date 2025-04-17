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
import { OrgClientField } from '../entity/OrgClientField';
import { emitTaskEvent } from './emitTaskEvent';
import { TaskEventType } from '../types/TaskEventType';

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

const createTaskFieldByFemplateField = (taskId: string, ordinal: number, femplateField: FemplateField, defaultValueMap: Map<string, any>) => {
  const field = new TaskField();
  field.id = uuidv4();
  field.taskId = taskId;
  field.ordinal = ordinal;
  field.name = femplateField.name;
  field.description = femplateField.description;
  field.type = femplateField.type;
  field.required = femplateField.required;
  field.value = defaultValueMap.get(femplateField.name);
  field.options = femplateField.options;
  field.official = femplateField.official;

  return field;
};

export const createTaskForClientByFemplate = async (m: EntityManager, femplateId, taskName, orgClientId, creatorId: string, id, orgId) => {
  assert(orgClientId, 400, 'orgClientId is not specified');

  const femplate = femplateId ? await m.findOne(Femplate, {
    where: {
      id: femplateId
    },
  }) : null;

  const orgClient = await m.findOneByOrFail(OrgClient, { id: orgClientId, orgId });

  // const { user } = await ensureClientOrGuestUser(m, clientId, orgId);

  const task = new Task();
  task.id = id || uuidv4();
  task.deepLinkId = generateDeepLinkId();
  task.name = taskName || generateTaskDefaultName(femplate?.name, orgClient.clientAlias);
  task.orgClient = orgClient;
  task.orgId = orgId;
  task.status = TaskStatus.TODO;

  const clientFields = await m.findBy(OrgClientField, { orgClientId });
  const defaultValueMap = new Map(clientFields.map(f => [f.name, f.value]));

  // Provision taskFields based on femplate.fields
  const fields = femplate?.fields.map((f, i) => createTaskFieldByFemplateField(task.id, i, f, defaultValueMap)) ?? [];

  await m.save([task, ...fields]);

  await emitTaskEvent(m, TaskEventType.Create, task.id, creatorId);

  return task;
};