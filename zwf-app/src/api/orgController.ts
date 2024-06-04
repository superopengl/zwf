import { AppDataSource } from './../db';
import { assertRole } from "../utils/assertRole";
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { Org } from '../entity/Org';
import { User } from '../entity/User';
import { v4 as uuidv4 } from 'uuid';
import { handlerWrapper } from '../utils/asyncHandler';
import { OrgBasicInformation } from '../entity/views/OrgBasicInformation';
import { createOrgTrialSubscription } from '../utils/createOrgTrialSubscription';
import * as moment from 'moment';
import { Subscription } from '../entity/Subscription';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { SubscriptionType } from '../types/SubscriptionType';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { assert } from '../utils/assert';

export const getMyOrgProfile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { user: { id } } = req as any;
  const { orgId } = await AppDataSource.getRepository(User).findOne({ where: { id } });
  const org = orgId ? await AppDataSource.getRepository(Org).findOne({ where: { id: orgId } }) : null;
  res.json(org);
});

export const listOrg = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const { user: { id } } = req as any;
  const list = await AppDataSource.getRepository(OrgBasicInformation).find({});
  res.json(list);
});

export const saveOrgProfile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);

  const org = await AppDataSource.getRepository(Org).findOne({ where: { id: orgId } });
  assert(org, 404);

  Object.assign(org, req.body);

  await AppDataSource.manager.save(org);

  res.json();
})

export const createMyOrg = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const userId = getUserIdFromReq(req);
  const { name, domain, businessName, country, address, tel, abn } = req.body;
  const userEnitty = await AppDataSource.getRepository(User).findOne({ where: { id: userId } });

  const isFirstSave = !userEnitty.orgId;

  const org = new Org();
  const orgId = isFirstSave ? uuidv4() : userEnitty.orgId;
  org.id = orgId;
  org.name = name?.trim();
  org.domain = domain?.trim();
  org.businessName = businessName?.trim();
  org.country = country;
  org.address = address?.trim();
  org.tel = tel?.trim();
  org.abn = abn?.trim();

  await AppDataSource.transaction(async m => {

    if (isFirstSave) {
      userEnitty.orgId = orgId;
      userEnitty.orgOwner = true;
      userEnitty.paid = false;
      await m.save(userEnitty);
    }

    await m.save(org);
    await createOrgTrialSubscription(m, orgId);
  })

  res.json();
});
