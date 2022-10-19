import { db } from './../db';

import { v4 as uuidv4 } from 'uuid';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import { CreditTransaction } from '../entity/CreditTransaction';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { getCreditBalance } from '../utils/getCreditBalance';


const getAccountForOrg = async (orgId) => {

  // const subscription = await db.getRepository(OrgCurrentSubscriptionInformation).findOne({ where: {orgId} });

  // const credit = await getCreditBalance(db.manager, orgId);

  // const result = {
  //   subscription,
  //   credit
  // };

  return null;
};

export const getAccount = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const { id } = req.params;
  const result = await getAccountForOrg(id);

  res.json(result);
});

export const getMyAccount = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);
  const result = await getAccountForOrg(orgId);

  res.json(result);
});


export const adjustCredit = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const { id } = req.params;
  const { amount } = req.body;
  if (amount !== 0) {
    const entity = new CreditTransaction();
    entity.id = uuidv4();
    entity.orgId = id;
    entity.amount = amount;
    entity.type = 'grant';

    await db.getRepository(CreditTransaction).insert(entity);
  }

  res.json();
});

