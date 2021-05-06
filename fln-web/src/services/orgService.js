import { httpGet$, httpPost, httpDelete } from './http';

export function getMyOrgProfile$() {
  return httpGet$(`/org`);
}
