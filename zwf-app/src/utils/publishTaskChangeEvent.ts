import { Task } from '../entity/Task';
import { publishEvent } from '../services/zeventSubPubService';

export function publishTaskChangeEvent(task: Task, by: string) {
  publishEvent({
    type: 'task.change',
    userId: task.userId,
    taskId: task.id,
    orgId: task.orgId,
    by,
  });
}
