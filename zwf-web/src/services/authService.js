import { httpGet, httpPost$, httpGet$ } from './http';

export function login$(name, password) {
  const data = { name, password };
  return httpPost$(`auth/login`, data);
}

export function signUpOrg$(email) {
  return httpPost$(`auth/signup/org`, {email});
}

export function forgotPassword$(email, returnUrl) {
  return httpPost$(`auth/forgot_password`, { email, returnUrl });
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

export function inviteMember$(email) {
  return httpPost$(`auth/invite/member`, { email });
}

export function reinviteMember$(email) {
  return httpPost$(`auth/reinvite/member`, { email });
}

export function inviteClient$(email) {
  return httpPost$(`auth/invite/client`, { email });
}

export function ssoGoogleRegisterOrg$(token) {
  return httpPost$(`auth/register/google`, { token });
}

export function ssoGoogleLogin$(token) {
  return httpPost$(`auth/login/google`, { token });
}