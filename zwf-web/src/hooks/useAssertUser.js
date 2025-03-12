import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthUser } from './useAuthUser';

export const useAssertUser = (testerFn, fallbackRoute = '/') => {
  const [user] = useAuthUser();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    const allowed = testerFn(user);
    if (!allowed) {
      console.debug(`fallback to route ${fallbackRoute}`);
      navigate(fallbackRoute);
    }
  }, [user]);

  return null;
}

