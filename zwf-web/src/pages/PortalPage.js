// import 'App.css';
import { Button, Row, Col, Image, Layout, Space, Typography } from 'antd';
import HomeFooter from 'components/HomeFooter';
import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { GlobalContext } from 'contexts/GlobalContext';
import smoothscroll from 'smoothscroll-polyfill';
import { Outlet } from 'react-router-dom';
import { Tabs } from 'antd';
import { OrgRegisterModal } from 'components/OrgRegisterModal';

const { Text } = Typography;

smoothscroll.polyfill();

const StyledLayoutPage = styled(Layout)`
position: relative;

.ant-layout-header {
  background-color: white;
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

.light2 {
  position: absolute;
  width: 532.39px;
  height: 232.9px;
  right: 200px;
  top: 168.86px;

  background: linear-gradient(268.24deg, rgba(0, 61, 182, 0.4) 12.79%, rgba(55, 212, 207, 0.4) 56.4%);
  filter: blur(147px);
  transform: rotate(-31.89deg);
}

.light1 {
  position: absolute;
  width: 284.65px;
  height: 159.8px;
  right: 0px;
  top: 161.4px;

  background: rgba(0, 61, 182, 0.8);
  filter: blur(300px);
  transform: rotate(-135deg);
}
`;


const scrollToElement = (selector) => {
  document.querySelector(selector)?.scrollIntoView({
    behavior: 'smooth',
    block: "start",
    inline: "nearest"
  });
}


export const PortalPage = () => {

  const navigate = useNavigate();
  const [visible, setVisible] = React.useState(false);
  const context = React.useContext(GlobalContext);

  const { role } = context;
  const isGuest = role === 'guest';

  const handleMenuChange = (path) => {
    if (path.charAt(0) === '#') {
      scrollToElement(path)
    } else {
      navigate(path);
    }
  }

  const handleShowModal = () => {
    setVisible(true);
  }

  const handleHideModal = () => {
    setVisible(false);
  }

  return <StyledLayoutPage>
    <div className="light1"></div>
    <div className="light2"></div>
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
              <Tabs.TabPane tab="Pricing" key="#pricing"></Tabs.TabPane>
              <Tabs.TabPane tab="Contact Us" key="#contactus"></Tabs.TabPane>
            </Tabs>
          </Col>
          {isGuest && <Col>
            <Link to="/login">
              <Button type="primary" ghost>Log in</Button>
            </Link>
          </Col>}
          {isGuest && <Col>
            <Button type="primary" onClick={handleShowModal}>Try it Now</Button>
          </Col>}
          {!isGuest && <Col>
            <Link to="/task">
              <Button type="primary">Go to App</Button>
            </Link>
          </Col>}
        </Row>
      </Space>
    </Layout.Header>
    <Layout.Content>
      <Outlet />
    </Layout.Content>
    <HomeFooter />
    <OrgRegisterModal
      visible={visible}
      onOk={handleHideModal}
      onCancel={handleHideModal}
    />
  </StyledLayoutPage>
}

PortalPage.propTypes = {};

PortalPage.defaultProps = {};

