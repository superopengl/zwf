import { getUtcNow } from '../utils/getUtcNow';
import { TaskComment } from '../entity/TaskComment';
import { TaskActionType } from '../types/TaskActionType';
import { EntityManager } from 'typeorm';
import { assert } from '../utils/assert';
import { Task } from '../entity/Task';
import { TaskCommentLastAccess } from '../entity/TaskCommentLastAccess';
import { TaskStatus } from '../types/TaskStatus';
import { publishEvent } from './globalEventSubPubService';
import { v4 as uuidv4 } from 'uuid';
import { TaskInformation } from '../entity/views/TaskInformation';

export const TASK_ACTIVITY_EVENT_TYPE = 'task.activity';


async function insertNewCommentEntity(m: EntityManager, action: TaskActionType, task: Task | TaskInformation, by: string, info?: any) {
  assert(task, 500);
  const comment = new TaskComment();
  const {userId, orgId, id: taskId} = task;
  comment.id = uuidv4();
  comment.action = action;
  comment.taskId = taskId;
  comment.by = by;
  comment.info = info;
  const result = await m.save(comment);
  await nudgeCommentAccess(m, taskId, by);

  publishEvent({
    type: 'task',
    subtype: 'comment',
    userId,
    taskId,
    orgId,
    payload: comment
  });

  return result;
}

export async function nudgeCommentAccess(m: EntityManager, taskId: string, userId: string) {
  await m.createQueryBuilder()
    .insert()
    .into(TaskCommentLastAccess)
    .values({ taskId, userId })
    .onConflict(`("taskId", "userId") DO UPDATE SET "lastAccessAt" = now()`)
    .execute();
}

export async function logTaskCreated(m: EntityManager, task: Task, by: string) {
  return await insertNewCommentEntity(m, TaskActionType.Created, task, by);
}

export async function logTaskAssigned(m: EntityManager, task: Task, by: string, assigneeId: string) {
  return await insertNewCommentEntity(m, TaskActionType.Assigned, task, by, assigneeId);
}

export async function logTaskDocSignedByClient(m: EntityManager, task: Task, clientId: string, taskDocId: string, name: string) {
  return await insertNewCommentEntity(m, TaskActionType.DocSigned, task, clientId, {taskDocId, name});
}

export async function logTaskStatusChange(m: EntityManager, task: Task, by: string, oldStatus: TaskStatus, newStatus: TaskStatus) {
  return await insertNewCommentEntity(m, TaskActionType.StatusChange, task, by, { oldStatus, newStatus });
}

export async function logTaskChat(m: EntityManager, task: Task | TaskInformation, by: string, message: string) {
  return await insertNewCommentEntity(m, TaskActionType.Chat, task, by, message);
}