import { OrgSubscriptionPeriod } from "./../entity/OrgSubscriptionPeriod";
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
import { getUtcNow } from '../utils/getUtcNow';
import { Payment } from '../entity/Payment';
import moment = require('moment');
import { getRoleFromReq } from "../utils/getRoleFromReq";
import { Role } from "../types/Role";

const TRIAL_PERIOD_DAYS = 14;

export const getMyOrgProfile = handlerWrapper(async (req, res) => {
  const role = getRoleFromReq(req);
  const orgId = getOrgIdFromReq(req);
  let org: Org = null;
  if (orgId) {
    assertRole(req,[ 'admin']);
    org = await db.manager.findOneBy(Org, { id: orgId })
  } else {
    assert(role === Role.Admin, 403);
    // When user hasn't been onboard.
  }

  res.json(org);
});

export const listOrg = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'system']);
  const { user: { id } } = req as any;
  const list = await db.getRepository(OrgBasicInformation).find({});
  res.json(list);
});

export const saveOrgProfile = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'admin']);
  const orgId = getOrgIdFromReq(req);
  assert(orgId, 400, 'orgId not found');

  const orgInDb = await db.getRepository(Org).findOneBy({ id: orgId });

  const org = { ...orgInDb, ...req.body, orgId };

  await db.getRepository(Org).save(org);

  res.json();
});

export const createMyOrg = handlerWrapper(async (req, res) => {
  const role = getRoleFromReq(req);
  assert(role === Role.Admin, 403);

  const reqOrgId = getOrgIdFromReq(req);
  assert(!reqOrgId, 400, 'Cannot setup org again');

  const userId = getUserIdFromReq(req);
  const { name, businessName, country, address, tel, abn } = req.body;

  const orgId = uuidv4();
  const now = getUtcNow();

  const org = new Org();
  org.id = orgId;
  org.name = name?.trim();
  org.businessName = businessName?.trim();
  org.country = country;
  org.address = address?.trim();
  org.tel = tel?.trim();
  org.abn = abn?.trim();

  const period = new OrgSubscriptionPeriod()
  period.id = uuidv4();
  period.periodFrom = now;
  period.periodTo = moment(now).add(TRIAL_PERIOD_DAYS - 1, 'days').toDate();
  period.checkoutDate = now;
  period.orgId = orgId;
  period.type = 'trial';
  period.planFullPrice = 0;

  const ticket = createNewTicketForUser(userId, period);

  await db.transaction(async m => {
    const userEnitty = await m.findOneBy(User, { id: userId });

    assert(!userEnitty.orgId, 400, 'The org has been initialized');
    await m.save(org);
    userEnitty.orgId = orgId;
    userEnitty.orgOwner = true;

    await m.save([userEnitty, period, ticket]);
  });

  res.json();
});
