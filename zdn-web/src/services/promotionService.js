import { httpGet$, httpPost$, httpPut$ } from './http';

export function listPromotions$() {
  return httpGet$(`/promotion`);
}

export function savePromotion$(payload) {
  return httpPost$(`/promotion`, payload);
}

export function newPromotionCode$() {
  return httpPut$(`/promotion`);
}