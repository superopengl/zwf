import { EntityManager } from 'typeorm';
import * as moment from 'moment';
import { enqueueEmailInBulk } from '../../src/services/emailService';
import { EmailTemplateType } from '../../src/types/EmailTemplateType';
import { EmailRequest } from '../../src/types/EmailRequest';
import { getEmailRecipientName } from '../../src/utils/getEmailRecipientName';
import { UserInformation } from '../../src/entity/views/UserInformation';
import { Role } from '../../src/types/Role';
import { SubscriptionBlock } from '../../src/entity/SubscriptionBlock';
import { OrgCurrentSubscriptionInformation } from '../../src/entity/views/OrgCurrentSubscriptionInformation';

async function getOrgAdminUsers(m: EntityManager, orgId: string) {
  const users = await m.getRepository(UserInformation).find({
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

export async function sendSubscriptionEmail(m: EntityManager, emailTemplate: EmailTemplateType, info: SubscriptionBlock | OrgCurrentSubscriptionInformation) {
  const { orgId, endingAt } = info;
  const adminUsers = await getOrgAdminUsers(m, orgId);
  const emailRequests = adminUsers.map(user => {
    const req: EmailRequest = {
      to: user.email,
      template: emailTemplate,
      shouldBcc: true,
      vars: {
        toWhom: getEmailRecipientName(user),
        endDate: moment(endingAt).format('D MMM YYYY')
      }
    };
    return req;
  });

  await enqueueEmailInBulk(m, emailRequests);
}
