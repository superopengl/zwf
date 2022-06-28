import { EmailTemplateType } from './../src/types/EmailTemplateType';
import { AppDataSource } from './../src/db';
import errorToJson from 'error-to-json';
import 'colors';
import { start } from './jobStarter';
import { IsNull, LessThan } from 'typeorm';
import { EmailSentOutTask } from '../src/entity/EmailSentOutTask';
import { sendEmail } from '../src/services/emailService';
import { getUtcNow } from '../src/utils/getUtcNow';
import { sleep } from '../src/utils/sleep';

const JOB_NAME = 'email-sender';

const EMAIL_RATE_LIMIT_PER_SEC = 13; // Max limit rate is 14/sec right now
const EMAIL_POLLING_INTERVAL_SEC = 30;

export async function handleEmailTasks() {
  const takeSize = EMAIL_RATE_LIMIT_PER_SEC * EMAIL_POLLING_INTERVAL_SEC;
  const sleepTimeMs = 1000 / EMAIL_RATE_LIMIT_PER_SEC;
  console.log('Starting email daemon');
  const emailTasks = await AppDataSource.getRepository(EmailSentOutTask).find({
    where: {
      sentAt: IsNull(),
      failedCount: LessThan(5)
    },
    order: {
      id: 'ASC'
    },
    take: takeSize
  });

  console.log(`Email sender ${emailTasks.length} emails to send out`);

  if (!emailTasks.length) {
    return;
  }

  let okCounter = 0;
  for (const task of emailTasks) {
    try {
      await sendEmail({
        to: task.to,
        from: task.from,
        template: task.template as EmailTemplateType,
        vars: task.vars,
        attachments: task.attachments as { filename: string; path: string }[],
        shouldBcc: task.shouldBcc,
      });
      task.sentAt = getUtcNow();
      await AppDataSource.getRepository(EmailSentOutTask).save(task);
      okCounter++;
      await sleep(sleepTimeMs);
    } catch (err) {
      console.log(`Failed to send out email ${task.id}`, errorToJson(err));
      await AppDataSource.getRepository(EmailSentOutTask).increment({ id: task.id }, 'failedCount', 1);
    }
  }
  console.log(`Email sender ${emailTasks.length} emails to send out, ${okCounter} succeeded.`);
}

start(JOB_NAME, async () => {
  try {
    await handleEmailTasks();
  } catch (e) {
    console.error('Fatal error', errorToJson(e));
  }
}, { daemon: false });