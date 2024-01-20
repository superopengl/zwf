import { UserProfile } from './../entity/UserProfile';
import { EmailTemplateType } from '../types/EmailTemplateType';

import { getRepository, getManager } from 'typeorm';
import { assert } from './assert';
import * as _ from 'lodash';
import { Task } from '../entity/Task';
import { TaskTemplate } from '../entity/TaskTemplate';
import { TaskStatus } from '../types/TaskStatus';
import { ensureClientOrGuestUser } from './ensureClientOrGuestUser';
import { v4 as uuidv4 } from 'uuid';
import * as voucherCodes from 'voucher-code-generator';
import { User } from '../entity/User';
import { enqueueEmail } from '../services/emailService';
import { getEmailRecipientName } from './getEmailRecipientName';
import { Org } from '../entity/Org';

function generateDeepLinkId() {
  const result = voucherCodes.generate({
    length: 64,
    count: 1,
    charset: voucherCodes.charset("alphanumeric")
  });
  return result[0];
}

function prefillTaskTemplateFields(taskTemplateFields, inputFields: object) {
  if (!inputFields) return taskTemplateFields;

  const fields = taskTemplateFields.map(f => (
    {
      ...f,
      value: inputFields[f.name]
    }
  ));

  return fields;
}

function generateTaskDefaultName (taskTemplateName, profile: UserProfile) {
  assert(profile, 500, 'User profile is not specified');
  const clientName = `${profile.givenName} ${profile.surname}`;
  const displayName = clientName.trim() ? clientName : profile.email;
  return `${taskTemplateName} - ${displayName}`;
}

export const createTaskByTaskTemplateAndUserEmail = async (taskTemplateId, taskName, email, fieldValues) => {
  assert(taskTemplateId, 400, 'taskTemplateId is not specified');
  assert(email, 400, 'email is not specified');

  let task: Task;
  let user: User;
  await getManager().transaction(async m => {
    const taskTemplate = await m.findOne(TaskTemplate, taskTemplateId);
    assert(taskTemplate, 404, 'taskTemplate is not found');
    const fields = prefillTaskTemplateFields(taskTemplate.fields, fieldValues);

    user = await ensureClientOrGuestUser(m, email);

    task = new Task();
    task.id = uuidv4();
    task.deepLinkId = generateDeepLinkId();
    task.name = taskName || generateTaskDefaultName(taskTemplate.name, user.profile);
    task.description = taskTemplate.description;
    task.userId = user.id;
    task.taskTemplateId = taskTemplateId;
    task.fields = fields;
    task.orgId = taskTemplate.orgId;
    // task.docs = mapDocTemplatesToGenDocs(docTemplates);
    task.status = TaskStatus.TODO;
    await m.insert(Task, task);
  });

  const org = await getRepository(Org).findOne(task.orgId);

  enqueueEmail({
    template: EmailTemplateType.TaskCreated,
    to: email,
    vars: {
      toWhom: getEmailRecipientName(user),
      orgName: org.name,
      taskName: task.name,
      directUrl: `${process.env.ZWF_API_DOMAIN_NAME}/t/${task.deepLinkId}`
    },
  });

  return task;
};