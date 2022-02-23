import React from 'react';
import 'antd/dist/antd.less';
import { GlobalContext } from './contexts/GlobalContext';
import { RoleRoute } from 'components/RoleRoute';
import {
  QuestionOutlined} from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import { Dropdown, Menu, Modal, Layout, Button } from 'antd';
import styled from 'styled-components';
import ProfileModal from 'pages/Profile/ProfileModal';
import ContactForm from 'components/ContactForm';
import AboutModal from 'pages/About/AboutModal';
import { Switch } from 'react-router-dom';
import loadable from '@loadable/component'
import TermAndConditionPage from 'pages/TermAndConditionPage';
import PrivacyPolicyPage from 'pages/PrivacyPolicyPage';
import { AvatarDropdownMenu } from 'components/AvatarDropdownMenu';

const ChangePasswordModal = loadable(() => import('components/ChangePasswordModal'));
const ClientTaskListPage = loadable(() => import('pages/ClientTask/ClientTaskListPage'));
const NewTaskPage = loadable(() => import('pages/MyTask/MyTaskPage'));
const ClientTaskPage = loadable(() => import('pages/MyTask/ClientTaskPage'));


const StyledLayout = styled(Layout)`
.ant-layout-footer {
  border-top: 1px solid rgba(0,0,0,0.1);
}

`;

const StyledMenu = styled(Menu)`
.ant-dropdown-menu-item {
  padding: 12px !important;
}
`;

export const AppClient = React.memo(props => {

  const context = React.useContext(GlobalContext);
  const [changePasswordVisible, setChangePasswordVisible] = React.useState(false);
  const [profileVisible, setProfileVisible] = React.useState(false);
  const [contactVisible, setContactVisible] = React.useState(false);
  const [aboutVisible, setAboutVisible] = React.useState(false);
  const [tcVisible, setTcVisible] = React.useState(false);
  const [ppVisible, setPpVisible] = React.useState(false);

  const { user, setUser } = context;
  if (!user) {
    return null;
  }

  const helpMenu = <StyledMenu>
    <Menu.Item key="contact" onClick={() => setContactVisible(true)}>
      Contact Us
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="about" onClick={() => setAboutVisible(true)}>
      About Us
    </Menu.Item>
    <Menu.Item key="tc" onClick={() => setTcVisible(true)}>
    Terms and Conditions
    </Menu.Item>
    <Menu.Item key="pp" onClick={() => setPpVisible(true)}>
    Privacy Policy
    </Menu.Item>
  </StyledMenu>


  return <StyledLayout>
    <Layout.Header style={{ position: 'fixed', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'end' }}>
      <div style={{ marginLeft: 16 }}>
        <Dropdown overlay={helpMenu} trigger={['click']}>
          <Button shape="circle" size="large" type="primary" icon={<QuestionOutlined />} ghost style={{borderWidth: 2}} />
        </Dropdown>
      </div>
      <div style={{ marginLeft: 16 }}>
        <AvatarDropdownMenu />
      </div>
    </Layout.Header>
    <Layout.Content style={{ marginTop: 64, height: '100%', padding: 30 }}>
      <Switch>
        <RoleRoute exact path="/task" component={ClientTaskListPage} />
        <RoleRoute exact path="/task/:id" component={ClientTaskPage} />
      </Switch>
    </Layout.Content>
    <ChangePasswordModal
      visible={changePasswordVisible}
      onOk={() => setChangePasswordVisible(false)}
      onCancel={() => setChangePasswordVisible(false)}
    />
    <ProfileModal
      visible={profileVisible}
      onOk={() => setProfileVisible(false)}
      onCancel={() => setProfileVisible(false)}
    />
    <Modal
      title="Contact Us"
      visible={contactVisible}
      onOk={() => setContactVisible(false)}
      onCancel={() => setContactVisible(false)}
      footer={null}
      destroyOnClose={true}
      maskClosable={false}
    >
      <ContactForm onDone={() => setContactVisible(false)}></ContactForm>
    </Modal>
    <AboutModal
      visible={aboutVisible}
      onClose={() => setAboutVisible(false)}
    />
    <Modal
      visible={tcVisible}
      onOk={() => setTcVisible(false)}
      onCancel={() => setTcVisible(false)}
      title={null}
      footer={null}
      destroyOnClose={true}
      maskClosable={false}
      width={600}
    >
      <TermAndConditionPage/>
    </Modal>
    <Modal
      visible={ppVisible}
      onOk={() => setPpVisible(false)}
      onCancel={() => setPpVisible(false)}
      title={null}
      footer={null}
      destroyOnClose={true}
      maskClosable={false}
      width={600}
    >
      <PrivacyPolicyPage />
    </Modal>
  </StyledLayout>
})

