import { useState, useEffect, useCallback, useRef } from 'react';
import { PurchasesPackage, PurchasesOfferings } from 'react-native-purchases';
import type { PlanTier } from '@/types/subscription';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import {
  initRevenueCat,
  getOfferings,
  purchasePackage,
  restorePurchases,
  checkEntitlements,
  getTrialStatus,
  addCustomerInfoListener,
  tierFromCustomerInfo,
} from '@/lib/revenuecat';

type FeatureKey =
  | 'insights'
  | 'infradian'
  | 'pdf_export'
  | 'unlimited_history'
  | 'action_plan'
  | 'trt_tracking'
  | 'ai_coaching'
  | 'challenges';

const PREMIUM_FEATURES: FeatureKey[] = [
  'insights',
  'infradian',
  'pdf_export',
  'unlimited_history',
  'action_plan',
  'challenges',
];

const PRO_FEATURES: FeatureKey[] = ['trt_tracking', 'ai_coaching'];

// Module-level flag to prevent multiple RevenueCat inits
let _rcInitialized = false;

interface UseSubscriptionReturn {
  tier: PlanTier;
  isPremium: boolean;
  isPro: boolean;
  isTrialActive: boolean;
  trialExpiresAt: Date | null;
  canAccess: (feature: FeatureKey) => boolean;
  offerings: PurchasesOfferings | null;
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<void>;
  isLoading: boolean;
}

export function useSubscription(): UseSubscriptionReturn {
  // Read from Zustand store (source of truth)
  const tier = useSubscriptionStore((s) => s.tier);
  const storeTrial = useSubscriptionStore((s) => s.isTrialActive);
  const storeTrialExpiry = useSubscriptionStore((s) => s.trialExpiresAt);
  const setSubscription = useSubscriptionStore((s) => s.setSubscription);

  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const isTrialActive = storeTrial;
  const trialExpiresAt = storeTrialExpiry ? new Date(storeTrialExpiry) : null;

  useEffect(() => {
    if (_rcInitialized) {
      setIsLoading(false);
      return;
    }
    _rcInitialized = true;
    let mounted = true;

    async function init() {
      try {
        await initRevenueCat();

        const [currentTier, trialStatus, currentOfferings] = await Promise.all([
          checkEntitlements(),
          getTrialStatus(),
          getOfferings(),
        ]);

        if (!mounted) return;

        setSubscription(currentTier, trialStatus.expiresAt?.toISOString() ?? null);
        setOfferings(currentOfferings);

        unsubscribeRef.current = addCustomerInfoListener((info) => {
          if (!mounted) return;
          const newTier = tierFromCustomerInfo(info);
          const premiumEntitlement = info.entitlements.active['premium'];
          const expiry = premiumEntitlement?.expirationDate ?? null;
          setSubscription(newTier, expiry);
        });
      } catch (error) {
        console.error('[useSubscription] init error:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
      unsubscribeRef.current?.();
    };
  }, []);

  const isPremium = tier === 'premium' || tier === 'pro';
  const isPro = tier === 'pro';

  const canAccess = useCallback(
    (feature: FeatureKey): boolean => {
      if (PRO_FEATURES.includes(feature)) {
        return isPro;
      }
      if (PREMIUM_FEATURES.includes(feature)) {
        return isPremium;
      }
      return true;
    },
    [isPremium, isPro],
  );

  const purchase = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await purchasePackage(pkg);
      if (result.success) {
        const newTier = tierFromCustomerInfo(result.customerInfo);
        const expiry = result.customerInfo.entitlements.active['premium']?.expirationDate ?? null;
        setSubscription(newTier, expiry);
      }
      return result.success;
    } catch (error) {
      console.error('[useSubscription] purchase error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setSubscription]);

  const restore = useCallback(async () => {
    try {
      setIsLoading(true);
      const info = await restorePurchases();
      const newTier = tierFromCustomerInfo(info);
      const expiry = info.entitlements.active['premium']?.expirationDate ?? null;
      setSubscription(newTier, expiry);
    } catch (error) {
      console.error('[useSubscription] restore error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setSubscription]);

  return {
    tier,
    isPremium,
    isPro,
    isTrialActive,
    trialExpiresAt,
    canAccess,
    offerings,
    purchase,
    restore,
    isLoading,
  };
}
