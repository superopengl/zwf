

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from '../contexts/GlobalContext';
import { ssoGoogleRegisterOrg$, ssoGoogleLogin$ } from 'services/authService';
import { GoogleLogin } from 'react-google-login';
import { notify } from 'util/notify';
import PropTypes from 'prop-types';

export const GoogleSsoButton = props => {
  const context = React.useContext(GlobalContext);
  const { setUser } = context;
  const { render, type } = props;
  const navigate = useNavigate();

  const loginWithUser = (user) => {
    if (!user) {
      throw new Error('User is null');
    }
    setUser(user);
    const isAdminFirstLogin = user.role === 'admin' && !user.orgId;
    navigate(isAdminFirstLogin ? '/onboard' : '/task');
  }

  const handleGoogleSso = (response) => {
    console.log('Google sso', response);
    const { tokenId, error } = response;
    if (error || !tokenId) {
      return;
    }

    if (type === 'register') {
      ssoGoogleRegisterOrg$(tokenId)
        .subscribe((user) => loginWithUser(user),
          err => notify.error('Failed to register with Google')
        );
    } else if (type === 'login') {
      ssoGoogleLogin$(tokenId)
        .subscribe(user => loginWithUser(user),
          err => notify.error('Failed to log in with Google')
        );
    } else {
      throw new Error(`Unsupported type ${type}`);
    }

  }

  return <GoogleLogin
    clientId={process.env.REACT_APP_ZWF_GOOGLE_SSO_CLIENT_ID}
    buttonText="Login with Google"
    // isSignedIn={true}
    render={render}
    style={{ width: '100%' }}
    icon={true}
    onSuccess={handleGoogleSso}
    onFailure={handleGoogleSso}
  // cookiePolicy={'single_host_origin'}
  />
}

GoogleSsoButton.propTypes = {
  type: PropTypes.oneOf(['register', 'login'])
};

GoogleSsoButton.defaultProps = {
};