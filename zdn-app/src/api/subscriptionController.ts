
import { getManager, getRepository, In } from 'typeorm';
import { assert, assertRole } from '../utils/assert';
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
import { OrgCurrentSubscription } from '../entity/views/OrgCurrentSubscription';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';

async function getUserSubscriptionHistory(orgId) {
  const list = await getRepository(Subscription).find({
    where: {
      orgId,
      status: In([SubscriptionStatus.Expired, SubscriptionStatus.Alive])
    },
    order: {
      start: 'ASC',
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

  const subscription = await getRepository(OrgCurrentSubscription).findOne(
    {
      orgId
    }
  );

  res.json(subscription);
});

export const provisionSubscription = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);
  const { plan, seats } = req.body;

  const payment = await provisionSubscriptionPurchase({
    orgId,
    subscriptionType: plan,
    seats
  }, req);
  const result: any = {
    amount: payment.amount,
    paymentId: payment.id,
    subscriptionId: payment.subscription.id,
    clientSecret: await getStripeClientSecretForOrg(orgId)
  };

  res.json(result);
});

export const confirmSubscriptionPayment = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id: paymentId } = req.params;
  const orgId = getOrgIdFromReq(req);

  const payment = await getRepository(Payment).findOne({
    id: paymentId,
    orgId,
  }, { relations: ['subscription'] });

  assert(payment, 404);

  const { stripePaymentMethodId } = req.body;
  payment.stripePaymentMethodId = stripePaymentMethodId;
  const rawResponse = await chargeStripeForCardPayment(payment, true);
  payment.rawResponse = rawResponse;
  await commitSubscription(payment);

  res.json();
});


export const previewSubscriptionPayment = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);
  const { seats, type, promotionCode } = req.body;
  const result = await getNewSubscriptionPaymentInfo(getManager(), orgId, type, seats, promotionCode);
  res.json(result);
});

