import { httpPost$ } from './http';

export function submitContact$(payload) {
  const { name, email, body } = payload;
  return httpPost$(`/contact`, { name, email, body });
}
