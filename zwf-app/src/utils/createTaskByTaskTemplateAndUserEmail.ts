import { db } from './../db';
import { OrgClient } from './../entity/OrgClient';
import { TaskField } from '../entity/TaskField';
import { getUtcNow } from './getUtcNow';
import { UserProfile } from '../entity/UserProfile';
import { EmailTemplateType } from '../types/EmailTemplateType';

import { assert } from './assert';
import * as _ from 'lodash';
import { Task } from '../entity/Task';
import { TaskTemplate } from '../entity/TaskTemplate';
import { TaskStatus } from '../types/TaskStatus';
import { ensureClientOrGuestUser } from './ensureClientOrGuestUser';
import { v4 as uuidv4 } from 'uuid';
import * as voucherCodes from 'voucher-code-generator';
import { User } from '../entity/User';
import { sendEmail } from '../services/emailService';
import { getEmailRecipientName } from './getEmailRecipientName';
import { Org } from '../entity/Org';
import { DocTemplate } from '../entity/DocTemplate';
import { logTaskCreated } from '../services/taskTrackingService';
import { Role } from '../types/Role';
import * as path from 'path';
import { TaskTemplateField } from '../types/TaskTemplateField';

function generateDeepLinkId() {
  const result = voucherCodes.generate({
    length: 64,
    count: 1,
    charset: voucherCodes.charset('alphanumeric')
  });
  return result[0];
}

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
  const clientName = `${profile.givenName} ${profile.surname}`;
  const displayName = clientName.trim() ? clientName : profile.email;
  return `${taskTemplateName} - ${displayName}`;
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

export const createTaskByTaskTemplateAndUserEmail = async (taskTemplateId, taskName, email, creatorId: string, id?) => {
  assert(taskTemplateId, 400, 'taskTemplateId is not specified');
  assert(email, 400, 'email is not specified');

  let task: Task;
  await db.transaction(async m => {
    const taskTemplate: TaskTemplate = await m.findOne(TaskTemplate, { where: { id: taskTemplateId }, relations: { docs: true } });
    assert(taskTemplate, 404, 'taskTemplate is not found');

    const { user } = await ensureClientOrGuestUser(m, email, taskTemplate.orgId);

    task = new Task();
    task.id = id || uuidv4();
    task.deepLinkId = generateDeepLinkId();
    task.name = taskName || generateTaskDefaultName(taskTemplate.name, user.profile);
    task.description = taskTemplate.description;
    task.userId = user.id;
    task.taskTemplateId = taskTemplateId;
    task.orgId = taskTemplate.orgId;
    task.status = TaskStatus.TODO;

    // Provision taskFields based on taskTemplate.fields
    const fields = taskTemplate.fields.map((f, i) => createTaskFieldByTaskTemplateField(task.id, i, f));

    await m.save([task, ...fields]);

    // Add the user to org clients
    const orgClient = new OrgClient();
    orgClient.orgId = task.orgId;
    orgClient.userId = task.userId;
    await m.createQueryBuilder()
      .insert()
      .into(OrgClient)
      .values(orgClient)
      .orIgnore()
      .execute();

    await logTaskCreated(m, task, creatorId);
  });

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