import { AppDataSource } from './../db';
import { OrgClient } from './../entity/OrgClient';

import { User } from '../entity/User';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
import { validatePasswordStrength } from '../utils/validatePasswordStrength';
import { v4 as uuidv4 } from 'uuid';
import { UserStatus } from '../types/UserStatus';
import { computeUserSecret } from '../utils/computeUserSecret';
import { handlerWrapper } from '../utils/asyncHandler';
import { sendEmail } from '../services/emailService';
import { getUtcNow } from '../utils/getUtcNow';
import { Role } from '../types/Role';
import * as jwt from 'jsonwebtoken';
import { attachJwtCookie, clearJwtCookie } from '../utils/jwt';
import { getEmailRecipientName } from '../utils/getEmailRecipientName';
import { logUserLogin } from '../utils/loginLog';
import { sanitizeUser } from '../utils/sanitizeUser';
import { getActiveUserByEmailWithProfile } from '../utils/getActiveUserByEmailWithProfile';
import { UserProfile } from '../entity/UserProfile';
import { EmailTemplateType } from '../types/EmailTemplateType';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { OrgAliveSubscription } from '../entity/views/OrgAliveSubscription';
import { inviteOrgMemberWithSendingEmail } from '../utils/inviteOrgMemberWithSendingEmail';
import { createUserAndProfileEntity } from '../utils/createUserAndProfileEntity';
import { ensureClientOrGuestUser } from '../utils/ensureClientOrGuestUser';

export const getAuthUser = handlerWrapper(async (req, res) => {
  let { user } = (req as any);
  if (user) {
    const email = user.profile.email;
    user = await getActiveUserByEmailWithProfile(email);
    attachJwtCookie(user, res);
  }
  res.json(user || null);
});

export const login = handlerWrapper(async (req, res) => {
  const { name, password } = req.body;

  const user = await getActiveUserByEmailWithProfile(name);

  assert(user, 400, 'User or password is not valid');

  // Validate passpord
  const hash = computeUserSecret(password, user.salt);
  assert(hash === user.secret, 400, 'User or password is not valid');

  user.lastLoggedInAt = getUtcNow();
  user.resetPasswordToken = null;
  user.status = UserStatus.Enabled;
  user.role = user.role === Role.Guest ? Role.Client : user.role;

  await AppDataSource.getRepository(User).save(user);

  attachJwtCookie(user, res);

  logUserLogin(user, req, 'local');

  res.json(sanitizeUser(user));
});

export const logout = handlerWrapper(async (req, res) => {
  clearJwtCookie(res);
  res.json();
});


async function createNewLocalUser(payload): Promise<{ user: User; profile: UserProfile }> {
  const { user, profile } = createUserAndProfileEntity(payload);

  user.resetPasswordToken = uuidv4();
  user.status = UserStatus.ResetPassword;

  await AppDataSource.manager.save([profile, user]);

  return { user, profile };
}


export const signUp = handlerWrapper(async (req, res) => {
  const payload = req.body;
  const role = payload.role || Role.Client;

  const { user, profile } = await createNewLocalUser({
    ...payload,
    orgOwner: false,
    role: Role.Client,
    password: uuidv4(), // Temp password to fool the functions beneath
  });

  const { id, resetPasswordToken } = user;
  const { email } = profile;

  const url = `${process.env.ZWF_API_DOMAIN_NAME}/r/${resetPasswordToken}/`;
  await sendEmail({
    template: role === Role.Admin ? EmailTemplateType.WelcomeOrg : EmailTemplateType.WelcomeClient,
    to: email,
    vars: {
      email,
      url
    },
    shouldBcc: true
  });

  const info = {
    id,
    email
  };

  res.json(info);
});

export const signUpOrg = handlerWrapper(async (req, res) => {
  const { email } = req.body;

  assert(email, 400, 'email is required');

  const { user } = await createNewLocalUser({
    email: email.toLowerCase(),
    orgOwner: true,
    password: uuidv4(), // Temp password to fool the functions beneath
    role: Role.Admin,
  });

  const { id, resetPasswordToken } = user;

  const url = `${process.env.ZWF_API_DOMAIN_NAME}/r/${resetPasswordToken}/`;
  await sendEmail({
    template: EmailTemplateType.WelcomeOrg,
    to: email,
    vars: {
      email,
      url
    },
    shouldBcc: true
  });

  const info = {
    id,
    email
  };

  res.json(info);
});

async function setUserToResetPasswordStatus(user: User, returnUrl: string) {
  const userRepo = AppDataSource.getRepository(User);
  const resetPasswordToken = uuidv4();
  user.resetPasswordToken = resetPasswordToken;
  user.status = UserStatus.ResetPassword;

  const returnUrlParam = returnUrl ? `?r=${encodeURIComponent(returnUrl)}` : '';
  const url = `${process.env.ZWF_API_DOMAIN_NAME}/r/${resetPasswordToken}/` + returnUrlParam;
  await sendEmail({
    to: user.profile.email,
    template: EmailTemplateType.SetPassword,
    vars: {
      toWhom: getEmailRecipientName(user),
      url
    },
    shouldBcc: false
  });

  await userRepo.save(user);
}

