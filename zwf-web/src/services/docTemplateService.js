import { httpGet$, httpPut$, httpPost$, httpPost, httpDelete$ } from './http';

export function getDocTemplate$(id) {
  return httpGet$(`doc_template/${id}`);
}

export function saveDocTemplate$(docTemplate) {
  return httpPost$('doc_template', docTemplate);
}

export function cloneDocTemplate$(sourceTemplateId) {
  return httpPut$(`/doc_template/${sourceTemplateId}/clone`,);
}

export function deleteDocTemplate$(id) {
  return httpDelete$(`/doc_template/${id}`);
}

export function listDocTemplate$() {
  return httpGet$('doc_template');
}

export function renameDocTemplate$(id, name) {
  return httpPost$(`/doc_template/${id}/rename`, { name });
}