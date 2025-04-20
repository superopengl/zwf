import { EntityManager } from 'typeorm';
import { TaskWatcher } from '../entity/TaskWatcher';


export async function addTaskWatcher(m: EntityManager, taskId: string, userId: string, reason: 'watch' | 'assignee' | 'mentioned' | 'client' = 'watch') {
  await m.createQueryBuilder()
    .insert()
    .into(TaskWatcher)
    .values({ taskId, userId, reason })
    .orIgnore()
    .execute();
}
