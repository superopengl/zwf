import { httpGet$, httpPut$, httpPost$, httpPost, httpDelete$ } from './http';

export function getDocTemplate$(id) {
  return httpGet$(`/demplate/${id}`);
}

export function saveDocTemplate$(demplate) {
  return httpPost$('/demplate', demplate);
}

export function cloneDocTemplate$(sourceTemplateId, name) {
  return httpPut$(`/demplate/${sourceTemplateId}/clone`, {name});
}

export function deleteDocTemplate$(id) {
  return httpDelete$(`/demplate/${id}`);
}

export function listDocTemplate$() {
  return httpGet$('/demplate');
}

export function renameDocTemplate$(id, name) {
  return httpPost$(`/demplate/${id}/rename`, { name });
}