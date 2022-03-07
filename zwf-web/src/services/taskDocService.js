import { API_BASE_URL, httpPost$, httpPut$ } from './http';

export function createOrphanTaskDocFromUploadedFile$(fileId) {
  return httpPut$(`/task_doc`, { fileId });
}

export function createOrphanTaskDocFromDocTemplate$(docTemplateId) {
  return httpPut$(`/task_doc`, { docTemplateId });
}

export function listTaskDocs$(taskDocIds) {
  return httpPost$(`/task_doc/search`, { ids: taskDocIds });
}

export function toggleTaskDocsOfficialOnly$(taskDocId, officialOnly) {
  return httpPost$(`/task_doc/${taskDocId}/offical_only`, { officialOnly });
}

export function toggleTaskDocsRequiresSign$(taskDocId, requiresSign) {
  return httpPost$(`/task_doc/${taskDocId}/requires_sign`, { requiresSign });
}

export function signTaskDoc$(taskDocId) {
  return httpPost$(`/task_doc/${taskDocId}/sign`);
}

export function getTaskDocDownloadUrl(taskDocId) {
  return `${API_BASE_URL}/task_doc/${taskDocId}/data`;
}