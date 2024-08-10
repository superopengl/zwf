import { httpGet$, httpGet, httpPost, request, httpPost$ } from './http';

export async function downloadReceipt(paymentId) {
  const path = `subscription/${paymentId}/receipt`;
  const data = await request('GET', path, null, null, 'blob');
  const fileUrl = URL.createObjectURL(data);
  window.open(fileUrl);
}

export async function cancelSubscription(id) {
  return httpPost(`subscription/${id}/cancel`);
}

export async function getMyCurrentSubscription() {
  return httpGet(`subscription`);
}

export function getMyCurrentSubscription$() {
  return httpGet$(`/subscription`);
}

export async function listMySubscriptionHistory() {
  return httpGet(`subscription/history`);
}

export async function listUserSubscriptionHistory(userId) {
  return httpGet(`/user/${userId}/subscription`);
}

export async function purchaseNewSubscription(seats, promotionCode) {
  return httpPost(`subscription`, {seats, promotionCode});
}

export async function calculatePaymentDetail(seats, promotionCode) {
  return httpPost(`subscription/preview`, { seats, promotionCode });
}

export async function fetchStripeCheckoutSession() {
  return httpGet(`/checkout/stripe/session`);
}