import { TaskComment } from '../entity/TaskComment';
import { SupportMessage } from '../entity/SupportMessage';

export type Zevent = {
  type: 'support';
  subtype: 'support';
  userId: string;
  payload: SupportMessage;
} | {
  type: 'task';
  subtype: 'fields';
  userId: string;
  taskId: string;
  orgId: string;
  payload: {
    taskId: string;
    fields: {[key: string]: any}
  };
} | {
  type: 'task';
  subtype: 'comment';
  userId: string;
  taskId: string;
  orgId: string;
  payload: TaskComment;
};
