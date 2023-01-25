import React from 'react';
import { GlobalContext } from './contexts/GlobalContext';
import Icon, {
  SettingOutlined, BankOutlined, TagFilled, CreditCardFilled
} from '@ant-design/icons';
import { Space, Typography, Row, Col, Layout, Button, Image } from 'antd';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { AvatarDropdownMenu } from 'components/AvatarDropdownMenu';
import { SmartSearch } from 'components/SmartSearch';
import { CreateNewButton } from 'components/CreateNewButton';
import { AiOutlineHistory } from 'react-icons/ai';
import { SupportAffix } from 'components/SupportAffix';
import { MdMessage, MdOutlinePages } from 'react-icons/md';
import { Outlet } from 'react-router-dom';
import { AiFillCalendar } from 'react-icons/ai';
import { FaFileInvoiceDollar } from 'react-icons/fa';
import { MdDashboard, MdSpaceDashboard } from 'react-icons/md';
import { BsFileEarmarkTextFill, BsFillPersonFill, BsFillPeopleFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { VersionMismatchAlert } from "components/VersionMismatchAlert";
import { ProLayout , PageContainer} from '@ant-design/pro-components';
import { Divider } from 'antd';
const { Link: LinkText } = Typography;

const StyledContainer = styled.div`
min-height: 100vh;
background: #ffffff;

.ant-pro-base-menu-menu-item {
  .anticon, .ant-pro-base-menu-item-text {
    color: #4B5B76 !important !important !important !important;
  }
}

.ant-layout-sider-children {
  padding-top: 8px !important;
}
`;


const ROUTES = [
  {
    path: '/',
    name: 'Tasks',
    routes: [
      {
        path: '/task',
        name: <FormattedMessage id="menu.tasks" />,
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
    path: '/',
    name: 'Templates',
    routes: [
      {
        path: '/task_template',
        name: <FormattedMessage id="menu.taskTemplate" />,
        icon: <Icon component={MdSpaceDashboard} />,
        roles: ['admin', 'agent'],
      },
      {
        path: '/doc_template',
        name: <FormattedMessage id="menu.docTemplate" />,
        icon: <Icon component={BsFileEarmarkTextFill} />,
        roles: ['admin', 'agent'],
      },
    ],
  },
  {
    path: '/',
    name: 'Users',
    routes: [
      {
        path: '/support',
        name: 'User Support',
        icon: <Icon component={MdMessage} />,
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
        icon: <Icon component={BsFillPersonFill} />,
        roles: ['admin', 'agent'],
      },
      {
        path: '/team',
        name: <FormattedMessage id="menu.team" />,
        icon: <Icon component={BsFillPeopleFill} />,
        roles: ['admin'],
      },
    ]
  },
  {
    path: '/',
    name: 'Others',
    routes: [
      {
        path: '/manage/resource',
        name: 'Resource Pages',
        icon: <Icon component={MdOutlinePages} />,
        roles: ['system'],
      },
      {
        path: '/invoices',
        name: 'Invoices',
        icon: <Icon component={FaFileInvoiceDollar} />,
        roles: ['admin'],
      },
      {
        path: '/payment_methods',
        name: 'Paymnent Methods',
        icon: <CreditCardFilled />,
        component: './pages/OrgAccount/OrgPaymentMethodPage',
        roles: ['admin'],
      },
      {
        path: '/tags',
        name: <FormattedMessage id="menu.tags" />,
        icon: <TagFilled />,
        roles: ['admin', 'agent'],
      },
      {
        path: '/config',
        name: <FormattedMessage id="menu.config" />,
        icon: <SettingOutlined />,
        roles: ['system'],
      },
    ]
  },
];


const FooterMenuItem = props => {
  const { children, href } = props;
  return <LinkText href={href} target="_blank">
    <Button type="text" size="large" block style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', fontSize: 'small', color: '#7787A2' }}>
      {children}
    </Button>
  </LinkText>
}

export const AppLoggedInPage = React.memo(() => {
  const context = React.useContext(GlobalContext);
  const [pathname, setPathname] = React.useState('/task');
  const navigate = useNavigate();

  const { user, role } = context;

  const routes = React.useMemo(() => ROUTES.map(g => ({
    ...g,
    routes: g.routes.filter(x => !x.roles || x.roles.includes(role))
  })).filter(g => g.routes.length > 0), [role]);

  if (!user) {
    return null;
  }

  const canCreateNew = role === 'admin' || role === 'agent';
  const isSystem = role === 'system';

  return <StyledContainer>
    <ProLayout
      logo={<Image src="/images/logo-full-primary.png" preview={false} width={150} />}
      title={"ZeeWorkflow"}
      actionsRender={() => [
        canCreateNew ? <Space key="search">
          <SmartSearch />
          <CreateNewButton />
        </Space> : null,
        <AvatarDropdownMenu key="avatar" />
      ].filter(x => !!x)}
      token={{
        sider: {
          colorTextMenu: '#4B5B76'
        }
      }}
      headerTitleRender={() => {
        return <Image src="/images/logo-full-primary.png" preview={false} width={150} />
      }}
      location={{ pathname }}
      route={{ routes }}
      // fixSiderbar={true}
      layout='mix'
      // splitMenus={true}
      siderWidth={210}
      menu={{
        type: 'group',
      }}
      // headerRender={false}
      menuItemRender={(item, dom) => (
        <div
          onClick={() => {
            setPathname(item.path || '/');
            navigate(item.path);
          }}
        >
          {dom}
        </div>
      )}
      menuFooterRender={props => {
        if (props?.collapsed) return undefined;
        return <Space direction="vertical" style={{ width: '100%' }}>
          <FooterMenuItem href="/terms_and_conditions">Terms and Conditions</FooterMenuItem>
          <FooterMenuItem href="/privacy_policy">Privacy Policy</FooterMenuItem>
        </Space>
      }}
    >
      <Outlet />
      {/* <PageContainer
            // loading={loading}
            fixedHeader
            header={{
              title: 'Payment Methods',
            }}
      >
fdasf
      </PageContainer> */}
    </ProLayout>
    {!isSystem && <SupportAffix />}

  </StyledContainer>
})

