import { UserLogin } from '../entity/UserLogin';
import { getRepository } from 'typeorm';
import { AppDataSource } from '../db';

export async function logUserLogin(user, req, loginType: 'local' | 'google') {
  const entity = new UserLogin();

  entity.userId = user.id;
  entity.loginMethod = loginType;

  await AppDataSource.getRepository(UserLogin).insert(entity);
}