import { httpGet, httpPost, httpGet$ } from './http';
import { of } from 'rxjs';

export async function getMessage(id) {
  return httpGet(`message/${id}`);
}

export async function listMessages(query) {
  return httpPost('message', query);
}


