import { EmailTemplateType } from '../src/types/EmailTemplateType';
import { db } from '../src/db';
import errorToJson from 'error-to-json';
import 'colors';
import { start } from './jobStarter';
import { In, IsNull, LessThan } from 'typeorm';
import { EmailSentOutTask } from '../src/entity/EmailSentOutTask';
import { enqueueEmailInBulk } from '../src/services/emailService';
import { getUtcNow } from '../src/utils/getUtcNow';
import { sleep } from '../src/utils/sleep';
import { TaskWatcherEmailNotificationInformation } from '../src/entity/views/TaskWatcherEmailNotificationInformation';
import { EmailRequest } from '../src/types/EmailRequest';
import { getEmailRecipientName } from '../src/utils/getEmailRecipientName';
import { getEmailRecipientNameByNames } from '../src/utils/getEmailRecipientName';

const JOB_NAME = 'index-notify';

export async function handleEmailTasks() {
  // const takeSize = EMAIL_RATE_LIMIT_PER_SEC * EMAIL_POLLING_INTERVAL_SEC;
  // const sleepTimeMs = 1000 / EMAIL_RATE_LIMIT_PER_SEC;
  console.log('Starting index-notify');

  const jobs = await db.getRepository(TaskWatcherEmailNotificationInformation).findBy({
    unackDays: In([1, 3, 7, 10, 30]),
  });

  console.log(`Email task notification ${jobs.length} jobs to handle`);

  if (!jobs.length) {
    return;
  }

  const emailRequests = jobs.map(j => {
    const request = new EmailRequest();
    request.to = j.email;
    request.template = EmailTemplateType.TaskLongUnackEvents;
    request.vars = {
      toWhom: getEmailRecipientNameByNames(j.givenName, j.surname),
      taskName: j.taskName,
      url: `${process.env.ZWF_WEB_DOMAIN_NAME}/task/direct/${j.deepLinkId}`,
      org: j.orgName,
    }

    return request;
  });

  await enqueueEmailInBulk(db.manager, emailRequests);

  console.log(`Email task notification ${jobs.length} emails enqueued.`);
}

start(JOB_NAME, async () => {
  try {
    await handleEmailTasks();
  } catch (e) {
    console.error('Fatal error', errorToJson(e));
  }
}, { daemon: false });