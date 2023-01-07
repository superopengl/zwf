
import { getRepository, Not } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Portfolio } from '../entity/Portfolio';
import { User } from '../entity/User';
import { UserStatus } from '../types/UserStatus';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { computeUserSecret } from '../utils/computeUserSecret';
import { validatePasswordStrength } from '../utils/validatePasswordStrength';
import { sendEmail } from '../services/emailService';
import { TaskStatus } from '../types/TaskStatus';
import { Task } from '../entity/Task';
import { handleInviteUser } from './authController';
import { getEmailRecipientName } from '../utils/getEmailRecipientName';

export const getProfile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { id } = (req as any).user as User;

  const profileRepo = getRepository(Portfolio);
  const profile = await profileRepo.findOne(id);

  res.json(profile);
});


export const changePassword = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { password, newPassword } = req.body;
  validatePasswordStrength(newPassword);

  const repo = getRepository(User);
  const { user: {id} } = req as any;
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
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const { id: loginUserId, role } = (req as any).user as User;
  if (role !== 'admin') {
    assert(id === loginUserId, 403);
  }
  const { email, givenName, surname, phone } = req.body;
  const repo = getRepository(User);
  const user = await repo.findOne(id);
  assert(user, 404);

  user.givenName = givenName || user.givenName;
  user.surname = surname || user.surname;
  user.phone = phone || user.phone;

  const newEmail = email?.trim().toLowerCase();
  const hasEmailChange = newEmail && user.email.toLowerCase() !== newEmail;
  if (hasEmailChange) {
    assert(user.email !== 'admin@filedin.io', 400, 'Cannot change the email for the builtin admin');
    user.email = newEmail;
    await handleInviteUser(user);
  } else {
    await repo.save(user);
  }

  res.json();
});

export const listAllUsers = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');

  const list = await getRepository(User).find({
    where: { status: Not(UserStatus.Disabled) },
    order: { role: 'ASC', email: 'ASC' }
  });

  res.json(list);
});

export const listClients = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');

  const list = await getRepository(User)
    .createQueryBuilder()
    .where(`role = 'client'`)
    .select([
      `id`,
      `email`,
      `"givenName"`,
      `surname`,
    ])
    .orderBy('"givenName"', 'ASC')
    .addOrderBy('surname', 'ASC')
    .addOrderBy('email', 'ASC')
    .execute();

  res.json(list);
});

export const listAgents = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');

  const list = await getRepository(User)
    .createQueryBuilder()
    .where(`role = 'agent' OR role = 'admin'`)
    .select([
      `id`,
      `email`,
      `"givenName"`,
      `surname`,
    ])
    .execute();

  res.json(list);
});

export const deleteUser = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;

  const repo = getRepository(User);
  const user = await repo.findOne({ id, email: Not('admin@filedin.io') });

  if (user) {
    await getRepository(Portfolio).update({ userId: id }, { deleted: true });
    await getRepository(Task).update({ userId: id }, { status: TaskStatus.ARCHIVE });
    await repo.delete(id);
    await sendEmail({
      to: user.email,
      template: 'deleteUser',
      vars: {
        toWhom: getEmailRecipientName(user),
      },
    });

  }

  res.json();
});

export const setUserPassword = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const { password } = req.body;
  assert(password, 404, 'Invalid password');

  const repo = getRepository(User);
  const newSalt = uuidv4();
  const newSecret = computeUserSecret(password, newSalt);
  await repo.update(id, { secret: newSecret, salt: newSalt });

  res.json();
});
