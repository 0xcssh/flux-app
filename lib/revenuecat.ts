import Purchases, {
  PurchasesOfferings,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import type { PlanTier } from '@/types/subscription';

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';

let initialized = false;

export async function initRevenueCat(): Promise<void> {
  if (initialized) return;

  const apiKey = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;

  if (!apiKey) {
    console.warn('[RevenueCat] No API key found for platform:', Platform.OS);
    return;
  }

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  Purchases.configure({ apiKey });
  initialized = true;
}

export async function identifyUser(userId: string): Promise<void> {
  try {
    await Purchases.logIn(userId);
  } catch (error) {
    console.error('[RevenueCat] identifyUser error:', error);
  }
}

export async function getOfferings(): Promise<PurchasesOfferings | null> {
  try {
    return await Purchases.getOfferings();
  } catch (error) {
    console.error('[RevenueCat] getOfferings error:', error);
    return null;
  }
}

export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<{ customerInfo: CustomerInfo; success: boolean }> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { customerInfo, success: true };
  } catch (error: any) {
    if (error.userCancelled) {
      return { customerInfo: error.customerInfo, success: false };
    }
    throw error;
  }
}

export async function restorePurchases(): Promise<CustomerInfo> {
  return await Purchases.restorePurchases();
}

/**
 * Single call to get tier + trial status + offerings.
 * Avoids multiple getCustomerInfo calls that cause 429 rate limits.
 */
export async function getSubscriptionState(): Promise<{
  tier: PlanTier;
  isTrialActive: boolean;
  trialExpiresAt: Date | null;
  offerings: PurchasesOfferings | null;
}> {
  try {
    const [customerInfo, offerings] = await Promise.all([
      Purchases.getCustomerInfo(),
      Purchases.getOfferings(),
    ]);

    const tier = tierFromCustomerInfo(customerInfo);
    const premiumEntitlement = customerInfo.entitlements.active['premium'];
    const isTrialActive = premiumEntitlement?.periodType === 'TRIAL' || false;
    const trialExpiresAt = isTrialActive && premiumEntitlement?.expirationDate
      ? new Date(premiumEntitlement.expirationDate)
      : null;

    return { tier, isTrialActive, trialExpiresAt, offerings };
  } catch (error) {
    console.error('[RevenueCat] getSubscriptionState error:', error);
    return { tier: 'free', isTrialActive: false, trialExpiresAt: null, offerings: null };
  }
}

// Keep these for backward compat but prefer getSubscriptionState
export async function checkEntitlements(): Promise<PlanTier> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return tierFromCustomerInfo(customerInfo);
  } catch (error) {
    console.error('[RevenueCat] checkEntitlements error:', error);
    return 'free';
  }
}

export async function getTrialStatus(): Promise<{
  isActive: boolean;
  expiresAt: Date | null;
}> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const premiumEntitlement = customerInfo.entitlements.active['premium'];
    if (premiumEntitlement && premiumEntitlement.periodType === 'TRIAL') {
      return {
        isActive: true,
        expiresAt: premiumEntitlement.expirationDate
          ? new Date(premiumEntitlement.expirationDate)
          : null,
      };
    }
    return { isActive: false, expiresAt: null };
  } catch (error) {
    console.error('[RevenueCat] getTrialStatus error:', error);
    return { isActive: false, expiresAt: null };
  }
}

export function tierFromCustomerInfo(info: CustomerInfo): PlanTier {
  if (info.entitlements.active['pro']) return 'pro';
  if (info.entitlements.active['premium']) return 'premium';
  return 'free';
}

export function addCustomerInfoListener(
  callback: (info: CustomerInfo) => void,
): () => void {
  Purchases.addCustomerInfoUpdateListener(callback);
  return () => {};
}
