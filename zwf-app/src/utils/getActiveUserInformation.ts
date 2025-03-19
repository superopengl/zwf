import { UserInformation } from '../entity/views/UserInformation';
import { db } from '../db';
import { assert } from './assert';
import { computeEmailHash } from './computeEmailHash';
import { EntityManager } from 'typeorm';


export async function getActiveUserInformation(m: EntityManager, email: string) {
  assert(email, 400, 'Invalid email');
  const emailHash = computeEmailHash(email);
  const user = await m.getRepository(UserInformation).findOneBy({ emailHash });
  return user;
}
