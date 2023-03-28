import { getRepository } from 'typeorm';
import { Task } from '../entity/Task';
import { User } from '../entity/User';
import { sendEmail } from '../services/emailService';
import { File } from '../entity/File';
import { getEmailRecipientName } from './getEmailRecipientName';
import { getUserEmailAddress } from './getUserEmailAddress';


export async function sendSignedEmail(task: Task) {
  const user = await getRepository(User).findOne(task.userId);
  const { id: taskId, docs: taskDocs, name: taskName, forWhom } = task;
  const fileIds = (taskDocs || []).filter(d => d.signedAt).map(d => d.fileId).filter(x => x);
  const attachments = fileIds.length ?
    await getRepository(File)
      .createQueryBuilder('x')
      .where(`x.id IN (:...ids)`, { ids: fileIds })
      .select(['x.fileName as filename', 'x.location as path'])
      .execute() :
    undefined;

  await sendEmail({
    to: user.profile.email,
    // bcc: [await getUserEmailAddress(task.agentId), SYSTEM_EMAIL_SENDER],
    template: 'taskSigned',
    vars: {
      toWhom: getEmailRecipientName(user),
      forWhom,
      taskId,
      taskName,
    },
    attachments,
  });
}
