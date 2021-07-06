import React from 'react';
import 'antd/dist/antd.less';
import { GlobalContext } from './contexts/GlobalContext';
import { RoleRoute } from 'components/RoleRoute';
import ProLayout from '@ant-design/pro-layout';
import Icon, {
  ClockCircleOutlined, StarOutlined, UserOutlined, SettingOutlined, TeamOutlined,
  BankOutlined, QuestionOutlined, AlertOutlined, HomeOutlined, FileOutlined
} from '@ant-design/icons';
import { Link, withRouter, Redirect } from 'react-router-dom';
import { logout$ } from 'services/authService';
import { Avatar, Space, Dropdown, Menu, Typography, Modal, Image } from 'antd';
import styled from 'styled-components';
import ProfileModal from 'pages/Profile/ProfileModal';
import ContactForm from 'components/ContactForm';
import AboutModal from 'pages/About/AboutModal';
import { Switch } from 'react-router-dom';
import { GiReceiveMoney, GiRadarSweep } from 'react-icons/gi';
import { AiOutlineBarcode } from 'react-icons/ai';
import { FaMoneyBillWave } from 'react-icons/fa';
import { BiDollar } from 'react-icons/bi';
import loadable from '@loadable/component'
import { FormattedMessage } from 'react-intl';
import { GoDatabase, GoTools } from 'react-icons/go';
import { FaTasks } from 'react-icons/fa';
import { RiCoinsLine, RiBarChartFill } from 'react-icons/ri';
import { HiOutlineViewBoards } from 'react-icons/hi';
import OrgOnBoardForm from 'pages/Org/OrgProfileForm';
import OrgListPage from 'pages/Org/OrgListPage';
import { UserAvatar } from 'components/UserAvatar';
import {HiOutlineUserGroup} from 'react-icons/hi';

