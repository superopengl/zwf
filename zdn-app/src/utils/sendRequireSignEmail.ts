import { getRepository } from 'typeorm';
import { Task } from '../entity/Task';
import { User } from '../entity/User';
import { sendEmailImmediately } from '../services/emailService';
import { getEmailRecipientName } from './getEmailRecipientName';
import { getUserEmailAddress } from './getUserEmailAddress';


export async function sendRequireSignEmail(task: Task) {
  const user = await getRepository(User).findOne(task.userId);
  const { id: taskId, name: taskName } = task;

  await sendEmailImmediately({
    to: user.profile.email,
    // bcc: [await getUserEmailAddress(task.agentId), SYSTEM_EMAIL_SENDER],
    template: 'taskToSign',
    vars: {
      toWhom: getEmailRecipientName(user),
      taskId,
      taskName,
    },
  });
}
