import Stripe from 'stripe';
import { EntityManager } from 'typeorm';
import { assert } from '../utils/assert';
import { UserProfile } from '../entity/UserProfile';
import { Org } from '../entity/Org';
import { getOrgOwner } from '../utils/getOrgOwner';

let stripe: Stripe = null;
function getStripe() {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2020-08-27' });
  }
  return stripe;
}

async function createStripeCustomer(userId: string, userProfile: UserProfile, org: Org) {
  return await getStripe().customers.create({
    email: userProfile.email,
    name: `${userProfile.givenName} ${userProfile.surname}`.trim(),
    metadata: {
      zwf_user_id: userId,
      zwf_payment_id: null,
      zwf_org_id: org.id,
      zef_org_name: org.name,
    }
  });
}

export async function getOrgStripeCustomerId(m: EntityManager, orgId: string) {
  const org = await m.findOneOrFail(Org, {where: {id: orgId}});
  if (!org.stripeCustomerId) {
    const owner = await getOrgOwner(org.id);
    const stripeCustomer = await createStripeCustomer(owner.id, owner.profile, org);
    org.stripeCustomerId = stripeCustomer.id;
    await m.save(org);
  }
  return org.stripeCustomerId;
}

export async function getStripeClientSecretForOrg(m: EntityManager, orgId: string): Promise<string> {
  const stripeCustomerId = await getOrgStripeCustomerId(m, orgId);
  const intent = await getStripe().setupIntents.create({
    customer: stripeCustomerId,
  });
  return intent.client_secret;
}

const DUMMY_STRIPE_RESPONSE = {
  status: 'succeeded',
  dummyStripeResponse: true
};

export async function chargeStripeForCardPayment(amount: number, stripeCustomerId: string, stripePaymentMethodId: string, onSessionPayment: boolean) {

  assert(stripeCustomerId, 400, 'Stripe customer ID is missing');
  assert(stripePaymentMethodId, 500, 'stripePaymentMethodId is missing');

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

export async function retrieveStripePaymentMethod(stripePaymentMethodId: string) {
  const paymentMethod = await getStripe().paymentMethods.retrieve(stripePaymentMethodId);
  return paymentMethod;
}