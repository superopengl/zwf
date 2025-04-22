import { map, of, tap } from 'rxjs';
import { httpGet$, httpPost$ } from './http';

export function getMyNotifications$() {
  return httpGet$(`/notification`);
}

export function ackTaskEventNotification$(taskId, type) {
  return httpPost$(`/notification`, { taskId, type });
}


