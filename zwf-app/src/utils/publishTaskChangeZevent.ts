import { EntityManager } from 'typeorm';
import { Task } from '../entity/Task';
import { publishZevent } from '../services/zeventSubPubService';

export async function publishTaskChangeZevent(m: EntityManager, taskId: string, by: string) {
  const task = await m.findOne(Task, {
    where: {
      id: taskId,
    },
    relations: {
      orgClient: true,
    }
  });

  await publishZevent({
    type: 'task.change',
    userId: task.orgClient?.userId,
    taskId: task.id,
    taskName: task.name,
    orgId: task.orgId,
    by,
  });
}
