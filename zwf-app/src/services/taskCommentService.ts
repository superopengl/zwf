import { ActivityWatch } from '../entity/ActivityWatch';
import { getUtcNow } from '../utils/getUtcNow';
import { TaskComment } from '../entity/TaskComment';
import { TaskActionType } from '../types/TaskActionType';
import { EntityManager } from 'typeorm';
import { assert } from '../utils/assert';
import { Task } from '../entity/Task';
import { TaskCommentLastAccess } from '../entity/TaskCommentLastAccess';
import { TaskStatus } from '../types/TaskStatus';
import { publishEvent } from './zeventSubPubService';
import { v4 as uuidv4 } from 'uuid';
import { TaskInformation } from '../entity/views/TaskInformation';

export const TASK_ACTIVITY_EVENT_TYPE = 'task.activity';


async function insertNewCommentEntity(m: EntityManager, action: TaskActionType, task: Task | TaskInformation, by: string, info?: any) {
  assert(task, 500);
  const comment = new TaskComment();
  const { userId, orgId, id: taskId } = task;
  comment.id = uuidv4();
  comment.action = action;
  comment.taskId = taskId;
  comment.by = by;
  comment.info = info;
  const result = await m.save(comment);
  await nudgeCommentAccess(m, taskId, by);

  publishEvent({
    type: 'task.comment',
    userId,
    taskId,
    orgId,
    by,
    payload: comment
  });

  return result;
}

export async function nudgeCommentAccess(m: EntityManager, taskId: string, userId: string) {
  await m.createQueryBuilder()
    .insert()
    .into(ActivityWatch)
    .values({ taskId, userId, type: 'task-comment', lastHappenAt: () => `NOW()` })
    .orUpdate(['lastHappenAt'])
    .execute();
}


export async function logTaskChat(m: EntityManager, task: Task | TaskInformation, by: string, message: string) {
  return await insertNewCommentEntity(m, TaskActionType.Chat, task, by, message);
}