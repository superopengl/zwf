import { httpGet$, httpPost$ } from './http';

export function getMyNotifications$() {
  return httpGet$(`/notification`);
}


