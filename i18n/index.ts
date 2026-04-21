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
import enNotifications from './en/notifications.json';

import frCommon from './fr/common.json';
import frDashboard from './fr/dashboard.json';
import frCycle from './fr/cycle.json';
import frLog from './fr/log.json';
import frInsights from './fr/insights.json';
import frProfile from './fr/profile.json';
import frOnboarding from './fr/onboarding.json';
import frNofap from './fr/nofap.json';
import frArticles from './fr/articles.json';
import frNotifications from './fr/notifications.json';

import esCommon from './es/common.json';
import esDashboard from './es/dashboard.json';
import esCycle from './es/cycle.json';
import esLog from './es/log.json';
import esInsights from './es/insights.json';
import esProfile from './es/profile.json';
import esOnboarding from './es/onboarding.json';
import esNofap from './es/nofap.json';
import esArticles from './es/articles.json';
import esNotifications from './es/notifications.json';

import itCommon from './it/common.json';
import itDashboard from './it/dashboard.json';
import itCycle from './it/cycle.json';
import itLog from './it/log.json';
import itInsights from './it/insights.json';
import itProfile from './it/profile.json';
import itOnboarding from './it/onboarding.json';
import itNofap from './it/nofap.json';
import itArticles from './it/articles.json';
import itNotifications from './it/notifications.json';

import deCommon from './de/common.json';
import deDashboard from './de/dashboard.json';
import deCycle from './de/cycle.json';
import deLog from './de/log.json';
import deInsights from './de/insights.json';
import deProfile from './de/profile.json';
import deOnboarding from './de/onboarding.json';
import deNofap from './de/nofap.json';
import deArticles from './de/articles.json';
import deNotifications from './de/notifications.json';

import ptCommon from './pt/common.json';
import ptDashboard from './pt/dashboard.json';
import ptCycle from './pt/cycle.json';
import ptLog from './pt/log.json';
import ptInsights from './pt/insights.json';
import ptProfile from './pt/profile.json';
import ptOnboarding from './pt/onboarding.json';
import ptNofap from './pt/nofap.json';
import ptArticles from './pt/articles.json';
import ptNotifications from './pt/notifications.json';

import nlCommon from './nl/common.json';
import nlDashboard from './nl/dashboard.json';
import nlCycle from './nl/cycle.json';
import nlLog from './nl/log.json';
import nlInsights from './nl/insights.json';
import nlProfile from './nl/profile.json';
import nlOnboarding from './nl/onboarding.json';
import nlNofap from './nl/nofap.json';
import nlArticles from './nl/articles.json';
import nlNotifications from './nl/notifications.json';

const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'it', 'de', 'pt', 'nl'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

function detectDeviceLanguage(): SupportedLanguage {
  try {
    const locales = getLocales();
    const primary = locales[0]?.languageCode;
    if (primary && (SUPPORTED_LANGUAGES as readonly string[]).includes(primary)) {
      return primary as SupportedLanguage;
    }
  } catch (e) {
    console.warn('[i18n] Failed to detect device language:', e);
  }
  return 'en';
}

const deviceLanguage = detectDeviceLanguage();

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
  'notifications',
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
      notifications: enNotifications,
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
      notifications: frNotifications,
    },
    es: {
      common: esCommon,
      dashboard: esDashboard,
      cycle: esCycle,
      log: esLog,
      insights: esInsights,
      profile: esProfile,
      onboarding: esOnboarding,
      nofap: esNofap,
      articles: esArticles,
      notifications: esNotifications,
    },
    it: {
      common: itCommon,
      dashboard: itDashboard,
      cycle: itCycle,
      log: itLog,
      insights: itInsights,
      profile: itProfile,
      onboarding: itOnboarding,
      nofap: itNofap,
      articles: itArticles,
      notifications: itNotifications,
    },
    de: {
      common: deCommon,
      dashboard: deDashboard,
      cycle: deCycle,
      log: deLog,
      insights: deInsights,
      profile: deProfile,
      onboarding: deOnboarding,
      nofap: deNofap,
      articles: deArticles,
      notifications: deNotifications,
    },
    pt: {
      common: ptCommon,
      dashboard: ptDashboard,
      cycle: ptCycle,
      log: ptLog,
      insights: ptInsights,
      profile: ptProfile,
      onboarding: ptOnboarding,
      nofap: ptNofap,
      articles: ptArticles,
      notifications: ptNotifications,
    },
    nl: {
      common: nlCommon,
      dashboard: nlDashboard,
      cycle: nlCycle,
      log: nlLog,
      insights: nlInsights,
      profile: nlProfile,
      onboarding: nlOnboarding,
      nofap: nlNofap,
      articles: nlArticles,
      notifications: nlNotifications,
    },
  },
});

export default i18n;
