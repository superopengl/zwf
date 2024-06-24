import { httpGet$, httpPost$, httpDelete$, httpPut$ } from './http';

export function getTaskTemplate$(id) {
  return httpGet$(`/task_template/${id}`);
}

export function saveTaskTemplate$(taskTemplate) {
  return httpPost$('/task_template', taskTemplate);
}

export function cloneTaskTemplate$(sourceTemplateId) {
  return httpPut$(`/task_template/${sourceTemplateId}/clone`, );
}

export function deleteTaskTemplate$(id) {
  return httpDelete$(`/task_template/${id}`);
}

export function listTaskTemplate$() {
  return httpGet$('/task_template');
}

export function renameTaskTemplate$(id, name) {
  return httpPost$(`/task_template/${id}/rename`, {name});
}