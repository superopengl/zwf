import { OrgSubscriptionPeriod } from '../../src/entity/OrgSubscriptionPeriod';
import { EntityManager } from 'typeorm';
import * as moment from 'moment';
import { enqueueEmailInBulk } from '../../src/services/emailService';
import { EmailTemplateType } from '../../src/types/EmailTemplateType';
import { EmailRequest } from '../../src/types/EmailRequest';
import { getEmailRecipientName } from '../../src/utils/getEmailRecipientName';
import { getOrgAdminUsers } from './getOrgAdminUsers';

export async function sendPaymentCompletedEmail(m: EntityManager,
  emailTemplate: EmailTemplateType,
  period: OrgSubscriptionPeriod,
  invoiceInfo: { fileName: string, url: string }
) {
  const { orgId, periodTo } = period;
  const adminUsers = await getOrgAdminUsers(m, orgId);
  const emailRequests = adminUsers.map(user => {
    const req: EmailRequest = {
      to: user.email,
      template: emailTemplate,
      shouldBcc: true,
      vars: {
        toWhom: getEmailRecipientName(user),
        endDate: moment(periodTo).format('D MMM YYYY')
      },
      attachments: [
        { filename: invoiceInfo.fileName, path: invoiceInfo.url }
      ]
    };
    return req;
  });

  await enqueueEmailInBulk(m, emailRequests);
}
