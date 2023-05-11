import { TaskEventLastSeen } from '../entity/TaskEventLastSeen';
import { getUtcNow } from '../utils/getUtcNow';
import { TaskEvent } from '../entity/TaskEvent';
import { TaskEventType } from '../types/TaskEventType';
import { EntityManager } from 'typeorm';
import { assert } from '../utils/assert';
import { Task } from '../entity/Task';
import { publishZevent } from './zeventSubPubService';
import { v4 as uuidv4 } from 'uuid';
import { TaskInformation } from '../entity/views/TaskInformation';
import { emitTaskEvent } from '../utils/emitTaskEvent';

export const TASK_ACTIVITY_EVENT_TYPE = 'task.activity';


export async function createTaskComment(m: EntityManager, task: Task | TaskInformation, by: string, message: string) {
  assert(task, 500);
  const comment = new TaskEvent();
  const { orgId, id: taskId } = task;
  comment.id = uuidv4();
  comment.type = TaskEventType.Comment;
  comment.taskId = taskId;
  comment.by = by;
  comment.info = { message };
  // const result = await m.save(comment);

  await emitTaskEvent(m, TaskEventType.Comment, taskId, by, { message });

  const userId = (task as any).orgClient?.userId;
  if (userId) {
    await m.createQueryBuilder()
      .insert()
      .into(TaskEventLastSeen)
      .values({ taskId, userId, lastHappenAt: () => `NOW()` })
      .orUpdate(['lastHappenAt'], ['taskId', 'userId'])
      .execute();

    publishZevent({
      type: 'task.comment',
      userId,
      taskId,
      taskName: task.name,
      orgId,
      by,
      payload: comment
    });
  }

}
