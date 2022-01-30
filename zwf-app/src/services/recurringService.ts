import { UserInformation } from './../entity/views/UserInformation';
import { createTaskByTaskTemplateAndUserEmail } from './../utils/generateTaskByTaskTemplateAndPortfolio';
import { getRepository } from 'typeorm';
import { Recurring } from '../entity/Recurring';
import { assert } from '../utils/assert';
import { TaskStatus } from '../types/TaskStatus';
import { Task } from '../entity/Task';
import { sendNewTaskCreatedEmail } from '../utils/sendNewTaskCreatedEmail';
import * as moment from 'moment-timezone';
import 'colors';
import { calculateRecurringNextRunAt } from '../utils/calculateRecurringNextRunAt';
import { createNewTask } from '../api';

export const CLIENT_TZ = 'Australia/Sydney';

export const CRON_EXECUTE_TIME = process.env.NODE_ENV === 'dev' ? moment().add(2, 'minute').format('HH:mm') : '5:00';

export async function testRunRecurring(recurringId: string) {
  const recurring = await getRepository(Recurring).findOne(recurringId);
  assert(recurring, 404);
  return executeRecurring(recurring, false);
}

export async function executeRecurring(recurring: Recurring, resetNextRunAt: boolean) {
  const { taskTemplateId, userId, nameTemplate } = recurring;

  const taskName = nameTemplate.replace('{{createdDate}}', moment().format('DD MMM YYYY'));
  const client = await getRepository(UserInformation).findOne({id: userId});
  const clientEmail = client.email;

  const task = await createTaskByTaskTemplateAndUserEmail(taskTemplateId, taskName, clientEmail, {});

  console.log('[Recurring]'.bgYellow, 'task created', `${taskName}`.yellow);

  task.status = TaskStatus.TODO;

  sendNewTaskCreatedEmail(task);

  await getRepository(Task).save(task);

  if (resetNextRunAt) {
    recurring.lastRunAt = new Date();
    recurring.nextRunAt = calculateRecurringNextRunAt(recurring);
    await getRepository(Recurring).save(recurring);
  }

  return task;
}
