import { EmailTemplateType } from '../types/EmailTemplateType';
import { EntityManager } from 'typeorm';
import { Org } from '../entity/Org';
import { getOrgAdminUsers } from '../../endpoints/helpers/getOrgAdminUsers';
import { EmailRequest } from '../types/EmailRequest';
import { getEmailRecipientName } from './getEmailRecipientName';
import { enqueueEmailInBulk } from '../services/emailService';

export async function sendReactivatingEmailForOrg(m: EntityManager, orgId: string) {
  const adminUsers = await getOrgAdminUsers(m, orgId);
  const { resurgingCode } = await m.findOneByOrFail(Org, { id: orgId, suspended: true });

  const emailRequests = adminUsers.map(user => {
    const ret: EmailRequest = {
      to: user.email,
      template: EmailTemplateType.SubscriptionSuspended,
      shouldBcc: true,
      vars: {
        toWhom: getEmailRecipientName(user),
        url: `${process.env.ZWF_WEB_DOMAIN_NAME}/resurge/${resurgingCode}`
      }
    };
    return ret;
  });

  await enqueueEmailInBulk(m, emailRequests);
}
