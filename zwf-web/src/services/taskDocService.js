import { API_BASE_URL, httpPost$, httpPut$ } from './http';

export function getTaskDocDownloadUrl(fileId) {
  return `${API_BASE_URL}/task/file/${fileId}`;
}