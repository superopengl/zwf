import { SystemConfig } from '../entity/SystemConfig';
import { db } from '../db';

export async function getConfigValue(key, defaultValue) {
  const item =  await db.getRepository(SystemConfig).findOne({
    where: {
    key
  }});
  return item.value ?? defaultValue;
}
