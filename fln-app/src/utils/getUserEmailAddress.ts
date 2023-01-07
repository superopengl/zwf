import { getRepository } from 'typeorm';
import { User } from '../entity/User';


export async function getUserEmailAddress(userId: string) {
  if (!userId)
    return null;
  const user = await getRepository(User).findOne(userId);
  if (!user)
    return null;
  const { email, givenName, surname } = user;
  return `${givenName} ${surname} <${email}>`;
}
