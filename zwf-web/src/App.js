import React from 'react';
import 'antd/dist/antd.less';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { AppLoggedIn } from 'AppLoggedIn';
import PortalApp from 'pages/PortalApp';
import { Loading } from 'components/Loading';
import CookieConsent from "react-cookie-consent";
import HomePage from 'pages/HomePage';

const ClientTaskListPage = loadable(() => import('pages/ClientTask/ClientTaskListPage'));
const OrgListPage = loadable(() => import('pages/Org/OrgListPage'));
const SignUpPage = loadable(() => import('pages/SignUpPage'));
const LogInPage = loadable(() => import('pages/LogInPage'));
const ResetPasswordPage = loadable(() => import('pages/ResetPasswordPage'));
const ForgotPasswordPage = loadable(() => import('pages/ForgotPasswordPage'));
const PrivacyPolicyPage = loadable(() => import('pages/PrivacyPolicyPage'));
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
const ClientTaskPage = loadable(() => import('pages/Org/ClientTaskPage'));
const ClientTrackingListPage = loadable(() => import('pages/ClientTask/ClientTrackingListPage'));
const ResourceEditPage = loadable(() => import('pages/ResourcePage/ResourceEditPage'));

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

  const globalContextValue = {
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
  }

  const [contextValue, setContextValue] = React.useState(globalContextValue);


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

      contextValue.setLocale(user?.profile?.locale || DEFAULT_LOCALE);
    }
  }, [user]);

  const role = contextValue.role || 'guest';
  const isGuest = role === 'guest';
  const isClient = role === 'client';
  const isAdmin = role === 'admin';
  const isSystem = role === 'system';
  const isAgent = role === 'agent';

  const isLoggedIn = !isGuest;

  const { antdLocale, intlLocale, intlMessages } = localeDic[locale] || localeDic[DEFAULT_LOCALE];

  if (loading) {
    return <Row>
      <Loading loading={true} />
    </Row>
  }

  return (
    <GlobalContext.Provider value={contextValue}>
      <ConfigProvider locale={antdLocale}>
        <IntlProvider locale={intlLocale} messages={intlMessages}>
          <BrowserRouter basename="/">
            <Routes>
              <Route path={'/'} element={<PortalApp />} >
                <Route index element={<HomePage />} />
                <Route path="resource" element={<ResourceListPage />} />
                <Route path="resource/:id" element={<ResourcePage />} />
              </Route>
              <Route path="/terms_and_conditions" element={<TermAndConditionPage />} />
              <Route path="/privacy_policy" element={<PrivacyPolicyPage />} />
              {isGuest && <Route path="/login" element={<LogInPage />} />}
              {isGuest && <Route path="/signup" element={<SignUpPage />} />}
              {isGuest && <Route path="/signup/org" element={<OrgSignUpPage />} />}
              {isGuest && <Route path="/forgot_password" element={<ForgotPasswordPage />} />}
              {isGuest && <Route path="/reset_password" element={<ResetPasswordPage />} />}
              {isAdmin && <Route path="/onboard" element={<OrgOnBoardPage />} />}
              {!isSystem && <Route path="/task/direct/:token" element={<TaskDirectPage />} />}
              {!isGuest && <Route path="/" element={<AppLoggedIn />} >
                {isSystem && <Route path="/task" element={<SystemBoardPage />} />}
                {isClient && <Route path="/task" element={<ClientTaskListPage />} />}
                {(isAdmin || isAgent) && <Route path="/task" element={<OrgTaskListPage />} />}
                {isClient && <Route path="/task/:id" element={<ClientTaskPage />} />}
                {(isAdmin || isAgent) && <Route path="/task/:id" element={<OrgTaskPage />} />}
                {isClient && <Route path="/activity" element={<ClientTrackingListPage />} />}
                <Route path="/doc_template" element={<DocTemplateListPage />} />
                <Route path="/doc_template/new" element={<DocTemplatePage />} />
                <Route path="/doc_template/:id" element={<DocTemplatePage />} />
                <Route path="/task_template" element={<TaskTemplateListPage />} />
                <Route path="/task_template/new" element={<TaskTemplatePage />} />
                <Route path="/task_template/:id" element={<TaskTemplatePage />} />
                <Route path="/scheduler" element={<RecurringListPage />} />
                <Route path="/client" element={<OrgClientListPage />} />
                <Route path="/tags" element={<TagsSettingPage />} />
                <Route path="/account" element={<OrgAccountPage />} />
                <Route path="/team" element={<OrgMemberListPage />} />
                <Route path="/config" element={<ConfigListPage />} />
                <Route path="/org" element={<OrgListPage />} />
                <Route path="/support" element={<SupportListPage />} />
                <Route path="/manage/resource" element={<ResourceListPage />} />
                <Route path="/manage/resource/new" element={<ResourceEditPage />} />
                <Route path="/manage/resource/:id" element={<ResourceEditPage />} />
                <Route path="/revenue" element={<RevenuePage />} />
              </Route>}
              {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
            </Routes>
          </BrowserRouter>
          <CookieConsent location="bottom" overlay={false} expires={365} buttonStyle={{ borderRadius: 4 }} buttonText="Accept">
            We use cookies to improve your experiences on our website.
          </CookieConsent>
        </IntlProvider>
      </ConfigProvider>
    </GlobalContext.Provider>
  );
});

