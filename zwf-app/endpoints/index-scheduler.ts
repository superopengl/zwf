import { getRepository } from 'typeorm';
import { start } from './jobStarter';
import * as moment from 'moment';
import { db, refreshMaterializedView } from '../src/db';
import * as _ from 'lodash';
import { SysLog } from '../src/entity/SysLog';
import { Task } from '../src/entity/Task';
import { User } from '../src/entity/User';
import { Recurring } from '../src/entity/Recurring';
import { TaskStatus } from '../src/types/TaskStatus';
import errorToJSON from 'error-to-json';
import { calculateRecurringNextRunAt } from '../src/utils/calculateRecurringNextRunAt';
import { TaskTemplate } from '../src/entity/TaskTemplate';
import { executeRecurring } from '../src/services/recurringService';


function logging(log: {
  level?: string,
  message: string,
  data?: any
}) {
  const sysLog = new SysLog();
  sysLog.level = 'info';
  Object.assign(sysLog, log);
  sysLog.createdBy = 'cron';
  db.getRepository(SysLog).save(sysLog).catch(err => {
    console.error('Logging error', errorToJSON(err));
  });
}

async function executeSingleRecurringFromCron(recurring: Recurring): Promise<void> {
  const { id } = recurring;

  try {
    console.log('[Recurring]'.bgYellow, `Executing recuring ${id}`);
    await executeRecurring(db.manager, recurring, null, true);

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

const JOB_NAME = 'daily-recurring';

start(JOB_NAME, async () => {

  console.log('[Recurring]'.bgYellow, 'Cron job is executing');
  logging({
    message: '[Recurring] Cron job is executing'
  });

  const list = await db.getRepository(Recurring)
    .createQueryBuilder('x')
    .innerJoin(q => q.from(TaskTemplate, 'j'), 'j', 'j.id = x."taskTemplateId"')
    .innerJoin(q => q.from(User, 'u'), 'u', 'u.id = p."userId"')
    .where(`x."nextRunAt" <= now()`)
    .getMany();

  for (const r of list) {
    await executeSingleRecurringFromCron(r);
  }
  console.log('[Recurring]'.bgYellow, `Cron job finished ${list.length} recurrings`);
  logging({
    message: `[Recurring] Cron job finished ${list.length} recurrings`
  });
});

