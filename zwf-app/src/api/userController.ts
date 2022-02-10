import { Tag } from '../entity/Tag';

import { getRepository, Not, getManager, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../entity/User';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import { computeUserSecret } from '../utils/computeUserSecret';
import { validatePasswordStrength } from '../utils/validatePasswordStrength';
import { inviteOrgMemberWithSendingEmail } from "../utils/inviteOrgMemberWithSendingEmail";
import { attachJwtCookie } from '../utils/jwt';
import { UserProfile } from '../entity/UserProfile';
import { computeEmailHash } from '../utils/computeEmailHash';
import { searchOrgMembers } from '../utils/searchOrgMembers';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { Payment } from '../entity/Payment';
import { Subscription } from '../entity/Subscription';
import { CreditTransaction } from '../entity/CreditTransaction';
import { Role } from '../types/Role';
import { searchOrgClients } from '../utils/searchOrgClients';

export const changePassword = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'member');
  const { password, newPassword } = req.body;
  validatePasswordStrength(newPassword);

  const repo = getRepository(User);
  const { user: { id } } = req as any;
  const user = await repo.findOne(id);
  assert(password && newPassword && user.secret === computeUserSecret(password, user.salt), 400, 'Invalid password');

  const newSalt = uuidv4();
  const newSecret = computeUserSecret(newPassword, newSalt);
  user.salt = newSalt;
  user.secret = newSecret;
  await repo.save(user);

  res.json();
});

export const saveProfile = handlerWrapper(async (req, res) => {
  assertRole(req, Role.System, Role.Admin, Role.Agent, Role.Client);
  const { id } = req.params;
  const { id: loginUserId, role } = (req as any).user as User;
  const repo = getRepository(User);
  const userQuery: any = { id };
  switch (role) {
    case Role.Agent:
    case Role.Client:
      assert(id === loginUserId, 403);
      break;
    case Role.Admin:
      userQuery.orgId = getOrgIdFromReq(req);
    default:
      break;
  }

  const { email } = req.body;
  const user = await repo.findOne({
    where: userQuery,
    relations: ['profile']
  });
  assert(user, 404);

  user.profile.avatarFileId = req.body.avatar;
  user.profile.givenName = req.body.givenName;
  user.profile.surname = req.body.surname;
  user.profile.locale = req.body.locale;

  let hasEmailChange = false;
  if (email) {
    const newEmailHash = computeEmailHash(email);
    hasEmailChange = user.emailHash !== newEmailHash;

    if (hasEmailChange) {
      assert(user.emailHash !== BUILTIN_ADMIN_EMIAL_HASH, 400, 'Cannot change the email for the builtin admin');
      user.emailHash = newEmailHash;
      user.profile.email = email;

      await inviteOrgMemberWithSendingEmail(getManager(), user, user.profile);
    }
  }

  if (!hasEmailChange) {
    await getManager().save(user.profile);
  }

  if (id === loginUserId) {
    attachJwtCookie(user, res);
  }

  res.json();
});

export const searchOrgMemberUserList = handlerWrapper(async (req, res) => {
  assertRole(req, 'system', 'admin');

  const orgId = getOrgIdFromReq(req);

  const page = +req.body.page;
  const size = +req.body.size;
  const orderField = req.body.orderBy || 'email';
  const orderDirection = req.body.orderDirection || 'ASC';
  const text = req.body.text?.trim();
  const tags = (req.body.tags || []);

  const list = await searchOrgMembers(
    orgId,
    {
      text,
      page,
      size,
      orderField,
      orderDirection,
      tags
    });

  res.json(list);
});

export const searchOrgClientUserList = handlerWrapper(async (req, res) => {
  assertRole(req, 'system', 'admin');

  const orgId = getOrgIdFromReq(req);

  const page = +req.body.page;
  const size = +req.body.size;
  const orderField = req.body.orderBy || 'email';
  const orderDirection = req.body.orderDirection || 'ASC';
  const text = req.body.text?.trim();
  const tags = (req.body.tags || []);

  const list = await searchOrgClients(
    orgId,
    {
      text,
      page,
      size,
      orderField,
      orderDirection,
      tags
    });

  res.json(list);
});

