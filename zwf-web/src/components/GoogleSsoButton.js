

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ssoGoogleRegisterOrg$, ssoGoogleLogin$ } from 'services/authService';
import { GoogleLogin } from 'react-google-login';
import { notify } from 'util/notify';
import PropTypes from 'prop-types';
import { catchError, finalize } from 'rxjs/operators';
import { useSetAuthUser } from 'hooks/useSetAuthUser';

export const GoogleSsoButton = props => {
  const { render, type, onStart, onEnd } = props;
  const navigate = useNavigate();
  const setAuthUser = useSetAuthUser();

  const loginWithUser = (user) => {
    if (!user) {
      throw new Error('User is null');
    }
    setAuthUser(user);
    if (user.role === 'admin' && !user.orgId) {
      // When org isn't initialized.
      navigate('/onboard')
    } else {
      navigate('/task');
    }
  }

  const handleGoogleSso = (response) => {
    console.log('Google sso', response);
    const { tokenId, error } = response;
    if (error || !tokenId) {
      return;
    }

    onStart();

    if (type === 'register') {
      ssoGoogleRegisterOrg$(tokenId)
        .pipe(
          catchError(err => notify.error('Failed to register with Google')),
          finalize(() => onEnd())
        ).subscribe((user) => loginWithUser(user));
    } else if (type === 'login') {
      ssoGoogleLogin$(tokenId)
        .pipe(
          catchError(err => notify.error('Failed to log in with Google. You may need to be invited by an agent.')),
          finalize(() => onEnd())
        ).subscribe(user => loginWithUser(user));
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
  type: PropTypes.oneOf(['register', 'login']),
  onStart: PropTypes.func,
  onEnd: PropTypes.func,
};

GoogleSsoButton.defaultProps = {
  onStart: () => { },
  onEnd: () => { },
};