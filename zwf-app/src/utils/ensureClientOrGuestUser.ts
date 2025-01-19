import { EntityManager } from 'typeorm';
import { User } from '../entity/User';
import { sendEmail } from '../services/emailService';
import { EmailTemplateType } from '../types/EmailTemplateType';
import { Role } from '../types/Role';
import { UserStatus } from '../types/UserStatus';
import { computeEmailHash } from './computeEmailHash';
import { createUserAndProfileEntity } from './createUserAndProfileEntity';
import { getEmailRecipientName } from './getEmailRecipientName';
import { v4 as uuidv4 } from 'uuid';
import { Org } from '../entity/Org';

/**
 * Get client user if it exists. Otherwise create a guest user
 * @param m
 * @param email
 * @returns
 */
export async function ensureClientOrGuestUser(m: EntityManager, email: string, orgId: string) {
  let user: User;
  const emailHash = computeEmailHash(email);
  user = await m.findOne(User, { where: { emailHash }, relations: { profile: true } });
  let newlyCreated = false;
  if (!user) {
    const { user: guestUser, profile } = createUserAndProfileEntity({ email, role: Role.Guest });
    await m.save([guestUser, profile]);
    user = guestUser;
    user.profile = profile;
    newlyCreated = true;
  }

  /**
   * If the user already has an account in ZeeWorkflow, send an invite to this org.
   * If the user hasn't accept the invite, resend the invite to ask for joining ZeeWorkflow.
   */
  if (user.role === Role.Guest) {
    const resetPasswordToken = uuidv4();
    user.resetPasswordToken = resetPasswordToken;
    user.status = UserStatus.ResetPassword;
    await m.save(user);

    const url = `${process.env.ZWF_API_DOMAIN_NAME}/r/${resetPasswordToken}/`;

    const org = await m.findOneBy(Org, { id: orgId });

    await sendEmail({
      to: email,
      template: EmailTemplateType.InviteNewClientUser,
      vars: {
        toWhom: getEmailRecipientName(user),
        email,
        url,
        org: org.name,
      },
      shouldBcc: false
    });
  }
  return { user, newlyCreated };
}
