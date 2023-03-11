import React from 'react';
// import 'antd/dist/antd.less';
import { BrowserRouter, createBrowserRouter, createRoutesFromElements, Routes, Route, RouterProvider } from 'react-router-dom';
import { GlobalContext } from './contexts/GlobalContext';
import { getAuthUser$ } from 'services/authService';
import { Subject } from 'rxjs';
import { ConfigProvider, Row } from 'antd';
import loadable from '@loadable/component'
import { IntlProvider } from "react-intl";
import antdLocaleEN from 'antd/lib/locale/en_US';
import antdLocaleZH from 'antd/lib/locale/zh_CN';
import intlMessagesEN from "./translations/en-US.json";
import intlMessagesZH from "./translations/zh-CN.json";
import { getDefaultLocale } from './util/getDefaultLocale';
import { reactLocalStorage } from 'reactjs-localstorage';
import { AppLoggedInPage } from 'AppLoggedInPage';
import { PortalPage } from 'pages/PortalPage';
import { Loading } from 'components/Loading';
import CookieConsent from "react-cookie-consent";
import { HomePage } from 'pages/HomePage';
import { Navigate } from 'react-router-dom';
import { DebugJsonPanel } from 'components/DebugJsonPanel';
import { RouteByRole } from 'components/RouteByRole';
import Error404 from 'pages/Error404';

const ClientTaskListPage = loadable(() => import('pages/ClientTask/ClientTaskListPage'));
const OrgListPage = loadable(() => import('pages/Org/OrgListPage'));
const LogInPage = loadable(() => import('pages/LogInPage'));
const ActivateAccountPage = loadable(() => import('pages/ActivateAccountApage'));
const ForgotPasswordPage = loadable(() => import('pages/ForgotPasswordPage'));
const PrivacyPolicyPage = loadable(() => import('pages/PrivacyPolicyPage'));
const OrgResurgingPage = loadable(() => import('pages/OrgResurgingPage'));
const TermAndConditionPage = loadable(() => import('pages/TermAndConditionPage'));
const BlogsPage = loadable(() => import('pages/BlogsPage'));
const OrgSignUpPage = loadable(() => import('pages/Org/OrgSignUpPage'));
const OrgOnBoardPage = loadable(() => import('pages/Org/OrgOnBoardPage'));
const TaskDirectPage = loadable(() => import('pages/MyTask/TaskDirectPage'))
const ResourceListPage = loadable(() => import('pages/ResourcePage/ResourceListPage'))
const ResourcePage = loadable(() => import('pages/ResourcePage/ResourcePage'))
const SystemBoardPage = loadable(() => import('pages/SystemBoard/SystemBoardPage'));
const TagsSettingPage = loadable(() => import('pages/TagsSettingPage/TagsSettingPage'));
const ConfigListPage = loadable(() => import('pages/Config/ConfigListPage'));
const OrgMemberListPage = loadable(() => import('pages/User/OrgMemberListPage'));
const OrgClientListPage = loadable(() => import('pages/User/OrgClientListPage'));
const SupportListPage = loadable(() => import('pages/Support/SupportListPage'));
const OrgSubscriptionPage = loadable(() => import('pages/OrgSubscription/OrgSubscriptionPage'));
const RevenuePage = loadable(() => import('pages/AdminDashboard/RevenuePage'));
const DocTemplateListPage = loadable(() => import('pages/DocTemplate/DocTemplateListPage'));
const DocTemplatePage = loadable(() => import('pages/DocTemplate/DocTemplatePage'));
const TaskTemplateListPage = loadable(() => import('pages/TaskTemplate/TaskTemplateListPage'));
const TaskTemplatePage = loadable(() => import('pages/TaskTemplate/TaskTemplatePage'));
const OrgTaskListPage = loadable(() => import('pages/OrgBoard/TaskListPage'));
const RecurringListPage = loadable(() => import('pages/Recurring/RecurringListPage'));
const OrgTaskPage = loadable(() => import('pages/MyTask/OrgTaskPage'));
const ClientTaskPage = loadable(() => import('pages/Org/ClientTaskPage'));
const ClientTrackingListPage = loadable(() => import('pages/ClientTask/ClientTrackingListPage'));
const ResourceEditPage = loadable(() => import('pages/ResourcePage/ResourceEditPage'));
const ResourceEditListPage = loadable(() => import('pages/ResourcePage/ResourceEditListPage'));

