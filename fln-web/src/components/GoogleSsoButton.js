

import React from 'react';
import { withRouter } from 'react-router-dom';
import { GlobalContext } from '../contexts/GlobalContext';
import { ssoGoogle } from 'services/authService';
import { countUnreadMessage } from 'services/messageService';
import { GoogleLogin } from 'react-google-login';
import { notify } from 'util/notify';

const GoogleSsoButton = props => {
  const context = React.useContext(GlobalContext);
  const { setUser, setNotifyCount } = context;
  const {render} = props;

  const handleGoogleSso = async (response) => {
    console.log('Google sso', response);
    const { tokenId, error } = response;
    if(error || !tokenId) {
      return;
    }
    const user = await ssoGoogle(tokenId);
    if (user) {
      setUser(user);

      const count = await countUnreadMessage();
      setNotifyCount(count);
      
      props.history.push('/dashboard');
    } else {
      notify.error('Failed to log in with Google');
    }
  }

  return <GoogleLogin
    clientId={process.env.REACT_APP_FLN_GOOGLE_SSO_CLIENT_ID}
    buttonText="Log In with Google"
    // isSignedIn={true}
    render={render}
    style={{width: '100%'}}
    icon={true}
    onSuccess={handleGoogleSso}
    onFailure={handleGoogleSso}
  // cookiePolicy={'single_host_origin'}
  />
}

export default withRouter(GoogleSsoButton);