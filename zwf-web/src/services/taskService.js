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

export function getTaskFieldDocs$(fieldId, taskDocIds) {
  return httpPost$(`/task/field/${fieldId}/docs`, { taskDocIds });
}

export function saveTaskFieldValues$(taskId, fields) {
  return httpPost$(`/task/${taskId}/field/value`, { fields });
}

// export function updateTaskFields$(taskId, fields) {
//   return httpPost$(`/task/${taskId}/fields`, fields);
// }

export function createNewTask$(payload) {
  return httpPut$('/task', payload);
}

export function listClientTask$() {
  return httpGet$('task');
}

export function searchTask$(query) {
  return httpPost$('task/search', query);
}

export function updateTaskTags$(id, tags) {
  return httpPost$(`task/${id}/tags`, { tags });
}

export function renameTask$(id, name) {
  return httpPost$(`task/${id}/rename`, { name });
}

export function assignTask$(taskId, agentId) {
  return httpPost$(`task/${taskId}/assign`, { agentId });
}

export function getTaskHistory$(taskId) {
  return httpGet$(`/task/${taskId}/history`);
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

export function listTaskTrackings$(taskId) {
  return httpGet$(`task/${taskId}/tracking`);
}

export function getTaskDeepLinkUrl(taskDeepLinkId) {
  return `${API_DOMAIN_NAME}/t/${taskDeepLinkId}/`;
}

export function subscribeTaskFieldsChange(taskId) {
  const url = `${API_BASE_URL}/task/${taskId}/content/sse`;
  const es = new EventSource(url, { withCredentials: true });
  return es;
}