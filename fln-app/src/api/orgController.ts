
import { getRepository, getManager } from 'typeorm';
import { assertRole } from '../utils/assert';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { Org } from '../entity/Org';
import { User } from '../entity/User';
import { v4 as uuidv4 } from 'uuid';
import { handlerWrapper } from '../utils/asyncHandler';

export const getMyOrgProfile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { user: { id } } = req as any;
  const { orgId } = await getRepository(User).findOne(id, { select: ['orgId'] });
  const org = await getRepository(Org).findOne({ id: orgId });
  res.json(org);
});

export const saveMyOrgProfile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { user: { id } } = req as any;
  const { name, domain, businessName, address, tel, abn } = req.body;
  const userEnitty = await getRepository(User).findOne(id);

  const org = new Org();
  org.id = userEnitty.orgId || uuidv4();
  org.name = name?.trim();
  org.domain = domain?.trim();
  org.businessName = businessName?.trim();
  org.address = address?.trim();
  org.tel = tel?.trim();
  org.abn = abn?.trim();

  const entities: any[] = [org];

  if (!userEnitty.orgId) {
    userEnitty.orgId = org.id;
    entities.push(userEnitty);
  }
  await getManager().save(entities);

  res.json();
});
