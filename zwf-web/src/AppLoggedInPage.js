import React from 'react';
import Icon, {
  SettingOutlined, BankOutlined, TagFilled, CreditCardFilled, ClockCircleOutlined, CustomerServiceOutlined
} from '@ant-design/icons';
import { Space, Typography, Button, Image } from 'antd';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { AvatarDropdownMenu } from 'components/AvatarDropdownMenu';
import { SmartSearch } from 'components/SmartSearch';
import { CreateNewButton } from 'components/CreateNewButton';
import { AiOutlineHistory } from 'react-icons/ai';
import { MdMessage, MdOutlinePages, MdOutlineRepeat } from 'react-icons/md';
import { Outlet } from 'react-router-dom';
import { AiFillCalendar } from 'react-icons/ai';
import { MdDashboard, MdSpaceDashboard } from 'react-icons/md';
import { BsFileEarmarkTextFill, BsFillPersonFill, BsFillPeopleFill, BsFillTrash3Fill, BsRepeat, BsClock } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { ProLayout } from '@ant-design/pro-components';
import { SubscriptionNotification } from 'components/SubscriptionNotification';
import { useAssertRole } from 'hooks/useAssertRole';
import { useAssertUser } from 'hooks/useAssertUser';
import { useAuthUser } from 'hooks/useAuthUser';
import { useRole } from 'hooks/useRole';
import { useAssertOrgHasOnBoard } from 'hooks/useAssertOrgHasOnBoard';
import { UnimpersonatedFloatButton } from 'components/UnimpersonatedFloatButton';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { NotificationButton } from 'components/NotificationButton';
import { HelpDropdownMenu } from 'components/HelpDropdownMenu';
import { useSupportChatWidget } from 'hooks/useSupportChatWidget';
import { TbClock, TbClockPlay, TbRepeat } from 'react-icons/tb';
import { BiRepeat } from 'react-icons/bi';
import { ZeventContainer } from 'components/ZeventContainer';
import { SupportAffix } from 'components/SupportAffix';
import { HiViewBoards, HiViewList } from 'react-icons/hi';
import { PaymentMethodNotification } from 'components/PaymentMethodNotification';
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

.header-logo-image {
  &:hover {
    cursor: pointer !important;
  }
}

&.client-role {
  .ant-pro-global-header-collapsed-button {
    display: none;
  }
}
`;


const ROUTES = [
  {
    path: '/',
    name: 'Tasks',
    routes: [
      {
        path: '/task/board',
        name: 'Board',
        icon: <Icon component={HiViewBoards} />,
        roles: ['admin', 'agent'],
      },
      {
        path: '/task/list',
        name: 'List',
        icon: <Icon component={HiViewList} />,
        roles: ['admin', 'agent'],
      },
      // {
      //   path: '/activity',
      //   name: 'Interactions & Messages',
      //   icon: <Icon component={AiOutlineHistory} />,
      //   roles: ['client'],
      // },
      {
        path: '/recurring',
        name: <FormattedMessage id="menu.recurring" />,
        icon: <ClockCircleOutlined />,
        roles: ['admin', 'agent'],
      },
      {
        path: '/archived',
        name: "Archived Tasks",
        icon: <Icon component={BsFillTrash3Fill} />,
        roles: ['admin', 'agent'],
      },
    ],
  },
  {
    path: '/',
    name: 'Templates',
    routes: [
      {
        path: '/femplate',
        name: <FormattedMessage id="menu.femplate" />,
        icon: <Icon component={MdSpaceDashboard} />,
        roles: ['admin', 'agent'],
      },
      {
        path: '/demplate',
        name: <FormattedMessage id="menu.demplate" />,
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
        icon: <CustomerServiceOutlined />,
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
        path: '/billings',
        name: 'Billings',
        icon: <CreditCardFilled />,
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
  useAssertRole(['client', 'agent', 'admin', 'system'])
  useAssertUser(user => user?.suspended !== true)
  useAssertOrgHasOnBoard();
  // const [openSupport, supportContextHolder, supportOpen] = useSupportChatWidget();

  useDocumentTitle();

  const [user] = useAuthUser();
  const role = useRole();

  const [pathname, setPathname] = React.useState(role === 'system' ? '/sysboard' : '/task');
  const navigate = useNavigate();

  const routes = React.useMemo(() => ROUTES.map(g => ({
    ...g,
    routes: g.routes.filter(x => !x.roles || x.roles.includes(role))
  })).filter(g => g.routes.length > 0), [role]);

  if (!user) {
    return null;
  }

  const canCreateNew = true && role === 'admin' || role === 'agent';
  const isSystem = role === 'system';
  const isAdmin = role === 'admin';
  const isClient = role === 'client';

  return <ZeventContainer>
    <StyledContainer className={isClient ? 'client-role' : ''}>
      <ProLayout
        token={{
          header: {
            // heightLayoutHeader: 200
          },
          sider: {
            colorTextMenu: '#1C222B'
          }
        }}
        fixedHeader={true}
        logo={<Image src="/images/logo-full-primary.png" className="header-logo-image" preview={false} width={150} onClick={() => navigate('/task')} />}
        title={""}
        actionsRender={() => [
          canCreateNew ? <Space key="search" size="large">
            {/* <SmartSearch /> */}
            <CreateNewButton />
          </Space> : null,
          // isSystem ? null : <HelpDropdownMenu key="help" onSupportOpen={openSupport} />,
          (isSystem || isClient) ? null : <NotificationButton key="notification" />,
          <AvatarDropdownMenu key="avatar" />
        ].filter(x => !!x)}
        headerTitleRender={() => {
          return <Image src="/images/logo-full-primary.png" className="header-logo-image" preview={false} width={150} onClick={() => navigate('/task')} />
        }}
        location={{ pathname }}
        route={{ routes }}
        // fixSiderbar={true}
        layout={role === 'client' ? 'top' : 'mix'}
        // splitMenus={true}
        siderWidth={210}
        menu={{
          type: 'group',
        }}
        suppressSiderWhenMenuEmpty={true}
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
      // menuFooterRender={props => {
      //   if (props?.collapsed) return undefined;
      //   return <Space direction="vertical" style={{ width: '100%' }}>
      //     <FooterMenuItem href="/terms_of_use">Terms of Use</FooterMenuItem>
      //     <FooterMenuItem href="/privacy_policy">Privacy Policy</FooterMenuItem>
      //   </Space>
      // }}
      >
        <Outlet />
      </ProLayout>
      {/* {isAdmin && <SubscriptionNotification />} */}
      {isAdmin && <PaymentMethodNotification />}
      {!isSystem && <UnimpersonatedFloatButton />}
      {!isSystem && !isClient && <SupportAffix />}
    </StyledContainer >
  </ZeventContainer>
})

