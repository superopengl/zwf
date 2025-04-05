import { httpGet, httpPost$, httpGet$ } from './http';

export function login$(name, password) {
  const data = { name, password };
  return httpPost$(`auth/login`, data);
}

export function signUpOrg$(email) {
  return httpPost$(`auth/signup/org`, { email });
}

export function forgotPassword$(email, returnUrl) {
  return httpPost$(`auth/forgot_password`, { email, returnUrl });
}

export function resetPassword$(token, password) {
  return httpPost$(`auth/set_password`, { token, password });
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

export function impersonate$(id) {
  if (!id) {
    throw new Error(`ID not specified`);
  }
  return httpPost$(`auth/impersonate`, { id });
}

export function unimpersonate$() {
  return httpPost$(`auth/unimpersonate`);
}

export function inviteMember$(emails) {
  return httpPost$(`auth/invite/member`, { emails });
}

export function reinviteMember$(email) {
  return httpPost$(`auth/reinvite/member`, { email });
}

// export function inviteClient$(emails) {
//   return httpPost$(`auth/invite/client`, { emails });
// }

export function addClient$(alias, email) {
  return httpPost$(`/auth/invite/client`, { alias, email });
}

export function ssoGoogleRegisterOrg$(token) {
  return httpPost$(`auth/register/google`, { token });
}

export function ssoGoogleLogin$(token) {
  return httpPost$(`auth/login/google`, { token });
}