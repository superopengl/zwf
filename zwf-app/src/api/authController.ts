import { filter } from 'rxjs';
import { db } from './../db';
import { OrgClient } from './../entity/OrgClient';

import { User } from '../entity/User';
import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
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
import { emitUserAuditLog } from '../utils/emitUserAuditLog';
import { sanitizeUser } from '../utils/sanitizeUser';
import { getActiveUserInformation } from '../utils/getActiveUserInformation';
import { UserProfile } from '../entity/UserProfile';
import { EmailTemplateType } from '../types/EmailTemplateType';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { inviteOrgMemberWithSendingEmail } from '../utils/inviteOrgMemberWithSendingEmail';
import { createUserAndProfileEntity } from '../utils/createUserAndProfileEntity';
import { ensureClientOrGuestUser } from '../utils/ensureClientOrGuestUser';
import { UserInformation } from '../entity/views/UserInformation';
import { sleep } from '../utils/sleep';
import { getRoleFromReq } from '../utils/getRoleFromReq';
import { Org } from '../entity/Org';
import { UserLoginType } from '../types/UserLoginType';
import { sendInviteOrgMemberEmail } from '../utils/sendInviteOrgMemberEmail';
import { isEmail } from 'validator';

export const getAuthUser = handlerWrapper(async (req, res) => {
  let { user } = (req as any);
  if (user) {
    const email = user.email;
    user = await getActiveUserInformation(email);
    assert(user, 400, 'User not found');
    if (user.suspended) {
      clearJwtCookie(res);
      user = null;
    } else {
      attachJwtCookie(user, res);
    }
  }
  res.json(user || null);
});

export const login = handlerWrapper(async (req, res) => {
  const { name: email, password } = req.body;

  const userInfo = await getActiveUserInformation(email);
  assert(userInfo, 400, 'User or password is not valid');

  const user = await db.getRepository(User).findOneBy({ id: userInfo.id });

  // Validate passpord
  const hash = computeUserSecret(password, user.salt);
  assert(hash === user.secret, 400, 'User or password is not valid');

  user.lastLoggedInAt = getUtcNow();
  user.resetPasswordToken = null;
  user.status = UserStatus.Enabled;
  user.role = user.role === Role.Guest ? Role.Client : user.role;

  await db.getRepository(User).save(user);

  attachJwtCookie(userInfo, res);

  emitUserAuditLog(user.id, 'login', { type: 'local' });

  res.json(sanitizeUser(userInfo));
});

export const logout = handlerWrapper(async (req, res) => {
  clearJwtCookie(res);
  res.json();
});


async function createNewLocalOrgAdmin(payload): Promise<{ user: User; profile: UserProfile, exists: boolean }> {
  const { user, profile } = createUserAndProfileEntity(payload);

  user.resetPasswordToken = uuidv4();
  user.status = UserStatus.ResetPassword;
  user.orgOwner = true;

  let exists = false;

  await db.manager.transaction(async m => {
    const existingUser = await m.findOneBy(UserInformation, { email: profile.email });
    exists = !!existingUser;
    if (!exists) {
      await m.save([profile, user]);
    }
  })

  return { user, profile, exists };
}


export const signUpOrg = handlerWrapper(async (req, res) => {
  const email = req.body.email?.toLowerCase();

  assert(email, 400, 'email is required');

  await sleep(1500);

  const { user, exists } = await createNewLocalOrgAdmin({
    email,
    orgId: null, // Don't set orgId at the moment. Org will be created when this user's first login.
    role: Role.Admin,
    password: uuidv4(), // Temp password to fool the functions beneath
  });

  if (exists) {
    const url = `${process.env.ZWF_WEB_DOMAIN_NAME}/login`;
    await sendEmail({
      template: EmailTemplateType.RegisterExistingAccount,
      to: email,
      vars: {
        email,
        url
      },
      shouldBcc: true
    });
  } else {
    const { resetPasswordToken } = user;

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

    emitUserAuditLog(user.id, 'register-org');
  }


  res.json();
});

async function setUserToResetPasswordStatus(userId: string, returnUrl: string) {
  const user = await db.getRepository(User).findOne({
    where: { id: userId },
    relations: ['profile']
  });
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

  await db.manager.save(user);
}

export const forgotPassword = handlerWrapper(async (req, res) => {
  const { email, returnUrl } = req.body;
  const user = await getActiveUserInformation(email);
  if (!user) {
    res.json();
    return;
  }

  await setUserToResetPasswordStatus(user.id, returnUrl);

  emitUserAuditLog(user.id, 'forgot-password');

  res.json();
});

export const resetPassword = handlerWrapper(async (req, res) => {
  const { token, password } = req.body;
  validatePasswordStrength(password);
  
  const user = await db.manager.getRepository(User).findOneByOrFail({
    resetPasswordToken: token,
    status: UserStatus.ResetPassword
  });
  
  const salt = uuidv4();
  const secret = computeUserSecret(password, salt);
  user.secret = secret;
  user.salt = salt;
  user.resetPasswordToken = null;
  user.status = UserStatus.Enabled;
  if(user.role === Role.Guest) {
    user.role = Role.Client;
  }

  await db.manager.save(user);
  const userInfo = await db.getRepository(UserInformation).findOneByOrFail({ id: user.id });

  attachJwtCookie(userInfo, res);

  res.json(sanitizeUser(userInfo));
});

