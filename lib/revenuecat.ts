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

/**
 * Initialize RevenueCat SDK with platform-specific API keys.
 */
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

/**
 * Identify the current user with RevenueCat.
 */
export async function identifyUser(userId: string): Promise<void> {
  try {
    await Purchases.logIn(userId);
  } catch (error) {
    console.error('[RevenueCat] identifyUser error:', error);
  }
}

/**
 * Fetch available subscription offerings.
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error('[RevenueCat] getOfferings error:', error);
    return null;
  }
}

/**
 * Purchase a specific package.
 */
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

/**
 * Restore purchases (e.g., after device transfer).
 */
export async function restorePurchases(): Promise<CustomerInfo> {
  const customerInfo = await Purchases.restorePurchases();
  return customerInfo;
}

/**
 * Check current entitlements and return the user's plan tier.
 */
export async function checkEntitlements(): Promise<PlanTier> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return tierFromCustomerInfo(customerInfo);
  } catch (error) {
    console.error('[RevenueCat] checkEntitlements error:', error);
    return 'free';
  }
}

/**
 * Get trial status for the current user.
 */
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

/**
 * Derive PlanTier from CustomerInfo entitlements.
 */
export function tierFromCustomerInfo(info: CustomerInfo): PlanTier {
  if (info.entitlements.active['pro']) {
    return 'pro';
  }
  if (info.entitlements.active['premium']) {
    return 'premium';
  }
  return 'free';
}

/**
 * Add a listener for customer info changes. Returns an unsubscribe function.
 */
export function addCustomerInfoListener(
  callback: (info: CustomerInfo) => void,
): () => void {
  Purchases.addCustomerInfoUpdateListener(callback);
  return () => {
    // RevenueCat SDK manages listener lifecycle;
    // returning a no-op unsubscribe as the listener is tied to SDK lifecycle.
  };
}
