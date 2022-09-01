import React from 'react';
import { GlobalContext } from './contexts/GlobalContext';
import ProLayout from '@ant-design/pro-layout';
import Icon, {
  ClockCircleOutlined, SettingOutlined, TeamOutlined,
  BankOutlined, QuestionOutlined, FileOutlined, TagsOutlined, MailOutlined
} from '@ant-design/icons';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { Space, Typography, Modal, Row, Col, Button } from 'antd';
import styled from 'styled-components';
import ProfileModal from 'pages/Profile/ProfileModal';
import AboutModal from 'pages/About/AboutModal';
import { BiDollar } from 'react-icons/bi';
import loadable from '@loadable/component'
import { FormattedMessage } from 'react-intl';
import { GoTools } from 'react-icons/go';
import { RiCoinsLine } from 'react-icons/ri';
import { HiOutlineViewList } from 'react-icons/hi';
import OrgOnBoardForm from 'pages/Org/OrgProfileForm';
import OrgListPage from 'pages/Org/OrgListPage';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { ImInsertTemplate } from 'react-icons/im';
import { AvatarDropdownMenu } from 'components/AvatarDropdownMenu';
import { SmartSearch } from 'components/SmartSearch';
import { CreateNewButton } from 'components/CreateNewButton';
import { ClientTaskListPage } from 'pages/ClientTask/ClientTaskListPage';
import { AiOutlineHistory } from 'react-icons/ai';
import { SupportAffix } from 'components/SupportAffix';
import { MdMessage, MdOutlinePages } from 'react-icons/md';
import Error404 from 'pages/Error404';
import { Navigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

const SystemBoardPage = loadable(() => import('pages/SystemBoard/SystemBoardPage'));
const TagsSettingPage = loadable(() => import('pages/TagsSettingPage/TagsSettingPage'));
const ConfigListPage = loadable(() => import('pages/Config/ConfigListPage'));
const OrgMemberListPage = loadable(() => import('pages/User/OrgMemberListPage'));
const OrgClientListPage = loadable(() => import('pages/User/OrgClientListPage'));
const SupportListPage = loadable(() => import('pages/Support/SupportListPage'));
const OrgAccountPage = loadable(() => import('pages/OrgAccount/OrgAccountPage'));
const ChangePasswordModal = loadable(() => import('components/ChangePasswordModal'));
const RevenuePage = loadable(() => import('pages/AdminDashboard/RevenuePage'));
const DocTemplateListPage = loadable(() => import('pages/DocTemplate/DocTemplateListPage'));
const ResourceListPage = loadable(() => import('pages/ResourcePage/ResourceEditListPage'));
const ResourceEditPage = loadable(() => import('pages/ResourcePage/ResourceEditPage'));
const DocTemplatePage = loadable(() => import('pages/DocTemplate/DocTemplatePage'));
const TaskTemplateListPage = loadable(() => import('pages/TaskTemplate/TaskTemplateListPage'));
const TaskTemplatePage = loadable(() => import('pages/TaskTemplate/TaskTemplatePage'));
const OrgTaskListPage = loadable(() => import('pages/OrgBoard/TaskListPage'));
const RecurringListPage = loadable(() => import('pages/Recurring/RecurringListPage'));
const OrgTaskPage = loadable(() => import('pages/MyTask/OrgTaskPage'));
const ClientTaskPage = loadable(() => import('pages/Org/ClientTaskPage'));
const ClientTrackingListPage = loadable(() => import('pages/ClientTask/ClientTrackingListPage'));
const { Link: LinkText, Text } = Typography;

const StyledLayout = styled(ProLayout)`
.ant-layout {
  background-color: #f8f8fa;
}

.ant-pro-global-header {
  padding-left: 24px;
}

.ant-pro-global-header-collapsed-button {
  margin-right: 16px;
}

.ant-pro-sider {
  background-color: #F1F2F5
}

.ant-pro-sider-footer {
  padding: 0 0 16px 16px;
  .ant-typography {
    font-size: 12px;
    color: #7787A2;
  }
}

`;


const ROUTES = [
  {
    group: 'Task',
  },

  {
    path: '/task',
    name: <FormattedMessage id="menu.tasks" />,
    icon: <Icon component={HiOutlineViewList }/>,
    roles: ['admin', 'agent', 'client'],
  },
  {
    path: '/activity',
    name: 'Interactions & Messages',
    icon: <Icon component={AiOutlineHistory} />,
    roles: ['client'],
  },
  // {
  //   path: '/metrics',
  //   name: <FormattedMessage id="menu.metrics" />,
  //   icon: <Icon component={RiBarChartFill } /> />,
  //   roles: ['admin']
  // },

  {
    path: '/scheduler',
    name: <FormattedMessage id="menu.scheduler" />,
    icon: <ClockCircleOutlined />,
    roles: ['admin', 'agent'],
  },
  {
    group: 'Templates',
  },
  {
    path: '/task_template',
    name: <FormattedMessage id="menu.taskTemplate" />,
    icon: <Icon component={ImInsertTemplate } />,
    roles: ['admin', 'agent'],
  },
  {
    path: '/doc_template',
    name: <FormattedMessage id="menu.docTemplate" />,
    icon: <FileOutlined />,
    roles: ['admin', 'agent'],
  },
  {
    group: 'Admin',
  },
  {
    path: '/support',
    name: 'User Support',
    icon: <Icon component={MdMessage } />,
    roles: ['system'],
  },
  {
    path: '/manage/resource',
    name: 'Resource Pages',
    icon: <Icon component={MdOutlinePages } />,
    roles: ['system'],
  },
  {
    path: '/org',
    name: <FormattedMessage id="menu.org" />,
    icon: <BankOutlined />,
    roles: ['system'],
  },
  {
    path: '/client',
    name: <FormattedMessage id="menu.client" />,
    icon: <TeamOutlined />,
    roles: ['admin', 'agent'],
  },
  {
    path: '/team',
    name: <FormattedMessage id="menu.team" />,
    icon: <Icon component={HiOutlineUserGroup } />,
    roles: ['admin'],
  },
  {
    group: 'Others',
  },
  {
    path: '/account',
    name: 'Subscription & Billings',
    icon: <Icon component={BiDollar } />,
    roles: ['admin'],
  },
  {
    path: '/tags',
    name: <FormattedMessage id="menu.tags" />,
    icon: <TagsOutlined />,
    roles: ['admin', 'agent'],
  },
  // {
  //   path: '/revenue',
  //   name: <FormattedMessage id="menu.revenue" />,
  //   icon: <Icon component={RiCoinsLine } /> />,
  //   roles: ['system']
  // },
  {
    path: '/config',
    name: <FormattedMessage id="menu.config" />,
    icon: <SettingOutlined />,
    roles: ['system'],
    group: 'Others',
  },
];

function getSanitizedPathName(pathname) {
  const match = /\/[^/]+/.exec(pathname);
  return match ? match[0] ?? pathname : pathname;
}

export const AppLoggedIn = React.memo(props => {
  const context = React.useContext(GlobalContext);
  const location = useLocation();
  const [changePasswordVisible, setChangePasswordVisible] = React.useState(false);
  const [profileVisible, setProfileVisible] = React.useState(false);
  const [aboutVisible, setAboutVisible] = React.useState(false);
  const [orgProfileVisible, setOrgProfileVisible] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [pathname, setPathname] = React.useState(getSanitizedPathName(location.pathname));

  const { user, role } = context;
  if (!user) {
    return null;
  }

  const isSystem = role === 'system';
  const isAdmin = role === 'admin';
  const isAgent = role === 'agent';
  const isClient = role === 'client';

  const routes = ROUTES.filter(x => !x.roles || x.roles.includes(role));

  return <StyledLayout
    // title={<Image src="/images/brand.svg" preview={false} width={110} />}
    title={""}
    logo="/images/logo-horizontal-blue.png"
    // logo="/header-logo.png"
    route={{ routes }}
    location={{ pathname }}
    navTheme="light"
    siderWidth={230}
    fixSiderbar={true}
    fixedHeader={true}
    headerRender={true}
    collapsed={collapsed}
    onCollapse={setCollapsed}
    menuItemRender={(item, dom) => {
      if(item.group) {
        return <Text type="secondary" style={{fontSize: 'small'}}>{item.group}</Text>
      }
      // return <Button type="text" block size="large" icon={item.icon}>{item.name}</Button>
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
    headerContentRender={() => {
      if (isSystem || isClient) {
        return null;
      }
      return <Row gutter={10} wrap={false} justify="start">
        {/* <div
            onClick={() => setCollapsed(!collapsed)}
            style={{
              position: 'relative',
              top: '20px',
              left: '-24px',
              cursor: 'pointer',
              // fontSize: '16px',
              backgroundColor: '#062638',
              width: '20px',
              color: 'white'
            }}
          >
          {collapsed ? <RightCircleOutlined /> : <LeftCircleOutlined />}
          </div> */}
        <Col>
          <SmartSearch />
        </Col>
        <Col>
          <CreateNewButton />
        </Col>
      </Row>
    }}
    rightContentRender={() => (
      <div style={{ marginLeft: 16 }}>
        <AvatarDropdownMenu />
      </div>
    )}
    menuFooterRender={props => (
      props?.collapsed ?
        <QuestionOutlined style={{ color: '#7787A2' }} onClick={() => setCollapsed(!collapsed)} /> :
        <Space direction="vertical" style={{ width: 188 }}>
          <LinkText onClick={() => setAboutVisible(true)}>About</LinkText>
          <LinkText href="/terms_and_conditions" target="_blank">Terms and Conditions</LinkText>
          <LinkText href="/privacy_policy" target="_blank">Privacy Policy</LinkText>
        </Space>
    )}
  >
    <Outlet />

    <ChangePasswordModal

      onOk={() => setChangePasswordVisible(false)}
      onCancel={() => setChangePasswordVisible(false)}
    />
    <ProfileModal

      onOk={() => setProfileVisible(false)}
      onCancel={() => setProfileVisible(false)}
    />
    <Modal
      title="Organization Profile"

      onOk={() => setOrgProfileVisible(false)}
      onCancel={() => setOrgProfileVisible(false)}
      footer={null}
      destroyOnClose={true}
      maskClosable={false}
    >
      <OrgOnBoardForm onOk={() => setOrgProfileVisible(false)} />
    </Modal>
    <AboutModal

      onClose={() => setAboutVisible(false)}
    />
    {/* {(isAdmin || isAgent) && <SupportAffix />} */}
    {!isSystem && <SupportAffix />}
  </StyledLayout>
})

