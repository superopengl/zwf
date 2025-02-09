import {httpGet, httpGet$, httpPost$, httpDelete$ } from './http';

export function listOrgPaymentMethods$() {
  return httpGet$(`/org/payment_method`);
}

export async function getPaymentMethodSecret() {
  return httpGet(`/org/payment_method/secret`);
}

export function deleteOrgPaymentMethod$(id) {
  return httpDelete$(`/org/payment_method/${id}`);
}

export function saveOrgPaymentMethod$(stripePaymentMethodId) {
  return httpPost$(`/org/payment_method`, { stripePaymentMethodId });
}

export function setOrgPrimaryPaymentMethod$(id) {
  return httpPost$(`/org/payment_method/${id}/primary`);
}