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

export async function downloadTaskDoc(taskDocId) {
  if (!taskDocId) throw new Error('Missing taskDocId');
  return request('GET', `/task/doc/${taskDocId}`, null, null, 'blob');
}

export async function openTaskDoc(docId, docName) {
  try {
    const data = await downloadTaskDoc(docId);
    var link = document.createElement("a"); // Or maybe get it from the current document
    link.href = URL.createObjectURL(data);
    link.download = docName;
    link.click();
    return true;
  } catch (e) {
    return false;
  }
}

export function getPublicFileUrl(fileId) {
  return `${API_BASE_URL}/file/public/${fileId}/data`;
}

export function getFileUrl(fileId) {
  return `${API_BASE_URL}/file/${fileId}/data`;
}
