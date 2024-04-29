import React from 'react';
import 'antd/dist/antd.less';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GlobalContext } from './contexts/GlobalContext';
import { getAuthUser$ } from 'services/authService';
import { RoleRoute } from 'components/RoleRoute';
import { Subject } from 'rxjs';
import { ConfigProvider } from 'antd';
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
    setNotifyCount: count => { },
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

  const isLoggedIn = !isGuest;

  const { antdLocale, intlLocale, intlMessages } = localeDic[locale] || localeDic[DEFAULT_LOCALE];

  if(loading) {
    return <Loading loading={true} />
  }

  return (
    <GlobalContext.Provider value={contextValue}>
      <ConfigProvider locale={antdLocale}>
        <IntlProvider locale={intlLocale} messages={intlMessages}>
          <BrowserRouter basename="/">
            <Routes>
              <Route path={'/'} element={<PortalApp />} />
              {/* <Route path={'resources'} element={<PortalApp />} />
              <Route path={'/resources/:id'} element={<PortalApp />} /> */}
              <Route path="/login" element={<LogInPage />} />
              {/* {isGuest && <Route path="/signup" element={<SignUpPage />} />}
              {isGuest && <Route path="/signup/org" element={<OrgSignUpPage />} />}
              {isGuest && <Route path="/forgot_password" element={<ForgotPasswordPage />} />}
              <Route path="/reset_password" element={<ResetPasswordPage />} />
              <Route path="/terms_and_conditions" element={<TermAndConditionPage />} />
              <Route path="/privacy_policy" element={<PrivacyPolicyPage />} />
              {!isSystem && <Route path="/task/direct/:token" element={<TaskDirectPage />} />}
              <Route path="/*" element={<AppLoggedIn />} /> */}
              {/* <Redirect to="/" /> */}
              {/* <RoleRoute loading={loading} element={Error404} /> */}
              {/* <RoleRoute element={Error404} /> */}
            </Routes>
          </BrowserRouter>
        </IntlProvider>
      </ConfigProvider>
    </GlobalContext.Provider>
  );
});

