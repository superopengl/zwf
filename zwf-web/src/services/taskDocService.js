import { httpPost$ } from './http';

export function createOrphanTaskDoc$(fileId) {
  return httpPost$(`/task_doc`, { fileId });
}

export function listTaskDocs$(taskDocIds) {
  return httpPost$(`/task_doc/search`, { ids: taskDocIds });
}
