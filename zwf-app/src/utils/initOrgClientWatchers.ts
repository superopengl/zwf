import { EntityManager } from 'typeorm';
import { TaskWatcher } from '../entity/TaskWatcher';
import { Task } from '../entity/Task';
import { OrgClient } from '../entity/OrgClient';


export async function initOrgClientWatchers(m: EntityManager, orgClient: OrgClient) {
  const tasks = await m.find(Task, {
    where: {
      orgClientId: orgClient.id
    },
    select: {
      id: true
    }
  });

  const taskWatchers = tasks.map(t => {
    const watcher = new TaskWatcher();
    watcher.taskId = t.id;
    watcher.userId = orgClient.userId;
    watcher.reason = 'client';
    return watcher;
  });

  await m.createQueryBuilder()
    .insert()
    .into(TaskWatcher)
    .values(taskWatchers)
    .orIgnore()
    .execute();
}
