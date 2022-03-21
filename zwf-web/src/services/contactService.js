import { API_BASE_URL, httpGet$, httpPost$ } from './http';

export function listMyContact$() {
  return httpGet$(`/contact`);
}

export function sendContact$(message, capturedUrl, replyToUserId) {
  return httpPost$(`/contact`, { message, capturedUrl, replyToUserId });
}

export function subscribeContactChange() {
  const url = `${API_BASE_URL}/contact/sse`;
  const es = new EventSource(url, { withCredentials: true });
  return es;
}

export function listUserContact$(userId) {
  return httpGet$(`/contact/${userId}`);
}

export function subscribeUserContactChange(userId) {
  const url = `${API_BASE_URL}/contact/${userId}/sse`;
  const es = new EventSource(url, { withCredentials: true });
  return es;
}