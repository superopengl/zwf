import { API_BASE_URL } from './http';
import { httpGet$, httpPost$ } from './http';

export function establishZeventStream(taskId) {
  let url = `${API_BASE_URL}/zevent/establish`;
  if(taskId) {
    url += `?taskId=${taskId}`;
  }
  const es = new EventSource(url, { withCredentials: true });
  return es;
}

export function loadMyUnackZevents$() {
  return httpGet$(`/zevent`);
}

export function ackTaskEventType$(taskId, type) {
  return httpPost$(`/zevent`, { taskId, type });
}


