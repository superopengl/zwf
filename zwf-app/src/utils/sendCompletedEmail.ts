import { AppDataSource } from './../db';
import { IsNull, Not } from 'typeorm';
import { Task } from '../entity/Task';
import { User } from '../entity/User';
import { sendEmail } from '../services/emailService';
import { getEmailRecipientName } from './getEmailRecipientName';


export async function sendCompletedEmail(task: Task) {
  const user = await AppDataSource.getRepository(User).findOne({where: {id: task.userId}});
  const { id: taskId, name: taskName } = task;

  // const taskDocs = await AppDataSource.getRepository(TaskDoc).find({
  //   where: { 
  //     taskId,
  //     fileId: Not(IsNull())
  //   },
  //   relations: [
  //     'file'
  //   ]
  // });

  const attachments = [];
  // const attachments = taskDocs.map(doc => ({
  //   filename: doc.file.fileName,
  //   path: doc.file.location,
  // }));

  await sendEmail({
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
