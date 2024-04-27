import { OrgClient } from './../entity/OrgClient';
import { TaskField } from '../entity/TaskField';
import { getUtcNow } from './getUtcNow';
import { UserProfile } from '../entity/UserProfile';
import { EmailTemplateType } from '../types/EmailTemplateType';

import { getRepository, getManager, EntityManager } from 'typeorm';
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
import { DocTemplate } from '../entity/DocTemplate';
import { TaskDoc } from '../entity/TaskDoc';
import { tryGenDocFile } from '../services/genDocService';
import { logTaskCreated } from '../services/taskTrackingService';
import { Role } from '../types/Role';
import * as path from 'path';
import { TaskTemplateField } from '../types/TaskTemplateField';

function generateDeepLinkId() {
  const result = voucherCodes.generate({
    length: 64,
    count: 1,
    charset: voucherCodes.charset("alphanumeric")
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

export const createTaskDocByDocTemplate = async (m: EntityManager, taskId: string, fieldId: string, docTemplateId: string) => {
  const docTemplate = await m.getRepository(DocTemplate).findOne(docTemplateId);
  const taskDoc = new TaskDoc();
  taskDoc.taskId = taskId;
  taskDoc.fieldId = fieldId;
  taskDoc.docTemplateId = docTemplateId;
  taskDoc.status = 'pending';
  taskDoc.name = docTemplate.name;

  return taskDoc;
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
  field.linkedVarName = taskTemplateField.varName;
  field.value = null;
  field.options = taskTemplateField.options;
  field.official = taskTemplateField.official;
  field.value = taskTemplateField.value;

  return field;
}

export const createTaskByTaskTemplateAndUserEmail = async (taskTemplateId, taskName, email, creatorId: string, id?) => {
  assert(taskTemplateId, 400, 'taskTemplateId is not specified');
  assert(email, 400, 'email is not specified');

  let task: Task;
  let user: User;
  await getManager().transaction(async m => {
    const taskTemplate: TaskTemplate = await m.findOne(TaskTemplate, taskTemplateId, { relations: ['docs'] });
    assert(taskTemplate, 404, 'taskTemplate is not found');

    user = await ensureClientOrGuestUser(m, email);

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
    // await m.save(fields);

    // Provision taskDoc for those "autodoc" fields
    const autoDocFields = fields.filter(f => f.type === 'autodoc');
    const taskDocs = [];
    for (const field of autoDocFields) {
      const docTemplateId = field.value.docTemplateId;
      const taskDoc = await createTaskDocByDocTemplate(m, task.id, field.id, docTemplateId);
      taskDocs.push(taskDoc);
    }
    // await m.save(taskDocs);

    // task.fields = fields;

    await m.save([task, ...fields, ...taskDocs]);

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

    await logTaskCreated(m, task.id, creatorId);
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