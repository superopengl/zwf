import { httpGet$, httpPost$, httpDelete } from './http';

export function getMyOrgProfile$() {
  return httpGet$(`/org`);
}

export function saveMyOrgProfile$(org) {
  return httpPost$(`/org`, org);
}

export function listOrgs$() {
  return httpGet$(`/org/list`);
}

export function listOrgExistingClients(query) {
  return httpPost$(`/org/client`, query);
}

export function listOrgMembers$() {
  return httpGet$(`/org/member`);
}