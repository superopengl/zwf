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
import { Femplate } from '../src/entity/Femplate';
import { executeRecurring } from '../src/services/recurringService';


function logging(log: {
  level?: string,
  message: string,
  data?: any
}) {
  const sysLog = new SysLog();
  sysLog.level = 'info';
  Object.assign(sysLog, log);
  sysLog.createdBy = 'recurring';
  db.getRepository(SysLog).save(sysLog).catch(err => {
    console.error('Logging error', errorToJSON(err));
  });
}

async function executeSingleRecurring(recurring: Recurring): Promise<void> {
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

  console.log('[Recurring]'.bgYellow, 'Recurring job is executing');
  logging({
    message: '[Recurring] Recurring job is executing'
  });

  const list = await db.getRepository(Recurring)
    .createQueryBuilder('r')
    .innerJoin(q => q.from(Femplate, 'j'), 'j', 'j.id = r."femplateId"')
    .innerJoin(q => q.from(User, 'u'), 'u', 'u.id = r."userId"')
    .where(`r."nextRunAt" <= now()`)
    .getMany();

  for (const r of list) {
    await executeSingleRecurring(r);
  }
  console.log('[Recurring]'.bgYellow, `Recurring job finished ${list.length} recurrings`);
  logging({
    message: `[Recurring] Recurring job finished ${list.length} recurrings`
  });
});

