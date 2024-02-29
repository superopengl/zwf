// import 'App.css';
import { Space, Typography, Alert } from 'antd';
import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { GlobalContext } from 'contexts/GlobalContext';

const { Link: TextLink } = Typography;

const HOME_SITE_URL = process.env.REACT_APP_ZWF_HOME_SITE_URL;
const isProd = process.env.NODE_ENV === 'production';

const HomePage = () => {
  const context = React.useContext(GlobalContext);

  const { role } = context;

  const isLoggedIn = role !== 'guest';

  if (isLoggedIn) {
    throw new Error(`This page is only for guest users`);
  }

  const homeUrl = process.env.REACT_APP_ZWF_HOME_SITE_URL;

  if (isProd) {
    window.location = homeUrl;
    return <TextLink href={homeUrl} target="_self">{homeUrl}</TextLink>;
  }

  return <>
    <Alert
      type="info"
      description={<Space style={{ width: '100%', justifyContent: 'flex-end' }} size="large">
        <Link to="/signup">Sign Up</Link>
        <Link to="/login">Login</Link>
        <Link to="/privacy_policy">Privacy Policy</Link>
        <Link to="/terms_and_conditions">Terms of services</Link>
      </Space>} banner />
    <iframe src={HOME_SITE_URL} width="100%" height="100%" style={{ border: 0 }}></iframe>
    {/* {isLoggedIn && <Affix style={{ position: 'absolute', top: 8, right: 8 }}>
      <Link to={isSystem ? '/org' : '/'}><Button type="primary">
        <FormattedMessage id="menu.dashboard" /> <RightOutlined />
      </Button></Link>
    </Affix>} */}
  </>
}

HomePage.propTypes = {};

HomePage.defaultProps = {};

export default withRouter(HomePage);
