

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ssoGoogleRegisterOrg$, ssoGoogleLogin$ } from 'services/authService';
import { GoogleLogin } from 'react-google-login';
import { notify } from 'util/notify';
import PropTypes from 'prop-types';
import { catchError, filter, finalize } from 'rxjs/operators';
import { useAuthUser } from 'hooks/useAuthUser';

export const GoogleSsoButton = props => {
  const { render, type, onStart, onEnd } = props;
  const navigate = useNavigate();
  const [user, setAuthUser] = useAuthUser();

  const handleGoogleSso = (response) => {
    // console.log('Google SSO', response);
    const { tokenId, error } = response;
    if (error || !tokenId) {
      return;
    }

    onStart();

    let source$;

    if (type === 'register') {
      source$ = ssoGoogleRegisterOrg$(tokenId)
    } else if (type === 'login') {
      source$ = ssoGoogleLogin$(tokenId);
    } else {
      throw new Error(`Unsupported type ${type}`);
    }

    source$
      .pipe(
        catchError(err => notify.error('Cannot log in with Google. You might require an invitation from an organization.')),
        finalize(() => onEnd())
      ).subscribe(user => {
        if (!user) {
          throw new Error('User is null');
        }
        debugger;
        setAuthUser(user, '/landing');
      });

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