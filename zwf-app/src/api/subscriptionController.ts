import { PaymentStatus } from './../types/PaymentStatus';
import { SubscriptionBlock } from './../entity/SubscriptionBlock';

import { Not } from 'typeorm';
import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import { Subscription } from '../entity/Subscription';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { calcNewSubscriptionPaymentInfo } from '../utils/calcNewSubscriptionPaymentInfo';
import * as _ from 'lodash';
import { generateReceiptPdfStream } from '../services/receiptService';
import { ReceiptInformation } from '../entity/views/ReceiptInformation';
import { OrgCurrentSubscriptionInformation } from '../entity/views/OrgCurrentSubscriptionInformation';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { purchaseNewSubscriptionWithPrimaryCard } from '../utils/purchaseNewSubscriptionWithPrimaryCard';
import { db } from '../db';
import { getRequestGeoInfo } from '../utils/getIpGeoLocation';

async function getUserSubscriptionHistory(orgId) {
  const list = await db.getRepository(SubscriptionBlock).find({
    where: {
      orgId
    },
    order: {
      startAt: 'ASC',
    },
    relations: ['payment']
  })

  return list;
}

export const listMySubscriptionHistory = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);

  const list = await getUserSubscriptionHistory(orgId);

  res.json(list);
});

export const listUserSubscriptionHistory = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const { id } = req.params;

  const list = await getUserSubscriptionHistory(id);

  res.json(list);
});

export const downloadPaymentReceipt = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);

  const receipt = await db.getRepository(ReceiptInformation).findOne({
    where: {
      paymentId: id,
      orgId,
    }
  });
  assert(receipt, 404);

  const { pdfStream, fileName } = await generateReceiptPdfStream(receipt);

  res.set('Cache-Control', `public, max-age=36536000, immutable`);
  res.attachment(fileName);
  res.send(pdfStream);
  // pdfStream.pipe(res);
});

export const getMyCurrnetSubscription = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);
  assert(orgId, 400, 'orgId not found');

  const subscription = await db.getRepository(OrgCurrentSubscriptionInformation).findOneBy({ orgId });

  res.json(subscription);
});

export const purchaseSubscription = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);
  const { seats, promotionCode } = req.body;

  assert(seats > 0, 400, 'seats must be positive integer');

  const geoInfo = await getRequestGeoInfo(req);

  await purchaseNewSubscriptionWithPrimaryCard({
    orgId,
    seats,
    promotionCode
  }, geoInfo);

  res.json();
});

export const previewSubscriptionPayment = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);
  const { seats, promotionCode } = req.body;
  const result = await calcNewSubscriptionPaymentInfo(db.manager, orgId, seats, promotionCode);
  res.json(result);
});

