// import 'App.css';
import { Menu, Dropdown, Button, Row, Col, Image, Layout, Space, Typography } from 'antd';
import HomeCarouselArea from 'components/homeAreas/HomeCarouselArea';
import HomeServiceArea from 'components/homeAreas/HomeServiceArea';
import HomeFooter from 'components/HomeFooter';
import React from 'react';
import styled from 'styled-components';
import { HomePricingArea } from 'components/homeAreas/HomePricingArea';
import { Link, useNavigate } from 'react-router-dom';
import loadable from '@loadable/component'
import { GlobalContext } from 'contexts/GlobalContext';
import ProLayout, { DefaultFooter, PageContainer } from '@ant-design/pro-layout';
import Icon, { ArrowRightOutlined, RightOutlined } from '@ant-design/icons';
import { IoLanguage, IoTrashBinSharp } from 'react-icons/io5';
import { useIntl } from 'react-intl';
import { FormattedMessage } from 'react-intl';
import HomeContactArea from 'components/homeAreas/HomeContactArea.js';
import smoothscroll from 'smoothscroll-polyfill';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Error404 from './Error404';
import { Outlet } from 'react-router-dom';
import { Logo } from 'components/Logo';
import { Tabs } from 'antd';

const { Text } = Typography;

smoothscroll.polyfill();

const ResourceListPage = loadable(() => import('pages/ResourcePage/ResourceListPage'))
const ResourcePage = loadable(() => import('pages/ResourcePage/ResourcePage'))

const StyledLayout = styled(ProLayout)`
.ant-layout-header {
  background-color: white;
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
  // background-color: #0a425eaa;
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

const StyledLayoutPage = styled(Layout)`
.ant-layout-header {
  background-color: white;
}

.ant-tabs-nav {
  margin: 0;
}

.ant-tabs-nav::before {
  border: none;
}


`;


const scrollToElement = (selector) => {
  document.querySelector(selector)?.scrollIntoView({
    behavior: 'smooth',
    block: "start",
    inline: "nearest"
  });
}

const RawMenuButton = (props) => {
  const { to, children } = props;
  const navigate = useNavigate();

  return <Text onClick={() => navigate(to)}>
    {children}
  </Text>
};

const MenuButton = styled(RawMenuButton)`
&:hover {
  cursor: pointer;
}
`;


const PortalPage = (props) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const context = React.useContext(GlobalContext);
  const navigate = useNavigate();


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
      path: '/resource',
      name: <FormattedMessage id="menu.resources" />,
      visible: true,
    },
  ];

  const handleMenuClick = (path) => {
    const isAnchor = path.includes('#');
    if (isAnchor) {
      scrollToElement(path.replace(/\//, ''))
      setCollapsed(true);
    } else {
      navigate(path);
    }
  }

  const handleMenuChange = (path) => {
    navigate(path);
  }

  return <StyledLayoutPage>
    <Layout.Header>
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <Link to="/">
          <Image src="/images/logo-horizontal-blue.png" preview={false} height={32} />
        </Link>
        <Row gutter={30} align="middle">
          <Col>
            <Tabs defaultActiveKey="/" onChange={handleMenuChange}>
              <Tabs.TabPane tab="Home" key="/"></Tabs.TabPane>
              <Tabs.TabPane tab="Resources" key="/resource"></Tabs.TabPane>
              <Tabs.TabPane tab="Pricing" key="/#pricing"></Tabs.TabPane>
              <Tabs.TabPane tab="Contact Us" key="/#contactus"></Tabs.TabPane>
            </Tabs>
          </Col>
          <Col>
            <Link to="/login">
              <Button type="primary" ghost>Log in</Button>
            </Link>
          </Col>
          <Col>
            <Link to="/signup/org">
              <Button type="primary">Try it Now</Button>
            </Link>
          </Col>
        </Row>
      </Space>
    </Layout.Header>
    <Layout.Content>
      <Outlet />
    </Layout.Content>
    <HomeFooter />
  </StyledLayoutPage>

  return <StyledLayout
    title={'ZeeWorkflow'}
    logo="/images/logo-horizontal-blue.png"
    // logo="/images/logo-transparent.png"
    collapsed={collapsed}
    onCollapse={setCollapsed}
    // siderWidth={270}
    layout="top"
    navTheme="dark"
    route={{ routes: ROUTES }}
    location={{ pathname: '/resource' }}
    style={{
      height: '100vh',
    }}
    fixedHeader={true}
    menuItemRender={(item, dom) => item.visible ? <div onClick={() => handleMenuClick(item.path)}>{dom}</div> : null}
    rightContentRender={() => {
      return isLoggedIn ? <Link to={isSystem ? '/support' : '/task'}><Button type="primary">
        <FormattedMessage id="menu.dashboard" /> <RightOutlined />
      </Button>
      </Link>
        : <Space size="large">
          <Link to="/login">
            <Button ghost>Log in</Button>
          </Link>
          <Link to="/signup/org">
            <Button type="primary">Try it Now</Button>
          </Link>
        </Space>

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
    <Outlet />
  </StyledLayout>
}

PortalPage.propTypes = {};

PortalPage.defaultProps = {};

export default PortalPage;
