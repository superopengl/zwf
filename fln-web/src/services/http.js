import * as axios from 'axios';
import * as _ from 'lodash';
import { notify } from 'util/notify';
import * as FormData from 'form-data';
import { ajax } from 'rxjs/ajax';
import { catchError, map, tap } from 'rxjs/operators';

import * as queryString from 'query-string';
import { of } from 'rxjs';

axios.defaults.withCredentials = true;

function trimSlash(str) {
  return str ? str.replace(/^\/+/, '').replace(/\/+$/, '') : str;
}

function trimTrailingSlash(str) {
  return str ? str.replace(/\/+$/, '') : str;
}

function getFullBaseUrl() {
  const url = trimTrailingSlash(process.env.REACT_APP_FLN_API_ENDPOINT);
  if (url.charAt(0) === '/') {
    // Relative address
    return window.location.origin + url;
  } else {
    // Absolute address
    return url;
  }
}

export const API_BASE_URL = getFullBaseUrl();
export const WEBSOCKET_URL = API_BASE_URL.replace(/^(http)(s?:\/\/[^/]+)(.*)/i, 'ws$2');
console.log('Backend API URL', API_BASE_URL, WEBSOCKET_URL);

function getHeaders(responseType) {
  const headers = {
    'Content-Type': responseType === 'json' ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
  };

  return headers;
}

export async function request(method, path, queryParams, body, responseType = 'json') {
  try {
    const response = await axios({
      method,
      // baseURL,
      url: `${API_BASE_URL}/${trimSlash(path)}`,
      headers: getHeaders(responseType),
      params: queryParams,
      data: body,
      responseType
    });

    return response.data;
  } catch (e) {
    const code = _.get(e, 'response.status', null);
    if (code === 401) {
      notify.error('Session timeout.');
      window.location = '/';
      return;
    }
    const errorMessage = responseType === 'blob' ? e.message : _.get(e, 'response.data.message') || _.get(e, 'response.data') || e.message;
    notify.error('Error', errorMessage);
    console.error(e.response);
    throw e;
  }
}

export function request$(method, path, queryParams, body, responseType = 'json') {
  return ajax({
    method,
    url: `${API_BASE_URL}/${trimSlash(path)}?${queryString.stringify(queryParams)}`,
    headers: getHeaders(responseType),
    body,
    crossDomain: true,
    withCredentials: true,
  }).pipe(
    // tap(r => {
    //   debugger;
    //   console.log(r)
    // }),
    map(r => r.response),
    catchError(e => {
      const code = e.status;
      if (code === 401) {
        notify.error('Session timeout.');
        window.location = '/';
        return;
      }
      const errorMessage = responseType === 'blob' ? e.message : e.response || _.get(e, 'response.data.message') || _.get(e, 'response.data') || e.message;
      notify.error('Error', errorMessage);
      console.error(e.response);
      throw e;
    })
  );
}

export async function uploadFile(fileBlob) {
  try {
    const form = new FormData();
    form.append('file', fileBlob, fileBlob.name);
    const response = await axios.post(
      `${API_BASE_URL}/file`,
      form,
      // { headers: getHeaders(responseType) },
    );

    return response.data;
  } catch (e) {
    const code = _.get(e, 'response.status', null);
    if (code === 401) {
      notify.error('Session timeout.');
      window.location = '/';
      return;
    }
    const errorMessage = _.get(e, 'response.data.message') || _.get(e, 'response.data') || e.message;
    notify.error('Error', errorMessage);
    console.error(e.response);
    throw e;
  }
}

export const httpGet = async (path, queryParams = null) => request('GET', path, queryParams);
export const httpPost = async (path, body, queryParams = null) => request('POST', path, queryParams, body);
export const httpPut = async (path, body, queryParams = null) => request('PUT', path, queryParams, body);
export const httpDelete = async (path, body = null, queryParams = null) => request('DELETE', path, queryParams, body);

export const httpGet$ = (path, queryParams = null) => request$('GET', path, queryParams);
export const httpPost$ = (path, body, queryParams = null) => request$('POST', path, queryParams, body);
export const httpPut$ = (path, body, queryParams = null) => request$('PUT', path, queryParams, body);
export const httpDelete$ = (path, body = null, queryParams = null) => request$('DELETE', path, queryParams, body);