export const forgotPassword = handlerWrapper(async (req, res) => {
  const { email, returnUrl } = req.body;
  const user = await getActiveUserByEmailWithProfile(email);
  if (!user) {
    res.json();
    return;
  }

  await setUserToResetPasswordStatus(user, returnUrl);

  res.json();
});

export const resetPassword = handlerWrapper(async (req, res) => {
  const { token, password } = req.body;
  validatePasswordStrength(password);

  const salt = uuidv4();
  const secret = computeUserSecret(password, salt);

  
  await AppDataSource
    .createQueryBuilder()
    .update(User)
    .set({
      secret,
      salt,
      resetPasswordToken: null,
      status: UserStatus.Enabled
    })
    .where({
      resetPasswordToken: token,
      status: UserStatus.ResetPassword
    })
    .execute();

  res.json();
});

export const retrievePassword = handlerWrapper(async (req, res) => {
  const { token } = req.params;
  const r = req.query.r as string;
  assert(token, 400, 'Invalid token');

  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({where: { resetPasswordToken: token }});

  assert(user, 401, 'Token expired');

  const url = `${process.env.ZWF_WEB_DOMAIN_NAME}/reset_password?token=${token}` + (r ? `&r=${encodeURIComponent(r)}` : '');
  res.redirect(url);
});

export const impersonate = handlerWrapper(async (req, res) => {
  assertRole(req, 'system', 'admin');
  const { email } = req.body;
  assert(email, 400, 'Invalid email');
  const { user: { role } } = req as any;

  const user = await getActiveUserByEmailWithProfile(email);
  if (role === Role.Admin) {
    const orgId = getOrgIdFromReq(req);
    assert(user.orgId === orgId, 404, 'User not found');
  }

  assert(user, 404, 'User not found');

  attachJwtCookie(user, res);

  res.json(sanitizeUser(user));
});

export const inviteOrgMember = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { email } = req.body;
  const orgId = getOrgIdFromReq(req);
  const existingUser = await getActiveUserByEmailWithProfile(email);
  assert(!existingUser, 400, 'User exists');

  const { user, profile } = createUserAndProfileEntity({
    email,
    orgId,
    role: Role.Agent
  });

  await AppDataSource.transaction(async m => {
    const subscription = await m.findOne(OrgAliveSubscription, { where: {orgId }});
    assert(subscription, 400, 'No active subscription');
    const { seats, occupiedSeats } = subscription;
    assert(occupiedSeats + 1 <= seats, 400, 'Ran out of licenses. Please change subscription by adding more licenses.');
    await inviteOrgMemberWithSendingEmail(m, user, profile);
  })

  res.json();
});

export const inviteClientToOrg = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { email } = req.body;
  const orgId = getOrgIdFromReq(req);

  await AppDataSource.manager.transaction(async m => {
    const user = await ensureClientOrGuestUser(m, email);
    const orgClient = new OrgClient();
    orgClient.orgId = orgId;
    orgClient.userId = user.id;

    await m.save(orgClient);
  });

  res.json();
});

async function decodeEmailFromGoogleToken(token) {
  assert(token, 400, 'Empty code payload');
  const secret = process.env.EVC_GOOGLE_SSO_CLIENT_SECRET;
  const decoded = jwt.decode(token, secret);
  const { email, given_name: givenName, family_name: surname } = decoded;
  assert(email, 400, 'Invalid Google token');
  return { email, givenName, surname };
}

export const ssoGoogle = handlerWrapper(async (req, res) => {
  const { token, referralCode } = req.body;

  const { email, givenName, surname } = await decodeEmailFromGoogleToken(token);

  let user = await getActiveUserByEmailWithProfile(email);

  const isNewUser = !user;
  const now = getUtcNow();
  const extra = {
    loginType: 'google',
    lastLoggedInAt: now,
    referredBy: referralCode,
    role: Role.Client,
  };

  if (isNewUser) {
    const { user: newUser, profile } = createUserAndProfileEntity({
      email,
      role: Role.Client
    });

    user = Object.assign(newUser, extra);
    user.profile = profile;
    profile.givenName = givenName;
    profile.surname = surname;
    await AppDataSource.manager.save([user, profile]);

    sendEmail({
      to: user.profile.email,
      template: EmailTemplateType.WelcomeClient,
      vars: {
        toWhom: getEmailRecipientName(user),
      },
      shouldBcc: false
    });
  } else {
    user = Object.assign(user, extra);
    await AppDataSource.getRepository(User).save(user);
  }

  attachJwtCookie(user, res);

  logUserLogin(user, req, 'google');

  res.json(sanitizeUser(user));
});
