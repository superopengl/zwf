import { API_BASE_URL, httpPost$, httpGet$ } from 'services/http';

export function createTaskTalkText$(taskId, message, mentionedUserIds) {
  return httpPost$(`task/${taskId}/talk/text`, { message, mentionedUserIds });
}

