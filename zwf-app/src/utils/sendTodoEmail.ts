import { AppDataSource } from './../db';
import { Task } from '../entity/Task';
import { User } from '../entity/User';
import { sendEmail } from '../services/emailService';
import { getEmailRecipientName } from './getEmailRecipientName';

export async function sendTodoEmail(task: Task) {
  const user = await AppDataSource.getRepository(User).findOne({where: {id: task.userId}});
  const { id: taskId, name: taskName } = task;

  await sendEmail({
    to: user.profile.email,
    // bcc: [await getUserEmailAddress(task.agentId), SYSTEM_EMAIL_SENDER],
    template: 'taskTodo',
    vars: {
      toWhom: getEmailRecipientName(user),
      taskId,
      taskName,
    },
  });
}


