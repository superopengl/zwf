import { EntityManager } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { UserStatus } from '../types/UserStatus';
import { sendEmail } from '../services/emailService';
import { getEmailRecipientName } from './getEmailRecipientName';
import { EmailTemplateType } from '../types/EmailTemplateType';


export async function inviteClientToOrgWithSendingEmail(m: EntityManager, user, profile) {
  const resetPasswordToken = uuidv4();
  user.resetPasswordToken = resetPasswordToken;
  user.status = UserStatus.ResetPassword;

  await m.save(profile);
  user.profile = profile;
  await m.save(user);

  const url = `${process.env.ZWF_API_DOMAIN_NAME}/app/r/${resetPasswordToken}/`;
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
