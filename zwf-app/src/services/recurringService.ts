import { db } from './../db';
import { UserInformation } from './../entity/views/UserInformation';
import { createTaskForClientByFemplate } from '../utils/createTaskForClientByFemplate';
import { Recurring } from '../entity/Recurring';
import { assert } from '../utils/assert';
import { TaskStatus } from '../types/TaskStatus';
import { Task } from '../entity/Task';
import * as moment from 'moment-timezone';
import 'colors';
import { calculateRecurringNextRunAt } from '../utils/calculateRecurringNextRunAt';
import { EntityManager } from 'typeorm';

export const CLIENT_TZ = 'Australia/Sydney';

export const CRON_EXECUTE_TIME = process.env.NODE_ENV === 'dev' ? moment().add(2, 'minute').format('HH:mm') : '5:00';

export async function testRunRecurring(recurringId: string, orgId: string, executorId: string) {
  let task: Task;
  await db.transaction(async m => {
    const recurring = await m.getRepository(Recurring).findOneBy({ id: recurringId, orgId });
    assert(recurring, 404);
    task = await executeRecurring(m, recurring, executorId, false);
  })
  return task;
}

export async function executeRecurring(m: EntityManager, recurring: Recurring, executorId: string, resetNextRunAt: boolean) {
  const { femplateId, orgClientId, name, orgId } = recurring;

  const taskName = `${name} ${moment().format('D MMM YYYY')}`;

  const task = await createTaskForClientByFemplate(m, femplateId, taskName, orgClientId, executorId, null, orgId);
  task.status = TaskStatus.TODO;
  
  console.log('[Recurring]'.bgYellow, 'task created', `${taskName}`.yellow);
  
  const entitiesToSave: any[] = [task]

  if (resetNextRunAt) {
    recurring.lastRunAt = new Date();
    recurring.nextRunAt = calculateRecurringNextRunAt(recurring);
    entitiesToSave.push(recurring);
  }
  await m.save(entitiesToSave);

  return task;
}

