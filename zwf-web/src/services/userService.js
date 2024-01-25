import { httpGet, httpPost, httpPost$, httpDelete } from './http';

export async function changePassword(password, newPassword) {
  return httpPost(`user/change_password`, { password, newPassword });
}

export function searchAssigneeList$(page = 0, text = undefined) {
  return httpGet$(`org/member`, { page, size: 50, text });
}

export async function searchOrgClientUsers(payload) {
  return httpPost(`org/client`, { page: 0, size: 50, ...payload });
}

export async function listAllUsers() {
  return httpGet(`user`);
}

export async function deleteUser(id) {
  return httpDelete(`user/${id}`);
}

export async function setPasswordForUser(id, password) {
  return httpPost(`user/${id}/set_password`, { password });
}

export async function saveProfile(userId, profile) {
  return httpPost(`user/${userId}/profile`, profile);
}

export async function setUserTags(userId, tags) {
  return httpPost(`user/${userId}/tags`, { tags });
}

export async function setUserRole(userId, role) {
  return httpPost(`user/${userId}/role`, { role });
}