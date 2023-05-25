import { API_BASE_URL, httpGet$, httpPost$ } from './http';

export function listMySupportMessages$() {
  return httpGet$(`/support`);
}

export function nudgeMyLastReadSupportMessage$() {
  return httpPost$(`/support/nudge`);
}

export function searchUserSupports$(queryInfo) {
  return httpPost$(`/support/search`, queryInfo);
}

export function sendSupportMessage$(message, capturedUrl, replyToUserId) {
  return httpPost$(`/support`, { message, capturedUrl, replyToUserId });
}

export function getUserSupport$(userId) {
  return httpGet$(`/support/${userId}`);
}
