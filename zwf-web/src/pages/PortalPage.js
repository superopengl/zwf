// import 'App.css';
import { Button, Row, Col, Image, Layout, Space, Typography, Grid } from 'antd';
import HomeFooter from 'components/HomeFooter';
import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import smoothscroll from 'smoothscroll-polyfill';
import { Outlet } from 'react-router-dom';
import { Tabs } from 'antd';
import { useOrgRegisterModal } from 'hooks/useOrgRegisterModal';
import { CloseOutlined, MenuOutlined, RightOutlined } from '@ant-design/icons';
import { Drawer } from 'antd';
import { useAuthUser } from 'hooks/useAuthUser';
import { useRole } from 'hooks/useRole';

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

const StyledLogoImage = styled(Image)`
&, & > .ant-image-img {
  width: auto !important;
  height: 40px;
}
`;



export const PortalPage = () => {

  const navigate = useNavigate();
  const [modalMenuVisible, setModalMenuVisible] = React.useState(false);
  // const position = useWindowScrollPosition(); 
  const [user] = useAuthUser();
  const role = useRole();
  const screens = Grid.useBreakpoint();
  const [openModal, contextHolder] = useOrgRegisterModal();

  const isGuest = role === 'guest';
  const beingSuspended = user?.suspended;

  const handleMenuChange = (path) => {
    navigate(path);
    setModalMenuVisible(false);
  }

  const handleShowRegisterModal = () => {
    openModal();
    setModalMenuVisible(false);
  }

  const narrowScreen = (screens.xs || screens.sm ) && !screens.md;


  return <StyledLayoutPage>
    <Layout.Header>
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <Link onClick={() => setModalMenuVisible(x => !x)}>
          <StyledLogoImage src="/images/logo-full-primary.svg" height={narrowScreen? 30 : 40} preview={false} />
        </Link>

        <Row gutter={narrowScreen ? 8 : 30} wrap={false} style={{alignItems: 'center'}}>
          {(screens.xxl || screens.xl || screens.lg) && <Col>
            <Tabs
              defaultActiveKey="/"
              onChange={handleMenuChange}
              items={[
                {
                  key: '/',
                  label: 'Home'
                },
                {
                  key: '/resource',
                  label: 'Resources'
                },
                {
                  key: '/#pricing',
                  label: 'Pricing'
                },
                {
                  key: '/#contactus',
                  label: 'Contact Us'
                },
              ]}
            />
          </Col>}
          {(screens.xxl || screens.xl || screens.lg || screens.md || screens.sm) && isGuest && <Col>
            <Link to="/login">
              <Button type="primary" ghost>Log in</Button>
            </Link>
          </Col>}
          {isGuest && ((screens.xxl || screens.xl || screens.lg || screens.md || screens.sm)) && <Col>
            <Button type="primary" onClick={handleShowRegisterModal}>Try it Now</Button>
          </Col>}
          {!isGuest && !beingSuspended && <Col>
            <Link to="/landing">
              <Button type="primary">Go to App <RightOutlined/></Button>
            </Link>
          </Col>}
          {!(screens.xxl || screens.xl || screens.lg) && <Col>
            <Button icon={<MenuOutlined />} onClick={() => setModalMenuVisible(x => !x)} />
          </Col>}
        </Row>
      </Space>
    </Layout.Header>
    <Layout.Content style={{overflowX:'hidden'}}>
      <Outlet />
    </Layout.Content>
    <HomeFooter />
    {contextHolder}
    <Drawer
      title={<Image src="/images/logo-full-primary.svg" preview={false} height={24} />}
      extra={<Button type="text" size="large" icon={<CloseOutlined />} onClick={() => setModalMenuVisible(false)} />}
      open={modalMenuVisible}
      onClose={() => setModalMenuVisible(false)}
      closable={false}
      destroyOnClose={true}
      width={280}
      maskClosable={true}
      headerStyle={{ padding: 16, paddingRight: 4 }}
      footerStyle={{ border: 'none', marginBottom: '4rem' }}
      footer={
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {isGuest && <Button type="primary" block size="large" onClick={handleShowRegisterModal}>Try it Now</Button>}
          {isGuest && <Button type="link" block size="large" onClick={() => handleMenuChange('/login')}>Login</Button>}
          {!isGuest && !beingSuspended && <Button type="primary" block size="large" onClick={() => handleMenuChange('/landing')}>Go to App <RightOutlined/></Button>}
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

