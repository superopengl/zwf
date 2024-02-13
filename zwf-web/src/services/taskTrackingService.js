import { API_BASE_URL, httpPost$, httpGet$ } from 'services/http';


export function subscribeTaskTracking(taskId) {
  const url = `${API_BASE_URL}/task/${taskId}/tracking/sse`;
  const es = new EventSource(url, { withCredentials: true });
  return es;
}

export function createNewTaskTracking$(taskId, message) {
  return httpPost$(`task/${taskId}/tracking`, { message });
}

export function nudgeTrackingAccess$(taskId) {
  return httpGet$(`task/${taskId}/tracking/nudge`);
}

export function searchMyTaskTracking$(page = 1, size = 50) {
  return httpGet$(`task/tracking`, {page, size});
}