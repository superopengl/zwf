import { httpPost, httpGet, httpPost$, httpGet$ } from './http';
import {reactLocalStorage} from 'reactjs-localstorage';

export async function getUserAuthOrg(token) {
  return httpGet(`org/auth/${token}`);
}

export async function approveAuthOrg(token) {
  return httpPost(`org/auth/${token}/approve`);
}

export async function rejectAuthOrg(token) {
  return httpPost(`org/auth/${token}/reject`);
}
