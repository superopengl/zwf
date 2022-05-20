import { getRepository } from 'typeorm';
import { Recurring } from '../entity/Recurring';
import { SysLog } from '../entity/SysLog';
import { assert } from '../utils/assert';
import { TaskStatus } from '../types/TaskStatus';
import { Task } from '../entity/Task';
import errorToJSON from 'error-to-json';
import { TaskTemplate } from '../entity/TaskTemplate';
import { User } from '../entity/User';
import { sendNewTaskCreatedEmail } from '../utils/sendNewTaskCreatedEmail';
import * as moment from 'moment-timezone';
import 'colors';
import { calculateRecurringNextRunAt } from '../utils/calculateRecurringNextRunAt';
import { AppDataSource } from '../db';

export const CLIENT_TZ = 'Australia/Sydney';

export const CRON_EXECUTE_TIME = process.env.NODE_ENV === 'dev' ? moment().add(2, 'minute').format('HH:mm') : '5:00';
const PROD_CRON_PATTERN = CRON_EXECUTE_TIME.replace(/(.*):(.*)/, '0 $2 $1 * * *'); // at 5 am every day


console.log('PROD_CRON_PATTERN', PROD_CRON_PATTERN);

let cronJob = null;

function stopRunningCronJob() {
  cronJob?.stop();
}

function getCronPattern() {
  if (process.env.NODE_ENV === 'dev') {
    return '*/10 * * * * *';
  } else {
    return PROD_CRON_PATTERN;
  }
}


function logging(log: {
  level?: string,
  message: string,
  data?: any
}) {
  const sysLog = new SysLog();
  sysLog.level = 'info';
  Object.assign(sysLog, log);
  sysLog.createdBy = 'cron';
  AppDataSource.getRepository(SysLog).save(sysLog).catch(err => {
    console.error('Logging error', errorToJSON(err));
  });
}

export async function testRunRecurring(recurringId: string) {
  const recurring = await AppDataSource.getRepository(Recurring).findOne({where: {id: recurringId}});
  assert(recurring, 404);
  return executeRecurring(recurring, false);
}

async function executeRecurring(recurring: Recurring, resetNextRunAt: boolean) {
  const { taskTemplateId, nameTemplate } = recurring;

  const taskName = nameTemplate.replace('{{createdDate}}', moment().format('DD MMM YYYY'));
  // const task = await generateTaskByTaskTemplateAndPortfolio(
  //   taskTemplateId,
  //   () => taskName
  // );
  const task = new Task()

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

async function executeSingleRecurringFromCron(recurring: Recurring): Promise<void> {
  const { id } = recurring;

  try {
    console.log('[Recurring]'.bgYellow, `Executing recuring ${id}`);
    await executeRecurring(recurring, true);

    logging({
      message: 'Recurring complete',
      data: {
        recurringId: id
      }
    });


    console.log('[Recurring]'.bgYellow, `Done with recuring ${id}`);
  } catch (err) {
    logging({
      level: 'error',
      message: 'Recurring error',
      data: {
        recurringId: id,
        error: errorToJSON(err)
      }
    });

    console.error('[Recurring]'.bgYellow, `Error from recuring ${id}`, err);
  }
}

// export function startCronService() {
//   try {
//     console.log('[Recurring]'.bgYellow, `Starting cron service`);

//     startCronJob();

//     console.log('[Recurring]'.bgYellow, `Started cron service`);
//     logging({
//       message: 'Cron service started'
//     });
//   } catch (e) {
//     console.error('[Recurring]'.bgYellow, `Failed to start cron service`, errorToJSON(e));
//     logging({
//       level: 'error',
//       message: 'Failed to restart cron service',
//       data: errorToJSON(e)
//     });
//   }
// }
