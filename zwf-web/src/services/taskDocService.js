import { API_BASE_URL, httpPost$, httpPut$ } from './http';

export function listTaskDocs$(taskDocIds) {
  return httpPost$(`/task_doc/search`, { ids: taskDocIds });
}

export function genDoc$(taskDocId) {
  return httpPost$(`/task_doc/${taskDocId}/gendoc`);
}

export function getTaskDocDownloadUrl(fileId) {
  return `${API_BASE_URL}/task/file/${fileId}`;
}