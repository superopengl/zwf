import { getRepository } from 'typeorm';
import { Recurring } from '../entity/Recurring';
import { generateTaskByTaskTemplateAndPortfolio } from '../utils/generateTaskByTaskTemplateAndPortfolio';
import { assert } from '../utils/assert';
import { TaskStatus } from '../types/TaskStatus';
import { Task } from '../entity/Task';
import { sendNewTaskCreatedEmail } from '../utils/sendNewTaskCreatedEmail';
import * as moment from 'moment-timezone';
import 'colors';
import { calculateRecurringNextRunAt } from '../utils/calculateRecurringNextRunAt';

export const CLIENT_TZ = 'Australia/Sydney';

export const CRON_EXECUTE_TIME = process.env.NODE_ENV === 'dev' ? moment().add(2, 'minute').format('HH:mm') : '5:00';

function trySetTaskDueDateField(task: Task, dueDay: number) {
  if (!dueDay) return;
  const dueDateField = task.fields.find(x => x.name === 'Due_Date');
  if (!dueDateField) return;
  const dueDateMoment = moment().add(dueDay, 'day');
  dueDateField.value = dueDateMoment.format('DD/MM/YYYY');
  task.dueDate = dueDateMoment.toDate();
}

export async function testRunRecurring(recurringId: string) {
  const recurring = await getRepository(Recurring).findOne(recurringId);
  assert(recurring, 404);
  return executeRecurring(recurring, false);
}

export async function executeRecurring(recurring: Recurring, resetNextRunAt: boolean) {
  const { taskTemplateId, portfolioId, nameTemplate } = recurring;

  const taskName = nameTemplate.replace('{{createdDate}}', moment().format('DD MMM YYYY'));
  const task = await generateTaskByTaskTemplateAndPortfolio(
    taskTemplateId,
    portfolioId,
    () => taskName
  );

  console.log('[Recurring]'.bgYellow, 'task created', `${taskName}`.yellow);

  task.status = TaskStatus.TODO;

  trySetTaskDueDateField(task, recurring.dueDay);

  sendNewTaskCreatedEmail(task);

  await getRepository(Task).save(task);

  if (resetNextRunAt) {
    recurring.lastRunAt = new Date();
    recurring.nextRunAt = calculateRecurringNextRunAt(recurring);
    await getRepository(Recurring).save(recurring);
  }

  return task;
}

