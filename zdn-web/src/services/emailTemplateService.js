import { httpGet, httpPost, httpDelete } from './http';

export async function saveEmailTemplate(locale, key, payload) {
  return httpPost(`email_template/${locale}/${key}`, payload);
}

export async function listEmailTemplate() {
  return httpGet('email_template');
}

