import { httpGet, httpPost, httpDelete } from './http';

export async function getRecurring(id) {
  return httpGet(`recurring/${id}`);
}

export async function saveRecurring(recurring) {
  return httpPost('recurring', recurring);
}

export async function deleteRecurring(id) {
  return httpDelete(`recurring/${id}`);
}

export async function runRecurring(id) {
  return httpPost(`recurring/${id}/run`);
}

export async function listRecurring() {
  return httpGet('recurring');
}

export async function healthCheckRecurring() {
  return httpGet('recurring/healthcheck');
}