const SystemBoardPage = loadable(() => import('pages/SystemBoard/SystemBoardPage'));
const AdminBoardPage = loadable(() => import('pages/AdminBoard/AdminBoardPage'));
const TagsSettingPage = loadable(() => import('pages/TagsSettingPage/TagsSettingPage'));
const ConfigListPage = loadable(() => import('pages/Config/ConfigListPage'));
const EmailTemplateListPage = loadable(() => import('pages/EmailTemplate/EmailTemplateListPage'));
const AgentUserListPage = loadable(() => import('pages/User/AgentUserListPage'));
const ClientUserListPage = loadable(() => import('pages/User/ClientUserListPage'));
const OrgAccountPage = loadable(() => import('pages/OrgAccount/OrgAccountPage'));
const ChangePasswordModal = loadable(() => import('components/ChangePasswordModal'));
const RevenuePage = loadable(() => import('pages/AdminDashboard/RevenuePage'));
const DocTemplatePage = loadable(() => import('pages/DocTemplate/DocTemplatePage'));
const TaskTemplatePage = loadable(() => import('pages/TaskTemplate/TaskTemplatePage'));
const TaskTemplateBuilderPage = loadable(() => import('pages/TaskTemplate/TaskTemplateEditorPage'));
const AdminTaskListPage = loadable(() => import('pages/AdminTask/AdminTaskListPage'));
const MyTaskPage = loadable(() => import('pages/MyTask/MyTaskPage'));
const RecurringListPage = loadable(() => import('pages/Recurring/RecurringListPage'));
const PromotionListPage = loadable(() => import('pages/Promotion/PromotionListPanel'));

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
  padding: 0 0 16px 16px;
  .ant-typography {
    font-size: 12px;
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
    path: '/dashboard',
    name: <FormattedMessage id="menu.board" />,
    icon: <Icon component={() => <HiOutlineViewBoards />} />,
    roles: ['admin', 'agent']
  },
  {
    path: '/watchlist',
    name: <FormattedMessage id="menu.watchlist" />,
    icon: <StarOutlined />,
    roles: ['client']
  },
  {
    path: '/portfolio',
    name: <FormattedMessage id="menu.portfolio" />,
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
    icon: <Icon component={() => <FaTasks />} />,
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
    icon: <Icon component={() => <HiOutlineUserGroup/>} />,
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

const AppLoggedIn = props => {

  const { history } = props;

  const context = React.useContext(GlobalContext);
  const [changePasswordVisible, setChangePasswordVisible] = React.useState(false);
  const [profileVisible, setProfileVisible] = React.useState(false);
  const [contactVisible, setContactVisible] = React.useState(false);
  const [aboutVisible, setAboutVisible] = React.useState(false);
  const [orgProfileVisible, setOrgProfileVisible] = React.useState(false);
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
    logout$().subscribe(() => {
      // reactLocalStorage.clear();
      setUser(null);
      history.push('/');
    });
  }

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
    {isAdmin && <Menu.Divider />}
    {isAdmin && <Menu.Item key="org_profile" onClick={() => setOrgProfileVisible(true)}>
      Organisation Profile
    </Menu.Item>}
    <Menu.Divider />
    <Menu.Item key="logout" danger onClick={handleLogout}>
      <FormattedMessage id="menu.logout" />
    </Menu.Item>
  </StyledMenu>

  return <StyledLayout
    // title={<Image src="/images/brand.svg" preview={false} width={120} />}
    title={null}
    logo="/images/logo.svg"
    // logo="/header-logo.png"
    route={{ routes }}
    location={{ pathname }}
    navTheme="dark"
    siderWidth={200}
    fixSiderbar={true}
    fixedHeader={true}
    headerRender={true}
    collapsed={collapsed}
    onCollapse={setCollapsed}
    menuItemRender={(item, dom) => {
      return <Link to={item.path} onClick={() => {
        setPathname(item.path);
      }}>
        {dom}
      </Link>
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
              backgroundColor: '#002329',
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
            {/* <Avatar size={40}
              icon={<UserOutlined style={{ fontSize: 20 }} />}
              style={{ backgroundColor: isSystem ? '#ff4d4f' : isAdmin ? '#002329' : isAgent ? '#4c1bb3' : isClient ? '#18b0d7' : '#333333' }}
            /> */}
            <UserAvatar
              size={40}
              value={user.profile.avatarFileId}
              style={{ backgroundColor: isSystem ? '#ff4d4f' : isAdmin ? '#002329' : isAgent ? '#4c1bb3' : isClient ? '#18b0d7' : '#333333' }}
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
      <RoleRoute visible={isAgent || isAdmin} exact path="/dashboard" component={isSystem ? SystemBoardPage : AdminBoardPage} />
      <RoleRoute visible={isAdmin} exact path="/task" component={AdminTaskListPage} />
      <RoleRoute visible={isAdmin} exact path="/task/new" component={MyTaskPage} />
      <RoleRoute visible={isAdmin} exact path="/doc_template" component={DocTemplatePage} />
      <RoleRoute visible={isAdmin} exact path="/task_template" component={TaskTemplatePage} />
      <RoleRoute visible={isAdmin} exact path="/task_template/new" component={TaskTemplateBuilderPage} />
      <RoleRoute visible={isAdmin} exact path="/task_template/:id" component={TaskTemplateBuilderPage} />
      <RoleRoute visible={isAdmin} exact path="/scheduler" component={RecurringListPage} />
      <RoleRoute visible={isAdmin} exact path="/account" component={OrgAccountPage} />
      <RoleRoute visible={isSystem} exact path="/org" component={OrgListPage} />
      <RoleRoute visible={isSystem || isAdmin} exact path="/team" component={AgentUserListPage} />
      <RoleRoute visible={isSystem || isAdmin} exact path="/portfolio" component={ClientUserListPage} />
      <RoleRoute visible={isSystem || isAdmin} exact path="/tags" component={TagsSettingPage} />
      <RoleRoute visible={isSystem || isAdmin} exact path="/config" component={ConfigListPage} />
      <RoleRoute visible={isSystem || isAdmin} exact path="/email_template" component={EmailTemplateListPage} />
      <RoleRoute visible={isSystem} exact path="/revenue" component={RevenuePage} />
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
    <Modal
      title="Organisation Profile"
      visible={orgProfileVisible}
      onOk={() => setOrgProfileVisible(false)}
      onCancel={() => setOrgProfileVisible(false)}
      footer={null}
      destroyOnClose={true}
      maskClosable={false}
    >
      <OrgOnBoardForm onOk={() => setOrgProfileVisible(false)} />
    </Modal>
    <AboutModal
      visible={aboutVisible}
      onClose={() => setAboutVisible(false)}
    />
  </StyledLayout>
}

export default withRouter(AppLoggedIn);
