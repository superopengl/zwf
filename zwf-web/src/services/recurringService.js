import { httpGet$, httpPost$, httpDelete$, httpGet, httpPost, httpDelete } from './http';

export function getRecurring$(id) {
  return httpGet$(`recurring/${id}`);
}

export function saveRecurring$(recurring) {
  return httpPost$('recurring', recurring);
}

export async function deleteRecurring(id) {
  return httpDelete(`recurring/${id}`);
}

export async function runRecurring(id) {
  return httpPost(`recurring/${id}/run`);
}

export function listRecurring$() {
  return httpGet$('/recurring');
}


