import { API_BASE_URL } from './http';
import { httpGet$, httpPost$ } from './http';

export function establishZeventRawStream(onMessageHandler) {
  let url = `${API_BASE_URL}/zevent/establish`;
  // if(taskId) {
  //   url += `?taskId=${taskId}`;
  // }
  const es = new EventSource(url, { withCredentials: true });
  es.onmessage = (e) => {
    const event = JSON.parse(e.data);
    onMessageHandler?.(event);
  }

  return es;
}

export function loadMyUnackZevents$() {
  return httpGet$(`/zevent`);
}

export function ackTaskEventType$(taskId, type) {
  return httpPost$(`/zevent`, { taskId, type });
}


