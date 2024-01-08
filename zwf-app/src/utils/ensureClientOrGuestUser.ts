import { getManager, EntityManager } from 'typeorm';
import { User } from '../entity/User';
import { Role } from '../types/Role';
import { computeEmailHash } from './computeEmailHash';
import { createUserAndProfileEntity } from './createUserAndProfileEntity';

/**
 * Get client user if it exists. Otherwise create a guest user
 * @param m 
 * @param email 
 * @returns 
 */
export async function ensureClientOrGuestUser(m: EntityManager, email: string): Promise<User> {
  let user: User;
  const emailHash = computeEmailHash(email);
  user = await m.findOne(User, { emailHash }, { relations: ['profile'] });
  if (!user) {
    const { user: guestUser, profile } = createUserAndProfileEntity({ email, role: Role.Guest });
    await m.save([guestUser, profile]);
    user = guestUser;
    user.profile = profile;
  }
  return user;
}
