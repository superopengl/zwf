import { getUtcNow } from './../utils/getUtcNow';
import { PaymentRollupInfo } from '../services/payment/PaymentRollupInfo';
import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import * as _ from 'lodash';
import { generateReceiptPdfStream } from '../services/receiptService';
import { ReceiptInformation } from '../entity/views/ReceiptInformation';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { db } from '../db';
import { rollupTicketUsageInPeriod } from '../services/payment/rollupTicketUsageInPeriod';

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

export const searchTicketUsage = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);
  const { from, to } = req.body;
  assert(from, 400, 'from date is not specified');
  const periodFrom = from;
  const periodTo = to ?? getUtcNow();

  const list = await rollupTicketUsageInPeriod(db.manager, orgId, periodFrom, periodTo);

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


