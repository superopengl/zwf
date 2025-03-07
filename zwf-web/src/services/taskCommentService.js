import { API_BASE_URL, httpPost$, httpGet$ } from 'services/http';


export function subscribeTaskComment(taskId) {
  const url = `${API_BASE_URL}/task/${taskId}/comment/sse`;
  const es = new EventSource(url, { withCredentials: true });
  return es;
}

export function addTaskComment$(taskId, message) {
  return httpPost$(`task/${taskId}/comment`, { message });
}

export function nudgeCommentAccess$(taskId) {
  return httpGet$(`task/${taskId}/comment/nudge`);
}

export function searchMyTaskComment$(page = 1, size = 50) {
  return httpGet$(`task/comment`, {page, size});
}