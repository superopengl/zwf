import { TaskActivityLastSeen } from '../entity/TaskActivityLastSeen';
import { getUtcNow } from '../utils/getUtcNow';
import { TaskActivity } from '../entity/TaskActivity';
import { TaskActionType } from '../types/TaskActionType';
import { EntityManager } from 'typeorm';
import { assert } from '../utils/assert';
import { Task } from '../entity/Task';
import { publishZevent } from './zeventSubPubService';
import { v4 as uuidv4 } from 'uuid';
import { TaskInformation } from '../entity/views/TaskInformation';

export const TASK_ACTIVITY_EVENT_TYPE = 'task.activity';


async function insertNewCommentEntity(m: EntityManager, action: TaskActionType, task: Task | TaskInformation, by: string, info?: any) {
  assert(task, 500);
  const comment = new TaskActivity();
  const { userId, orgId, id: taskId } = task;
  comment.id = uuidv4();
  comment.type = action;
  comment.taskId = taskId;
  comment.by = by;
  comment.info = info;
  const result = await m.save(comment);

  await m.createQueryBuilder()
    .insert()
    .into(TaskActivityLastSeen)
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

  return result;
}

export async function createTaskComment(m: EntityManager, task: Task | TaskInformation, by: string, message: string) {
  return await insertNewCommentEntity(m, TaskActionType.Comment, task, by, message);
}