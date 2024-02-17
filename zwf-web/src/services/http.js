import * as axios from 'axios';
import * as _ from 'lodash';
import { notify } from 'util/notify';
import * as FormData from 'form-data';
import { ajax } from 'rxjs/ajax';
import { catchError, map, tap } from 'rxjs/operators';
import { Modal } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { reactLocalStorage } from 'reactjs-localstorage';
import * as queryString from 'query-string';
import {showVersionMismatchModal} from 'components/showVersionMismatchModal';

axios.defaults.withCredentials = true;

let isSessionTimeoutModalOn = false;
const DEVICE_ID_KEY = 'deviceId';

function trimSlash(str) {
  return str ? str.replace(/^\/+/, '').replace(/\/+$/, '') : str;
}

function trimTrailingSlash(str) {
  return str ? str.replace(/\/+$/, '') : str;
}

function getFullBaseUrl() {
  const url = trimTrailingSlash(process.env.REACT_APP_ZWF_API_DOMAIN_NAME + process.env.REACT_APP_ZWF_API_ENDPOINT);
  if (url.charAt(0) === '/') {
    // Relative address
    return window.location.origin + url;
  } else {
    // Absolute address
    return url;
  }
}

function getDeviceId() {
  const deviceId = reactLocalStorage.get(DEVICE_ID_KEY, uuidv4());
  reactLocalStorage.set(DEVICE_ID_KEY, deviceId);
  return deviceId;
}

export const API_BASE_URL = getFullBaseUrl();
export const API_DOMAIN_NAME = trimTrailingSlash(process.env.REACT_APP_ZWF_API_DOMAIN_NAME)
const webappVersion = process.env.REACT_APP_GIT_HASH;

function getHeaders(responseType) {
  const headers = {
    'Content-Type': responseType === 'json' ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
    'zwf-webapp-version': webappVersion,
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
      handleSessionTimeout();
      return false;
    }
    const errorMessage = responseType === 'blob' ? e.message : _.get(e, 'response.data.message') || _.get(e, 'response.data') || e.message;
    notify.error('Error', errorMessage);
    console.error(e.response);
    throw e;
  }
}

function reloadPage() {
  window.location = '/';
}

function handleSessionTimeout() {
  if (!isSessionTimeoutModalOn) {
    isSessionTimeoutModalOn = true;
    Modal.warning({
      title: 'Session timeout',
      content: 'Your session is timeout.',
      maskClosable: false,
      closable: false,
      autoFocusButton: 'ok',
      okButtonProps: {
        type: 'primary'
      },
      okText: 'Reload page',
      onOk: () => {
        reloadPage();
      }
    });
  }
}

export function request$(method, path, queryParams, body, responseType = 'json') {
  const qs = queryString.stringify(queryParams);
  return ajax({
    method,
    url: `${API_BASE_URL}/${trimSlash(path)}${qs ? `?${qs}` : ''}`,
    headers: getHeaders(responseType),
    body,
    crossDomain: true,
    withCredentials: true,
  }).pipe(
    tap(handleVersionMatch),
    map(r => r.response),
    catchError(e => {
      const code = e.status;
      if (code === 401) {
        handleSessionTimeout();
        return false;
      }
      const errorMessage = responseType === 'blob' ? e.message : e.response || _.get(e, 'response.data.message') || _.get(e, 'response.data') || e.message;
      const displayErrorMessage = errorMessage === 'ajax error' ? `Network error.`
        : errorMessage;
      notify.error('Error', displayErrorMessage);
      console.error(e.response);
      throw e;
    })
  );
}

function handleVersionMatch(response) {
  const backendVersion = response.xhr.getResponseHeader('zwf-bff-version');
  showVersionMismatchModal(webappVersion, backendVersion);
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
      handleSessionTimeout();
      return false;
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
