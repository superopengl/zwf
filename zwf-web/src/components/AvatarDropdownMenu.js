import React from 'react';
import 'antd/dist/antd.less';
import { GlobalContext } from '../contexts/GlobalContext';
import { RoleRoute } from 'components/RoleRoute';
import {
  QuestionOutlined
} from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import { logout$ } from 'services/authService';
import { Dropdown, Menu, Modal, Layout, Button, Typography } from 'antd';
import styled from 'styled-components';
import ProfileModal from 'pages/Profile/ProfileModal';
import AboutModal from 'pages/About/AboutModal';
import { Switch } from 'react-router-dom';
import loadable from '@loadable/component'
import { FormattedMessage } from 'react-intl';
import { UserAvatar } from 'components/UserAvatar';
import TermAndConditionPage from 'pages/TermAndConditionPage';
import PrivacyPolicyPage from 'pages/PrivacyPolicyPage';
import ClientTaskListPage from 'pages/ClientTask/ClientTaskListPage';
import PropTypes from 'prop-types';

const ChangePasswordModal = loadable(() => import('components/ChangePasswordModal'));
const OrgOnBoardForm = loadable(() => import('pages/Org/OrgProfileForm'));

const { Link: TextLink } = Typography;

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

export const AvatarDropdownMenu = withRouter(React.memo(props => {
  const { user, role, setUser } = React.useContext(GlobalContext);

  const [changePasswordVisible, setChangePasswordVisible] = React.useState(false);
  const [profileVisible, setProfileVisible] = React.useState(false);
  const [aboutVisible, setAboutVisible] = React.useState(false);
  const [tcVisible, setTcVisible] = React.useState(false);
  const [ppVisible, setPpVisible] = React.useState(false);
  const [orgProfileVisible, setOrgProfileVisible] = React.useState(false);

  const email = user?.profile?.email;
  const avatarFileId = user?.profile?.avatarFileId;
  if (!email) {
    return null;
  }

  const goToHomePage = () => {
    window.location = process.env.REACT_APP_ZWF_HOME_SITE_URL || '/';
  }

  const handleLogout = () => {
    logout$().subscribe(() => {
      // reactLocalStorage.clear();
      setUser(null);
      goToHomePage();
    });
  };

  const isSystem = role === 'system';
  const isAdmin = role === 'admin';
  const isAgent = role === 'agent';
  const isClient = role === 'client';

  const avatarMenu = <StyledMenu>
    <Menu.Item key="email" disabled={true}>
      <pre style={{ fontSize: 14, margin: 0 }}>{email}</pre>
    </Menu.Item>
    <Menu.Divider />
    <TextLink href={process.env.REACT_APP_ZWF_HOME_SITE_URL} target="_blank">
      <Menu.Item key="home">
        <FormattedMessage id="menu.home" />
      </Menu.Item>
    </TextLink>
    <Menu.Item key="profile" onClick={() => setProfileVisible(true)}>
      <FormattedMessage id="menu.profile" />
    </Menu.Item>
    <Menu.Item key="change_password" onClick={() => setChangePasswordVisible(true)}>
      <FormattedMessage id="menu.changePassword" />
    </Menu.Item>
    {isAdmin && <Menu.Divider />}
    {isAdmin && <Menu.Item key="org_profile" onClick={() => setOrgProfileVisible(true)}>
      Organization Profile
    </Menu.Item>}
    {isAdmin && <Menu.Item key="subscription_billing" onClick={() => props.history.push('/account')}>
      Subscription & Billings
    </Menu.Item>}
    <Menu.Divider />
    <Menu.Item key="logout" danger onClick={handleLogout}>
      <FormattedMessage id="menu.logout" />
    </Menu.Item>
  </StyledMenu>

  return <>
    <Dropdown overlay={avatarMenu} trigger={['click']}>
      <a onClick={e => e.preventDefault()}>
        {/* <Avatar size={40}
      icon={<UserOutlined style={{ fontSize: 20 }} />}
      style={{ backgroundColor: isSystem ? '#cf222e' : isAdmin ? '#062638' : isAgent ? '#4c1bb3' : isClient ? '#18b0d7' : '#333333' }}
    /> */}
        <UserAvatar
          size={40}
          value={avatarFileId}
          style={{ backgroundColor: isSystem ? '#cf222e' : isAdmin ? '#062638' : isAgent ? '#4c1bb3' : isClient ? '#18b0d7' : '#333333' }}
        />
      </a>
    </Dropdown>
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
      <TermAndConditionPage />
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
    <Modal
      title="Organization Profile"
      visible={orgProfileVisible}
      onOk={() => setOrgProfileVisible(false)}
      onCancel={() => setOrgProfileVisible(false)}
      footer={null}
      destroyOnClose={true}
      maskClosable={false}
    >
      <OrgOnBoardForm onOk={() => setOrgProfileVisible(false)} />
    </Modal>
  </>
}));
