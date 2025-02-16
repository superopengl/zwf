import { GlobalContext } from 'contexts/GlobalContext';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Typography } from 'antd';
import { logout$ } from 'services/authService';
import { notify } from 'util/notify';

const { Paragraph } = Typography;

export const useAuthUser = () => {
  const navigate = useNavigate();
  const context = React.useContext(GlobalContext);

  const { user } = context;

  const updateContextUser = (user) => {
    context.user = user;
    context.role = user?.role ?? 'guest';;
  }

  const setAuthUser = (user) => {
    if (user) {
      const { suspended } = user;
      if (suspended) {
        // When org/account is suspended.
        updateContextUser(null);
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

      if (user?.role === 'admin' && !user.orgId) {
        updateContextUser(user);
        navigate('/onboard')
        return;
      }
    }

    updateContextUser(user);
  }

  return [user, setAuthUser];
}

