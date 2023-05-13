import { EntityManager } from 'typeorm';
import { TaskWatcher } from '../entity/TaskWatcher';
import { TaskWatcherReason } from '../types/TaskWatcherReason';

export async function addTaskWatcher(m: EntityManager, taskId: string, userId: string, reason: TaskWatcherReason = 'watch') {
  await m.createQueryBuilder()
    .insert()
    .into(TaskWatcher)
    .values({ taskId, userId, reason })
    .orIgnore()
    .execute();
}
