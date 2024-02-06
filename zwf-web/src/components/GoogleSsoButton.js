

import React from 'react';
import { withRouter } from 'react-router-dom';
import { GlobalContext } from '../contexts/GlobalContext';
import { ssoGoogle$ } from 'services/authService';
import { countUnreadMessage$ } from 'services/messageService';
import { GoogleLogin } from 'react-google-login';
import { notify } from 'util/notify';
import { concat, zip, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

const GoogleSsoButton = props => {
  const context = React.useContext(GlobalContext);
  const { setUser, setNotifyCount } = context;
  const { render } = props;

  const handleGoogleSso = (response) => {
    console.log('Google sso', response);
    const { tokenId, error } = response;
    if (error || !tokenId) {
      return;
    }

    ssoGoogle$(tokenId)
      .pipe(
        switchMap(user => {
          return zip(of(user), user ? countUnreadMessage$() : of(0));
        })
      )
      .subscribe(
        ([user, count]) => {
          if (user) {
            setUser(user);
            setNotifyCount(count);
            props.history.push('/');
          }
        },
        err => notify.error('Failed to log in with Google')
      );
  }

  return <GoogleLogin
    clientId={process.env.REACT_APP_ZWF_GOOGLE_SSO_CLIENT_ID}
    buttonText="Log In with Google"
    // isSignedIn={true}
    render={render}
    style={{ width: '100%' }}
    icon={true}
    onSuccess={handleGoogleSso}
    onFailure={handleGoogleSso}
  // cookiePolicy={'single_host_origin'}
  />
}

export default withRouter(GoogleSsoButton);