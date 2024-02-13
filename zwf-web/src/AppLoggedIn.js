import React from 'react';
import 'antd/dist/antd.less';
import { GlobalContext } from './contexts/GlobalContext';
import { RoleRoute } from 'components/RoleRoute';
import ProLayout from '@ant-design/pro-layout';
import Icon, {
  ClockCircleOutlined, SettingOutlined, TeamOutlined,
  BankOutlined, QuestionOutlined, FileOutlined, TagsOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Space, Typography, Modal, Row, Col } from 'antd';
import styled from 'styled-components';
import ProfileModal from 'pages/Profile/ProfileModal';
import ContactForm from 'components/ContactForm';
import AboutModal from 'pages/About/AboutModal';
import { Switch } from 'react-router-dom';
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

const SystemBoardPage = loadable(() => import('pages/SystemBoard/SystemBoardPage'));
const TagsSettingPage = loadable(() => import('pages/TagsSettingPage/TagsSettingPage'));
const ConfigListPage = loadable(() => import('pages/Config/ConfigListPage'));
const EmailTemplateListPage = loadable(() => import('pages/EmailTemplate/EmailTemplateListPage'));
const OrgMemberListPage = loadable(() => import('pages/User/OrgMemberListPage'));
const ClientUserListPage = loadable(() => import('pages/User/ClientUserListPage'));
const OrgAccountPage = loadable(() => import('pages/OrgAccount/OrgAccountPage'));
const ChangePasswordModal = loadable(() => import('components/ChangePasswordModal'));
const RevenuePage = loadable(() => import('pages/AdminDashboard/RevenuePage'));
const DocTemplateListPage = loadable(() => import('pages/DocTemplate/DocTemplateListPage'));
const DocTemplatePage = loadable(() => import('pages/DocTemplate/DocTemplatePage'));
const TaskTemplateListPage = loadable(() => import('pages/TaskTemplate/TaskTemplateListPage'));
const TaskTemplatePage = loadable(() => import('pages/TaskTemplate/TaskTemplatePage'));
const OrgTaskListPage = loadable(() => import('pages/OrgBoard/TaskListPage'));
const RecurringListPage = loadable(() => import('pages/Recurring/RecurringListPage'));
const OrgTaskPage = loadable(() => import('pages/MyTask/OrgTaskPage'));
const ClientTaskPage = loadable(() => import('pages/MyTask/ClientTaskPage'));
const ClientTrackingListPage = loadable(() => import('pages/ClientTask/ClientTrackingListPage'));
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


const ROUTES = [
  {
    path: '/',
    name: <FormattedMessage id="menu.tasks" />,
    icon: <Icon component={() => <HiOutlineViewList />} />,
    roles: ['admin', 'agent', 'client']
  },
  {
    path: '/activity',
    name: 'Interactions & Messages',
    icon: <Icon component={() => <AiOutlineHistory />} />,
    roles: ['client']
  },
  // {
  //   path: '/metrics',
  //   name: <FormattedMessage id="menu.metrics" />,
  //   icon: <Icon component={() => <RiBarChartFill />} />,
  //   roles: ['admin']
  // },

  {
    path: '/scheduler',
    name: <FormattedMessage id="menu.scheduler" />,
    icon: <ClockCircleOutlined />,
    roles: ['admin', 'agent']
  },
  {
    path: '/task_template',
    name: <FormattedMessage id="menu.taskTemplate" />,
    icon: <Icon component={() => <ImInsertTemplate />} />,
    roles: ['admin', 'agent']
  },
  {
    path: '/doc_template',
    name: <FormattedMessage id="menu.docTemplate" />,
    icon: <FileOutlined />,
    roles: ['admin', 'agent']
  },
  {
    path: '/procedure',
    name: <FormattedMessage id="menu.procedure" />,
    icon: <Icon component={() => <GoTools />} />,
    roles: ['admin']
  },
  {
    path: '/org',
    name: <FormattedMessage id="menu.org" />,
    icon: <BankOutlined />,
    roles: ['system']
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
    icon: <Icon component={() => <HiOutlineUserGroup />} />,
    roles: ['admin'],
  },
  {
    path: '/account',
    name: 'Subscription & Billings',
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
    path: '/tags',
    name: <FormattedMessage id="menu.tags" />,
    icon: <TagsOutlined />,
    roles: ['admin', 'agent'],
  },
  {
    path: '/settings',
    name: <FormattedMessage id="menu.settings" />,
    icon: <SettingOutlined />,
    roles: ['system', 'admin'],
    routes: [
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

export const AppLoggedIn = React.memo(props => {
  const context = React.useContext(GlobalContext);
  const [changePasswordVisible, setChangePasswordVisible] = React.useState(false);
  const [profileVisible, setProfileVisible] = React.useState(false);
  const [contactVisible, setContactVisible] = React.useState(false);
  const [aboutVisible, setAboutVisible] = React.useState(false);
  const [orgProfileVisible, setOrgProfileVisible] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [pathname, setPathname] = React.useState(getSanitizedPathName(props.location.pathname));

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
    title={"ZeeWorkflow"}
    logo="/images/logo.svg"
    // logo="/header-logo.png"
    route={{ routes }}
    location={{ pathname }}
    navTheme="dark"
    siderWidth={230}
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
    headerContentRender={() => {
      if(isSystem || isClient) {
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
      <RoleRoute exact path="/" component={isSystem ? SystemBoardPage : isClient ? ClientTaskListPage : OrgTaskListPage} />
      <RoleRoute visible={!isSystem} path="/task/:id" component={isClient ? ClientTaskPage : OrgTaskPage} />
      <RoleRoute visible={isClient} exact path="/activity" component={ClientTrackingListPage} />
      <RoleRoute visible={isAdmin || isAgent} exact path="/doc_template" component={DocTemplateListPage} />
      <RoleRoute visible={isAdmin || isAgent} exact path="/doc_template/new" component={DocTemplatePage} />
      <RoleRoute visible={isAdmin || isAgent} exact path="/doc_template/:id" component={DocTemplatePage} />
      <RoleRoute visible={isAdmin || isAgent} exact path="/task_template" component={TaskTemplateListPage} />
      <RoleRoute visible={isAdmin || isAgent} exact path="/task_template/new" component={TaskTemplatePage} />
      <RoleRoute visible={isAdmin || isAgent} exact path="/task_template/:id" component={TaskTemplatePage} />
      <RoleRoute visible={isAdmin || isAgent} exact path="/scheduler" component={RecurringListPage} />
      <RoleRoute visible={isAdmin || isAgent} exact path="/client" component={ClientUserListPage} />
      <RoleRoute visible={isAdmin || isAgent} exact path="/tags" component={TagsSettingPage} />
      <RoleRoute visible={isAdmin} exact path="/account" component={OrgAccountPage} />
      <RoleRoute visible={isAdmin} exact path="/team" component={OrgMemberListPage} />
      <RoleRoute visible={isSystem || isAdmin} exact path="/config" component={ConfigListPage} />
      <RoleRoute visible={isSystem || isAdmin} exact path="/email_template" component={EmailTemplateListPage} />
      <RoleRoute visible={isSystem} exact path="/org" component={OrgListPage} />
      <RoleRoute visible={isSystem} exact path="/revenue" component={RevenuePage} />
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
    <AboutModal
      visible={aboutVisible}
      onClose={() => setAboutVisible(false)}
    />
  </StyledLayout>
})

