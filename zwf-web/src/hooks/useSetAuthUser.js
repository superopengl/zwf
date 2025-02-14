import { GlobalContext } from 'contexts/GlobalContext';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Typography } from 'antd';
import { logout$ } from 'services/authService';
import { notify } from 'util/notify';

const { Paragraph } = Typography;

export const useSetAuthUser = () => {
  const context = React.useContext(GlobalContext);
  const navigate = useNavigate();

  const { setUser } = context;

  const setAuthUser = (user) => {
    if (user) {
      const { suspended } = user;
      if (suspended) {
        setUser(null);
        logout$().subscribe(() => {
          notify.error(
            'Account is suspended',
            <>
              <Paragraph>Your account and your organization's account have been suspended. </Paragraph>
              <Paragraph>Kindly contact your organization owner, who should have received emails containing guidelines on how to settle the outstanding bill and remove the suspension.</Paragraph>
            </>,
            0
          )
        });
        return;
      }
    }
    setUser(user);
  }

  return setAuthUser;
}