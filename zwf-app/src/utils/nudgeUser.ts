import { AppDataSource } from './../db';
import * as _ from 'lodash';
import { User } from '../entity/User';
import * as moment from 'moment';

const isProd = process.env.NODE_ENV === 'prod';
const map = new Map<string, moment.Moment>();
const intervalMs = isProd ? 1000 * 60 * 5 : 5000; // 5 minute in prod
const chunkSize = 1000;
let started = false;

function bulkUpdateUser() {
  try {
    const { schema, tableName } = AppDataSource.getRepository(User).metadata;
    const list = Array.from(map.entries())
      .map(([userId, time]) => {
        const sql = `('${userId}', '${time.format('YYYY/MM/DD HH:mm:ss.SSS')}')`;
        map.delete(userId);
        return sql;
      });

    const chunks = _.chunk(list, chunkSize);
    for (const chunk of chunks) {
      const param = chunk.join(',');
      AppDataSource.manager
        .query(`
update "${schema}"."${tableName}" as u
set "lastNudgedAt" = TO_TIMESTAMP(v.time, 'YYYY/MM/DD HH24:MI:SS.MS')
from (values ${param}
) as v (id, "time")
where u.id = v.id::uuid;`)
        .catch(err => console.log('Nudge user error', err));
    }
  } catch (err) {
    console.log('Nudge user interval handler error', err);
  }
}

export function nudgeUser(userId) {
  map.set(userId, moment());
  if (!started) {
    setInterval(bulkUpdateUser, intervalMs);
    started = true;
  }
}