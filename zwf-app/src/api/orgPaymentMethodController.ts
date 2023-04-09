import { db } from './../db';

import { Not } from 'typeorm';
import { OrgPaymentMethod } from '../entity/OrgPaymentMethod';
import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { getStripeClientSecretForOrg } from '../services/stripeService';
import { saveNewPaymentMethod } from '../utils/saveNewPaymentMethod';

export const saveOrgPaymentMethod = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'admin']);
  const orgId = getOrgIdFromReq(req);
  const { stripePaymentMethodId } = req.body;
  
  assert(stripePaymentMethodId, 400, 'paymentMethodId is empty');
  
  await db.transaction(async m => {
    await saveNewPaymentMethod(m, orgId, stripePaymentMethodId, false);
  })

  res.json();
});

export const setOrgPrimaryPaymentMethod = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'admin']);
  const orgId = getOrgIdFromReq(req);
  const { id } = req.params;

  await db.transaction(async m => {
    await m.update(OrgPaymentMethod, { orgId, id: Not(id) }, { primary: false });
    await m.update(OrgPaymentMethod, { orgId, id }, { primary: true });
  });

  res.json();
});

export const listOrgPaymentMethods = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'admin']);
  const orgId = getOrgIdFromReq(req);
  const list = await db.getRepository(OrgPaymentMethod).find({ where: { orgId }, order: {createdAt: 'ASC'} });
  res.json(list);
});

export const deleteOrgPaymentMethod = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'admin']);
  const orgId = getOrgIdFromReq(req);
  const { id } = req.params;
  await db.getRepository(OrgPaymentMethod).softDelete({
    id,
    orgId,
    primary: false
  });
  res.json();
});

export const getOrgStripeClientSecret = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'admin']);
  const orgId = getOrgIdFromReq(req);
  const clientSecret = await getStripeClientSecretForOrg(db.manager, orgId);
  const result = { clientSecret };
  res.json(result);
});


