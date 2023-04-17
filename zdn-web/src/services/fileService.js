import { httpGet, httpPost, request } from './http';

export async function getFile(id) {
  return httpGet(`file/${id}`);
}

export async function searchFile(ids) {
  return ids?.length ? httpPost('file/search', { ids }) : [];
}

export async function downloadFile(taskId, fileId) {
  if (!taskId || !fileId) throw new Error('Missing taskId and fileId');
  return request('GET', `file/download/task/${taskId}/file/${fileId}`, null, null, 'blob');
}

export async function openFile(taskId, fileId) {
  const data = await downloadFile(taskId, fileId);
  const fileUrl = URL.createObjectURL(data);
  window.open(fileUrl);
}
