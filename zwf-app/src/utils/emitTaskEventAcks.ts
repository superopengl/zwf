import { EntityManager } from "typeorm";
import { publishZevent } from "../services/zeventSubPubService";
import { TaskWatcherEventAck } from "../entity/TaskWatcherEventAck";


export async function emitTaskEventAcks(m: EntityManager, eventIds: string[], userId: string) {
  if (!eventIds.length) {
    return;
  }
  const acks = eventIds.map(eventId => {
    const ack = new TaskWatcherEventAck();
    ack.userId = userId;
    ack.eventId = eventId;
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