const BUILTIN_ADMIN_EMIAL_HASH = computeEmailHash('admin@zeeworkflow.com');

export const listAllUsers = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');

  const list = await getRepository(UserProfile)
    .createQueryBuilder('p')
    .innerJoin(User, 'u', `u."profileId" = p.id AND u."deletedAt" IS NULL`)
    .select([
      'u.id as id',
      '"givenName"',
      'surname',
      'email'
    ])
    .execute();

  res.json(list);
});

export const deleteUser = handlerWrapper(async (req, res) => {
  assertRole(req, 'system', 'admin');
  const { id } = req.params;

  const repo = getRepository(User);
  const user = await repo.findOne({
    where: {
      id,
      emailHash: Not(BUILTIN_ADMIN_EMIAL_HASH)
    },
    relations: ['profile']
  });

  if (user) {
    const { profileId } = user;
    await repo.softDelete(id);
    await getRepository(UserProfile).delete(profileId);

    // await enqueueEmail({
    //   to: user.profile.email,
    //   template: EmailTemplateType.DeleteUser,
    //   vars: {
    //     toWhom: getEmailRecipientName(user.profile),
    //     email: user.profile.email,
    //   },
    //   shouldBcc: false
    // });
  }

  res.json();
});

export const setUserTags = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;

  const { tags } = req.body;
  const repo = getRepository(User);
  const user = await repo.findOne(id);
  if (tags?.length) {
    user.tags = await getRepository(Tag).find({
      where: {
        id: In(tags)
      }
    });
  } else {
    user.tags = [];
  }
  await repo.save(user);
  res.json();
});

export const setUserRole = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);
  const { role } = req.body;
  assert([Role.Admin, Role.Agent].includes(role), 400, `Invalid role ${role}`);

  await getManager().update(User, {
    id,
    orgId,
    orgOwner: false,
    role: Not(role)
  }, {
    role
  });
  res.json();
});

export const setUserPassword = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const { id } = req.params;
  const { password } = req.body;
  assert(password, 404, 'Invalid password');

  const repo = getRepository(User);
  const newSalt = uuidv4();
  const newSecret = computeUserSecret(password, newSalt);
  await repo.update(id, { secret: newSecret, salt: newSalt });

  res.json();
});

export const listMyCreditHistory = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);
  const list = await getRepository(CreditTransaction)
    .createQueryBuilder('uc')
    .where('uc."orgId" = :orgId', { orgId })
    // .andWhere('uc.amount != 0')
    .leftJoin(q => q.from(Payment, 'py'), 'py', 'uc.id = py."creditTransactionId"')
    .leftJoin(q => q.from(Subscription, 'sub'), 'sub', 'sub.id = py."subscriptionId"')
    .orderBy('uc."createdAt"', 'DESC')
    .select([
      'uc."createdAt" as "createdAt"',
      'uc.amount as amount',
      'py.id as "paymentId"',
      'sub.type as type'
    ])
    .execute();
  res.json(list);
});

export const listUserCreditHistory = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const { id } = req.params;
  const list = await getRepository(CreditTransaction)
    .createQueryBuilder('uc')
    .where('uc."orgId" = :id', { id })
    .leftJoin(q => q.from(User, 'u'), 'u', 'uc."referredUserId" = u.id')
    .leftJoin(q => q.from(UserProfile, 'p'), 'p', 'p.id = u."profileId"')
    .leftJoin(q => q.from(Payment, 'py'), 'py', 'uc.id = py."creditTransactionId"')
    .leftJoin(q => q.from(Subscription, 'sub'), 'sub', 'sub.id = py."subscriptionId"')
    .orderBy('uc."createdAt"', 'DESC')
    .select([
      'uc."createdAt" as "createdAt"',
      'uc.amount as amount',
      'uc."revertedCreditTransactionId" as "revertedCreditTransactionId"',
      'uc.type as "creditType"',
      'p.email as "referredUserEmail"',
      'py.id as "paymentId"',
      'sub.type as type'
    ])
    .execute();
  res.json(list);
});

