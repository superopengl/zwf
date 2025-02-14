import { db } from './../db';

import { Not } from 'typeorm';
import { OrgPaymentMethod } from '../entity/OrgPaymentMethod';
import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { getStripeClientSecretForOrg, retrieveStripePaymentMethod as retrieveStripePaymentMethod } from '../services/stripeService';
import * as moment from 'moment';

export const saveOrgPaymentMethod = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'admin']);
  const orgId = getOrgIdFromReq(req);
  const entity = new OrgPaymentMethod();
  const { stripePaymentMethodId } = req.body;

  assert(stripePaymentMethodId, 400, 'paymentMethodId is empty');

  const paymentMethod = await retrieveStripePaymentMethod(stripePaymentMethodId);

  entity.orgId = orgId;
  entity.stripePaymentMethodId = stripePaymentMethodId;
  entity.cardBrand = paymentMethod.card.brand;
  entity.cardExpiry = moment(`${paymentMethod.card.exp_month}/${paymentMethod.card.exp_year}`, 'M/YYYY').format('MM/YY');
  entity.cardLast4 = paymentMethod.card.last4;

  await db.transaction(async m => {
    const hasPrimary = await m.getRepository(OrgPaymentMethod).findOneBy({ orgId, primary: true });
    entity.primary = !hasPrimary;
    await m.createQueryBuilder()
      .insert()
      .into(OrgPaymentMethod)
      .values(entity)
      .orIgnore()
      .execute();
  });

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
  await db.getRepository(OrgPaymentMethod).delete({
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