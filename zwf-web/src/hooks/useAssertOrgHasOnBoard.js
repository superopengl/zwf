
import React from 'react';
import { useAuthUser } from './useAuthUser';
import { useRole } from './useRole';
import { useNavigate } from 'react-router-dom';

export function useAssertOrgHasOnBoard() {
  const [user] = useAuthUser();
  const role = useRole();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (role === 'admin' && !user.orgId) {
      navigate('/onboard');
    }
  }, []);

  return null;
}
