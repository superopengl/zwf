import { TaskDoc } from './../entity/TaskDoc';
import { TaskEvent } from '../entity/TaskEvent';
import { SupportMessage } from '../entity/SupportMessage';
import { TaskWatcherEventAck } from '../entity/TaskWatcherEventAck';
import { TaskTalk } from '../entity/TaskTalk';

export type Zevent = {
  type: 'support';
  userId: string;
  payload: SupportMessage;
} | {
  type: 'taskEvent',
  userId: string,
  payload: TaskEvent,
} | {
  type: 'taskEvent.ack',
  userId: string,
  payload: TaskWatcherEventAck,
} | {
  type: 'taskTalk',
  userId: string,
  payload: TaskTalk,
};


