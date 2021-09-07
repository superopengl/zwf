
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

function generateDeepLinkId() {
  const result = voucherCodes.generate({
    length: 64,
    count: 1,
    charset: voucherCodes.charset("alphanumeric")
  });
  return result[0];
}

function prefillFieldsWithProtofolio(taskTemplateFields, portfolioFields) {
  if (!portfolioFields) return taskTemplateFields;

  const map = new Map(portfolioFields.map(({ name, value }) => [name, value]));
  const fields = taskTemplateFields.map(f => (
    {
      ...f,
      value: map.get(f.name)
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

export const generateTaskByTaskTemplateAndPortfolio = async (taskTemplateId, portfolioId, genName: (task: TaskTemplate, porto: Portfolio) => string) => {
  assert(taskTemplateId, 400, 'taskTemplateId is not specified');
  assert(portfolioId, 400, 'portfolioId is not specified');

  const taskTemplateRepo = getRepository(TaskTemplate);
  const taskTemplate = await taskTemplateRepo.findOne(taskTemplateId);
  assert(taskTemplate, 404, 'taskTemplate is not found');

  const portfolioRepo = getRepository(Portfolio);
  const portfolio = await portfolioRepo.findOne(portfolioId);
  assert(portfolio, 404, 'portfolio is not found');

  // const docTemplates = taskTemplate.docTemplateIds.length ?
  //   await getRepository(DocTemplate).find({ where: { id: In(taskTemplate.docTemplateIds) } }) :
  //   [];

  const task = new Task();

  const fields = prefillFieldsWithProtofolio(taskTemplate.fields, portfolio.fields);

  // task.id = uuidv4();
  task.name = genName(taskTemplate, portfolio);
  task.userId = portfolio.userId;
  task.taskTemplateId = taskTemplateId;
  task.portfolioId = portfolioId;
  task.fields = fields;
  // task.docs = mapDocTemplatesToGenDocs(docTemplates);
  task.status = TaskStatus.TODO;

  return task;
};

export const createTaskByTaskTemplateAndEmail = async (taskTemplateId, email) => {
  assert(taskTemplateId, 400, 'taskTemplateId is not specified');
  assert(email, 400, 'email is not specified');

  let task: Task;
  await getManager().transaction(async m => {
    const taskTemplate = await m.findOne(TaskTemplate, taskTemplateId);
    assert(taskTemplate, 404, 'taskTemplate is not found');

    const user = await ensureClientOrGuestUser(m, email);

    task = new Task();
  
    const fields = prefillFieldsWithProtofolio(taskTemplate.fields, null);
  
    task.id = uuidv4();
    task.deepLinkId = generateDeepLinkId();
    task.name = taskTemplate.name;
    task.userId = user.id;
    task.taskTemplateId = taskTemplateId;
    task.portfolioId = null;
    task.fields = fields;
    task.orgId = taskTemplate.orgId;
    // task.docs = mapDocTemplatesToGenDocs(docTemplates);
    task.status = TaskStatus.TODO;

    await m.insert(Task, task);
  });

  return task;
};