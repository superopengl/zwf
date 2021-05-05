import React from 'react';
import 'antd/dist/antd.less';
import { GlobalContext } from './contexts/GlobalContext';
import { RoleRoute } from 'components/RoleRoute';
import ProLayout from '@ant-design/pro-layout';
import Icon, {
  UploadOutlined, StarOutlined, UserOutlined, SettingOutlined, TeamOutlined,
  DashboardOutlined, QuestionOutlined, AlertOutlined, HomeOutlined
} from '@ant-design/icons';
import { Link, withRouter, Redirect } from 'react-router-dom';
import { logout } from 'services/authService';
import { Avatar, Space, Dropdown, Menu, Typography, Modal } from 'antd';
import styled from 'styled-components';
import ProfileModal from 'pages/Profile/ProfileModal';
import ContactForm from 'components/ContactForm';
import AboutDrawer from 'pages/About/AboutDrawer';
import { Switch } from 'react-router-dom';
import { GiReceiveMoney, GiRadarSweep } from 'react-icons/gi';
import { BsCalendar } from 'react-icons/bs';
import { FaMoneyBillWave } from 'react-icons/fa';
import { BiDollar } from 'react-icons/bi';
import loadable from '@loadable/component'
import { FormattedMessage } from 'react-intl';
import { GoDatabase } from 'react-icons/go';
import { RiCoinsLine } from 'react-icons/ri';

const AdminBoardPage = loadable(() => import('pages/AdminBoard/AdminBoardPage'));
const TagsSettingPage = loadable(() => import('pages/TagsSettingPage/TagsSettingPage'));
const ConfigListPage = loadable(() => import('pages/Config/ConfigListPage'));
const EmailTemplateListPage = loadable(() => import('pages/EmailTemplate/EmailTemplateListPage'));
const UserListPage = loadable(() => import('pages/User/UserListPage'));
const MyAccountPage = loadable(() => import('pages/MyAccount/MyAccountPage'));
const ChangePasswordModal = loadable(() => import('components/ChangePasswordModal'));
const RevenuePage = loadable(() => import('pages/AdminDashboard/RevenuePage'));

const { Link: LinkText } = Typography;

const StyledLayout = styled(ProLayout)`
.ant-layout {
  // background-color: white;
}

.ant-pro-global-header {
  padding-left: 24px;
}

.ant-pro-global-header-collapsed-button {
  margin-right: 16px;
}

.ant-pro-sider-footer {
  .ant-typography {
    color: rgba(255,255,255,0.45);
  }
}

`;

const StyledMenu = styled(Menu)`
.ant-dropdown-menu-item {
  padding: 12px !important;
}
`;

