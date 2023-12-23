import { httpGet, httpGet$, httpPost, httpDelete} from './http';

export async function getDocTemplate(id) {
  return httpGet(`doc_template/${id}`);
}

export function getDocTemplate$(id) {
  return httpGet$(`doc_template/${id}`);
}

export async function saveDocTemplate(docTemplate) {
  return httpPost('doc_template', docTemplate);
}

export async function deleteDocTemplate(id) {
  return httpDelete(`doc_template/${id}`);
}

export async function listDocTemplate() {
  return httpGet('doc_template');
}

export function listDocTemplate$() {
  return httpGet$('doc_template');
}

export async function applyDocTemplate(id, variables) {
  return httpPost(`doc_template/${id}/apply`, {variables});
}

export async function genPdfFromDocTemplate(id, variables) {
  return httpPost(`doc_template/${id}/pdf`, {variables});
}