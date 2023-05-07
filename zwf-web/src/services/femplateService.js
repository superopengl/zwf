import { httpGet$, httpPost$, httpDelete$, httpPut$ } from './http';

export function getFemplate$(id) {
  return httpGet$(`/femplate/${id}`);
}

export function saveFemplate$(femplate) {
  return httpPost$('/femplate', femplate);
}

export function duplicateFemplate$(sourceTemplateId) {
  return httpPut$(`/femplate/${sourceTemplateId}/duplicate`, );
}

export function deleteFemplate$(id) {
  return httpDelete$(`/femplate/${id}`);
}

export function listFemplate$() {
  return httpGet$('/femplate');
}

export function renameFemplate$(id, name) {
  return httpPost$(`/femplate/${id}/rename`, {name});
}