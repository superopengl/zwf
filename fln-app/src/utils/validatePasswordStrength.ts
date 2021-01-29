import { assert } from './assert';
export const validatePasswordStrength = (password: string) => {
  assert(password && password.length >= 8, 400, 'Too weak password');
};