const ROUTES = [
  {
    path: '/',
    name: <FormattedMessage id="menu.home" />,
    icon: <HomeOutlined />,
    roles: ['admin', 'agent', 'client']
  },
  {
    path: '/dashboard',
    name: <FormattedMessage id="menu.dashboard" />,
    icon: <DashboardOutlined />,
    roles: ['admin', 'agent']
  },
  {
    path: '/watchlist',
    name: <FormattedMessage id="menu.watchlist" />,
    icon: <StarOutlined />,
    roles: ['member']
  },
  {
    path: '/user',
    name: <FormattedMessage id="menu.users" />,
    icon: <TeamOutlined />,
    roles: ['system', 'admin']
  },
  {
    path: '/account',
    name: <FormattedMessage id="menu.account" />,
    icon: <Icon component={() => <BiDollar />} />,
    roles: ['admin'],
  },
  {
    path: '/data',
    name: <FormattedMessage id="menu.dataManagement" />,
    icon: <Icon component={() => <GoDatabase />} />,
    roles: ['admin', 'agent']
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

const AppLoggedIn = props => {

  const { history } = props;

  const context = React.useContext(GlobalContext);
  const [changePasswordVisible, setChangePasswordVisible] = React.useState(false);
  const [profileVisible, setProfileVisible] = React.useState(false);
  const [contactVisible, setContactVisible] = React.useState(false);
  const [aboutVisible, setAboutVisible] = React.useState(false);
  const [earnCommissionVisible, setEarnCommissionVisible] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [pathname, setPathname] = React.useState(getSanitizedPathName(props.location.pathname));

  const { user, role, setUser } = context;
  if (!user) {
    return null;
  }

  const isSystem = role === 'system';
  const isAdmin = role === 'admin';
  const isAgent = role === 'agent';
  const isClient = role === 'client';
  const isGuest = role === 'guest';


  const routes = ROUTES.filter(x => !x.roles || x.roles.includes(role));

  const handleLogout = async () => {
    await logout();
    // reactLocalStorage.clear();
    setUser(null);
    history.push('/');
  }

  const avatarMenu = <StyledMenu>
    <Menu.Item key="email" disabled={true}>
      <pre style={{ fontSize: 14, margin: 0 }}>{user.profile.email}</pre>
    </Menu.Item>
    <Menu.Divider />
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

  return <StyledLayout
    title="Filedin"
    logo="/favicon-32x32.png"
    // logo="/header-logo.png"
    route={{ routes }}
    location={{ pathname }}
    navTheme="dark"
    siderWidth={240}
    fixSiderbar={true}
    fixedHeader={true}
    headerRender={true}
    collapsed={collapsed}
    onCollapse={setCollapsed}
    menuItemRender={(item, dom) => {
      if (item.path === '/referral') {
        return <div onClick={() => setEarnCommissionVisible(true)}>
          {dom}
        </div>
      } else {

        return <Link to={item.path} onClick={() => {
          setPathname(item.path);
        }}>
          {dom}
        </Link>
      }
    }}
    // collapsedButtonRender={false}
    // postMenuData={menuData => {
    //   return [
    //     {
    //       icon: collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />,
    //       name: ' ',
    //       onTitleClick: () => setCollapsed(!collapsed),
    //     },
    //     ...menuData
    //   ]
    // }}
    headerContentRender={() => (
      <Space>
        {/* <div
            onClick={() => setCollapsed(!collapsed)}
            style={{
              position: 'relative',
              top: '20px',
              left: '-24px',
              cursor: 'pointer',
              // fontSize: '16px',
              backgroundColor: '#05001a',
              width: '20px',
              color: 'white'
            }}
          >
            {collapsed ? <RightCircleOutlined /> : <LeftCircleOutlined />}
          </div> */}
      </Space>
    )}
    rightContentRender={() => (
      <div style={{ marginLeft: 16 }}>
        <Dropdown overlay={avatarMenu} trigger={['click']}>
          <a onClick={e => e.preventDefault()}>
            <Avatar size={40}
              icon={<UserOutlined style={{ fontSize: 20 }} />}
              style={{ backgroundColor: isSystem ? '#ff4d4f' : isAdmin ? '#05001a' : isAgent ? '#4c1bb3' : isClient ? '#18b0d7' : '#333333' }}
            />
          </a>
        </Dropdown>
      </div>
    )}
    menuFooterRender={props => (
      props?.collapsed ?
        <QuestionOutlined style={{ color: 'rgba(255,255,255,0.95' }} onClick={() => setCollapsed(!collapsed)} /> :
        <Space direction="vertical" style={{ width: 188 }}>
          <LinkText onClick={() => setContactVisible(true)}>Contact Us</LinkText>
          <LinkText onClick={() => setAboutVisible(true)}>About</LinkText>
          <LinkText href="/terms_and_conditions" target="_blank">Terms and Conditions</LinkText>
          <LinkText href="/privacy_policy" target="_blank">Privacy Policy</LinkText>
        </Space>
    )}
  >
    <Switch>
      <RoleRoute exact path="/dashboard" component={AdminBoardPage} />



      {/* <RoleRoute visible={isMember || isFree} path="/watchlist" exact component={StockWatchListPage} /> */}

      {/* <RoleRoute visible={isAdmin} exact path="/blogs/admin" component={AdminBlogPage} /> */}
      <RoleRoute visible={isSystem || isAdmin} exact path="/user" component={UserListPage} />
      <RoleRoute visible={isSystem || isAdmin} exact path="/tags" component={TagsSettingPage} />
      <RoleRoute visible={isSystem || isAdmin} exact path="/config" component={ConfigListPage} />
      <RoleRoute visible={isSystem || isAdmin} exact path="/email_template" component={EmailTemplateListPage} />
      <RoleRoute visible={isAdmin} exact path="/revenue" component={RevenuePage} />
      <RoleRoute visible={isClient} path="/account" exact component={MyAccountPage} />
      <Redirect to={(isSystem || isAdmin || isAgent) ? '/dashboard' : '/stock'} />
    </Switch>

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
    <AboutDrawer
      visible={aboutVisible}
      onClose={() => setAboutVisible(false)}
    />
  </StyledLayout>
}

export default withRouter(AppLoggedIn);
