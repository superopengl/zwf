import { UserInformation } from './../entity/views/UserInformation';
import { User } from './../entity/User';
import { UserStatus } from '../types/UserStatus';
import { sendEmail } from '../services/emailService';
import { getEmailRecipientName } from './getEmailRecipientName';
import { EmailTemplateType } from '../types/EmailTemplateType';
import { assert } from '../utils/assert';


export async function sendInviteOrgMemberEmail(user: User | UserInformation, email: string) {
  const { resetPasswordToken } = user;
  user.status = UserStatus.ResetPassword;
  assert(resetPasswordToken, 500, 'resetPasswordToken is not set yet');

  const url = `${process.env.ZWF_API_DOMAIN_NAME}/app/r/${resetPasswordToken}/`;
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
