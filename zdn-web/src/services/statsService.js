import { httpGet } from './http';

export async function getStats() {
  return httpGet(`stats`);
}

