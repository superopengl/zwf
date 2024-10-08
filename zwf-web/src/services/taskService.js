import { API_DOMAIN_NAME, API_BASE_URL, httpGet, httpPost, httpDelete, httpPut$, httpGet$, httpPost$, httpDelete$ } from 'services/http';
import { isEmpty } from 'lodash';
import { of } from 'rxjs';

export function getTask(id) {
  return httpGet(`task/${id}`);
}

export function getTask$(id) {
  return httpGet$(`task/${id}`);
}

export function watchTask$(id, watch) {
  return httpPost$(`task/${id}/watch`, { watch });
}

export function getDeepLinkedTask$(deepLinkId) {
  return httpGet$(`task/deep/${deepLinkId}`);
}

export function changeTaskStatus$(id, status) {
  return httpPost$(`task/${id}/status/${status}`);
}

export function requestClientAction$(id, payload) {
  return httpPost$(`task/${id}/request_action`, payload);
}

export function addDemplateToTask$(taskid, demplateIds) {
  if (!demplateIds?.length) {
    throw new Error(`demplateIds cannot be empty`);
  }
  return httpPost$(`task/${taskid}/demplate`, { demplateIds });
}

export function deleteTaskDoc$(docId) {
  if (!docId) {
    throw new Error(`docId cannot be empty`);
  }
  return httpDelete$(`task/doc/${docId}`);
}

export function requestSignTaskDoc$(docId) {
  if (!docId) {
    throw new Error(`docId cannot be empty`);
  }
  return httpPost$(`task/doc/${docId}/request_sign`);
}

export function unrequestSignTaskDoc$(docId) {
  if (!docId) {
    throw new Error(`docId cannot be empty`);
  }
  return httpPost$(`task/doc/${docId}/unrequest_sign`);
}

export async function saveTask(item) {
  return httpPost('task', item);
}

export function updateTaskFields$(taskId, fields) {
  return httpPost$(`/task/${taskId}/fields`, { fields });
}

export function generateDemplateDoc$(docId) {
  return httpPost$(`/task/doc/${docId}/gendoc`);
}

export function saveTaskFieldValues$(taskId, fields) {
  if (isEmpty(fields)) {
    return of(null);
  }
  return httpPost$(`/task/${taskId}/field/value`, { fields });
}

export function getTaskDocDownloadUrl(fileId) {
  return `${API_BASE_URL}/task/file/${fileId}`;
}

export function signTaskDocs$(...docIds) {
  return httpPost$(`/task/doc/sign`, { docIds });
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

export function assignTask$(taskId, assigneeId) {
  return httpPost$(`/task/${taskId}/assign`, { assigneeId });
}

export function getTaskTimeline$(taskId) {
  return httpGet$(`/task/${taskId}/timeline`);
}

export function listTaskComment$(taskId) {
  return httpGet$(`/task/${taskId}/comment`);
}

export function getTaskDeepLinkUrl(taskDeepLinkId) {
  return `${API_DOMAIN_NAME || window.location.origin}/t/${taskDeepLinkId}/`;
}
