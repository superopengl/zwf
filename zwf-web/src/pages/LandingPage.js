import React from 'react';
import loadable from '@loadable/component'
import { useRole } from 'hooks/useRole';
import { useNavigate } from 'react-router-dom';
import { useAuthUser } from 'hooks/useAuthUser';

export const LandingPage = () => {
  const role = useRole();
  const [user] = useAuthUser();
  const navigate = useNavigate();

  React.useEffect(() => {
    switch (role) {
      case 'admin':
        if (!user.orgId) {
          navigate('/onboard');
          break;
        }
      case 'agent':
      case 'client':
        navigate('/task');
        break;
      case 'system':
        navigate('/sysboard');
        break;
      default:
        navigate('/');
        break;
    }
  }, []);

  return null;
}

