import { AppDataSource } from './../db';

import { v4 as uuidv4 } from 'uuid';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import { CreditTransaction } from '../entity/CreditTransaction';
import { OrgAliveSubscription } from '../entity/views/OrgAliveSubscription';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { getCreditBalance } from '../utils/getCreditBalance';


const getAccountForOrg = async (orgId) => {

  const subscription = await AppDataSource.getRepository(OrgAliveSubscription).findOne({ where: {orgId} })

  const credit = await getCreditBalance(AppDataSource.manager, orgId);

  const result = {
    subscription,
    credit
  };

  return result;
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

    await AppDataSource.getRepository(CreditTransaction).insert(entity);
  }

  res.json();
});

