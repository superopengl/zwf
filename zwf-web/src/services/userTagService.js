import { httpGet$, httpPost$, httpDelete$ } from './http';

export function listUserTags$() {
  return httpGet$(`usertag`);
}

export function deleteUserTag$(id) {
  return httpDelete$(`usertag/${id}`);
}

export function saveUserTag$(tag) {
  const { id, name } = tag;
  return httpPost$(`usertag`, { id, name });
}