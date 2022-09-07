import { EntityManager } from 'typeorm';
import * as moment from 'moment';
import { enqueueEmailInBulk } from '../../src/services/emailService';
import { EmailTemplateType } from '../../src/types/EmailTemplateType';
import { EmailRequest } from '../../src/types/EmailRequest';
import { getEmailRecipientName } from '../../src/utils/getEmailRecipientName';
import { OrgCurrentSubscriptionInformation } from '../../src/entity/views/OrgCurrentSubscriptionInformation';
import { db } from '../../src/db';
import { UserInformation } from '../../src/entity/views/UserInformation';
import { Role } from '../../src/types/Role';

async function getOrgAdminUsers(orgId: string) {
  const users = await db.getRepository(UserInformation).find({
    where: {
      orgId,
      role: Role.Admin,
    },
    select: {
      email: true,
      givenName: true,
      surname: true,
    }
  });
  return users;
}

export async function sendSubscriptionEmail(m: EntityManager, emailTemplate: EmailTemplateType, sub: OrgCurrentSubscriptionInformation) {
  const { orgId, headBlockId: subscriptionId, endingAt } = sub;
  const adminUsers = await getOrgAdminUsers(orgId);
  const emailRequests = adminUsers.map(user => {
    const req: EmailRequest = {
      to: user.email,
      template: emailTemplate,
      shouldBcc: true,
      vars: {
        toWhom: getEmailRecipientName(user),
        subscriptionId: subscriptionId,
        endDate: moment(endingAt).format('D MMM YYYY')
      }
    };
    return req;
  });

  await enqueueEmailInBulk(m, emailRequests);
}
