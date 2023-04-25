
import { getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../entity/User';
import { assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { CreditTransaction } from '../entity/CreditTransaction';
import { OrgCurrentSubscription } from '../entity/views/OrgCurrentSubscription';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';


const getAccountForOrg = async (orgId) => {

  const subscription = await getRepository(OrgCurrentSubscription).findOne({ orgId })

  const credit = await getRepository(CreditTransaction)
    .createQueryBuilder()
    .where({ orgId })
    .select('SUM(amount) AS amount')
    .getRawOne();


  const result = {
    subscription,
    credit: +credit?.amount || 0
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

    await getRepository(CreditTransaction).insert(entity);
  }

  res.json();
});