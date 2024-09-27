import { httpGet, httpPost, httpDelete } from './http';


export async function getMyAccount() {
  return httpGet(`account`);
}

export async function getAccount(userId) {
  return httpGet(`user/${userId}/account`);
}


