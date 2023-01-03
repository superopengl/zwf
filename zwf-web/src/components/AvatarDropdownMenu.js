import React from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate } from 'react-router-dom';
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
import { Link } from 'react-router-dom';
import { QuestionCircleFilled } from '@ant-design/icons';

const ChangePasswordModal = loadable(() => import('components/ChangePasswordModal'));
const OrgProfileForm = loadable(() => import('pages/Org/OrgProfileForm'));

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

export const AvatarDropdownMenu = React.memo(props => {
  const { user, role, setUser } = React.useContext(GlobalContext);

  const [changePasswordVisible, setChangePasswordVisible] = React.useState(false);
  const [profileVisible, setProfileVisible] = React.useState(false);
  const [aboutVisible, setAboutVisible] = React.useState(false);
  const [tcVisible, setTcVisible] = React.useState(false);
  const [ppVisible, setPpVisible] = React.useState(false);
  const [orgProfileVisible, setOrgProfileVisible] = React.useState(false);
  const navigate = useNavigate();

  const { email, avatarFileId, loginType } = user ?? {};

  if (!email) {
    return null;
  }

  const goToHomePage = () => {
    navigate('/')
  }

  const handleLogout = () => {
    Modal.confirm({
      icon: <QuestionCircleFilled/>,
      title: 'Are you sure you want to log out?',
      okText: 'Logout',
      okButtonProps: {
        danger: true,
        type: 'primary',
      },
      autoFocusButton: 'cancel',
      onOk: () => {
        logout$().subscribe(() => {
          // reactLocalStorage.clear();
          setUser(null);
          goToHomePage();
        });
      }
    });
  };

  const isSystem = role === 'system';
  const isAdmin = role === 'admin';
  const isAgent = role === 'agent';
  const isClient = role === 'client';

  const handleMenuItemClick = e => {
    const { key } = e;
    switch (key) {
      case 'home':
        goToHomePage();
        break;
      case 'profile':
        setProfileVisible(true);
        break;
      case 'change_password':
        setChangePasswordVisible(true);
        break;
      case 'org_profile':
        setOrgProfileVisible(true);
        break;
      case 'invoices':
        navigate('/invoices');
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        throw new Error(`Unsupported key ${key}`);
    }
  };

  const menu = {
    items: [
      {
        key: 'email',
        disabled: true,
        label: <pre style={{ fontSize: 14, margin: 0 }}>{email}</pre>
      },
      {
        key: 'divider',
        type: 'divider',
      },
      {
        key: 'home',
        label: <FormattedMessage id="menu.home" />,
      },
      {
        key: 'profile',
        label: <FormattedMessage id="menu.profile" />
      },
      loginType === 'local' ? {
        key: 'change_password',
        label: <FormattedMessage id="menu.changePassword" />
      } : null,
      isAdmin ? {
        key: 'divider2',
        type: 'divider'
      } : null,
      isAdmin ? {
        key: 'org_profile',
        label: 'Org Profile'
      } : null,
      isAdmin ? {
        key: 'invoices',
        label: 'Invoices'
      } : null,
      {
        key: 'divider',
        type: 'divider',
      },
      {
        key: 'logout',
        danger: true,
        label: <FormattedMessage id="menu.logout" />
      }
    ].filter(x => !!x),
    onClick: handleMenuItemClick,
  }

  return <div style={props.style}>
    <Dropdown menu={menu} trigger={['click']}>
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
      open={changePasswordVisible}
      onOk={() => setChangePasswordVisible(false)}
      onCancel={() => setChangePasswordVisible(false)}
    />
    <ProfileModal
      open={profileVisible}
      onOk={() => setProfileVisible(false)}
      onCancel={() => setProfileVisible(false)}
    />
    <AboutModal
      open={aboutVisible}
      onClose={() => setAboutVisible(false)}
    />
    <Modal
      open={tcVisible}
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
      open={ppVisible}
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
      open={orgProfileVisible}
      onOk={() => setOrgProfileVisible(false)}
      onCancel={() => setOrgProfileVisible(false)}
      footer={null}
      destroyOnClose={true}
      maskClosable={false}
    >
      <OrgProfileForm onOk={() => setOrgProfileVisible(false)} />
    </Modal>
  </div>
});
