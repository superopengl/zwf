import { reactLocalStorage } from 'reactjs-localstorage';

function getNavigatorLocale() {
  const navigatorLang = navigator.language.split(/[-_]/)[0];
  const navigatorLocale = navigatorLang === 'en' ? 'en-US' :
    navigatorLang === 'zh' ? 'zh-CN' :
      'en-US';
  return navigatorLocale;
}

export function getDefaultLocale() {
  return reactLocalStorage.get('locale') || getNavigatorLocale();
}