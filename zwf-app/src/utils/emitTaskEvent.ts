import { EntityManager } from 'typeorm';
import { ZeventName } from '../types/ZeventName';
import { TaskEvent } from '../entity/TaskEvent';
import { Task } from '../entity/Task';
import { publishZevent } from '../services/zeventSubPubService';
import { ZEVENT_DEF_ENTITIES } from '../types/ZeventTypeDef';
import { TaskTalk } from '../entity/TaskTalk';

const ZEVENTABLE_TASKEENTTYPES = new Set(ZEVENT_DEF_ENTITIES.filter(z => true).map(z => z.name));

export async function emitTaskEvent(m: EntityManager, taskEventType: ZeventName, taskId: string, by?: string, info?: any) {
  const task = await m.findOne(Task, {
    where: {
      id: taskId,
    },
    relations: {
      orgClient: true,
      watchers: true,
    }
  });

  const taskEvent = new TaskEvent();
  taskEvent.taskId = taskId;
  taskEvent.taskName = task.name;
  taskEvent.by = by;
  taskEvent.orgId = task.orgId;
  taskEvent.type = taskEventType;
  taskEvent.info = info;

  await m.save(taskEvent);

  if (ZEVENTABLE_TASKEENTTYPES.has(taskEventType)) {
    const watcherUserIds = task.watchers.map(x => x.userId);
    if (taskEventType === ZeventName.TaskComment && !watcherUserIds.includes(by)) {
      // If comment, always publish to self, regardless if watching or not.
      watcherUserIds.push(by);
    }
    for (const userId of watcherUserIds) {
      publishZevent({
        type: 'taskEvent',
        userId,
        payload: taskEvent,
      });
    }
  }
}

export async function emitTaskTalkEvent(m: EntityManager, taskId: string, taskTalk: TaskTalk) {
  const task = await m.findOne(Task, {
    where: {
      id: taskId,
    },
    select: {
      watchers: true,
    },
    relations: {
      watchers: true,
    }
  });


  const watcherUserIds = task.watchers.map(x => x.userId);
  if (!watcherUserIds.includes(taskTalk.by)) {
    // If comment, always publish to self, regardless if watching or not.
    watcherUserIds.push(taskTalk.by);
  }
  for (const userId of watcherUserIds) {
    publishZevent({
      type: 'taskTalk',
      userId,
      payload: taskTalk,
    });
  }
}

