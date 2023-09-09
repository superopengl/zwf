import { getUtcNow } from './../utils/getUtcNow';
import { LicenseTicket } from './../entity/LicenseTicket';
import { db } from './../db';
import { UserInformation } from './../entity/views/UserInformation';
import { OrgMemberInformation } from './../entity/views/OrgMemberInformation';
import { Tag } from '../entity/Tag';

import { Not, In, IsNull, MoreThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../entity/User';
import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import { computeUserSecret } from '../utils/computeUserSecret';
import { validatePasswordStrength } from '../utils/validatePasswordStrength';
import { inviteOrgMemberWithSendingEmail } from '../utils/inviteOrgMemberWithSendingEmail';
import { attachJwtCookie } from '../utils/jwt';
import { UserProfile } from '../entity/UserProfile';
import { computeEmailHash } from '../utils/computeEmailHash';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { Payment } from '../entity/Payment';
import { Role } from '../types/Role';
import { searchOrgClients } from '../utils/searchOrgClients';
import { getActiveUserInformation } from '../utils/getActiveUserInformation';
import { OrgClientInformation } from '../entity/views/OrgClientInformation';

export const changePassword = handlerWrapper(async (req, res) => {
  assertRole(req, [Role.System, Role.Admin, Role.Agent, Role.Client]);
  const { password, newPassword } = req.body;
  validatePasswordStrength(newPassword);

  const repo = db.getRepository(User);
  const { user: { id } } = req as any;
  const user = await repo.findOne({ where: { id } });
  assert(password && newPassword && user.secret === computeUserSecret(password, user.salt), 400, 'Invalid password');

  const newSalt = uuidv4();
  const newSecret = computeUserSecret(newPassword, newSalt);
  user.salt = newSalt;
  user.secret = newSecret;
  await repo.save(user);

  res.json();
});

export const getBulkUserBrief = handlerWrapper(async (req, res) => {
  assertRole(req, [Role.System, Role.Admin, Role.Agent, Role.Client]);
  const { ids } = req.body;

  assert(ids.length, 400, 'ids cannot be empty');

  const data = await db.getRepository(UserInformation).find({
    where: { id: In(ids) },
    select: [
      'id',
      'avatarFileId',
      'avatarColorHex',
      'givenName',
      'surname',
      'email'
    ]
  });

  res.json(data);
});



export const saveProfile = handlerWrapper(async (req, res) => {
  assertRole(req, [Role.System, Role.Admin, Role.Agent, Role.Client]);
  const { id } = req.params;
  const { id: loginUserId, role } = (req as any).user as User;
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

  // const { email } = req.body;

  await db.transaction(async m => {
    const user = await m.findOne(User, {
      where: userQuery,
      relations: ['profile']
    });
    assert(user, 404);

    user.profile.avatarFileId = req.body.avatarFileId;
    user.profile.givenName = req.body.givenName;
    user.profile.surname = req.body.surname;
    user.profile.locale = req.body.locale;

    // let hasEmailChange = false;
    // if (email) {
    //   const newEmailHash = computeEmailHash(email);
    //   hasEmailChange = user.emailHash !== newEmailHash;

    //   if (hasEmailChange) {
    //     assert(user.emailHash !== BUILTIN_SYSTEM_ADMIN_EMIAL_HASH, 400, 'Cannot change the email for the builtin admin');
    //     user.emailHash = newEmailHash;
    //     user.profile.email = email;

    //     // await inviteOrgMemberWithSendingEmail(m, user, user.profile);
    //   }
    // }

    // const entitiesToSave: any[] = [user.profile];
    // if(hasEmailChange) {
    //   entitiesToSave.push(user);
    // }

    await m.save(user.profile);
  });

  res.json();
});

export const listOrgMembers = handlerWrapper(async (req, res) => {
  assertRole(req, ['system', 'admin', 'agent']);
  const orgId = getOrgIdFromReq(req);
  const list = await db.getRepository(OrgMemberInformation).find({
    where: {
      orgId
    },
    order: {
      createdAt: 'ASC'
    }
  });
  res.json(list);
});



const BUILTIN_SYSTEM_ADMIN_EMIAL_HASH = computeEmailHash('admin@zeeworkflow.com');

export const deleteUser = handlerWrapper(async (req, res) => {
  assertRole(req, ['system', 'admin']);
  const { id } = req.params;

  const repo = db.getRepository(User);
  const user = await repo.findOne({
    where: {
      id,
      emailHash: Not(BUILTIN_SYSTEM_ADMIN_EMIAL_HASH)
    },
    relations: ['profile']
  });

  if (user) {
    const { profileId } = user;

    await db.transaction(async m => {
      await m.getRepository(User).softDelete(id);
      await m.getRepository(UserProfile).delete(profileId);
      const { orgId } = user;
      if (orgId) {
        await m.getRepository(LicenseTicket).createQueryBuilder()
          .update()
          .set({
            ticketTo: () => `now()`,
            email: user.profile.email,
          })
          .where(`"userId" = :id`, { id })
          .andWhere(`"orgId" = :orgId`, { orgId })
          .andWhere(`"ticketTo" > now()`)
          .execute();
      }
    });
  }

  res.json();
});

export const setUserRole = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin']);
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);
  const { role } = req.body;
  assert([Role.Admin, Role.Agent].includes(role), 400, `Invalid role ${role}`);

  await db.manager.update(User, {
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
  assertRole(req, ['system']);
  const { id } = req.params;
  const { password } = req.body;
  assert(password, 404, 'Invalid password');

  const repo = db.getRepository(User);
  const newSalt = uuidv4();
  const newSecret = computeUserSecret(password, newSalt);
  await repo.update(id, { secret: newSecret, salt: newSalt });

  res.json();
});



