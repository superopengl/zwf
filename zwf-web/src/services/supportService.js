import { API_BASE_URL, httpGet$, httpPost$ } from './http';

export function getMySupport$() {
  return httpGet$(`/support`);
}

export function nudgeMyLastReadSupportMessage$(messageId) {
  if(!messageId) {
    throw new Error('messageId is not specified');
  }
  return httpPost$(`/support/nudge`, { messageId });
}

export function searchUserSupports$(queryInfo) {
  return httpPost$(`/support/search`, queryInfo);
}

export function sendContact$(message, capturedUrl, replyToUserId) {
  return httpPost$(`/support`, { message, capturedUrl, replyToUserId });
}

export function subscribeSupportMessage() {
  const url = `${API_BASE_URL}/support/sse`;
  const es = new EventSource(url, { withCredentials: true });
  return es;
}

export function getUserSupport$(userId) {
  return httpGet$(`/support/${userId}`);
}
