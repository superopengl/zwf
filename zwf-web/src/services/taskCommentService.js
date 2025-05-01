import { API_BASE_URL, httpPost$, httpGet$ } from 'services/http';

export function addTaskComment$(taskId, message, mentionedUserIds) {
  return httpPost$(`task/${taskId}/comment`, { message, mentionedUserIds });
}


export function searchMyTaskComment$(page = 1, size = 50) {
  return httpGet$(`task/comment`, {page, size});
}