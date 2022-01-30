import { UserInformation } from './../entity/views/UserInformation';
import { EmailTemplateType } from '../types/EmailTemplateType';

import { getRepository, In, getManager } from 'typeorm';
import { assert } from './assert';
import * as _ from 'lodash';
import { Task } from '../entity/Task';
import { getNow } from './getNow';
import { TaskTemplate } from '../entity/TaskTemplate';
import { Portfolio } from '../entity/Portfolio';
import { TaskStatus } from '../types/TaskStatus';
import { guessDisplayNameFromFields } from './guessDisplayNameFromFields';
import { DocTemplate } from '../entity/DocTemplate';
import { TaskDoc } from '../types/TaskDoc';
import { ensureClientOrGuestUser } from './ensureClientOrGuestUser';
import { v4 as uuidv4 } from 'uuid';
import * as voucherCodes from 'voucher-code-generator';
import { User } from '../entity/User';
import { enqueueEmail, sendEmailImmediately } from '../services/emailService';
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

function mapDocTemplatesToGenDocs(docTemplates: DocTemplate[]): TaskDoc[] {
  return docTemplates.map(x => {
    const taskDoc = new TaskDoc();
    taskDoc.docTemplateId = x.id;
    // docTemplateName: x.name,
    // docTemplateDescription: x.description,
    taskDoc.variables = x.variables.map(name => ({ name, value: undefined }));
    taskDoc.fileName = `${x.name}.pdf`;
    return taskDoc;
  });
}

export const createTaskByTaskTemplateAndUserEmail = async (taskTemplateId, taskName, email, fieldValues) => {
  assert(taskTemplateId, 400, 'taskTemplateId is not specified');
  assert(taskName, 400, 'name is not specified');
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
    task.name = taskName || taskTemplate.name;
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