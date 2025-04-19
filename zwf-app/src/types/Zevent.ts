import { TaskDoc } from './../entity/TaskDoc';
import { TaskEvent } from '../entity/TaskEvent';
import { SupportMessage } from '../entity/SupportMessage';

export type Zevent = {
  type: 'support';
  userId: string;
  by: string;
  payload: SupportMessage;
// } | {
//   type: 'task.fields';
//   userId: string;
//   taskId: string;
//   orgId: string;
//   payload: {
//     taskId: string;
//     fields: {[key: string]: any}
//   };
} | {
  type: 'task.change';
  userId: string;
  taskId: string;
  taskName: string;
  orgId: string;
  by: string;
} | {
  type: 'task.comment';
  userId: string;
  taskId: string;
  taskName: string;
  orgId: string;
  by: string;
  payload: TaskEvent;
} | {
  type: 'taskEvent',
  userId: string,
  taskEvent: TaskEvent,
};


