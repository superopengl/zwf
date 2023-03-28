import { httpGet, httpPost, httpDelete } from './http';

export async function listUserTags() {
  return httpGet(`usertag`);
}

export async function deleteUserTag(id) {
  return httpDelete(`usertag/${id}`);
}

export async function saveUserTag(tag) {
  return httpPost(`usertag`, tag);
}