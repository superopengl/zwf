import React from 'react';
import { GlobalContext } from './contexts/GlobalContext';
import ProLayout from '@ant-design/pro-layout';
import Icon, {
  ClockCircleOutlined, SettingOutlined, TeamOutlined,
  BankOutlined, QuestionOutlined, FileOutlined, TagFilled, CreditCardFilled
} from '@ant-design/icons';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { Space, Typography, Modal, Row, Col, Layout, Button, Menu, Image } from 'antd';
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
import { AiOutlineMenu, AiFillCalendar } from 'react-icons/ai';
import { HiUser, HiUsers } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

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

const StyledNewLayout = styled(Layout)`
.ant-menu {
  background-color: transparent;
}

.ant-layout-header {
  padding-left: 24px;
  padding-right: 24px
}

.ant-menu-item-group-title {
  font-size: small;
}

.ant-menu, .ant-icon  {
  font-size: 16px !important;
  color: #4B5B76 !important;
}

.menu-group {
  padding-left: 16px;
  margin-top: 16px;
  color: #97A3B7;
  font-size: small;
}

.menu-button {
  // font-size: 16px !important;
  color: #4B5B76 !important;
  justify-content: flex-start;
  align-items: center;
  display: flex;

  &:hover {
    background-color: #E3E6EB;
  }
}

`;


const StyledKnot = styled.div`
border: 1px solid #F1F2F5;
background-color: #F1F2F5;
position: absolute;
left: 0;
top: 8px;
margin: 0;
padding: 0 4px;
&:hover {
  cursor: pointer;
}
`;


const ROUTES = [
  {
    type: 'group',
    label: 'Tasks',
    key: 'g_tasks',
    children: [
      {
        key: '/task',
        label: <FormattedMessage id="menu.tasks" />,
        icon: <Icon component={HiOutlineViewList} />,
        roles: ['admin', 'agent', 'client'],
      },
      {
        key: '/activity',
        label: 'Interactions & Messages',
        icon: <Icon component={AiOutlineHistory} />,
        roles: ['client'],
      },
      {
        key: '/scheduler',
        label: <FormattedMessage id="menu.scheduler" />,
        icon: <Icon component={AiFillCalendar} />,
        roles: ['admin', 'agent'],
      },
    ],
  },
  {
    type: 'group',
    label: 'Templates',
    key: 'g_templates',
    children: [
      {
        key: '/task_template',
        label: <FormattedMessage id="menu.taskTemplate" />,
        icon: <Icon component={ImInsertTemplate} />,
        roles: ['admin', 'agent'],
      },
      {
        key: '/doc_template',
        label: <FormattedMessage id="menu.docTemplate" />,
        icon: <FileOutlined />,
        roles: ['admin', 'agent'],
      },
    ],
  },
  {
    type: 'group',
    label: 'Users',
    key: 'g_users',
    children: [
      {
        key: '/support',
        label: 'User Support',
        icon: <Icon component={MdMessage} />,
        roles: ['system'],
      },
      {
        key: '/org',
        label: <FormattedMessage id="menu.org" />,
        icon: <BankOutlined />,
        roles: ['system'],
      },
      {
        key: '/client',
        label: <FormattedMessage id="menu.client" />,
        icon: <Icon component={HiUser} />,
        roles: ['admin', 'agent'],
      },
      {
        key: '/team',
        label: <FormattedMessage id="menu.team" />,
        icon: <Icon component={HiUsers} />,
        roles: ['admin'],
      },
    ]
  },
  {
    type: 'group',
    label: 'Others',
    key: 'g_others',
    children: [
      {
        key: '/manage/resource',
        label: 'Resource Pages',
        icon: <Icon component={MdOutlinePages} />,
        roles: ['system'],
      },
      {
        key: '/account',
        label: 'Subscription & Billings',
        icon: <CreditCardFilled />,
        roles: ['admin'],
      },
      {
        key: '/tags',
        label: <FormattedMessage id="menu.tags" />,
        icon: <TagFilled />,
        roles: ['admin', 'agent'],
      },
      // {
      //   key: '/revenue',
      //   name: <FormattedMessage id="menu.revenue" />,
      //   icon: <Icon component={RiCoinsLine } /> />,
      //   roles: ['system']
      // },
      {
        key: '/config',
        label: <FormattedMessage id="menu.config" />,
        icon: <SettingOutlined />,
        roles: ['system'],
      },
    ]
  },
];

