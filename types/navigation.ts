export type RootStackParamList = {
  '(auth)': undefined;
  '(onboarding)': undefined;
  '(tabs)': undefined;
  '(modals)/paywall': undefined;
  '(modals)/article/[id]': { id: string };
  '(modals)/pdf-preview': { uri: string };
  '(modals)/nofap-details': undefined;
};

export type AuthStackParamList = {
  login: undefined;
  signup: undefined;
  'forgot-password': undefined;
};

export type OnboardingStackParamList = {
  welcome: undefined;
  circadian: undefined;
  infradian: undefined;
  setup: undefined;
  trial: undefined;
};

export type TabParamList = {
  index: undefined;
  cycle: undefined;
  log: undefined;
  insights: undefined;
  profile: undefined;
};

export type ModalParams = {
  articleId?: string;
  pdfUri?: string;
};
