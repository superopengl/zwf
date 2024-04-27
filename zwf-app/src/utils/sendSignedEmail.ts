import { getRepository } from 'typeorm';
import { Task } from '../entity/Task';
import { User } from '../entity/User';
import { sendEmailImmediately } from '../services/emailService';
import { File } from '../entity/File';
import { getEmailRecipientName } from './getEmailRecipientName';
import { getUserEmailAddress } from './getUserEmailAddress';
import { AppDataSource } from '../db';


export async function sendSignedEmail(task: Task) {
  const user = await AppDataSource.getRepository(User).findOne({where: {id: task.userId}});
  const { id: taskId, name: taskName } = task;
  const fileIds = [] //(taskDocs || []).filter(d => d.signedAt).map(d => d.fileId).filter(x => x);
  const attachments = fileIds.length ?
    await AppDataSource.getRepository(File)
      .createQueryBuilder('x')
      .where(`x.id IN (:...ids)`, { ids: fileIds })
      .select(['x.fileName as filename', 'x.location as path'])
      .execute() :
    undefined;

  await sendEmailImmediately({
    to: user.profile.email,
    // bcc: [await getUserEmailAddress(task.agentId), SYSTEM_EMAIL_SENDER],
    template: 'taskSigned',
    vars: {
      toWhom: getEmailRecipientName(user),
      taskId,
      taskName,
    },
    attachments,
  });
}
