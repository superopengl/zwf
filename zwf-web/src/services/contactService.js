import { httpPost } from './http';

export async function saveContact(body) {
  return httpPost(`contact`, body);
}
