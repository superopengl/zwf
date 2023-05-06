import { httpGet$, httpPut$, httpPost$, httpPost, httpDelete$ } from './http';

export function getDocTemplate$(id) {
  return httpGet$(`doc_template/${id}`);
}

export function saveDocTemplate$(docTemplate) {
  return httpPost$('doc_template', docTemplate);
}

export function cloneDocTemplate$(sourceTemplateId, name) {
  return httpPut$(`/demplate/${sourceTemplateId}/clone`, {name});
}

export function deleteDocTemplate$(id) {
  return httpDelete$(`/demplate/${id}`);
}

export function listDocTemplate$() {
  return httpGet$('doc_template');
}

export function renameDocTemplate$(id, name) {
  return httpPost$(`/demplate/${id}/rename`, { name });
}