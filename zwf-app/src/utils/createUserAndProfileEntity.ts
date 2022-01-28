import { User } from '../entity/User';
import { assert } from './assert';
import { validatePasswordStrength } from './validatePasswordStrength';
import { v4 as uuidv4 } from 'uuid';
import { UserStatus } from '../types/UserStatus';
import { computeUserSecret } from './computeUserSecret';
import { Role } from '../types/Role';
import { computeEmailHash } from './computeEmailHash';
import { UserProfile } from '../entity/UserProfile';
import { generateRandomAvatarColorHex } from './generateRandomAvatarColorHex';

export function createUserAndProfileEntity(payload): { user: User; profile: UserProfile; } {
  const { email, password, role, orgId, orgOwner, ...other } = payload;
  const thePassword = password || uuidv4();
  validatePasswordStrength(thePassword);
  assert([Role.Guest, Role.Client, Role.Agent, Role.Admin].includes(role), 400, `Unsupported role ${role}`);

  const profileId = uuidv4();
  const userId = uuidv4();
  const salt = uuidv4();

  const profile = new UserProfile();
  profile.id = profileId;
  profile.email = email.trim().toLowerCase();
  profile.avatarColorHex = generateRandomAvatarColorHex();
  Object.assign(profile, other);

  const user = new User();
  user.id = userId;
  user.emailHash = computeEmailHash(email);
  user.secret = computeUserSecret(thePassword, salt);
  user.salt = salt;
  user.role = role;
  user.orgId = role === Role.Client ? null : orgId;
  user.status = UserStatus.Enabled;
  user.profileId = profileId;
  user.orgOwner = !!orgOwner;

  return { user, profile };
}

