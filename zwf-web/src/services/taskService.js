import { API_DOMAIN_NAME, API_BASE_URL, httpGet, httpPost, httpDelete, httpPut$, httpGet$, httpPost$, httpDelete$ } from 'services/http';

export function getTask(id) {
  return httpGet(`task/${id}`);
}

export function getTask$(id) {
  return httpGet$(`task/${id}`);
}

export function getDeepLinkedTask$(deepLinkId) {
  return httpGet$(`task/deep/${deepLinkId}`);
}

export function changeTaskStatus$(id, status) {
  return httpPost$(`task/${id}/status/${status}`);
}

export async function saveTask(item) {
  return httpPost('task', item);
}

export function updateTaskFields$(taskId, fields) {
  return httpPost$(`/task/${taskId}/fields`, { fields });
}

export function generateAutoDoc$(fieldId) {
  return httpPost$(`/task/field/${fieldId}/autodoc`);
}

export function saveTaskFieldValues$(taskId, fields) {
  return httpPost$(`/task/${taskId}/field/value`, { fields });
}

export function getTaskDocDownloadUrl(fileId) {
  return `${API_BASE_URL}/task/file/${fileId}`;
}

export function signTaskFile$(fileId) {
  return httpPost$(`/task/file/${fileId}/sign`);
}

// export function updateTaskFields$(taskId, fields) {
//   return httpPost$(`/task/${taskId}/fields`, fields);
// }

export function createNewTask$(payload) {
  return httpPut$('/task', payload);
}

export function listClientTask$() {
  return httpGet$('/task');
}

export function searchTask$(query) {
  return httpPost$('/task/search', query);
}

export function updateTaskTags$(id, tags) {
  return httpPost$(`/task/${id}/tags`, { tags });
}

export function renameTask$(id, name) {
  return httpPost$(`/task/${id}/rename`, { name });
}

export function assignTask$(taskId, agentId) {
  return httpPost$(`/task/${taskId}/assign`, { agentId });
}

export function getTaskHistory$(taskId) {
  return httpGet$(`/task/${taskId}/history`);
}

export function notifyTask$(taskId, msg) {
  const message = msg?.trim();
  return httpPost$(`/task/${taskId}/notify`, { message });
}

export async function listTaskComments(taskId) {
  return httpGet(`/task/${taskId}/comment`);
}

export async function addTaskComment(taskId, content) {
  return httpPost(`/task/${taskId}/comment`, { content });
}

export function listTaskTrackings$(taskId) {
  return httpGet$(`/task/${taskId}/tracking`);
}

export function getTaskDeepLinkUrl(taskDeepLinkId) {
  return `${API_DOMAIN_NAME}/app/t/${taskDeepLinkId}/`;
}

export function subscribeTaskFieldsChange(taskId) {
  const url = `${API_BASE_URL}/task/${taskId}/content/sse`;
  const es = new EventSource(url, { withCredentials: true });
  return es;
}