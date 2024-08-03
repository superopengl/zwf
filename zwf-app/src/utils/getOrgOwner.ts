import { db } from './../db';
import { User } from '../entity/User';
import { assert } from './assert';

export async function getOrgOwner(orgId: string) {
  const user = await db.getRepository(User).findOne({
    where: {
      orgId,
      orgOwner: true
    },
    relations: { profile: true }
  });

  assert(user, 500, `Failed to get org owner for ${orgId}`);
  return user;
}
