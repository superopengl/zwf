import { tap } from 'rxjs';
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

function getTaskDocFileInfo$(taskDocId) {
  if (!taskDocId) throw new Error('Missing taskDocId');
  return httpGet$(`/task/doc/${taskDocId}`);
}

export function openTaskDoc$(docId) {
  return getTaskDocFileInfo$(docId)
    .pipe(
      tap(data => {
        const { name, fileUrl } = data;
        if (fileUrl) {
          const link = document.createElement("a"); // Or maybe get it from the current document
          link.href =`${process.env.REACT_APP_ZWF_API_DOMAIN_NAME}${process.env.REACT_APP_ZWF_API_ENDPOINT}${fileUrl}`;
          link.download = name;
          // link.target = "_blank"; // Don't set target. iPhone doesn't download if set target.
          // document.body.appendChild(link);
          link.click();
          // document.body.removeChild(link);
        }
      })
    );
}

export function getPublicFileUrl(fileId) {
  return `${API_BASE_URL}/file/public/${fileId}/data`;
}

export function getFileUrl(fileId) {
  return `${API_BASE_URL}/file/${fileId}/data`;
}
