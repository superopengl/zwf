import { useAuthUser } from './useAuthUser';

export function useRole() {
  const [user] = useAuthUser();
  return user?.role ?? 'guest';
}