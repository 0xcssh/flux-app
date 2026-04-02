import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import enCommon from './en/common.json';
import enDashboard from './en/dashboard.json';
import enCycle from './en/cycle.json';
import enLog from './en/log.json';
import enInsights from './en/insights.json';
import enProfile from './en/profile.json';
import enOnboarding from './en/onboarding.json';
import enNofap from './en/nofap.json';
import enArticles from './en/articles.json';

import frCommon from './fr/common.json';
import frDashboard from './fr/dashboard.json';
import frCycle from './fr/cycle.json';
import frLog from './fr/log.json';
import frInsights from './fr/insights.json';
import frProfile from './fr/profile.json';
import frOnboarding from './fr/onboarding.json';
import frNofap from './fr/nofap.json';
import frArticles from './fr/articles.json';

const deviceLanguage = getLocales()?.[0]?.languageCode ?? 'en';

export const defaultNS = 'common';
export const namespaces = [
  'common',
  'dashboard',
  'cycle',
  'log',
  'insights',
  'profile',
  'onboarding',
  'nofap',
  'articles',
] as const;

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: deviceLanguage,
  fallbackLng: 'en',
  defaultNS,
  ns: [...namespaces],
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: {
      common: enCommon,
      dashboard: enDashboard,
      cycle: enCycle,
      log: enLog,
      insights: enInsights,
      profile: enProfile,
      onboarding: enOnboarding,
      nofap: enNofap,
      articles: enArticles,
    },
    fr: {
      common: frCommon,
      dashboard: frDashboard,
      cycle: frCycle,
      log: frLog,
      insights: frInsights,
      profile: frProfile,
      onboarding: frOnboarding,
      nofap: frNofap,
      articles: frArticles,
    },
  },
});

export default i18n;
