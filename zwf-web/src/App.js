import React from 'react';
import 'antd/dist/antd.less';
import { BrowserRouter, Switch } from 'react-router-dom';
import HomePage from 'pages/HomePage';
import { GlobalContext } from './contexts/GlobalContext';
import { getAuthUser$ } from 'services/authService';
import { RoleRoute } from 'components/RoleRoute';
import { ContactWidget } from 'components/ContactWidget';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import ReactDOM from 'react-dom';
import { ConfigProvider } from 'antd';
import loadable from '@loadable/component'
import { IntlProvider } from "react-intl";
import antdLocaleEN from 'antd/lib/locale/en_US';
import antdLocaleZH from 'antd/lib/locale/zh_CN';
import intlMessagesEN from "./translations/en-US.json";
import intlMessagesZH from "./translations/zh-CN.json";
import { getDefaultLocale } from './util/getDefaultLocale';
import { reactLocalStorage } from 'reactjs-localstorage';
import { AppClient } from 'AppClient';
import { AppLoggedIn } from 'AppLoggedIn';
import { listTags$ } from 'services/tagService';
import { last, tap, switchMap, share } from 'rxjs/operators';
import { concat, EMPTY, of } from 'rxjs';

const SignUpPage = loadable(() => import('pages/SignUpPage'));
const Error404 = loadable(() => import('pages/Error404'));
const LogInPage = loadable(() => import('pages/LogInPage'));
const ResetPasswordPage = loadable(() => import('pages/ResetPasswordPage'));
const ForgotPasswordPage = loadable(() => import('pages/ForgotPasswordPage'));
const PrivacyPolicyPage = loadable(() => import('pages/PrivacyPolicyPage'));
const TermAndConditionPage = loadable(() => import('pages/TermAndConditionPage'));
const BlogsPage = loadable(() => import('pages/BlogsPage'));
const OrgSignUpPage = loadable(() => import('pages/Org/OrgSignUpPage'));
const OrgOnBoardPage = loadable(() => import('pages/Org/OrgOnBoardPage'));
const TaskDirectPage = loadable(() => import('pages/MyTask/TaskDirectPage'))

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

  const Initalize = () => {
    return getAuthUser$().subscribe(user => {
      setUser(user);
      setLoading(false);
    })
  }

  React.useEffect(() => {
    const sub$ = Initalize();
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

  const isLoggedIn = !isGuest;

  const { antdLocale, intlLocale, intlMessages } = localeDic[locale] || localeDic[DEFAULT_LOCALE];

  return (
    <GlobalContext.Provider value={contextValue}>
      <ConfigProvider locale={antdLocale}>
        <IntlProvider locale={intlLocale} messages={intlMessages}>
          <BrowserRouter basename="/">
            <Switch>
              <RoleRoute visible={isGuest} loading={loading} exact path="/login" component={LogInPage} />
              <RoleRoute visible={isGuest} loading={loading} exact path="/signup" component={SignUpPage} />
              <RoleRoute visible={isGuest} loading={loading} exact path="/signup/org" component={OrgSignUpPage} />
              <RoleRoute visible={isGuest} loading={loading} exact path="/forgot_password" component={ForgotPasswordPage} />
              <RoleRoute visible={isGuest} exact path="/task/direct/:token" component={TaskDirectPage} />
              <RoleRoute visible={isAdmin} loading={loading} exact path="/onboard" component={OrgOnBoardPage} />
              <RoleRoute loading={loading} exact path="/reset_password" component={ResetPasswordPage} />
              <RoleRoute loading={loading} exact path="/terms_and_conditions" component={TermAndConditionPage} />
              <RoleRoute loading={loading} exact path="/privacy_policy" component={PrivacyPolicyPage} />
              <RoleRoute loading={loading} path="/blogs" exact component={BlogsPage} />
              <RoleRoute loading={loading} path="/" exact component={HomePage} />
              <RoleRoute loading={loading} path="/" component={isLoggedIn ? (isClient ? AppClient : AppLoggedIn) : HomePage} />
              {/* <Redirect to="/" /> */}
              <RoleRoute loading={loading} component={Error404} />
            </Switch>
          </BrowserRouter>
          {isGuest && <ContactWidget />}
        </IntlProvider>
      </ConfigProvider>
    </GlobalContext.Provider>
  );
});

