import { Linking, Platform } from 'react-native';
import * as StoreReview from 'expo-store-review';
import { useSettingsStore } from '@/store/settingsStore';
import { track, AnalyticsEvents } from '@/lib/analytics';

const MIN_DAYS_BETWEEN_PROMPTS = 60;
const MAX_PROMPTS_PER_YEAR = 3;
const APP_STORE_URL = 'https://apps.apple.com/app/id6761628489';

export function canShowReviewPrompt(): boolean {
  const { lastReviewPromptAt, reviewPromptCount, hasRespondedToReview } =
    useSettingsStore.getState();

  if (hasRespondedToReview) return false;
  if (reviewPromptCount >= MAX_PROMPTS_PER_YEAR) return false;

  if (lastReviewPromptAt) {
    const last = new Date(lastReviewPromptAt).getTime();
    const daysSince = (Date.now() - last) / (1000 * 60 * 60 * 24);
    if (daysSince < MIN_DAYS_BETWEEN_PROMPTS) return false;
  }

  return true;
}

export async function requestNativeReview(): Promise<void> {
  try {
    track(AnalyticsEvents.REVIEW_NATIVE_REQUESTED);
    const isAvailable = await StoreReview.isAvailableAsync();
    if (isAvailable) {
      await StoreReview.requestReview();
    } else {
      await openAppStoreReviewPage();
    }
  } catch (e) {
    console.warn('[ReviewPrompt] requestNativeReview error:', e);
  }
}

export async function openAppStoreReviewPage(): Promise<void> {
  if (Platform.OS !== 'ios') return;
  try {
    await Linking.openURL(APP_STORE_URL + '?action=write-review');
  } catch (e) {
    console.warn('[ReviewPrompt] openAppStoreReviewPage error:', e);
  }
}

export function recordPromptShown(): void {
  useSettingsStore.getState().recordReviewPromptShown();
  track(AnalyticsEvents.REVIEW_PROMPT_SHOWN);
}

export function recordPositiveResponse(): void {
  useSettingsStore.getState().setHasRespondedToReview(true);
  track(AnalyticsEvents.REVIEW_RESPONSE, { response: 'positive' });
}

export function recordNegativeResponse(): void {
  useSettingsStore.getState().setHasRespondedToReview(true);
  track(AnalyticsEvents.REVIEW_RESPONSE, { response: 'negative' });
}

export function recordDismissedResponse(): void {
  track(AnalyticsEvents.REVIEW_RESPONSE, { response: 'dismissed' });
}
