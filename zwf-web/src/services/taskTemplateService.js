import { httpGet$, httpPost$, httpDelete$, httpPut$ } from './http';

export function getTaskTemplate$(id) {
  return httpGet$(`/femplate/${id}`);
}

export function saveTaskTemplate$(femplate) {
  return httpPost$('/femplate', femplate);
}

export function cloneTaskTemplate$(sourceTemplateId) {
  return httpPut$(`/femplate/${sourceTemplateId}/clone`, );
}

export function deleteTaskTemplate$(id) {
  return httpDelete$(`/femplate/${id}`);
}

export function listTaskTemplate$() {
  return httpGet$('/femplate');
}

export function renameTaskTemplate$(id, name) {
  return httpPost$(`/femplate/${id}/rename`, {name});
}