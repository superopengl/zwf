// import 'App.css';
import { Menu, Dropdown, Button, Modal, Alert, Typography } from 'antd';
import HomeCarouselArea from 'components/homeAreas/HomeCarouselArea';
import HomeServiceArea from 'components/homeAreas/HomeServiceArea';
import HomeFooter from 'components/HomeFooter';
import React from 'react';
import styled from 'styled-components';
import { HomePricingArea } from 'components/homeAreas/HomePricingArea';
import CookieConsent from "react-cookie-consent";
import { Link, withRouter } from 'react-router-dom';
import loadable from '@loadable/component'
import { GlobalContext } from 'contexts/GlobalContext';
import ProLayout, { DefaultFooter, PageContainer } from '@ant-design/pro-layout';
import Icon, { ArrowRightOutlined, RightOutlined } from '@ant-design/icons';
import { IoLanguage } from 'react-icons/io5';
import { useIntl } from 'react-intl';
import { FormattedMessage } from 'react-intl';
import HomeContactArea from 'components/homeAreas/HomeContactArea.js';
import smoothscroll from 'smoothscroll-polyfill';
import logoSvg from '../logo.svg';
import * as queryString from 'query-string';
import { BrowserRouter, Switch, Redirect } from 'react-router-dom';
import { RoleRoute } from 'components/RoleRoute';
import HomePage from './HomePage';
import Error404 from './Error404';

smoothscroll.polyfill();

const ResourceListPage = loadable(() => import('pages/ResourcePage/ResourceListPage'))
const ResourcePage = loadable(() => import('pages/ResourcePage/ResourcePage'))

const StyledLayout = styled(ProLayout)`
.ant-layout {
  // background-color: white;
}

.ant-menu-item:hover {
  .ant-pro-menu-item-title {
    color: rgba(255,255,255, 0.7);
    // font-weight: 500;
  }
  background-color: transparent !important;
}

.ant-layout-content {
  margin: 0;
  position: absolute;
  top: 0;
  width: 100%;
}

.ant-pro-top-menu {
  background: transparent !important;
}

.ant-pro-top-nav-header {
  // box-shadow: none;
}

.ant-pro-top-nav-header-logo, .ant-pro-top-nav-header-main-left {
  min-width: 0;
}

.ant-pro-top-nav-header-logo {
  h1 {
    display: none;
  }
}

.ant-pro-top-nav-header-main {
  margin: auto;
  // max-width: 1200px;
}

.ant-pro-global-header-layout-top, .ant-pro-top-nav-header {
  // background-color: rgba(19,194,194,0.7);
  background-color: #0a425eaa;
  // background-color: rgba(0, 41, 61, 0.7); 
// background-image: linear-gradient(135deg, #00474f, #00474f 400px, rgba(255,255,255,0.0) 400px, rgba(255,255,255,0.0) 100%);
}

.ant-pro-global-header-collapsed-button {
  // color: rgba(255,255,255,0.75);
  color: rgba(0,0,0,0.75);
}

.ant-pro-menu-item-title {
  color: rgba(255,255,255,0.95);
  // color: rgba(0,0,0,0.75);
  font-weight: 400;
}
`;


const scrollToElement = (selector) => {
  document.querySelector(selector)?.scrollIntoView({
    behavior: 'smooth',
    block: "start",
    inline: "nearest"
  });
}


const PortalPage = (props) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const context = React.useContext(GlobalContext);


  const { role } = context;

  const isLoggedIn = role !== 'guest';
  const isSystem = role === 'system';

  const ROUTES = [
    {
      key: '0',
      path: '/#features',
      name: <FormattedMessage id="menu.features" />,
      visible: true,
    },
    {
      key: '3',
      path: '/#pricing',
      name: <FormattedMessage id="menu.pricing" />,
      visible: true,
    },
    {
      key: '2',
      path: '/resources',
      name: <FormattedMessage id="menu.resources" />,
      visible: true,
    },
    {
      path: '/signup/org',
      name: <FormattedMessage id="menu.join" />,
      visible: !isLoggedIn,
    },
    {
      path: '/login',
      name: <FormattedMessage id="menu.login" />,
      visible: !isLoggedIn,
    }
  ];

  const handleMenuClick = (path) => {
    const isAnchor = path.includes('#');
    if (isAnchor) {
      scrollToElement(path.replace(/\//, ''))
      setCollapsed(true);
    } else {
      props.history.push(path);
    }
  }

  return <StyledLayout
    title={'ZeeWorkflow'}
    logo="/images/logo.svg"
    // logo="/images/logo-transparent.png"
    collapsed={collapsed}
    onCollapse={setCollapsed}
    // siderWidth={270}
    layout="top"
    navTheme="dark"
    route={{ routes: ROUTES }}
    location={{ pathname: '/resources' }}
    style={{
      height: '100vh',
    }}
    fixedHeader={true}
    menuItemRender={(item, dom) => item.visible ? <div onClick={() => handleMenuClick(item.path)}>{dom}</div> : null}
    rightContentRender={() => {

      if (isLoggedIn) {
        return <Link to={isSystem ? '/support' : '/task'}><Button type="primary">
          <FormattedMessage id="menu.dashboard" /> <RightOutlined />
        </Button></Link>
      }

      // const menu = <Menu mode="horizontal" onClick={e => handleLocaleChange(e.key)}>
      //   <Menu.Item key="en-US">English</Menu.Item>
      //   <Menu.Item key="zh-CN">中 文</Menu.Item>
      // </Menu>

      // const dropdown = <Dropdown overlay={menu} trigger={['click']}>
      //   {/* <GlobalOutlined /> */}
      //   <Icon style={{ fontSize: 20, color: 'rgba(0,0,0,0.75)' }} component={() => <IoLanguage />} />
      // </Dropdown>
      // return props.collapsed ? <div style={{ display: 'flex', alignItems: 'center', }}>
      //   {dropdown}
      // </div> : dropdown
    }}
    footerRender={() => <HomeFooter />}
  >
    <PageContainer>
      <Switch>
        <RoleRoute path="/" exact component={HomePage} />
        <RoleRoute exact path="/resources" component={ResourceListPage} />
        <RoleRoute exact path="/resources/:id" component={ResourcePage} />
        {/* <RoleRoute component={Error404} /> */}
      </Switch>
    </PageContainer>

    <CookieConsent location="bottom" overlay={false} expires={365} buttonStyle={{ borderRadius: 4 }} buttonText="Accept">
      We use cookies to improve your experiences on our website.
    </CookieConsent>
  </StyledLayout>
}

PortalPage.propTypes = {};

PortalPage.defaultProps = {};

export default withRouter(PortalPage);
