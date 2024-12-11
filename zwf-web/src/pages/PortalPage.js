// import 'App.css';
import { Button, Row, Col, Image, Layout, Space, Typography, Grid, Divider } from 'antd';
import HomeFooter from 'components/HomeFooter';
import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { GlobalContext } from 'contexts/GlobalContext';
import smoothscroll from 'smoothscroll-polyfill';
import { Outlet } from 'react-router-dom';
import { Tabs } from 'antd';
import { OrgRegisterModal } from 'components/OrgRegisterModal';
import { useWindowScrollPosition } from "rooks";
import { CloseOutlined, MenuOutlined } from '@ant-design/icons';
import { Drawer } from 'antd';

const { Text } = Typography;

smoothscroll.polyfill();

const StyledLayoutPage = styled(Layout)`
position: relative;
min-height: 100%;
background: #ffffff;

.ant-layout-header {
  background: #ffffff;
  box-shadow: 0px 5.99376px 23.975px rgba(0, 18, 77, 0.1);
  position: sticky !important;
  top: 0;
  z-index: 100;
  padding: 0 1rem;
  min-height: 64px;
  height: auto;
}

.ant-tabs-nav {
  margin: 0;
}

.ant-tabs-nav::before {
  border: none;
}

.ant-tabs-ink-bar {
  height: 3px !important;
}

`;



export const PortalPage = () => {

  const navigate = useNavigate();
  const [orgRegisterVisible, setOrgRegisterVisible] = React.useState(false);
  const [modalMenuVisible, setModalMenuVisible] = React.useState(false);
  // const position = useWindowScrollPosition(); 
  const context = React.useContext(GlobalContext);
  const screens = Grid.useBreakpoint();


  const { role } = context;
  const isGuest = role === 'guest';
  const isWideScreen = screens.xxl || screens.xl || screens.lg;

  const handleMenuChange = (path) => {
    navigate(path);
    setModalMenuVisible(false);
  }

  const handleShowRegisterModal = () => {
    setOrgRegisterVisible(true);
    setModalMenuVisible(false);
  }

  const handleHideRegisterModal = () => {
    setOrgRegisterVisible(false);
    setModalMenuVisible(false);
  }

  return <StyledLayoutPage>
    <Layout.Header >
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <Link to="/">
          <Image src="/images/logo-full-primary.svg" preview={false} height={40} />
        </Link>

        <Row gutter={(screens.xxl || screens.xl || screens.lg || screens.md) ? 30 : 16} align="middle">
          {(screens.xxl || screens.xl || screens.lg) && <Col>
            <Tabs defaultActiveKey="/" onChange={handleMenuChange}>
              <Tabs.TabPane tab="Home" key="/"></Tabs.TabPane>
              <Tabs.TabPane tab="Resources" key="/resource"></Tabs.TabPane>
              <Tabs.TabPane tab="Pricing" key="/#pricing"></Tabs.TabPane>
              <Tabs.TabPane tab="Contact Us" key="/#contactus"></Tabs.TabPane>
            </Tabs>
          </Col>}
          {(screens.xxl || screens.xl || screens.lg || screens.md || screens.sm) && isGuest && <Col>
            <Link to="/login">
              <Button type="primary" ghost>Log in</Button>
            </Link>
          </Col>}
          {isGuest && ((screens.xxl || screens.xl || screens.lg || screens.md || screens.sm)) && <Col>
            <Button type="primary" onClick={handleShowRegisterModal}>Try it Now</Button>
          </Col>}
          {!isGuest && <Col>
            <Link to="/task">
              <Button type="primary">Go to App</Button>
            </Link>
          </Col>}
          {!(screens.xxl || screens.xl || screens.lg) && <Col>
            <Button size="large" icon={<MenuOutlined />} onClick={() => setModalMenuVisible(x => !x)} />
          </Col>}
        </Row>
      </Space>
    </Layout.Header>
    <Layout.Content>
      <Outlet />
    </Layout.Content>
    <HomeFooter />
    <OrgRegisterModal
      visible={orgRegisterVisible}
      onOk={handleHideRegisterModal}
      onCancel={handleHideRegisterModal}
    />
    <Drawer
      title={<Image src="/images/logo-full-primary.svg" preview={false} height={24} />}
      extra={<Button type="text" size="large" icon={<CloseOutlined />} onClick={() => setModalMenuVisible(false)}/>}
      open={modalMenuVisible}
      onClose={() => setModalMenuVisible(false)}
      closable={false}
      destroyOnClose={true}
      width={280}
      maskClosable={true}
      headerStyle={{padding: 16, paddingRight: 4}}
      footerStyle={{border: 'none', marginBottom: '4rem'}}
      footer={
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {isGuest && <Button type="primary" block size="large" onClick={handleShowRegisterModal}>Try it Now</Button>}
          {isGuest && <Button type="link" block size="large" onClick={() => handleMenuChange('/login')}>Login</Button>}
          {!isGuest && <Button type="primary" block size="large" onClick={() => handleMenuChange('/task')}>Go to App</Button>}
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Button type="text" block size="large" onClick={() => handleMenuChange('/')}>Home</Button>
        <Button type="text" block size="large" onClick={() => handleMenuChange('/resource')}>Resources</Button>
        <Button type="text" block size="large" onClick={() => handleMenuChange('/#pricing')}>Pricing</Button>
        <Button type="text" block size="large" onClick={() => handleMenuChange('/#contactus')}>Contact Us</Button>
      </Space>
    </Drawer>

  </StyledLayoutPage>
}

PortalPage.propTypes = {};

PortalPage.defaultProps = {};

