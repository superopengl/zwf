

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from '../contexts/GlobalContext';
import { ssoGoogle$ } from 'services/authService';
import { GoogleLogin } from 'react-google-login';
import { notify } from 'util/notify';
import { concat, zip, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

const GoogleSsoButton = props => {
  const context = React.useContext(GlobalContext);
  const { setUser } = context;
  const { render } = props;
  const navigate = useNavigate();

  const handleGoogleSso = (response) => {
    console.log('Google sso', response);
    const { tokenId, error } = response;
    if (error || !tokenId) {
      return;
    }

    ssoGoogle$(tokenId)
      .subscribe(
        (user) => {
          if (user) {
            setUser(user);
            const isAdminFirstLogin = user.role === 'admin' && !user.orgId;
            navigate(isAdminFirstLogin ? '/onboard' : '/task');
          }
        },
        err => notify.error('Failed to log in with Google')
      );
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

export default GoogleSsoButton;