import { httpGet$, httpGet, httpPost, request, httpPost$ } from './http';

export async function downloadReceipt(paymentId) {
  const path = `subscription/${paymentId}/receipt`;
  const data = await request('GET', path, null, null, 'blob');
  const fileUrl = URL.createObjectURL(data);
  window.open(fileUrl);
}

export function listMyPayments$() {
  return httpGet$(`/payment`);
}

export async function listUserSubscriptionHistory(userId) {
  return httpGet(`/user/${userId}/subscription`);
}

export async function fetchStripeCheckoutSession() {
  return httpGet(`/checkout/stripe/session`);
}