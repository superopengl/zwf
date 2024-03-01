import { httpGet$, httpPost$, httpDelete$ } from './http';

export function listPublishedResourcePages$() {
  return httpGet$(`/resources`)
}

export function getPublishedResourcePage$(id) {
  return httpGet$(`/resources/${id}`)
}

export function listAllResourcePages$() {
  return httpGet$(`/manage/resources`)
}

export function saveResourcePage$(page) {
  return httpPost$(`/manage/resources`, page);
}

export function getEditResourcePage$(id) {
  return httpGet$(`/manage/resources/${id}`)
}

export function deleteResourcePage$(id) {
  return httpDelete$(`/manage/resources/${id}`)
}