const localeDic = {
  'en-US': {
    antdLocale: antdLocaleEN,
    intlLocale: 'en',
    intlMessages: intlMessagesEN,
  },
  'zh-CN': {
    antdLocale: antdLocaleZH,
    intlLocale: 'zh',
    intlMessages: intlMessagesZH
  }
}

const DEFAULT_LOCALE = getDefaultLocale();

export const App = React.memo(() => {
  const [loading, setLoading] = React.useState(true);
  const [locale, setLocale] = React.useState(DEFAULT_LOCALE);
  const [user, setUser] = React.useState(null);
  const event$ = React.useRef(new Subject()).current;

  // const globalContextValue = {
  //   event$,
  //   role: 'guest',
  //   user,
  //   setUser,
  //   // members,
  //   // setMembers,
  //   setLoading,
  //   setLocale: locale => {
  //     reactLocalStorage.set('locale', locale);
  //     setLocale(locale);
  //   },
  // }

  const [contextValue, setContextValue] = React.useState({
    event$,
    role: 'guest',
    user,
    setUser,
    // members,
    // setMembers,
    setLoading,
    setLocale: locale => {
      reactLocalStorage.set('locale', locale);
      setLocale(locale);
    },
  });


  React.useEffect(() => {
    const sub$ = getAuthUser$().subscribe(user => {
      setUser(user);
      setLoading(false);
    })
    return () => sub$.unsubscribe()
  }, []);

  React.useEffect(() => {
    if (user !== contextValue.user) {

      setContextValue({
        ...contextValue,
        user,
        role: user?.role || 'guest',
      });

      // contextValue.setLocale(user?.profile?.locale || DEFAULT_LOCALE);
    }
  }, [user]);

  const role = contextValue.role || 'guest';
  const isGuest = role === 'guest';
  const isClient = role === 'client';
  const isAdmin = role === 'admin';
  const isSystem = role === 'system';
  const isAgent = role === 'agent';
  const beingSuspended = user?.suspended;

  const isLoggedIn = !isGuest;

  const { antdLocale, intlLocale, intlMessages } = localeDic[locale] || localeDic[DEFAULT_LOCALE];

  if (loading) {
    return <Row justify='center' align='center' style={{ height: 400, alignItems: 'center' }}>
      <Loading loading={true} />
    </Row>
  }

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/">
        <Route path={'/'} element={<PortalPage />} >
          <Route index element={<HomePage />} />
          <Route path="/resource" element={<ResourceListPage />} />
          <Route path="/resource/:key" element={<ResourcePage />} />
        </Route>
        <Route path="/terms_and_conditions" element={<TermAndConditionPage />} />
        <Route path="/privacy_policy" element={<PrivacyPolicyPage />} />
        <Route path="/login" element={isGuest ? <LogInPage /> : <Navigate to="/" />} />
        <Route path="/signup/org" element={isGuest ? <OrgSignUpPage /> : <Navigate to="/" />} />
        <Route path="/forgot_password" element={isGuest ? <ForgotPasswordPage /> : <Navigate to="/" />} />
        <Route path="/activate" element={isGuest ? <ActivateAccountPage /> : <Navigate to="/" />} />
        <Route path="/resurge/:code" element={isGuest ? <OrgResurgingPage /> : <Navigate to="/" />} />
        <Route path="/task/direct/:token" element={!isSystem ? <TaskDirectPage /> : <Navigate to="/" />} />
        <Route path="/onboard" element={isAdmin && !user?.orgId ? <OrgOnBoardPage /> : <Navigate to="/" />} />


        <Route path="/" element={!isGuest && !beingSuspended ? <AppLoggedInPage /> : <PortalPage />} >
          <Route path="/task" element={isSystem ? <SystemBoardPage /> : isClient ? <ClientTaskListPage /> : <OrgTaskListPage />} />
          <Route path="/task/:id" element={isClient ? <ClientTaskPage /> : (isAdmin || isAgent) ? <OrgTaskPage /> : <Navigate to="/" />} />
          <Route path="/activity" element={isClient ? <ClientTrackingListPage /> : <Navigate to="/" />} />
          <Route path="/doc_template" element={(isAdmin || isAgent) ?<DocTemplateListPage />: <Navigate to="/" />} />
          <Route path="/doc_template/new" element={(isAdmin || isAgent) ?<DocTemplatePage />: <Navigate to="/" />} />
          <Route path="/doc_template/:id" element={(isAdmin || isAgent) ?<DocTemplatePage />: <Navigate to="/" />} />
          <Route path="/task_template" element={(isAdmin || isAgent) ?<TaskTemplateListPage />: <Navigate to="/" />} />
          <Route path="/task_template/new" element={(isAdmin || isAgent) ?<TaskTemplatePage />: <Navigate to="/" />} />
          <Route path="/task_template/:id" element={(isAdmin || isAgent) ?<TaskTemplatePage />: <Navigate to="/" />} />
          <Route path="/scheduler" element={(isAdmin || isAgent) ? <RecurringListPage /> : <Navigate to="/" />} />
          <Route path="/client" element={(isAdmin || isAgent) ? <OrgClientListPage /> : <Navigate to="/" />} />
          <Route path="/tags" element={(isAdmin || isAgent) ? <TagsSettingPage /> : <Navigate to="/" />} />
          <Route path="/subscription" element={(isAdmin || isAgent) ? <OrgSubscriptionPage /> : <Navigate to="/" />} />
          <Route path="/team" element={(isAdmin || isAgent) ? <OrgMemberListPage /> : <Navigate to="/" />} />
          <Route path="/config" element={isSystem ?<ConfigListPage /> : <Navigate to="/" />} />
          <Route path="/org" element={isSystem ? <OrgListPage /> : <Navigate to="/" />} />
          <Route path="/support" element={isSystem ? <SupportListPage /> : <Navigate to="/" />} />
          <Route path="/manage/resource" element={isSystem ? <ResourceEditListPage /> : <Navigate to="/" />} />
          <Route path="/manage/resource/new" element={isSystem ? <ResourceEditPage /> : <Navigate to="/" />} />
          <Route path="/manage/resource/:id" element={isSystem ? <ResourceEditPage /> : <Navigate to="/" />} />
          <Route path="/revenue" element={isSystem ? <RevenuePage /> : <Navigate to="/" />} />
        </Route>

        <Route path="/404" element={<Error404 />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    )
  )

  return (
    <GlobalContext.Provider value={contextValue}>
      <ConfigProvider
        theme={{
          components: {
            Divider: {
            },
            Typography: {
              fontWeightStrong: 800,
            },
          },
          token: {
            colorPrimary: '#0FBFC4',
            colorInfo: '#0051D9',
            colorWarning: '#F7BA1E',
            colorLink: '#0051D9',
            colorSuccess: '#00B42A',
            colorError: '#F53F3F',
            borderRadius: 4,
            colorTextBase: '#4B5B76',
            colorText: '#4B5B76',
            colorTextSecondary: '#97A3B7',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
            colorTextHeading: '#1C222B',
            fontSizeHeading1: 32,
            fontSizeHeading2: 28,
            fontSizeHeading3: 22,
            fontSizeHeading4: 18,
          }
        }}
        locale={antdLocale}>
        <IntlProvider locale={intlLocale} messages={intlMessages}>
          <RouterProvider router={router} />
          <CookieConsent location="bottom" overlay={false} expires={365} buttonStyle={{ borderRadius: 4 }} buttonText="Accept">
            We use cookies to improve your experiences on our website.
          </CookieConsent>
          {/* <DebugJsonPanel value={user} /> */}
        </IntlProvider>
      </ConfigProvider>
    </GlobalContext.Provider>
  );
});

