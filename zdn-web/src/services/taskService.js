import { httpGet, httpPost, httpDelete, httpPut$, httpGet$ } from './http';

export async function getTask(id) {
  return httpGet(`task/${id}`);
}

export function getTask$(id) {
  return httpGet$(`task/${id}`);
}

export function getDeepLinkedTask$(deepLinkId) {
  return httpGet$(`task/deep/${deepLinkId}`);
}

export async function saveTask(item) {
  return httpPost('task', item);
}

export function createNewTask(taskTemplateId, clientEmail) {
  return httpPut$('task', { taskTemplateId, clientEmail });
}

export async function deleteTask(id) {
  return httpDelete(`task/${id}`);
}

export async function listTask() {
  return httpGet('task');
}

export async function searchTask(query) {
  return httpPost('task/search', query);
}

export async function signTaskDoc(id, fileIds) {
  return httpPost(`task/${id}/sign`, { files: fileIds });
}

export async function generateTask(taskTemplateId, portfolioId) {
  return httpPost('task/generate', { taskTemplateId, portfolioId });
}

export async function assignTask(taskId, agentId) {
  return httpPost(`task/${taskId}/assign`, { agentId });
}

export async function listTaskNotifies(taskId, from, size = 20) {
  return httpGet(`task/${taskId}/notify`, { from, size });
}

export async function markTaskNotifyRead(taskId) {
  return httpPost(`task/${taskId}/notify/read`);
}

export async function notifyTask(taskId, msg) {
  const content = msg?.trim();
  if (content) {
    return httpPost(`task/${taskId}/notify`, { content });
  }
}

export async function listTaskComments(taskId) {
  return httpGet(`task/${taskId}/comment`);
}

export async function addTaskComment(taskId, content) {
  return httpPost(`task/${taskId}/comment`, { content });
}

