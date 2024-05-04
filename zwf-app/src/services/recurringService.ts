import { AppDataSource } from './../db';
import { UserInformation } from './../entity/views/UserInformation';
import { createTaskByTaskTemplateAndUserEmail } from '../utils/createTaskByTaskTemplateAndUserEmail';
import { Recurring } from '../entity/Recurring';
import { assert } from '../utils/assert';
import { TaskStatus } from '../types/TaskStatus';
import { Task } from '../entity/Task';
import { sendNewTaskCreatedEmail } from '../utils/sendNewTaskCreatedEmail';
import * as moment from 'moment-timezone';
import 'colors';
import { calculateRecurringNextRunAt } from '../utils/calculateRecurringNextRunAt';

export const CLIENT_TZ = 'Australia/Sydney';

export const CRON_EXECUTE_TIME = process.env.NODE_ENV === 'dev' ? moment().add(2, 'minute').format('HH:mm') : '5:00';

export async function testRunRecurring(recurringId: string) {
  const recurring = await AppDataSource.getRepository(Recurring).findOne({where: {id: recurringId}});
  assert(recurring, 404);
  return executeRecurring(recurring, false);
}

export async function executeRecurring(recurring: Recurring, resetNextRunAt: boolean) {
  const { taskTemplateId, userId, name } = recurring;

  const taskName = `${name} ${moment().format('DD MMM YYYY')}`;
  const client = await AppDataSource.getRepository(UserInformation).findOne({where: {id: userId}});
  const clientEmail = client.email;

  const task = await createTaskByTaskTemplateAndUserEmail(taskTemplateId, taskName, clientEmail, null);

  console.log('[Recurring]'.bgYellow, 'task created', `${taskName}`.yellow);

  task.status = TaskStatus.TODO;

  sendNewTaskCreatedEmail(task);

  await AppDataSource.getRepository(Task).save(task);

  if (resetNextRunAt) {
    recurring.lastRunAt = new Date();
    recurring.nextRunAt = calculateRecurringNextRunAt(recurring);
    await AppDataSource.getRepository(Recurring).save(recurring);
  }

  return task;
}

