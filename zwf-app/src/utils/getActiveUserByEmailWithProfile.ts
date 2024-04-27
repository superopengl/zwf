import { AppDataSource } from './../db';
import { getRepository, IsNull } from 'typeorm';
import { User } from '../entity/User';
import { assert } from './assert';
import { computeEmailHash } from './computeEmailHash';


export async function getActiveUserByEmailWithProfile(email) {
  assert(email, 400, 'Invalid email');
  const emailHash = computeEmailHash(email);
  const user = await AppDataSource.getRepository(User).findOne({
    where: {
      emailHash
    },
    relations: { profile: true }
  });
  return user;
}