function getSanitizedPathName(pathname) {
  const match = /\/[^/]+/.exec(pathname);
  return match ? match[0] ?? pathname : pathname;
}

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

const NavMenu = props => {
  const { items, size } = props;
  const navigate = useNavigate();

  const components = [];
  for (const group of items) {
    components.push(<div className="menu-group">{group.label}</div>)
    for (const item of group.children) {
      components.push(<Button
        className="menu-button"
        size={size}
        block
        icon={item.icon}
        type="text"
        onClick={() => navigate(item.key)}>
        <span>{item.label}</span>
      </Button>)
    }
  }

  return <Space direction="vertical" style={{ width: '100%', padding: 8 }}>{components}</Space>;
}

const FooterMenuItem = props => {
  const { children, href } = props;
  return <LinkText href={href} target="_blank">
    <Button type="text" block style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', fontSize: 'small', color: '#7787A2' }}>
    {children}
  </Button>
  </LinkText>
}

export const AppLoggedIn = React.memo(props => {
  const context = React.useContext(GlobalContext);
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);
  const [pathname, setPathname] = React.useState(getSanitizedPathName(location.pathname));

  const { user, role } = context;

  const routes = React.useMemo(() => ROUTES.map(g => ({
    ...g,
    children: g.children.filter(x => !x.roles || x.roles.includes(role))
  })).filter(g => g.children.length > 0), [role]);

  if (!user) {
    return null;
  }

  const isSystem = role === 'system';
  const isAdmin = role === 'admin';
  const isAgent = role === 'agent';
  const isClient = role === 'client';




  return <StyledNewLayout>
    <Layout.Header theme="light" style={{
      position: 'fixed',
      zIndex: 1000,
      width: '100%',
      padding: 0,
    }}>
      <Layout style={{ borderBottom: '1px solid #E3E6EB' }}>
        <Layout.Sider width={220} style={{ paddingLeft: 24, paddingRight: 24 }}>
          <Image src="/images/logo-horizontal-blue.png" preview={false} width={140} />
        </Layout.Sider>
        <Layout.Content style={{ paddingLeft: 24, paddingRight: 24 }}>
          <Row justify="space-between">
            <Col>
              <Space>
                <SmartSearch />
                <CreateNewButton />
              </Space>
            </Col>
            <Col>
              <div style={{ marginLeft: 16 }}>
                <AvatarDropdownMenu />
              </div>
            </Col>
          </Row>
        </Layout.Content>
      </Layout>

    </Layout.Header>
    <Layout style={{ marginTop: 64 }}>
      <Layout.Sider
        style={{
          overflow: 'auto',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          borderRight: '1px solid #E3E6EB',
        }}
        theme="light"
        // trigger={null}
        // collapsedWidth={0}
        width={220}
      // collapsible={false}
      // collapsed={collapsed}
      // defaultCollapsed={false}
      >
        <Layout style={{ paddingTop: 64 + 16, height: '100vh', background: 'transparent' }}>
          <Layout.Content>
            <NavMenu items={routes} />
          </Layout.Content>
          <Layout.Footer style={{ backgroundColor: 'transparent', padding: '24px 8px', borderTop: '1px solid #E3E6EB' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <FooterMenuItem href="/terms_and_conditions">Terms and Conditions</FooterMenuItem>
              <FooterMenuItem href="/privacy_policy">Privacy Policy</FooterMenuItem>
            </Space>
          </Layout.Footer>
        </Layout>
      </Layout.Sider>

      <Layout style={{ marginLeft: 220 }}>

        <Layout.Content >
          <Outlet />
          {!isSystem && <SupportAffix />}
        </Layout.Content>
      </Layout>
    </Layout>
  </StyledNewLayout>
})

