import PostHog from 'posthog-react-native';

const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '';
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com';

let posthogClient: PostHog | null = null;

/**
 * Initialize PostHog analytics.
 */
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

/**
 * Track a named event with optional properties.
 */
export function track(event: string, properties?: Record<string, any>): void {
  try {
    posthogClient?.capture(event, properties);
  } catch (error) {
    console.error('[Analytics] track error:', error);
  }
}

/**
 * Identify a user with optional traits.
 */
export function identify(userId: string, traits?: Record<string, any>): void {
  try {
    posthogClient?.identify(userId, traits);
  } catch (error) {
    console.error('[Analytics] identify error:', error);
  }
}

// Key event constants for type-safe tracking
export const AnalyticsEvents = {
  ONBOARDING_COMPLETED: 'onboarding_completed',
  TRIAL_STARTED: 'trial_started',
  TRIAL_SKIPPED: 'trial_skipped',
  LOG_SUBMITTED: 'log_submitted',
  SUBSCRIPTION_PURCHASED: 'subscription_purchased',
  PAYWALL_VIEWED: 'paywall_viewed',
  PAYWALL_DISMISSED: 'paywall_dismissed',
  INSIGHT_VIEWED: 'insight_viewed',
  PDF_EXPORTED: 'pdf_exported',
} as const;
