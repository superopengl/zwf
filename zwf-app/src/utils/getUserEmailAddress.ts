import { getRepository } from 'typeorm';
import { User } from '../entity/User';


export async function getUserEmailAddress(userId: string) {
  if (!userId)
    return null;
  const user = await getRepository(User).findOne(userId, {relations: ['profile']});
  if (!user?.profile)
    return null;
  const { email, givenName, surname } = user.profile;
  return `${givenName} ${surname} <${email}>`;
}
