import { httpGet, httpPost, httpDelete } from './http';


export async function getMyAccount() {
  return httpGet(`account`);
}

export async function getAccount(userId) {
  return httpGet(`user/${userId}/account`);
}

export async function adjustCredit(userId, amount) {
  return httpPost(`user/${userId}/credit`, {amount});
}

export async function listMyCreditHistory() {
  return httpGet(`credit/history`);
}

export async function listUserCreditHistory(userId) {
  return httpGet(`user/${userId}/credit/history`);
}

