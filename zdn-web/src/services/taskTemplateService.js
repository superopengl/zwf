import { httpGet, httpPost, httpDelete } from './http';

export async function getTaskTemplate(id) {
  return httpGet(`task_template/${id}`);
}

export async function saveTaskTemplate(taskTemplate) {
  return httpPost('task_template', taskTemplate);
}

export async function deleteTaskTemplate(id) {
  return httpDelete(`task_template/${id}`);
}

export async function listTaskTemplate() {
  return httpGet('task_template');
}
