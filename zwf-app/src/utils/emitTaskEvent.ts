import { EntityManager } from "typeorm";
import { TaskEventType } from "../types/TaskEventType";
import { TaskEvent } from "../entity/TaskEvent";
import { publishTaskChangeZevent } from "./publishTaskChangeZevent";
import { Task } from "../entity/Task";
import { publishZevent } from "../services/zeventSubPubService";

const ZEVENTABLE_TASKEENTTYPES = new Set([
  TaskEventType.ClientSignDoc,
  TaskEventType.RequestClientSign,
  TaskEventType.ClientSubmit,
  TaskEventType.FieldSchemaChange,
  TaskEventType.FieldValuesChange,
  TaskEventType.Complete,
  TaskEventType.Archive,
  TaskEventType.Comment,
]);

export async function emitTaskEvent(m: EntityManager, taskEventType: TaskEventType, taskId: string, by?: string, info?: any) {
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
  taskEvent.by = by;
  taskEvent.orgId = task.orgId;
  taskEvent.type = taskEventType;
  taskEvent.info = info;

  await m.save(taskEvent);

  if (ZEVENTABLE_TASKEENTTYPES.has(taskEventType)) {
    const watcherUserIds = task.watchers.map(x => x.userId);
    for (const userId of watcherUserIds) {
      publishZevent({
        type: 'taskEvent',
        taskEvent,
        userId,
      })
    }
  }
}