import { Recurring } from '../entity/Recurring';
import { assert } from '../utils/assert';
import { TaskStatus } from '../types/TaskStatus';
import { Task } from '../entity/Task';
import * as moment from 'moment-timezone';
import 'colors';
import { calculateRecurringNextRunAt } from '../utils/calculateRecurringNextRunAt';
import { db } from '../db';

export const CLIENT_TZ = 'Australia/Sydney';

export const CRON_EXECUTE_TIME = process.env.NODE_ENV === 'dev' ? moment().add(2, 'minute').format('HH:mm') : '5:00';

export async function testRunRecurring(recurringId: string) {
  const recurring = await db.getRepository(Recurring).findOne({where: {id: recurringId}});
  assert(recurring, 404);
  return executeRecurring(recurring, false);
}

async function executeRecurring(recurring: Recurring, resetNextRunAt: boolean) {
  const { name } = recurring;

  // const taskTemplate = await db.getRepository(TaskTemplate).findOneBy({id: taskTemplateId});
  const taskName = `${name} ${moment().format('DD MMM YYYY')}`;
  // const task = await generateTaskByTaskTemplateAndPortfolio(
  //   taskTemplateId,
  //   () => taskName
  // );
  const task = new Task();

  console.log('[Recurring]'.bgYellow, 'task created', `${taskName}`.yellow);

  task.status = TaskStatus.TODO;

  await db.getRepository(Task).save(task);

  if (resetNextRunAt) {
    recurring.lastRunAt = new Date();
    recurring.nextRunAt = calculateRecurringNextRunAt(recurring);
    await db.getRepository(Recurring).save(recurring);
  }

  return task;
}
