import { getRepository } from 'typeorm';
import { Task } from '../entity/Task';
import { User } from '../entity/User';
import { sendEmail } from '../services/emailService';
import { File } from '../entity/File';
import { getEmailRecipientName } from './getEmailRecipientName';
import { getUserEmailAddress } from './getUserEmailAddress';

export async function sendTodoEmail(task: Task) {
  const user = await getRepository(User).findOne(task.userId);
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


