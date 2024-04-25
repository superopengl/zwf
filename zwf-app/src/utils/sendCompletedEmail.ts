import { TaskDoc } from './../entity/TaskDoc';
import { getRepository, IsNull, Not } from 'typeorm';
import { Task } from '../entity/Task';
import { User } from '../entity/User';
import { sendEmailImmediately } from '../services/emailService';
import { File } from '../entity/File';
import { getEmailRecipientName } from './getEmailRecipientName';
import { getUserEmailAddress } from './getUserEmailAddress';


export async function sendCompletedEmail(task: Task) {
  const user = await getRepository(User).findOne(task.userId);
  const { id: taskId, name: taskName } = task;

  const taskDocs = await getRepository(TaskDoc).find({
    where: { 
      taskId,
      fileId: Not(IsNull())
    },
    relations: [
      'file'
    ]
  });

  const attachments = taskDocs.map(doc => ({
    filename: doc.file.fileName,
    path: doc.file.location,
  }));

  await sendEmailImmediately({
    to: user.profile.email,
    // bcc: [await getUserEmailAddress(task.agentId), SYSTEM_EMAIL_SENDER],
    template: 'taskComplete',
    vars: {
      toWhom: getEmailRecipientName(user),
      taskId,
      taskName,
    },
    attachments,
  });
}
