import { EntityManager } from 'typeorm';
import { Task } from '../entity/Task';
import { publishZevent } from '../services/zeventSubPubService';

export async function publishTaskChangeZevent(m: EntityManager, task: Task, by: string) {
  await publishZevent({
    type: 'task.change',
    userId: task.orgClient?.userId,
    taskId: task.id,
    taskName: task.name,
    orgId: task.orgId,
    by,
  });
}
