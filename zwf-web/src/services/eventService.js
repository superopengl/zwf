import { httpGet, httpPost, httpDelete } from './http';

export async function getEvent(id) {
  return httpGet(`event/${id}`);
}

export async function saveEvent(gallery) {
  return httpPost('event', gallery);
}

export async function deleteEvent(id) {
  return httpDelete(`event/${id}`);
}

export async function listEvent() {
  return httpGet('event');
}