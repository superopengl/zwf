import { BehaviorSubject, of, Subject } from 'rxjs';
import { filter, tap, delay, switchMap } from 'rxjs/operators';
import { httpGet, httpGet$, httpPost, httpPost$, httpDelete$ } from './http';

export async function changePassword(password, newPassword) {
  return httpPost(`user/change_password`, { password, newPassword });
}

export function searchOrgClientUsers$(payload) {
  return httpPost$(`/org/client`, { page: 1, size: 50, ...payload });
}

export async function listAllUsers() {
  return httpGet(`user`);
}

export function deleteUser$(id) {
  return httpDelete$(`user/${id}`);
}

export async function setPasswordForUser(id, password) {
  return httpPost(`user/${id}/set_password`, { password });
}

export async function saveProfile(userId, profile) {
  return httpPost(`user/${userId}/profile`, profile);
}

export async function setUserTags(userId, tags) {
  return httpPost(`user/${userId}/tags`, { tags });
}

export function setUserTags$(userId, tagIds) {
  return httpPost$(`user/${userId}/tags`, { tags: tagIds });
}

export async function setUserRole(userId, role) {
  return httpPost(`user/${userId}/role`, { role });
}

const userNameCardInfoCache = new Map();

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
      return ids.length ? httpPost$(`/user/brief`, { ids }) : of([])
    }),
  ).subscribe(result => {
    for(const info of result) {
      const userId = info.id;
      const cachedSource$ = userNameCardInfoCache.get(userId);
      cachedSource$.next(info);
    }
  });

}


