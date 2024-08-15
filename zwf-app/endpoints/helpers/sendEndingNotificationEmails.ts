import { db } from '../../src/db';
import { SubscriptionEndingNotificationEmailInformation } from '../../src/entity/views/SubscriptionEndingNotificationEmailInformation';
import { IsNull, Between } from 'typeorm';
import { SubscriptionBlockType } from '../../src/types/SubscriptionBlockType';
import * as moment from 'moment';
import { enqueueEmailInBulk } from '../../src/services/emailService';
import { EmailTemplateType } from '../../src/types/EmailTemplateType';
import { EmailRequest } from '../../src/types/EmailRequest';
import { getEmailRecipientNameByNames } from '../../src/utils/getEmailRecipientName';

export async function sendEndingNotificationEmails() {
  await db.transaction(async (m) => {

    const list = await m.findBy(SubscriptionEndingNotificationEmailInformation, {
      sentAt: IsNull(),
      daysBeforeEnd: Between(1, 7)
    });

    // Compose email requests
    const emailRequests = list.map(x => {
      const emailRequest: EmailRequest = {
        to: x.email,
        template: x.type === SubscriptionBlockType.Trial ? EmailTemplateType.SubscriptionTrialExpiring : EmailTemplateType.SubscriptionAutoRenewing,
        shouldBcc: true,
        vars: {
          toWhom: getEmailRecipientNameByNames(x.givenName, x.surname),
          end: moment(x.endingAt).format('D MMM YYYY'),
        }
      };
      return emailRequest;
    });

    // Enqueue email notifications
    await enqueueEmailInBulk(m, emailRequests);
  });
}
