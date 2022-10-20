import { SubscriptionPurchasePreviewInfo } from '../services/payment/SubscriptionPurchasePreviewInfo';
import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import * as _ from 'lodash';
import { generateReceiptPdfStream } from '../services/receiptService';
import { ReceiptInformation } from '../entity/views/ReceiptInformation';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { db } from '../db';

async function getOrgPaymentHistory(orgId) {
  const list = db.getRepository(ReceiptInformation).find({
    where: {
      orgId
    },
    order: {
      periodFrom: 'ASC',
    },
  });

  return list;
}

export const listMyPayments = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);

  const list = await getOrgPaymentHistory(orgId);

  res.json(list);
});

export const listUserSubscriptionHistory = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const { id } = req.params;

  const list = await getOrgPaymentHistory(id);

  res.json(list);
});

export const downloadReceipt = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);

  const payment = await db.getRepository(ReceiptInformation).findOneBy({ paymentId: id, orgId });
  assert(payment, 404);

  const { pdfStream, fileName } = await generateReceiptPdfStream(payment);

  res.set('Cache-Control', `public, max-age=36536000, immutable`);
  res.attachment(fileName);
  res.send(pdfStream);
  // pdfStream.pipe(res);
});


export const purchaseSubscription = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);
  // const { seats, promotionCode } = req.body;

  // assert(seats > 0, 400, 'seats must be positive integer');

  // const geoInfo = await getRequestGeoInfo(req);

  // await db.manager.transaction(async m => {
  //   const subInfo = await m.findOneBy(OrgCurrentSubscriptionInformation, { orgId });
  //   await changeSubscriptionRightaway(m, subInfo, seats, promotionCode, geoInfo);
  // });

  res.json();
});

export const previewSubscriptionPayment = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);
  const { seats, promotionCode } = req.body;

  let result: SubscriptionPurchasePreviewInfo;
  // await db.transaction(async m => {
  //   const subInfo = await m.findOneBy(OrgCurrentSubscriptionInformation, { orgId });

  //   const block = createSubscriptionBlock(subInfo, SubscriptionBlockType.Monthly, SubscriptionStartingMode.Rightaway);
  //   block.seats = seats || 0;
  //   block.promotionCode = promotionCode;

  //   result = await calcSubscriptionBlockPayment(m, subInfo, block);
  // });

  res.json(result);
});

