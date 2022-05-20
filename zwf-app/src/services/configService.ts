import { getRepository, IsNull } from 'typeorm';
import { SystemConfig } from '../entity/SystemConfig';
import { OrgConfig } from '../entity/OrgConfig';
import { AppDataSource } from '../db';

export async function getConfigValue(key, defaultValue) {
  const item =  await AppDataSource.getRepository(SystemConfig).findOne({
    where: {
    key
  }});
  return item.value ?? defaultValue;
}
