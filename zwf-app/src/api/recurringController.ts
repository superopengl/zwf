import { AppDataSource } from './../db';
import { User } from '../entity/User';
import { assert } from '../utils/assert';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { handlerWrapper } from '../utils/asyncHandler';
import { TaskTemplate } from '../entity/TaskTemplate';
import { Recurring } from '../entity/Recurring';
import { CLIENT_TZ, CRON_EXECUTE_TIME, testRunRecurring } from '../services/cronService';
import * as moment from 'moment-timezone';
import { calculateRecurringNextRunAt } from '../utils/calculateRecurringNextRunAt';
import { assertRole } from '../utils/assertRole';

export const saveRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id, portfolioId, taskTemplateId, userId, firstRunOn, every, period, repeatOn } = req.body;

  const taskTemplate = await AppDataSource.getRepository(TaskTemplate).findOne({where: {id: taskTemplateId}});
  assert(taskTemplate, 404, 'TaskTemplate is not found');

  const recurring = new Recurring();
  recurring.id = id || uuidv4();
  recurring.nameTemplate = `${taskTemplate.name} {{createdDate}}`;
  recurring.taskTemplateId = taskTemplateId;
  recurring.userId = userId;
  recurring.firstRunOn = firstRunOn ? moment.tz(`${firstRunOn} ${CRON_EXECUTE_TIME}`, 'YYYY-MM-DD HH:mm', CLIENT_TZ).toDate() : null;
  recurring.every = every;
  recurring.period = period;
  recurring.repeatOn = repeatOn;
  recurring.nextRunAt = calculateRecurringNextRunAt(recurring);

  const repo = AppDataSource.getRepository(Recurring);
  await repo.save(recurring);

  res.json();
});

export const listRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');

  const list = await AppDataSource.getRepository(Recurring)
    .createQueryBuilder('x')
    .leftJoin(q => q.from(TaskTemplate, 'j'), 'j', 'j.id = x."taskTemplateId"')
    .leftJoin(q => q.from(User, 'u'), 'u', 'u.id = p."userId"')
    .orderBy('x."lastUpdatedAt"', 'DESC', 'NULLS LAST')
    .addOrderBy('j.name', 'ASC')
    .addOrderBy('p.name', 'ASC')
    .select([
      'x.id as id',
      'x."nameTemplate" as "nameTemplate"',
      'x."firstRunOn" as "firstRunOn"',
      'x."every" as "every"',
      'x."period" as "period"',
      'x."dueDay" as "dueDay"',
      'u.email as email',
      'j.name as "taskTemplateName"',
      `j.id as "taskTemplateId"`,
      'p.name as "portfolioName"',
      'x."lastRunAt" as "lastRunAt"',
      'x."nextRunAt" as "nextRunAt"',
      'x."lastUpdatedAt" as "lastUpdatedAt"'
    ])
    .execute();

  res.json(list);
});

export const getRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const repo = AppDataSource.getRepository(Recurring);
  const recurring = await repo.findOne({where: {id}});
  assert(recurring, 404);

  res.json(recurring);
});

export const deleteRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const repo = AppDataSource.getRepository(Recurring);
  await repo.delete({ id });

  res.json();
});

export const runRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;

  const task = await testRunRecurring(id);

  res.json(task);
});


