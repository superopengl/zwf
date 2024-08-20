import { httpGet$, httpPost$, httpDelete$ } from './http';

export function listPublishedResourcePages$() {
  return httpGet$(`/resource`)
}

export function getPublishedResourcePage$(key) {
  return httpGet$(`/resource/${key}`)
}

export function listAllResourcePages$() {
  return httpGet$(`/manage/resource`)
}

export function saveResourcePage$(page) {
  return httpPost$(`/manage/resource`, page);
}

export function getEditResourcePage$(id) {
  return httpGet$(`/manage/resource/${id}`)
}

export function deleteResourcePage$(id) {
  return httpDelete$(`/manage/resource/${id}`)
}
