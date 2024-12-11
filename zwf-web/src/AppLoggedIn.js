import React from 'react';
import { GlobalContext } from './contexts/GlobalContext';
import Icon, {
  SettingOutlined, BankOutlined, QuestionOutlined, TagFilled, CreditCardFilled
} from '@ant-design/icons';
import { Space, Typography, Row, Col, Layout, Button, Image } from 'antd';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { HiOutlineViewList } from 'react-icons/hi';
import { ImInsertTemplate } from 'react-icons/im';
import { AvatarDropdownMenu } from 'components/AvatarDropdownMenu';
import { SmartSearch } from 'components/SmartSearch';
import { CreateNewButton } from 'components/CreateNewButton';
import { AiOutlineHistory } from 'react-icons/ai';
import { SupportAffix } from 'components/SupportAffix';
import { MdMessage, MdOutlinePages } from 'react-icons/md';
import { Outlet } from 'react-router-dom';
import { AiFillCalendar } from 'react-icons/ai';
import { BsBell } from 'react-icons/bs';
import { MdDashboard, MdSpaceDashboard } from 'react-icons/md';
import { BsFileEarmarkTextFill, BsFillPersonFill, BsFillPeopleFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { VersionMismatchAlert } from "components/VersionMismatchAlert";

const { Link: LinkText } = Typography;

const StyledNewLayout = styled(Layout)`
min-height: 100%;
background: #ffffff;

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

  .anticon {
    font-size: 1.2rem;
  }
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
        icon: <Icon component={MdDashboard} />,
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
        icon: <Icon component={MdSpaceDashboard} />,
        roles: ['admin', 'agent'],
      },
      {
        key: '/doc_template',
        label: <FormattedMessage id="menu.docTemplate" />,
        icon: <Icon component={BsFileEarmarkTextFill} />,
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
        icon: <Icon component={BsFillPersonFill} />,
        roles: ['admin', 'agent'],
      },
      {
        key: '/team',
        label: <FormattedMessage id="menu.team" />,
        icon: <Icon component={BsFillPeopleFill} />,
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



const NavMenu = props => {
  const { items, size } = props;
  const navigate = useNavigate();

  const components = [];
  let index = 0;
  for (const group of items) {
    components.push(<div className="menu-group" key={index++}>{group.label}</div>)
    for (const item of group.children) {
      components.push(<Button
        key={index++}
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

export const AppLoggedIn = React.memo(() => {
  const context = React.useContext(GlobalContext);

  const { user, role } = context;

  const routes = React.useMemo(() => ROUTES.map(g => ({
    ...g,
    children: g.children.filter(x => !x.roles || x.roles.includes(role))
  })).filter(g => g.children.length > 0), [role]);

  if (!user) {
    return null;
  }

  const isSystem = role === 'system';

  return <StyledNewLayout>
    <Layout.Header theme="light" style={{
      position: 'fixed',
      zIndex: 1000,
      width: '100%',
      padding: 0,
    }}>
      <Layout style={{ borderBottom: '1px solid #E3E6EB' }}>
        <Layout.Sider width={220} style={{ paddingLeft: 24, paddingRight: 24 }}>
          <Image src="/images/logo-full-primary.svg" preview={false} width={140} />
        </Layout.Sider>
        <Layout.Content style={{ paddingLeft: 24, paddingRight: 24 }}>
          <Row justify="space-between" gutter={16}>
            <Col>
              <Space>
                <SmartSearch />
                <CreateNewButton />
              </Space>
            </Col>
            <Col>
              <Space>
                {/* <Button icon={<QuestionOutlined />} type="text" size="large"></Button>
                <Button icon={<Icon component={BsBell}/>} type="text" size="large"></Button> */}
                <AvatarDropdownMenu style={{ marginLeft: 8 }} />
              </Space>
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
        width={220}
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

      <Layout style={{ marginLeft: 220, minHeight: '100%', backgroundColor: '#FFFFFF' }}>
        <Layout.Content style={{padding: '2rem'}}>
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
    {!isSystem && <SupportAffix />}
    <VersionMismatchAlert />
  </StyledNewLayout>
})