export const retrievePassword = handlerWrapper(async (req, res) => {
  const { token } = req.params;
  const r = req.query.r as string;
  assert(token, 400, 'Invalid token');

  const userRepo = db.getRepository(User);
  const user = await userRepo.findOne({ where: { resetPasswordToken: token } });

  assert(user, 401, 'Token expired');

  const url = `${process.env.ZWF_WEB_DOMAIN_NAME}/reset_password?token=${token}` + (r ? `&r=${encodeURIComponent(r)}` : '');
  res.redirect(url);
});

export const impersonate = handlerWrapper(async (req, res) => {
  assertRole(req, ['system', 'admin']);
  const { email } = req.body;
  assert(email, 400, 'Invalid email');
  const role = getRoleFromReq(req);
  const loginUser = (req as any).user;

  const user = await getActiveUserInformation(email);
  assert(user, 404, 'User not found');

  if (role === Role.Admin) {
    const orgId = getOrgIdFromReq(req);
    assert(user.orgId === orgId, 404, 'User not found');
  }

  attachJwtCookie(user, res);

  emitUserAuditLog(user.id, 'is-impersonated', { by: loginUser.id });

  res.json(sanitizeUser(user));
});

export const inviteOrgMember = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin']);
  const { emails: emailStrings } = req.body;
  const emails = emailStrings?.split(',').map(x => x.trim()).filter(x => !!x);

  assert(emails?.length, 400, 'No email address found');;
  assert(emails.every(e => isEmail(e)), 400, 'Invalid email address detected');

  const orgId = getOrgIdFromReq(req);

  for (const email of emails) {
    const existingUser = await getActiveUserInformation(email);
    if (!existingUser) {
      const { user, profile } = createUserAndProfileEntity({
        email,
        orgId,
        role: Role.Agent
      });

      await db.transaction(async m => {
        await inviteOrgMemberWithSendingEmail(m, user, profile);
      });
    }
  }

  res.json();
});

export const reinviteOrgMember = handlerWrapper(async (req, res) => {
  assertRole(req, ['system', 'admin']);
  const { email } = req.body;
  const orgId = getOrgIdFromReq(req);
  const role = getRoleFromReq(req);

  await db.transaction(async m => {
    const existingUser = await getActiveUserInformation(email);
    assert(role === Role.System || existingUser?.orgId === orgId, 400, `User doesn't exist`);
    const resetPasswordToken = uuidv4();
    await m.update(User, { id: existingUser.id }, { resetPasswordToken });
    existingUser.resetPasswordToken = resetPasswordToken;
    await sendInviteOrgMemberEmail(existingUser, email);
  });

  res.json();
});

export const inviteClientToOrg = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { emails: emailStrings } = req.body;
  const emails = emailStrings?.split(',').map(x => x.trim()).filter(x => !!x);
  assert(emails?.length, 400, 'No email address found');;
  assert(emails.every(e => isEmail(e)), 400, 'Invalid email address detected');
  const orgId = getOrgIdFromReq(req);

  for (const email of emails) {
    await db.manager.transaction(async m => {
      const { user, newlyCreated } = await ensureClientOrGuestUser(m, email, orgId);
      const orgClient = new OrgClient();
      orgClient.orgId = orgId;
      orgClient.userId = user.id;

      await m.save(OrgClient, orgClient);
      const org = await m.findOneBy(Org, { id: orgId });

      if (!newlyCreated && user.role === Role.Client) {
        /**
         * Exisitng ZeeWorkflow user (client account), but first time to be served by this org.
         */
        await sendEmail({
          to: email,
          template: EmailTemplateType.InviteClientUser,
          vars: {
            toWhom: getEmailRecipientName(user),
            email,
            org: org.name,
          },
          shouldBcc: false
        });
      }
    });
  }


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

export const ssoGoogleLogin = handlerWrapper(async (req, res) => {
  await sleep(1500);

  const { token, referralCode } = req.body;
  const { email, givenName, surname } = await decodeEmailFromGoogleToken(token);

  const user = await getActiveUserInformation(email);

  assert(user, 404, 'User not found');

  await db.getRepository(User).update({ id: user.id }, {
    loginType: UserLoginType.Google,
    lastLoggedInAt: getUtcNow(),
  });

  attachJwtCookie(user, res);

  emitUserAuditLog(user.id, 'login', { type: UserLoginType.Google });

  res.json(sanitizeUser(user));
});

export const ssoGoogleRegisterOrg = handlerWrapper(async (req, res) => {
  await sleep(1000);

  const { token, referralCode } = req.body;
  const { email, givenName, surname } = await decodeEmailFromGoogleToken(token);

  let user = await getActiveUserInformation(email);

  assert(!user, 404, 'User already registered');

  // if (user) {
  //   sendEmail({
  //     to: user.email,
  //     template: EmailTemplateType.RegisterExistingAccount,
  //     vars: {
  //       toWhom: getEmailRecipientName(user),
  //     },
  //     shouldBcc: false
  //   });
  //   res.json();
  //   return;
  // }

  // Only create org admin users
  let { user: newUser, profile } = createUserAndProfileEntity({
    email,
    role: Role.Admin,
    orgOwner: true,
  });

  newUser = Object.assign(newUser, {
    loginType: 'google',
    lastLoggedInAt: getUtcNow(),
  });
  newUser.profile = profile;
  profile.givenName = givenName;
  profile.surname = surname;

  await db.manager.save([newUser, profile]);

  user = await getActiveUserInformation(email);

  sendEmail({
    to: user.email,
    template: EmailTemplateType.WelcomeOrg,
    vars: {
      toWhom: getEmailRecipientName(user),
    },
    shouldBcc: false
  });


  attachJwtCookie(user, res);

  emitUserAuditLog(user.id, 'signup', { type: 'google' });
  res.json(sanitizeUser(user));
});
