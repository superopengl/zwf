
import { getRepository } from 'typeorm';
import { assertRole } from '../utils/assert';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { Org } from '../entity/Org';

export const getMyOrgProfile = async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);
  const org = await getRepository(Org).findOne({id: orgId});
  res.json(org);
};
