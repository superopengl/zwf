import { httpGet$, httpPost$, httpDelete } from './http';

export function getMyOrgProfile$() {
  return httpGet$(`/org`);
}

export function saveMyOrgProfile$(org) {
  return httpPost$(`/org`, org);
}