import { httpGet$, httpGet, httpPost, request, httpPost$ } from './http';

export async function downloadReceipt(paymentId) {
  if(!paymentId) {
    throw new Error('paymentId is null');
  }
  const path = `/subscription/receipt/${paymentId}`;
  const data = await request('GET', path, null, null, 'blob');
  const fileUrl = URL.createObjectURL(data);
  window.open(fileUrl);
}

export function listMySubscriptions$() {
  return httpGet$(`/subscription`);
}

export function searchMyTicketUsage$(from, to) {
  return httpPost$(`/subscription/usages/search`, { from, to });
}

export async function listUserSubscriptionHistory(userId) {
  return httpGet(`/user/${userId}/subscription`);
}

export async function fetchStripeCheckoutSession() {
  return httpGet(`/checkout/stripe/session`);
}