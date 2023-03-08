import { from, tap } from 'rxjs';
import { httpGet$, httpGet, request } from './http';

export function downloadInvoice$(paymentId) {
  if (!paymentId) {
    throw new Error('paymentId is null');
  }
  const path = `/subscription/invoice/${paymentId}`;
  return from(request('GET', path, null, null, 'blob'))
    .pipe(
      tap(data => {
        const fileUrl = URL.createObjectURL(data);
        window.open(fileUrl);
      })
    );
}

export function listMyInvoices$() {
  return httpGet$(`/subscription`);
}

export function getCurrentPeriod$() {
  return httpGet$(`/subscription/period/current`);
}

export function getSiblingPeriod$(periodId, direction) {
  return httpGet$(`/subscription/period/${periodId}/${direction}`);
}

export function getPeriodUsage$(periodId) {
  return httpGet$(`/subscription/period/${periodId}/usage`);
}

export async function listUserSubscriptionHistory(userId) {
  return httpGet(`/user/${userId}/subscription`);
}

export async function fetchStripeCheckoutSession() {
  return httpGet(`/checkout/stripe/session`);
}