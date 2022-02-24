import { UserInformation } from './../entity/views/UserInformation';

import { getRepository } from 'typeorm';
import { User } from '../entity/User';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { handlerWrapper } from '../utils/asyncHandler';
import { TaskTemplate } from '../entity/TaskTemplate';
import { Recurring } from '../entity/Recurring';
import { CLIENT_TZ, CRON_EXECUTE_TIME, testRunRecurring } from '../services/recurringService';
import * as moment from 'moment-timezone';
import { calculateRecurringNextRunAt } from '../utils/calculateRecurringNextRunAt';

export const saveRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id, clientId, taskTemplateId, startFrom, every, period } = req.body;

  const user = await getRepository(UserInformation).findOne(clientId);
  assert(user, 404, 'User is not found');
  const taskTemplate = await getRepository(TaskTemplate).findOne(taskTemplateId);
  assert(taskTemplate, 404, 'TaskTemplate is not found');

  const recurring = new Recurring();
  recurring.id = id || uuidv4();
  recurring.nameTemplate = `${user.surname} ${taskTemplate.name} {{createdDate}}`;
  recurring.userId = clientId;
  recurring.taskTemplateId = taskTemplateId;
  recurring.startFrom = startFrom ? moment.tz(`${startFrom} ${CRON_EXECUTE_TIME}`, 'YYYY-MM-DD HH:mm', CLIENT_TZ).toDate() : null;
  recurring.every = every;
  recurring.period = period;
  recurring.nextRunAt = calculateRecurringNextRunAt(recurring);

  const repo = getRepository(Recurring);
  await repo.save(recurring);

  res.json();
});

export const listRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');

  const list = await getRepository(Recurring)
    .createQueryBuilder('x')
    .leftJoin(q => q.from(TaskTemplate, 'j'), 'j', 'j.id = x."taskTemplateId"')
    .leftJoin(q => q.from(User, 'u'), 'u', 'u.id = p."userId"')
    .orderBy('x."updatedAt"', 'DESC', 'NULLS LAST')
    .addOrderBy('j.name', 'ASC')
    .addOrderBy('p.name', 'ASC')
    .select([
      'x.id as id',
      'x."nameTemplate" as "nameTemplate"',
      'x."startFrom" as "startFrom"',
      'x."every" as "every"',
      'x."period" as "period"',
      'x."dueDay" as "dueDay"',
      'u.email as email',
      'j.name as "taskTemplateName"',
      `j.id as "taskTemplateId"`,
      'x."lastRunAt" as "lastRunAt"',
      'x."nextRunAt" as "nextRunAt"',
      'x."updatedAt" as "updatedAt"'
    ])
    .execute();

  res.json(list);
});

export const getRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const repo = getRepository(Recurring);
  const recurring = await repo.findOne(id);
  assert(recurring, 404);

  res.json(recurring);
});

export const deleteRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const repo = getRepository(Recurring);
  await repo.delete({ id });

  res.json();
});

export const runRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;

  const task = await testRunRecurring(id);

  res.json(task);
});


