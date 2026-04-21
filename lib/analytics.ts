import PostHog from 'posthog-react-native';

const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '';
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com';

let posthogClient: PostHog | null = null;

export async function initAnalytics(): Promise<void> {
  if (posthogClient) return;
  if (!POSTHOG_KEY) {
    console.warn('[Analytics] No PostHog key found');
    return;
  }

  try {
    posthogClient = new PostHog(POSTHOG_KEY, {
      host: POSTHOG_HOST,
      enableSessionReplay: false,
    });
  } catch (error) {
    console.error('[Analytics] init error:', error);
  }
}

export function track(event: string, properties?: Record<string, any>): void {
  try {
    posthogClient?.capture(event, properties);
  } catch (error) {
    console.error('[Analytics] track error:', error);
  }
}

export function identify(userId: string, traits?: Record<string, any>): void {
  try {
    posthogClient?.identify(userId, traits);
  } catch (error) {
    console.error('[Analytics] identify error:', error);
  }
}

export interface UserProperties {
  tier?: 'free' | 'premium';
  isTrialActive?: boolean;
  language?: string;
  hormonalProfile?: string;
  nofapActive?: boolean;
  nofapStreakDays?: number;
  totalLogs?: number;
  signupDate?: string;
}

export function setUserProperties(props: UserProperties): void {
  try {
    posthogClient?.register(props as Record<string, any>);
  } catch (error) {
    console.error('[Analytics] setUserProperties error:', error);
  }
}

export function resetAnalytics(): void {
  try {
    posthogClient?.reset();
  } catch (error) {
    console.error('[Analytics] reset error:', error);
  }
}

export const AnalyticsEvents = {
  APP_OPENED: 'app_opened',

  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_STEP_VIEWED: 'onboarding_step_viewed',
  QUIZ_COMPLETED: 'quiz_completed',
  ONBOARDING_COMPLETED: 'onboarding_completed',

  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  LOGIN_COMPLETED: 'login_completed',
  LOGOUT: 'logout',

  LOG_SUBMITTED: 'log_submitted',
  LOG_BACKFILLED: 'log_backfilled',
  LOG_UPDATED: 'log_updated',

  TRIAL_STARTED: 'trial_started',
  TRIAL_SKIPPED: 'trial_skipped',
  SUBSCRIPTION_PURCHASED: 'subscription_purchased',
  SUBSCRIPTION_RESTORED: 'subscription_restored',
  PAYWALL_VIEWED: 'paywall_viewed',
  PAYWALL_DISMISSED: 'paywall_dismissed',

  INSIGHT_VIEWED: 'insight_viewed',
  ARTICLE_OPENED: 'article_opened',
  PDF_EXPORTED: 'pdf_exported',

  SHARE_ATTEMPTED: 'share_attempted',
  SHARE_COMPLETED: 'share_completed',

  NOFAP_TOGGLED: 'nofap_toggled',
  NOFAP_STREAK_BROKEN: 'nofap_streak_broken',
  NOFAP_MILESTONE_REACHED: 'nofap_milestone_reached',

  CHALLENGE_STARTED: 'challenge_started',
  CHALLENGE_COMPLETED: 'challenge_completed',
  CHALLENGE_ABANDONED: 'challenge_abandoned',

  NOTIFICATION_OPENED: 'notification_opened',
  NOTIFICATION_PERMISSION_RESPONDED: 'notification_permission_responded',

  TRACKING_PERMISSION_RESPONDED: 'tracking_permission_responded',
  ADS_ATTRIBUTION_RECEIVED: 'ads_attribution_received',

  PREMIUM_FEATURE_BLOCKED: 'premium_feature_blocked',
  PREMIUM_FEATURE_USED: 'premium_feature_used',
} as const;
