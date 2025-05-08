import { GlobalContext } from 'contexts/GlobalContext';
import React from 'react';
import { Typography, Modal } from 'antd';
import { logout$ } from 'services/authService';
import { notify } from 'util/notify';
import { useNavigate } from 'react-router-dom';

const { Paragraph } = Typography;

export const useAuthUser = () => {
  const navigate = useNavigate();
  const context = React.useContext(GlobalContext);

  const setAuthUser = (updatedUser, pathAfter = null) => {
    context.user = updatedUser;

    if (updatedUser) {
      const { suspended } = updatedUser;
      if (suspended) {
        // When org/account is suspended.
        logout$().subscribe(() => {
          context.user = null;
          navigate('/');
          Modal.error({
            title: 'Account has been suspended',
            content: <>
              <Paragraph>Your account and your organization's account have been suspended. </Paragraph>
              <Paragraph>Please contact your organization's administrators, as they should have received an email containing instructions on how to settle the outstanding bill and reactivate the accounts.</Paragraph>
            </>,
            closable: true,
            destroyOnClose: true,
            okButtonProps: {
              type: 'default',
            },
            autoFocusButton: "ok",
          })
        });
        return;
      }
    }

    if (pathAfter) {
      navigate(pathAfter);
    }
  }

  return [context.user, setAuthUser];
}

