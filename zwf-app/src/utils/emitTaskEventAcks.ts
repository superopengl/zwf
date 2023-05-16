import { EntityManager } from "typeorm";
import { publishZevent } from "../services/zeventSubPubService";
import { TaskWatcherEventAck } from "../entity/TaskWatcherEventAck";


export async function emitTaskEventAcks(m: EntityManager, taskEventIds: string[], userId: string) {
  if (!taskEventIds.length) {
    return;
  }
  const acks = taskEventIds.map(x => {
    const ack = new TaskWatcherEventAck();
    ack.userId = userId;
    ack.taskEventId = x;
    return ack;
  });

  await m.createQueryBuilder()
    .insert()
    .into(TaskWatcherEventAck)
    .values(acks)
    .orIgnore()
    .execute();

  acks.forEach(ack => {
    publishZevent({
      type: 'taskEvent.ack',
      userId,
      payload: ack,
    });
  });

}
