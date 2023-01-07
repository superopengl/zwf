import { httpGet, httpPost, httpDelete } from './http';

export async function getPortfolio(id) {
  return httpGet(`portfolio/${id}`);
}

export async function savePortfolio(portfolio) {
  return httpPost('portfolio', portfolio);
}

export async function deletePortfolio(id) {
  return httpDelete(`portfolio/${id}`);
}

export async function listPortfolio() {
  return httpGet('portfolio');
}

export async function newPortfolioForUser(portfolio, userId) {
  return httpPost(`user/${userId}/portfolio`, portfolio);
}

export async function listPortfolioForUser(userId) {
  return httpGet(`user/${userId}/portfolio`);
}
