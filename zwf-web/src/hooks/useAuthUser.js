import { GlobalContext } from 'contexts/GlobalContext';
import React from 'react';
import { Typography } from 'antd';
import { logout$ } from 'services/authService';
import { notify } from 'util/notify';
import { useNavigate } from 'react-router-dom';

const { Paragraph } = Typography;

export const useAuthUser = () => {
  const navigate = useNavigate();
  const context = React.useContext(GlobalContext);
  const routePathRef = React.useRef(null);

  React.useEffect(() => {
    if (routePathRef.current) {
      navigate(routePathRef.current);
    }
  }, [routePathRef.current]);

  const setAuthUser = (updatedUser, pathAfter = null) => {
    routePathRef.current = pathAfter ?? null;

    if (updatedUser) {
      const { suspended } = updatedUser;
      if (suspended) {
        // When org/account is suspended.
        logout$().subscribe(() => {
          context.user = null;
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
    }

    context.user = updatedUser;
  }

  return [context.user, setAuthUser];
}

