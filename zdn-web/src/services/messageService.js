import { httpGet, httpPost, httpGet$ } from './http';
import { of } from 'rxjs';

export async function getMessage(id) {
  return httpGet(`message/${id}`);
}

export function countUnreadMessage$() {
  return of(0);
  // return httpGet$(`message/count/unread`);
}

export async function listMessages(query) {
  return httpPost('message', query);
}


