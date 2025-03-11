import { Task } from '../entity/Task';
import { publishZevent } from '../services/zeventSubPubService';

export function publishTaskChangeZevent(task: Task, by: string) {
  publishZevent({
    type: 'task.change',
    userId: task.userId,
    taskId: task.id,
    taskName: task.name,
    orgId: task.orgId,
    by,
  });
}
