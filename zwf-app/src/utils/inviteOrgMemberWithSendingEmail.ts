import { User } from './../entity/User';
import { db } from './../db';
import { EntityManager } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { UserStatus } from '../types/UserStatus';
import { createNewTicketForUser } from './createNewTicketForUser';
import { UserProfile } from '../entity/UserProfile';
import { getOrgCurrentSubscriptionPeriod } from './getOrgCurrentSubscriptionPeriod';
import { sendInviteOrgMemberEmail } from './sendInviteOrgMemberEmail';


export async function inviteOrgMemberWithSendingEmail(m: EntityManager, user: User, profile: UserProfile) {
  const resetPasswordToken = uuidv4();
  user.resetPasswordToken = resetPasswordToken;
  user.status = UserStatus.ResetPassword;

  const period = await getOrgCurrentSubscriptionPeriod(m, user.orgId);
  const ticket = createNewTicketForUser(user.id, period);

  await m.save([profile, user, ticket]);

  await sendInviteOrgMemberEmail(user, profile.email);
}


