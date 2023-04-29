import { BehaviorSubject, of, Subject } from 'rxjs';
import { filter, tap, delay, switchMap } from 'rxjs/operators';
import { httpGet$, httpPost, httpPost$, httpDelete$ } from './http';

export async function changePassword(password, newPassword) {
  return httpPost(`user/change_password`, { password, newPassword });
}



export function deleteUser$(id) {
  return httpDelete$(`user/${id}`);
}

export async function setPasswordForUser(id, password) {
  return httpPost(`/user/${id}/set_password`, { password });
}

export function saveProfile$(userId, profile) {
  return httpPost$(`/user/${userId}/profile`, profile);
}


export async function setUserRole(userId, role) {
  return httpPost(`/user/${userId}/role`, { role });
}

const userNameCardInfoCache = new Map();
const API_PATH = `/user/brief`;

export function refreshUserNameCardCache(userId) {
  httpPost$(API_PATH, { ids: [userId] }).subscribe(info => {
    const cachedSource$ = userNameCardInfoCache.get(userId);
    cachedSource$.next(info[0]);
  });
}

export function getUserNameCardInfo$(userId) {
  let cachedSource$ = userNameCardInfoCache.get(userId);
  if (!cachedSource$) {
    cachedSource$ = new BehaviorSubject().pipe(
      filter(x => !!x),
    );

    userNameCardInfoCache.set(userId, cachedSource$);
    enqueueRequest(userId);
  }

  return cachedSource$;
}

const requestBuffer = [];
function enqueueRequest(userId) {
  requestBuffer.push(userId);

  of(null).pipe(
    delay(0),
    switchMap(() => {
      const ids = [];
      let first;
      while ((first = requestBuffer.shift())) {
        ids.push(first);
      }
      return ids.length ? httpPost$(API_PATH, { ids }) : of([])
    }),
  ).subscribe(result => {
    for (const info of result) {
      const userId = info.id;
      const cachedSource$ = userNameCardInfoCache.get(userId);
      cachedSource$.next(info);
    }
  });
}


