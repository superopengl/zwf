import errorToJson from 'error-to-json';
import 'colors';
import { start } from './jobStarter';
import { getRepository, IsNull, LessThan } from 'typeorm';
import { EmailSentOutTask } from '../src/entity/EmailSentOutTask';
import { sendEmail } from '../src/services/emailService';
import { getUtcNow } from '../src/utils/getUtcNow';

const JOB_NAME = 'email';

const EMAIL_RATE_LIMIT_PER_SEC = 13; // Max limit rate is 14/sec right now
const EMAIL_POLLING_INTERVAL_SEC = 30;

async function sleep(ms): Promise<void> {
  return new Promise(res => {
    setTimeout(() => res(), ms);
  });
}

export async function startEmailDaemon() {
  const takeSize = EMAIL_RATE_LIMIT_PER_SEC * EMAIL_POLLING_INTERVAL_SEC;
  const sleepTimeMs = 1000 / EMAIL_RATE_LIMIT_PER_SEC;
  console.log('Starting email daemon');
  while (true) {
    const emailTasks = await getRepository(EmailSentOutTask).find({
      where: {
        sentAt: IsNull(),
        failedCount: LessThan(5)
      },
      order: {
        id: 'ASC'
      },
      take: takeSize
    });

    if (emailTasks.length) {
      console.log(`Email daemon ${emailTasks.length} emails to send out`);

      let okCounter = 0;
      for (const task of emailTasks) {
        try {
          await sendEmail({
            to: task.to,
            from: task.from,
            template: task.template,
            vars: task.vars,
            attachments: task.attachments as { filename: string; path: string }[],
            shouldBcc: task.shouldBcc,
          });
          task.sentAt = getUtcNow();
          await getRepository(EmailSentOutTask).save(task);
          okCounter++;
          await sleep(sleepTimeMs);
        } catch (err) {
          console.log(`Failed to send out email ${task.id}`, errorToJson(err));
          await getRepository(EmailSentOutTask).increment({id: task.id}, 'failedCount', 1);
        }
      }
      console.log(`Email daemon ${emailTasks.length} emails to send out, ${okCounter} succedded.`);
    }

    await sleep(EMAIL_POLLING_INTERVAL_SEC * 1000); // Polling email tasks every 30 seconds
  }
}

start(JOB_NAME, async () => {
  try {
   await startEmailDaemon();
  } catch (e) {
    console.error('Fatal error', errorToJson(e));
    process.exit(1);
  }
}, { daemon: true });