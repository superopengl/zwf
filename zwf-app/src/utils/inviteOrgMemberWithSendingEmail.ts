import { db } from './../db';
import { EntityManager } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { UserStatus } from '../types/UserStatus';
import { sendEmail } from '../services/emailService';
import { getEmailRecipientName } from './getEmailRecipientName';
import { EmailTemplateType } from '../types/EmailTemplateType';
import { createNewTicketForUser } from './createNewTicketForUser';


export async function inviteOrgMemberWithSendingEmail(m: EntityManager, user, profile) {
  const resetPasswordToken = uuidv4();
  user.resetPasswordToken = resetPasswordToken;
  user.status = UserStatus.ResetPassword;

  const ticket = await createNewTicketForUser(m, user.id, user.orgId);

  await m.save([profile, user, ticket]);

  const url = `${process.env.ZWF_API_DOMAIN_NAME}/r/${resetPasswordToken}/`;
  const email = profile.email;
  await sendEmail({
    to: email,
    template: EmailTemplateType.InviteOrgMember,
    vars: {
      toWhom: getEmailRecipientName(user),
      email,
      url
    },
    shouldBcc: false
  });
}


