import { API_BASE_URL, httpGet, httpGet$, httpPost, request } from './http';

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

export async function downloadFile(fileId) {
  if (!fileId) throw new Error('Missing fileId');
  return request('GET', `/file/${fileId}/data`, null, null, 'blob');
}

export async function openFile(fileId) {
  const data = await downloadFile(fileId);
  const fileUrl = URL.createObjectURL(data);
  window.open(fileUrl);
}

export function getPublicFileUrl(fileId) {
  return `${API_BASE_URL}/file/public/${fileId}/data`;
}

export function getFileUrl(fileId) {
  return `${API_BASE_URL}/file/${fileId}/data`;
}
