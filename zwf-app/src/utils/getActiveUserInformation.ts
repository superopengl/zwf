import { UserInformation } from '../entity/views/UserInformation';
import { AppDataSource } from '../db';
import { assert } from './assert';
import { computeEmailHash } from './computeEmailHash';


export async function getActiveUserInformation(email) {
  assert(email, 400, 'Invalid email');
  const emailHash = computeEmailHash(email);
  const user = await AppDataSource.getRepository(UserInformation).findOneBy({ emailHash });
  return user;
}
