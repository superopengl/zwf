import React from 'react';
import 'antd/dist/antd.less';
import { GlobalContext } from './contexts/GlobalContext';
import { RoleRoute } from 'components/RoleRoute';
import ProLayout from '@ant-design/pro-layout';
import Icon, {
  ClockCircleOutlined, StarOutlined, SettingOutlined, TeamOutlined,
  BankOutlined, QuestionOutlined, FileOutlined
} from '@ant-design/icons';
import { Link, withRouter, Redirect } from 'react-router-dom';
import { logout$ } from 'services/authService';
import { Space, Dropdown, Menu, Typography, Modal, Image, Layout, Button } from 'antd';
import styled from 'styled-components';
import ProfileModal from 'pages/Profile/ProfileModal';
import ContactForm from 'components/ContactForm';
import AboutModal from 'pages/About/AboutModal';
import { Switch } from 'react-router-dom';
import { BiDollar } from 'react-icons/bi';
import loadable from '@loadable/component'
import { FormattedMessage } from 'react-intl';
import { GoTools } from 'react-icons/go';
import { FaTasks } from 'react-icons/fa';
import { RiCoinsLine, RiBarChartFill } from 'react-icons/ri';
import { HiOutlineViewBoards } from 'react-icons/hi';
import OrgOnBoardForm from 'pages/Org/OrgProfileForm';
import OrgListPage from 'pages/Org/OrgListPage';
import { UserAvatar } from 'components/UserAvatar';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { ImInsertTemplate } from 'react-icons/im';
import TermAndConditionPage from 'pages/TermAndConditionPage';
import PrivacyPolicyPage from 'pages/PrivacyPolicyPage';

import ClientTaskListPage from 'pages/ClientTask/ClientTaskListPage';
const ChangePasswordModal = loadable(() => import('components/ChangePasswordModal'));
const NewTaskPage = loadable(() => import('pages/MyTask/MyTaskPage'));
const ClientTaskPage = loadable(() => import('pages/MyTask/ClientTaskPage'));
const AdminTaskPage = loadable(() => import('pages/MyTask/AdminTaskPage'));

const { Link: LinkText } = Typography;

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

const ROUTES = [
  {
    path: '/dashboard',
    name: <FormattedMessage id="menu.board" />,
    icon: <Icon component={() => <HiOutlineViewBoards />} />,
    roles: ['admin', 'agent', 'client']
  },
  {
    path: '/client',
    name: <FormattedMessage id="menu.client" />,
    icon: <TeamOutlined />,
    roles: ['admin', 'agent'],
  },
  {
    path: '/scheduler',
    name: <FormattedMessage id="menu.scheduler" />,
    icon: <ClockCircleOutlined />,
    roles: ['admin']
  },
  {
    path: '/task_template',
    name: <FormattedMessage id="menu.taskTemplate" />,
    icon: <Icon component={() => <ImInsertTemplate />} />,
    roles: ['admin']
  },
  {
    path: '/doc_template',
    name: <FormattedMessage id="menu.docTemplate" />,
    icon: <FileOutlined />,
    roles: ['admin']
  },
  {
    path: '/procedure',
    name: <FormattedMessage id="menu.procedure" />,
    icon: <Icon component={() => <GoTools />} />,
    roles: ['admin']
  },
  {
    path: '/metrics',
    name: <FormattedMessage id="menu.metrics" />,
    icon: <Icon component={() => <RiBarChartFill />} />,
    roles: ['admin']
  },
  {
    path: '/org',
    name: <FormattedMessage id="menu.org" />,
    icon: <BankOutlined />,
    roles: ['system']
  },
  {
    path: '/team',
    name: <FormattedMessage id="menu.team" />,
    icon: <Icon component={() => <HiOutlineUserGroup />} />,
    roles: ['admin'],
  },
  {
    path: '/account',
    name: <FormattedMessage id="menu.account" />,
    icon: <Icon component={() => <BiDollar />} />,
    roles: ['admin'],
  },
  {
    path: '/revenue',
    name: <FormattedMessage id="menu.revenue" />,
    icon: <Icon component={() => <RiCoinsLine />} />,
    roles: ['system']
  },
  {
    path: '/settings',
    name: <FormattedMessage id="menu.settings" />,
    icon: <SettingOutlined />,
    roles: ['system', 'admin'],
    routes: [
      {
        path: '/tags',
        name: <FormattedMessage id="menu.tags" />,
      },
      {
        path: '/config',
        name: <FormattedMessage id="menu.config" />,
      },
      {
        path: '/email_template',
        name: <FormattedMessage id="menu.emailTemplate" />,
      },
    ]
  },
];

function getSanitizedPathName(pathname) {
  const match = /\/[^/]+/.exec(pathname);
  return match ? match[0] ?? pathname : pathname;
}

export const AppClient = withRouter(props => {

  const { history } = props;

  const context = React.useContext(GlobalContext);
  const [changePasswordVisible, setChangePasswordVisible] = React.useState(false);
  const [profileVisible, setProfileVisible] = React.useState(false);
  const [contactVisible, setContactVisible] = React.useState(false);
  const [aboutVisible, setAboutVisible] = React.useState(false);
  const [tcVisible, setTcVisible] = React.useState(false);
  const [ppVisible, setPpVisible] = React.useState(false);

  const { user, role, setUser } = context;
  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    logout$().subscribe(() => {
      // reactLocalStorage.clear();
      setUser(null);
      history.push('/');
    });
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

  const avatarMenu = <StyledMenu>
    <Menu.Item key="email" disabled={true}>
      <pre style={{ fontSize: 14, margin: 0 }}>{user.profile.email}</pre>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="home" onClick={() => props.history.push('/')}>
      <FormattedMessage id="menu.home" />
    </Menu.Item>
    <Menu.Item key="profile" onClick={() => setProfileVisible(true)}>
      <FormattedMessage id="menu.profile" />
    </Menu.Item>
    <Menu.Item key="change_password" onClick={() => setChangePasswordVisible(true)}>
      <FormattedMessage id="menu.changePassword" />
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="logout" danger onClick={handleLogout}>
      <FormattedMessage id="menu.logout" />
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
        <Dropdown overlay={avatarMenu} trigger={['click']}>
          <a onClick={e => e.preventDefault()}>
            <UserAvatar
              size={40}
              value={user.profile.avatarFileId}
            />
          </a>
        </Dropdown>
      </div>
    </Layout.Header>
    <Layout.Content style={{ marginTop: 64, height: '100%', padding: 30 }}>
      <Switch>
        <RoleRoute exact path="/app" component={ClientTaskListPage} />
        <RoleRoute exact path="/task/new" component={NewTaskPage} />
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

