import { UserLogin } from '../entity/UserLogin';
import { getRepository } from 'typeorm';

export async function logUserLogin(user, req, loginType: 'local' | 'google') {
  const entity = new UserLogin();

  entity.userId = user.id;
  entity.loginMethod = loginType;

  await getRepository(UserLogin).insert(entity);
}