import { API_BASE_URL, httpPost$, httpPut$ } from './http';

export function listTaskDocs$(taskDocIds) {
  return httpPost$(`/task_doc/search`, { ids: taskDocIds });
}


export function toggleTaskDocsRequiresSign$(taskDocId, requiresSign) {
  return httpPost$(`/task_doc/${taskDocId}/requires_sign`, { requiresSign });
}

export function signTaskDoc$(taskDocId) {
  return httpPost$(`/task_doc/${taskDocId}/sign`);
}

export function genDoc$(taskDocId) {
  return httpPost$(`/task_doc/${taskDocId}/gendoc`);
}

export function getTaskDocDownloadUrl(taskDocId) {
  return `${API_BASE_URL}/task_doc/${taskDocId}/data`;
}