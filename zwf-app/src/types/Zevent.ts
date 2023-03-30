import { TaskDoc } from './../entity/TaskDoc';
import { TaskComment } from '../entity/TaskComment';
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
  orgId: string;
  by: string;
} | {
  type: 'task.comment';
  userId: string;
  taskId: string;
  orgId: string;
  by: string;
  payload: TaskComment;
};


