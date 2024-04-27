import { getRepository } from 'typeorm';
import { AppDataSource } from '../db';
import { User } from '../entity/User';


export async function getUserEmailAddress(userId: string) {
  if (!userId)
    return null;
  const user = await AppDataSource.getRepository(User).findOne({ where: { id: userId }, relations: { profile: true } });
  if (!user?.profile)
    return null;
  const { email, givenName, surname } = user.profile;
  return `${givenName} ${surname} <${email}>`;
}
