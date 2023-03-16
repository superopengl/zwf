import { httpGet$, httpPost$ } from './http';

export function getMyNotificationMessages$() {
  return httpGet$(`/notification`);
}

export function reactOnNotificationMessage$(id) {
  return httpPost$(`/notification`, { id });
}
