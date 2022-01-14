
import { httpGet, httpPost, httpDelete } from './http';

export async function saveConfig(key, value) {
  return httpPost('config', {key, value});
}

export async function listConfig() {
  return httpGet('config');
}
