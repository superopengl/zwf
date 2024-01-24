import { TaskField } from './../types/TaskField';
import { getUtcNow } from './getUtcNow';
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
import { DocTemplate } from '../entity/DocTemplate';
import { TaskDoc } from '../types/TaskDoc';
import { tryGenDocFile } from '../services/genDocService';

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

async function mapDocTemplatesToGenDocs(docTemplates: DocTemplate[], fields: TaskField[], userId: string): Promise<TaskDoc[]> {
  const docs: TaskDoc[] = [];
  for(const docTemplate of docTemplates) {
    const taskDoc = new TaskDoc();
    taskDoc.id = docTemplate.id;
    taskDoc.name = docTemplate.name;
    taskDoc.createdAt = getUtcNow();
    const file = await tryGenDocFile(docTemplate, fields, userId);
    taskDoc.fileId = file?.id;
    docs.push(taskDoc);
  }
  return docs;
}

export const createTaskByTaskTemplateAndUserEmail = async (taskTemplateId, taskName, email, varBag: { [key: string]: any }) => {
  assert(taskTemplateId, 400, 'taskTemplateId is not specified');
  assert(email, 400, 'email is not specified');

  let task: Task;
  let user: User;
  await getManager().transaction(async m => {
    const taskTemplate: TaskTemplate = await m.findOne(TaskTemplate, taskTemplateId, { relations: ['docs'] });
    assert(taskTemplate, 404, 'taskTemplate is not found');
    const fields = prefillTaskTemplateFields(taskTemplate.fields, varBag);

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
    task.docs = await mapDocTemplatesToGenDocs(taskTemplate.docs, fields, user.id);
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