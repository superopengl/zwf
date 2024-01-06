import { httpGet, httpGet$, httpPost, request } from './http';

export async function getFileStream(id) {
  return httpGet(`file/${id}/data`);
}

export async function getFileMeta(id) {
  return httpGet(`file/${id}`);
}

export function getFileMeta$(id) {
  return httpGet$(`file/${id}`);
}

export async function getFileMetaList(ids) {
  return ids?.length ? httpPost('file/meta', { ids }) : [];
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

export function getPublicFileUrl(fileId) {
  return `${process.env.REACT_APP_ZWF_API_ENDPOINT}/file/public/${fileId}/data`;
}