import { useAssertUser } from './useAssertUser';

export const useAssertRole = (roles, fallbackRoute = '/') => {

  const roleCheck = user => {
    const role = user?.role || 'guest';
    return roles.includes(role);
  }

  useAssertUser(roleCheck, fallbackRoute);

  return null;
}


