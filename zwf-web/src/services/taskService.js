import { httpGet, httpPost, httpDelete, httpPut$, httpGet$, httpPost$ } from './http';
import { API_BASE_URL } from 'services/http';

export function getTask(id) {
  return httpGet(`task/${id}`);
}

export function getTask$(id) {
  return httpGet$(`task/${id}`);
}

export function getDeepLinkedTask$(deepLinkId) {
  return httpGet$(`task/deep/${deepLinkId}`);
}

export function saveDeepLinkedTask$(deepLinkId, payload) {
  return httpPost$(`task/deep/${deepLinkId}`, payload);
}

export function changeTaskStatus$(id, status) {
  return httpPost$(`task/${id}/status/${status}`);
}

export async function saveTask(item) {
  return httpPost('task', item);
}

export function createNewTask$(payload) {
  return httpPut$('task', payload);
}

export async function deleteTask(id) {
  return httpDelete(`task/${id}`);
}

export function listTask$() {
  return httpGet$('task');
}

export async function searchTask(query) {
  return httpPost('task/search', query);
}

export function searchTask$(query) {
  return httpPost$('task/search', query);
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

export function listTaskMessages(taskId) {
  return httpGet$(`task/${taskId}/message`);
}

export function sendTaskMessage$(taskId, id, message) {
  return httpPost$(`task/${taskId}/message`, { id, message });
}

export function subscribeTaskMessage(taskId) {
  const url = `${API_BASE_URL}/task/${taskId}/message/subscribe`;
  const es = new EventSource(url, { withCredentials: true });
  return es;
}