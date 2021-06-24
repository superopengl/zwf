import { EntityManager, getRepository } from 'typeorm';
import { enqueueEmail } from '../services/emailService';
import { getEmailRecipientName } from './getEmailRecipientName';
import { EmailTemplateType } from '../types/EmailTemplateType';
import { createUserAuthOrgEntity } from './createUserAuthOrgEntity';
import { Org } from '../entity/Org';


export async function inviteExistingClientWithSendingEmail(m: EntityManager, orgId, user, profile) {
  const org = await m.findOne(Org, orgId);
  const authId = await createUserAuthOrgEntity(m, user.id, orgId);

  const okUrl = `${process.env.ZDN_API_DOMAIN_NAME}/api/v1/auth/org/${authId}/approve`;
  const ngUrl = `${process.env.ZDN_API_DOMAIN_NAME}/api/v1/auth/org/${authId}/reject`;
  const email = profile.email;
  await enqueueEmail({
    to: email,
    template: EmailTemplateType.RequireClientAuthorizing,
    vars: {
      toWhom: getEmailRecipientName(profile),
      email,
      okUrl,
      ngUrl,
      orgName: org.name
    },
    shouldBcc: false
  });
}
