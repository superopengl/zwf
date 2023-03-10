import { GlobalContext } from 'contexts/GlobalContext';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Typography } from 'antd';
import { logout$ } from 'services/authService';
import { notify } from 'util/notify';

const { Text, Paragraph } = Typography;

export const useSetAuthUser = () => {
  const context = React.useContext(GlobalContext);
  const navigate = useNavigate();

  const { setUser } = context;

  const setAuthUser = (user) => {
    if (user) {
      const { suspended } = user;
      if (suspended) {
        // When org/account is suspended.
        setUser(null);
        logout$().subscribe(() => {
          notify.error(
            'Account has been suspended',
            <>
              <Paragraph>Your account and your organization's account have been suspended. </Paragraph>
              <Paragraph>Please contact your organization's administrators, as they should have received an email containing instructions on how to settle the outstanding bill and reactivate the accounts.</Paragraph>
            </>,
            0
          )
        });
        return;
      }

      if (user.role === 'admin' && !user.orgId) {
        setUser(user);
        navigate('/onboard')
        return;
      }
    }

    setUser(user);
  }

  return setAuthUser;
}