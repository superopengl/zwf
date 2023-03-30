import { TaskComment } from '../entity/TaskComment';
import { SupportMessage } from '../entity/SupportMessage';

export type Zevent = {
  type: 'support';
  userId: string;
  payload: SupportMessage;
} | {
  type: 'task.fields';
  userId: string;
  taskId: string;
  orgId: string;
  payload: {
    taskId: string;
    fields: {[key: string]: any}
  };
} | {
  type: 'task.comment';
  userId: string;
  taskId: string;
  orgId: string;
  payload: TaskComment;
};
