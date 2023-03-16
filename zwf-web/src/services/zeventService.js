import { API_BASE_URL, httpGet$, httpPost$ } from './http';

export function establishZeventStream(taskId) {
  let url = `${API_BASE_URL}/zevent`;
  if(taskId) {
    url += `?taskId=${taskId}`;
  }
  const es = new EventSource(url, { withCredentials: true });
  return es;
}
