import { httpPost, httpGet, httpPost$, httpGet$ } from './http';
import {reactLocalStorage} from 'reactjs-localstorage';

export function login$(name, password) {
  const data = { name, password };
  return httpPost$(`auth/login`, data);
}

export function signUp$(user) {
  return httpPost$(`auth/signup`, user);
}

export function signUpOrg$(email) {
  return httpPost$(`auth/signup/org`, {email});
}

export function forgotPassword$(email) {
  return httpPost$(`auth/forgot_password`, { email });
}

export function resetPassword$(token, password) {
  return httpPost$(`auth/reset_password`, { token, password });
}

export function logout$() {
  return httpPost$(`auth/logout`);
}

export async function getAuthUser() {
  return httpGet(`auth/user`);
}

export function getAuthUser$() {
  return httpGet$(`auth/user`);
}

export function impersonate$(email) {
  return httpPost$(`auth/impersonate`, { email });
}

export function inviteUser$(email, role) {
  return httpPost$(`auth/invite`, { email, role });
}

export async function inviteClient(email) {
  return httpPost(`auth/invite/client`, { email });
}

export function ssoGoogle$(token) {
  return httpPost$(`auth/sso/google`, { token });
}