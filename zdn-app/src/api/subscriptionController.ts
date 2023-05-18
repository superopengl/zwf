
import { getManager, getRepository, Not } from 'typeorm';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import { Subscription } from '../entity/Subscription';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { Payment } from '../entity/Payment';
import { PaymentMethod } from '../types/PaymentMethod';
import { getNewSubscriptionPaymentInfo } from '../utils/getNewSubscriptionPaymentInfo';
import { provisionSubscriptionPurchase } from '../utils/provisionSubscriptionPurchase';
import { commitSubscription } from '../utils/commitSubscription';
import * as _ from 'lodash';
import { getStripeClientSecretForOrg, chargeStripeForCardPayment } from '../services/stripeService';
import { generateReceiptPdfStream } from '../services/receiptService';
import { ReceiptInformation } from '../entity/views/ReceiptInformation';
import { OrgAliveSubscription } from '../entity/views/OrgAliveSubscription';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { OrgPaymentMethod } from '../entity/OrgPaymentMethod';
import { purchaseNewSubscriptionWithPrimaryCard } from '../utils/purchaseNewSubscriptionWithPrimaryCard';

async function getUserSubscriptionHistory(orgId) {
  const list = await getRepository(Subscription).find({
    where: {
      orgId,
      status: Not(SubscriptionStatus.Provisioning)
    },
    order: {
      createdAt: 'ASC',
    },
    relations: [
      'payments'
    ]
  });

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

export const turnOffSubscriptionRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);

  await getRepository(Subscription).update(
    {
      orgId,
      status: SubscriptionStatus.Alive,
      recurring: true,
    },
    {
      recurring: false,
    }
  );

  res.json();
});

export const downloadPaymentReceipt = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);

  const receipt = await getRepository(ReceiptInformation).findOne({
    paymentId: id,
    orgId,
  });
  assert(receipt, 404);

  const { pdfStream, fileName } = await generateReceiptPdfStream(receipt);

  res.set('Cache-Control', `public, max-age=31536000`);
  res.attachment(fileName);
  pdfStream.pipe(res);
});

export const getMyCurrnetSubscription = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);

  const subscription = await getRepository(OrgAliveSubscription).findOne(
    {
      orgId
    }
  );

  res.json(subscription);
});

export const purchaseSubscription = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);
  const { seats, promotionCode } = req.body;

  assert(seats > 0, 400, 'seats must be positive integer');

  await purchaseNewSubscriptionWithPrimaryCard({
    orgId,
    seats,
    promotionCode
  }, req);

  res.json();
});

export const previewSubscriptionPayment = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);
  const { seats, promotionCode } = req.body;
  const result = await getNewSubscriptionPaymentInfo(getManager(), orgId, seats, promotionCode);
  res.json(result);
});

