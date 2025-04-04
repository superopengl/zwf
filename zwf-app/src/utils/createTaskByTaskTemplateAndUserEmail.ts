import { OrgClient } from './../entity/OrgClient';
import { TaskField } from '../entity/TaskField';
import { UserProfile } from '../entity/UserProfile';

import { assert } from './assert';
import * as _ from 'lodash';
import { Task } from '../entity/Task';
import { TaskTemplate } from '../entity/TaskTemplate';
import { TaskStatus } from '../types/TaskStatus';
import { ensureClientOrGuestUser } from './ensureClientOrGuestUser';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { TaskTemplateField } from '../types/TaskTemplateField';
import { generateDeepLinkId } from './generateDeepLinkId';
import { EntityManager } from 'typeorm';

function prefillTaskTemplateFields(taskTemplateFields, varBag: { [key: string]: any }) {
  if (!varBag) return taskTemplateFields;

  const fields = taskTemplateFields.map(f => (
    {
      ...f,
      value: varBag[f.varName]
    }
  ));

  return fields;
}

function generateTaskDefaultName(taskTemplateName, profile: UserProfile) {
  assert(profile, 500, 'User profile is not specified');
  const clientName = `${profile.givenName ?? ''} ${profile.surname ?? ''}`;
  const displayName = clientName.trim() ? clientName : profile.email;
  return `${taskTemplateName || 'New ticket'} - ${displayName}`;
}

function ensureFileNameExtension(basename: string, ext: string = '.pdf') {
  const n = path.basename(basename, ext);
  return n + ext;
}

export const createTaskFieldByTaskTemplateField = (taskId: string, ordinal: number, taskTemplateField: TaskTemplateField) => {
  const field = new TaskField();
  field.id = uuidv4();
  field.taskId = taskId;
  field.ordinal = ordinal;
  field.name = taskTemplateField.name;
  field.description = taskTemplateField.description;
  field.type = taskTemplateField.type;
  field.required = taskTemplateField.required;
  field.value = null;
  field.options = taskTemplateField.options;
  field.official = taskTemplateField.official;
  field.value = taskTemplateField.value;

  return field;
};

export const createTaskByTaskTemplateAndUserEmail = async (m: EntityManager, taskTemplateId, taskName, email, creatorId: string, id, orgId) => {
  assert(email, 400, 'email is not specified');

  const taskTemplate = taskTemplateId ? await m.findOne(TaskTemplate, {
    where: {
      id: taskTemplateId
    },
    relations: {
      docs: true,
    }
  }) : null;

  const { user } = await ensureClientOrGuestUser(m, email, orgId);

  // Add the user to org clients
  let orgClient = await m.findOneBy(OrgClient, { orgId, userId: user.id });
  if (!orgClient) {
    orgClient = new OrgClient();
    orgClient.orgId = orgId;
    orgClient.userId = user.id;
    await m.save(orgClient);
  }

  const task = new Task();
  task.id = id || uuidv4();
  task.deepLinkId = generateDeepLinkId();
  task.name = taskName || generateTaskDefaultName(taskTemplate?.name, user.profile);
  task.orgClient = orgClient;
  task.orgId = orgId;
  task.status = TaskStatus.TODO;

  // Provision taskFields based on taskTemplate.fields
  const fields = taskTemplate?.fields.map((f, i) => createTaskFieldByTaskTemplateField(task.id, i, f)) ?? [];

  await m.save([task, ...fields]);



  // const org = await db.getRepository(Org).findOne({ where: { id: task.orgId } });

  // enqueueEmail({
  //   template: EmailTemplateType.TaskCreated,
  //   to: email,
  //   vars: {
  //     toWhom: getEmailRecipientName(user),
  //     orgName: org.name,
  //     taskName: task.name,
  //     directUrl: `${process.env.ZWF_API_DOMAIN_NAME}/t/${task.deepLinkId}`
  //   },
  // });

  return task;
};