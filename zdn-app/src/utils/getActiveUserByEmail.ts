import { getRepository, IsNull } from 'typeorm';
import { User } from '../entity/User';
import { assert } from './assert';
import { computeEmailHash } from './computeEmailHash';


export async function getActiveUserByEmail(email) {
  assert(email, 400, 'Invalid email');
  const emailHash = computeEmailHash(email);
  const user = await getRepository(User).findOne({
    emailHash
  }, { relations: ['profile'] });
  return user;
}
