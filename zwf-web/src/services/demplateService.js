import { httpGet$, httpPut$, httpPost$, request$, httpDelete$ } from './http';

export function getDemplate$(id) {
  return httpGet$(`/demplate/${id}`);
}

export function saveDemplate$(demplate) {
  return httpPost$('/demplate', demplate);
}

export function cloneDemplate$(sourceTemplateId, name) {
  return httpPut$(`/demplate/${sourceTemplateId}/duplicate`, { name });
}

export function deleteDemplate$(id) {
  return httpDelete$(`/demplate/${id}`);
}

export function listDemplate$() {
  return httpGet$('/demplate');
}

export function renameDemplate$(id, name) {
  return httpPost$(`/demplate/${id}/rename`, { name });
}

export function previewDemplatePdf$(html) {
  return request$('POST', `/demplate/preview`, null, { html }, 'blob');
}

export function getDemplatePdfBuffer$(id) {
  return request$('GET', `/demplate/${id}/pdf`, null, null, 'blob');
}