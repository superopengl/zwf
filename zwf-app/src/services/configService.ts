import { getRepository, IsNull } from 'typeorm';
import { SystemConfig } from '../entity/Config';
import { OrgConfig } from '../entity/OrgConfig';

export async function getConfigValue(orgId, key) {
  const { value } = orgId ? await getRepository(OrgConfig).findOne({
    orgId,
    key
  }) : await getRepository(SystemConfig).findOne({
    key
  });
  return value;
}