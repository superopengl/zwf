import { httpGet, httpPost, request } from './http';

export async function downloadReceipt(paymentId) {
  const path = `subscription/${paymentId}/receipt`;
  return request('GET', path, null, null, 'blob');
}

export async function cancelSubscription(id) {
  return httpPost(`subscription/${id}/cancel`);
}

export async function getMyCurrentSubscription() {
  return httpGet(`subscription`);
}

export async function listMySubscriptionHistory() {
  return httpGet(`subscription/history`);
}

export async function listUserSubscriptionHistory(userId) {
  return httpGet(`/user/${userId}/subscription`);
}

export async function provisionSubscription(seats, promotionCode) {
  return httpPost(`subscription`, { seats, promotionCode });
}

export async function confirmSubscriptionPayment(paymentId, payload) {
  return httpPost(`subscription/payment/${paymentId}/confirm`, payload);
}

export async function calculatePaymentDetail(seats, promotionCode) {
  return httpPost(`subscription/preview`, { seats, promotionCode });
}

export async function fetchStripeCheckoutSession() {
  return httpGet(`/checkout/stripe/session`);
}