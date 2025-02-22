import { getUtcNow } from './../utils/getUtcNow';
import { TaskTracking } from './../entity/TaskTracking';
import { TaskActionType } from './../types/TaskActionType';
import { EntityManager } from 'typeorm';
import { assert } from '../utils/assert';
import { Task } from '../entity/Task';
import { TaskTrackingLastAccess } from '../entity/TaskTrackingLastAccess';
import { TaskStatus } from '../types/TaskStatus';
import { publishEvent } from '../services/globalEventSubPubService';
import { v4 as uuidv4 } from 'uuid';
import { TaskInformation } from '../entity/views/TaskInformation';

export const TASK_ACTIVITY_EVENT_TYPE = 'task.activity';


async function insertNewTrackingEntity(m: EntityManager, action: TaskActionType, task: Task | TaskInformation, by: string, info?: any) {
  assert(task, 500);
  const tracking = new TaskTracking();
  const {userId, orgId, id: taskId} = task;
  tracking.id = uuidv4();
  tracking.action = action;
  tracking.taskId = taskId;
  tracking.by = by;
  tracking.info = info;
  const result = await m.save(tracking);
  await nudgeTrackingAccess(m, taskId, by);

  publishEvent({
    type: 'task',
    subtype: 'trackings',
    userId,
    taskId,
    orgId,
    payload: tracking
  });

  return result;
}

export async function nudgeTrackingAccess(m: EntityManager, taskId: string, userId: string) {
  await m.createQueryBuilder()
    .insert()
    .into(TaskTrackingLastAccess)
    .values({ taskId, userId })
    .onConflict(`("taskId", "userId") DO UPDATE SET "lastAccessAt" = now()`)
    .execute();
}

export async function logTaskCreated(m: EntityManager, task: Task, by: string) {
  return await insertNewTrackingEntity(m, TaskActionType.Created, task, by);
}

export async function logTaskAssigned(m: EntityManager, task: Task, by: string, assigneeId: string) {
  return await insertNewTrackingEntity(m, TaskActionType.Assigned, task, by, assigneeId);
}

export async function logTaskDocSignedByClient(m: EntityManager, task: Task, clientId: string, taskDocId: string, name: string) {
  return await insertNewTrackingEntity(m, TaskActionType.DocSigned, task, clientId, {taskDocId, name});
}

export async function logTaskStatusChange(m: EntityManager, task: Task, by: string, oldStatus: TaskStatus, newStatus: TaskStatus) {
  return await insertNewTrackingEntity(m, TaskActionType.StatusChange, task, by, { oldStatus, newStatus });
}

export async function logTaskChat(m: EntityManager, task: Task | TaskInformation, by: string, message: string) {
  return await insertNewTrackingEntity(m, TaskActionType.Chat, task, by, message);
}