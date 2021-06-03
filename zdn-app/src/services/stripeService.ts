import Stripe from 'stripe';
import { getRepository, getManager } from 'typeorm';
import { Payment } from '../entity/Payment';
import { assert } from '../utils/assert';
import { UserProfile } from '../entity/UserProfile';
import { User } from '../entity/User';
import { PaymentMethod } from '../types/PaymentMethod';
import { Org } from '../entity/Org';
import { getOrgOwner } from '../utils/getOrgOwner';

let stripe: Stripe = null;
function getStripe() {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2020-08-27' });
  }
  return stripe;
}

async function createStripeCustomer(userId: string, userProfile: UserProfile) {
  return await getStripe().customers.create({
    email: userProfile.email,
    name: `${userProfile.givenName} ${userProfile.surname}`.trim(),
    metadata: {
      zdn_user_id: userId,
      zdn_payment_id: null,
    }
  });
}

async function getOrgStripeCustomerId(orgId: string) {
  const org = await getRepository(Org).findOne(orgId);
  if (!org.stripeCustomerId) {
    const owner = await getOrgOwner(org.id);
    const stripeCustomer = await createStripeCustomer(owner.id, owner.profile);
    org.stripeCustomerId = stripeCustomer.id;
    await getManager().save(org);
  }
  return org.stripeCustomerId;
}

export async function getStripeClientSecretForOrg(orgId: string): Promise<string> {
  const stripeCustomerId = await getOrgStripeCustomerId(orgId);
  const intent = await getStripe().setupIntents.create({
    customer: stripeCustomerId,
  });
  return intent.client_secret;
}

const DUMMY_STRIPE_RESPONSE = {
  status: 'succeeded',
  dummyStripeResponse: true
};

export async function chargeStripeForCardPayment(payment: Payment, onSessionPayment: boolean) {
  const { amount, stripeCustomerId, stripePaymentMethodId } = payment;

  assert(stripeCustomerId, 400, 'Stripe customer ID is missing');
  assert(stripePaymentMethodId, 400, 'Stripe payment method ID is missing');

  const paymentIntent = amount ? await getStripe().paymentIntents.create({
    amount: Math.ceil(amount * 100),
    currency: 'usd',
    customer: stripeCustomerId,
    payment_method: stripePaymentMethodId,
    off_session: !onSessionPayment,
    payment_method_types: ['card'],
    confirm: true
  }) : DUMMY_STRIPE_RESPONSE;

  return paymentIntent;
}

export async function retrievePaymentMethod(paymentMethodId: string) {
  const paymentMethod = await getStripe().paymentMethods.retrieve(paymentMethodId);
  return paymentMethod;
}