import { getRepository } from 'typeorm';
import { Config } from '../entity/Config';

export async function getConfigValue(key) {
  const { value } = await getRepository(Config).findOne(key);
  return value;
}