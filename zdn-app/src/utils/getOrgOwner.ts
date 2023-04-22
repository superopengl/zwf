import { User } from '../entity/User';
import { getRepository } from 'typeorm';
import { assert } from './assert';

export async function getOrgOwner(orgId: string) {
  const user = await getRepository(User).findOne({
    orgId,
    orgOwner: true
  }, { relations: ['profile'] });

  assert(user, 500, `Failed to get org owner for ${orgId}`)
  return user;
}
