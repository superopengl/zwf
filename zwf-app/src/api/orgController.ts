import { db } from './../db';
import { assertRole } from '../utils/assertRole';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { Org } from '../entity/Org';
import { User } from '../entity/User';
import { v4 as uuidv4 } from 'uuid';
import { handlerWrapper } from '../utils/asyncHandler';
import { OrgBasicInformation } from '../entity/views/OrgBasicInformation';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { assert } from '../utils/assert';
import { createNewTicketForUser } from '../utils/createNewTicketForUser';

export const getMyOrgProfile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { user: { id } } = req as any;
  const { orgId } = await db.getRepository(User).findOne({ where: { id } });
  const org = orgId ? await db.getRepository(Org).findOne({ where: { id: orgId } }) : null;
  res.json(org);
});

export const listOrg = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const { user: { id } } = req as any;
  const list = await db.getRepository(OrgBasicInformation).find({});
  res.json(list);
});

export const saveOrgProfile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);
  assert(orgId, 400, 'orgId not found');

  const orgInDb = await db.getRepository(Org).findOneBy({ id: orgId });

  const org = { ...orgInDb, ...req.body, orgId };

  await db.getRepository(Org).save(org);

  res.json();
});

export const createMyOrg = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const userId = getUserIdFromReq(req);
  const { name, businessName, country, address, tel, abn } = req.body;

  const orgId = uuidv4();

  const org = new Org();
  org.id = orgId;
  org.name = name?.trim();
  org.businessName = businessName?.trim();
  org.country = country;
  org.address = address?.trim();
  org.tel = tel?.trim();
  org.abn = abn?.trim();

  const ticket = createNewTicketForUser(userId, orgId);

  await db.transaction(async m => {
    const userEnitty = await m.findOneBy(User, { id: userId });

    assert(!userEnitty.orgId, 400, 'The org has been initialized');

    userEnitty.orgId = orgId;
    userEnitty.orgOwner = true;

    await m.save([org, userEnitty, ticket]);
  });

  res.json();
});
