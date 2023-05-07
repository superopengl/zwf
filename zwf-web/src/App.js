import React from 'react';
// import 'antd/dist/antd.less';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import { GlobalContext } from './contexts/GlobalContext';
import { getAuthUser$ } from 'services/authService';
import { finalize, Subject } from 'rxjs';
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
import { HomePage } from 'pages/HomePage';
import { Navigate } from 'react-router-dom';
import { Error404 } from 'pages/Error404';
import { LandingPage } from 'pages/LandingPage';
import 'dayjs/locale/en-au';

const OrgClientPage = loadable(() => import('pages/User/OrgClientPage'));
const OrgArchivedTasksPage = loadable(() => import('pages/OrgBoard/OrgArchivedTasksPage'));
const OrgListPage = loadable(() => import('pages/Org/OrgListPage'));
const LogInPage = loadable(() => import('pages/LogInPage'));
const ActivateAccountPage = loadable(() => import('pages/ActivateAccountPage'));
const ForgotPasswordPage = loadable(() => import('pages/ForgotPasswordPage'));
const PrivacyPolicyPage = loadable(() => import('pages/PrivacyPolicyPage'));
const OrgResurgingPage = loadable(() => import('pages/OrgResurgingPage'));
const TermAndConditionPage = loadable(() => import('pages/TermOfUsePage'));
const OrgSignUpPage = loadable(() => import('pages/Org/OrgSignUpPage'));
const OrgOnBoardPage = loadable(() => import('pages/Org/OrgOnBoardPage'));
const TaskDirectPage = loadable(() => import('pages/MyTask/TaskDirectPage'))
const ResourceListPage = loadable(() => import('pages/ResourcePage/ResourceListPage'))
const ResourcePage = loadable(() => import('pages/ResourcePage/ResourcePage'))
const SystemBoardPage = loadable(() => import('pages/SystemBoard/SystemBoardPage'));
const OrgTagListPage = loadable(() => import('pages/OrgTagListPage/OrgTagListPage'));
const ConfigListPage = loadable(() => import('pages/Config/ConfigListPage'));
const OrgMemberListPage = loadable(() => import('pages/User/OrgMemberListPage'));
const OrgClientListPage = loadable(() => import('pages/User/OrgClientListPage'));
const SupportListPage = loadable(() => import('pages/Support/SupportListPage'));
const OrgSubscriptionPage = loadable(() => import('pages/OrgSubscription/OrgSubscriptionPage'));
const RevenuePage = loadable(() => import('pages/AdminDashboard/RevenuePage'));
const DocTemplateListPage = loadable(() => import('pages/DocTemplate/DocTemplateListPage'));
const DocTemplatePage = loadable(() => import('pages/DocTemplate/DocTemplatePage'));
const FemplateListPage = loadable(() => import('pages/Femplate/FemplateListPage'));
const FemplatePage = loadable(() => import('pages/Femplate/FemplatePage'));
const RecurringListPage = loadable(() => import('pages/Recurring/RecurringListPage'));
const TaskPage = loadable(() => import('pages/TaskPage'));
const TaskListPage = loadable(() => import('pages/TaskListPage'));
const ClientCommentListPage = loadable(() => import('pages/ClientTask/ClientCommentListPage'));
const ResourceEditPage = loadable(() => import('pages/ResourcePage/ResourceEditPage'));
const ResourceEditListPage = loadable(() => import('pages/ResourcePage/ResourceEditListPage'));
const OrgTaskEditPage = loadable(() => import('pages/MyTask/OrgTaskEditPage'));

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
  const contextValueRef = React.useRef({
    zeventBus$: new Subject(),
    user: null,
    setLoading,
    setLocale: locale => {
      reactLocalStorage.set('locale', locale);
      setLocale(locale);
    },
  });

  React.useEffect(() => {
    const sub$ = getAuthUser$()
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(user => {
        const context = contextValueRef.current;
        if (user !== context.user) {
          context.user = user;
        }
      })
    return () => sub$.unsubscribe()
  }, []);


  const { antdLocale, intlLocale, intlMessages } = localeDic[locale] || localeDic[DEFAULT_LOCALE];

  if (loading) {
    return <Row justify='center' align='center' style={{ height: 400, alignItems: 'center' }}>
      <Loading loading={true} />
    </Row>
  }

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/">

        <Route path="/terms_of_use" element={<TermAndConditionPage />} />
        <Route path="/privacy_policy" element={<PrivacyPolicyPage />} />
        <Route path="/login" element={<LogInPage />} />
        <Route path="/signup/org" element={<OrgSignUpPage />} />
        <Route path="/forgot_password" element={<ForgotPasswordPage />} />
        <Route path="/activate" element={<ActivateAccountPage />} />
        <Route path="/resurge/:code" element={<OrgResurgingPage />} />
        <Route path="/task/direct/:token" element={<TaskDirectPage />} />
        <Route path="/onboard" element={<OrgOnBoardPage />} />

        <Route path="/landing" element={<LandingPage />} />

        <Route path="/" element={<AppLoggedInPage />} >
          <Route path="/sysboard" element={<SystemBoardPage />} />
          <Route path="/task" element={<TaskListPage />} />
          <Route path="/task/:id" element={<TaskPage />} />
          <Route path="/task/:id/edit" element={<OrgTaskEditPage />} />
          <Route path="/activity" element={<ClientCommentListPage />} />
          <Route path="/demplate" element={<DocTemplateListPage />} />
          <Route path="/demplate/new" element={<DocTemplatePage />} />
          <Route path="/demplate/:id" element={<DocTemplatePage />} />
          <Route path="/femplate" element={<FemplateListPage />} />
          <Route path="/femplate/new" element={<FemplatePage />} />
          <Route path="/femplate/:id" element={<FemplatePage />} />
          <Route path="/recurring" element={<RecurringListPage />} />
          <Route path="/trash" element={<OrgArchivedTasksPage />} />
          <Route path="/client" element={<OrgClientListPage />} />
          <Route path="/client/:id" element={<OrgClientPage />} />
          <Route path="/tags" element={<OrgTagListPage />} />
          <Route path="/subscription" element={<OrgSubscriptionPage />} />
          <Route path="/team" element={<OrgMemberListPage />} />
          <Route path="/config" element={<ConfigListPage />} />
          <Route path="/org" element={<OrgListPage />} />
          <Route path="/support" element={<SupportListPage />} />
          <Route path="/manage/resource" element={<ResourceEditListPage />} />
          <Route path="/manage/resource/new" element={<ResourceEditPage />} />
          <Route path="/manage/resource/:id" element={<ResourceEditPage />} />
          <Route path="/revenue" element={<RevenuePage />} />
        </Route>

        <Route path={'/'} element={<PortalPage />} >
          <Route index element={<HomePage />} />
          <Route path="/resource" element={<ResourceListPage />} />
          <Route path="/resource/:key" element={<ResourcePage />} />
        </Route>

        <Route path="/404" element={<Error404 />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    )
  )

  return (
    <GlobalContext.Provider value={contextValueRef.current}>
      <ConfigProvider
        // locale={locale}
        locale={antdLocale}
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
            colorInfo: '#0FBFC4',
            // colorInfo: '#0051D9',
            colorWarning: '#F7BA1E',
            colorLink: '#0051D9',
            colorSuccess: '#00B42A',
            colorError: '#F53F3F',
            // borderRadius: 6,
            colorTextBase: '#4B5B76',
            colorText: '#4B5B76',
            colorTextSecondary: '#818c9f',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
            colorTextHeading: '#1C222B',
            colorTextPlaceholder: '#97A3B788',
            fontSizeHeading1: 32,
            fontSizeHeading2: 28,
            fontSizeHeading3: 22,
            fontSizeHeading4: 18,
          }
        }}
      >
        <IntlProvider locale={intlLocale} messages={intlMessages}>
          <RouterProvider router={router} />
          {/* <CookieConsent location="bottom" overlay={false} expires={365} buttonStyle={{ borderRadius: 4 }} buttonText="Accept">
            We use cookies to improve your experiences on our website.
          </CookieConsent> */}
          {/* <DebugJsonPanel value={user} /> */}
        </IntlProvider>
      </ConfigProvider>
    </GlobalContext.Provider>
  );
});

