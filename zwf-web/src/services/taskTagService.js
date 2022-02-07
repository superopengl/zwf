import { httpGet$, httpPost$, httpDelete$ } from './http';

export function listTaskTags$() {
  return httpGet$(`/tasktag`);
}

export function deleteTaskTag$(id) {
  return httpDelete$(`/tasktag/${id}`);
}

export function saveTaskTag$(tag) {
  const { id, name, colorHex } = tag;
  return httpPost$(`/tasktag`, { id, name, colorHex });
}