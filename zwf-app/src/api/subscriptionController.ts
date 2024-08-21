import { SubscriptionPurchasePreviewInfo } from '../services/payment/SubscriptionPurchasePreviewInfo';
import { SubscriptionBlock } from './../entity/SubscriptionBlock';
import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import * as _ from 'lodash';
import { generateReceiptPdfStream } from '../services/receiptService';
import { ReceiptInformation } from '../entity/views/ReceiptInformation';
import { OrgCurrentSubscriptionInformation } from '../entity/views/OrgCurrentSubscriptionInformation';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { db } from '../db';
import { getRequestGeoInfo } from '../utils/getIpGeoLocation';
import { calcSubscriptionBlockPayment } from "../services/payment/calcSubscriptionBlockPayment";
import { SubscriptionBlockType } from '../types/SubscriptionBlockType';
import { createSubscriptionBlock } from '../services/payment/createSubscriptionBlock';
import { SubscriptionStartingMode } from '../types/SubscriptionStartingMode';
import { changeSubscriptionRightaway } from '../services/payment/changeSubscriptionRightaway';

async function getUserSubscriptionHistory(orgId) {
  const list = await db.getRepository(SubscriptionBlock).find({
    where: {
      orgId
    },
    order: {
      startedAt: 'ASC',
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

  await db.manager.transaction(async m => {
    const subInfo = await m.findOneBy(OrgCurrentSubscriptionInformation, { orgId });
    await changeSubscriptionRightaway(m, subInfo, seats, promotionCode, geoInfo);
  });

  res.json();
});

export const previewSubscriptionPayment = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);
  const { seats, promotionCode } = req.body;

  let result: SubscriptionPurchasePreviewInfo;
  await db.transaction(async m => {
    const subInfo = await m.findOneBy(OrgCurrentSubscriptionInformation, { orgId });

    const block = createSubscriptionBlock(subInfo, SubscriptionBlockType.Monthly, SubscriptionStartingMode.Rightaway);
    block.seats = seats || 0;
    block.promotionCode = promotionCode;
  
    result = await calcSubscriptionBlockPayment(m, subInfo, block);
  });

  res.json(result);
});

