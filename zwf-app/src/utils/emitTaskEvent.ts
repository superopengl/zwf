import { EntityManager } from "typeorm";
import { ZeventType } from "../types/ZeventTypeDef";
import { TaskEvent } from "../entity/TaskEvent";
import { Task } from "../entity/Task";
import { publishZevent } from "../services/zeventSubPubService";

const ZEVENTABLE_TASKEENTTYPES = new Set([
  ZeventType.ClientSignedDoc,
  ZeventType.RequestClientSignDoc,
  ZeventType.ClientSubmittedForm,
  ZeventType.TaskFormSchemaChanged,
  ZeventType.TaskFieldValueChanged,
  ZeventType.TaskStatusCompleted,
  ZeventType.TaskStatusArchived,
  ZeventType.TaskComment,
]);

export async function emitTaskEvent(m: EntityManager, taskEventType: ZeventType, taskId: string, by?: string, info?: any) {
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
    if (taskEventType === ZeventType.TaskComment && !watcherUserIds.includes(by)) {
      // If comment, always publish to self, regardless if watching or not.
      watcherUserIds.push(by);
    }
    for (const userId of watcherUserIds) {
      publishZevent({
        type: 'taskEvent',
        userId,
        payload: taskEvent,
      })
    }
  }
}

