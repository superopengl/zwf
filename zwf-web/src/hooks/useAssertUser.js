import { GlobalContext } from 'contexts/GlobalContext';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const useAssertUser = (testerFn, fallbackRoute = '/') => {
  const context = React.useContext(GlobalContext);
  const navigate = useNavigate();
  
  React.useEffect(() => {
    const allowed = testerFn(context.user);
    if (!allowed) {
      navigate(fallbackRoute);
    }
  }, []);

  return null;
}
