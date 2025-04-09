import { BehaviorSubject, of } from 'rxjs';
import { filter, delay, switchMap } from 'rxjs/operators';
import { httpPost$, httpGet$ } from './http';

export function searchOrgClients$(payload) {
  return httpPost$(`/org/client`, { page: 1, size: 50, ...payload });
}

export function saveClientAlias$(orgClientId, alias) {
  return httpPost$(`/org/client/${orgClientId}/alias`, { alias });
}

export function saveClientRemark$(orgClientId, remark) {
  return httpPost$(`/org/client/${orgClientId}/remark`, { remark });
}

export function setOrgClientTags$(orgClientId, tagIds) {
  return httpPost$(`/org/client/${orgClientId}/tags`, { tags: tagIds });
}

export function createOrgClientField$(orgClientId, name) {
  return httpPost$(`/org/client/${orgClientId}/databag`, { name });
}

export function getOrgClientDataBag$(orgClientId) {
  return httpGet$(`/org/client/${orgClientId}/databag`);
}

export function getOrgClientDatabag$(orgClientId) {
  return httpGet$(`/org/client/${orgClientId}/databag`);
}

export function getOrgClientInfo$(orgClientId) {
  return httpGet$(`/org/client/${orgClientId}/info`);
}

export function saveOrgClientEmail$(orgClientId, email) {
  return httpPost$(`/org/client/${orgClientId}/email`, { email });
}

export function saveOrgClientDatabag$(orgClientId, fields) {
  return httpPost$(`/org/client/${orgClientId}/databag`, { fields });
}

const clientNameCardInfoCache = new Map();
const API_PATH = `/org/client/brief`;

export function refreshClientNameCardCache(orgClientId) {
  httpPost$(API_PATH, { ids: [orgClientId] }).subscribe(info => {
    const cachedSource$ = clientNameCardInfoCache.get(orgClientId);
    cachedSource$.next(info[0]);
  });
}

export function getClientNameCardInfo$(orgClientId) {
  let cachedSource$ = clientNameCardInfoCache.get(orgClientId);
  if (!cachedSource$) {
    cachedSource$ = new BehaviorSubject().pipe(
      filter(x => !!x),
    );

    clientNameCardInfoCache.set(orgClientId, cachedSource$);
    enqueueRequest(orgClientId);
  }

  return cachedSource$;
}

const requestBuffer = [];
function enqueueRequest(orgClientId) {
  requestBuffer.push(orgClientId);

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
      const orgClientId = info.id;
      const cachedSource$ = clientNameCardInfoCache.get(orgClientId);
      cachedSource$.next(info);
    }
  });
}


