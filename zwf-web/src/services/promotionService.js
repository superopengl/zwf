import { httpGet$, httpPost$, httpPut$ } from './http';

export function listPromotions$(orgId) {
  return httpGet$(`/promotion/${orgId}`);
}

export function savePromotion$(payload) {
  return httpPost$(`/promotion`, payload);
}

export function newPromotionCode$(orgId) {
  return httpPut$(`/promotion/${orgId}`,);
}