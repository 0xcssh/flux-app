import { useState, useEffect, useCallback, useRef } from 'react';
import { PurchasesPackage, PurchasesOfferings } from 'react-native-purchases';
import type { PlanTier } from '@/types/subscription';
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
  | 'trt_tracking'
  | 'ai_coaching';

const PREMIUM_FEATURES: FeatureKey[] = [
  'insights',
  'infradian',
  'pdf_export',
  'unlimited_history',
];

const PRO_FEATURES: FeatureKey[] = ['trt_tracking', 'ai_coaching'];

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
  const [tier, setTier] = useState<PlanTier>('free');
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [trialExpiresAt, setTrialExpiresAt] = useState<Date | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
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

        setTier(currentTier);
        setIsTrialActive(trialStatus.isActive);
        setTrialExpiresAt(trialStatus.expiresAt);
        setOfferings(currentOfferings);

        // Listen for subscription changes
        unsubscribeRef.current = addCustomerInfoListener((info) => {
          if (!mounted) return;
          setTier(tierFromCustomerInfo(info));

          const premiumEntitlement = info.entitlements.active['premium'];
          if (premiumEntitlement && premiumEntitlement.periodType === 'TRIAL') {
            setIsTrialActive(true);
            setTrialExpiresAt(
              premiumEntitlement.expirationDate
                ? new Date(premiumEntitlement.expirationDate)
                : null,
            );
          } else {
            setIsTrialActive(false);
            setTrialExpiresAt(null);
          }
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
        setTier(tierFromCustomerInfo(result.customerInfo));
      }
      return result.success;
    } catch (error) {
      console.error('[useSubscription] purchase error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const restore = useCallback(async () => {
    try {
      setIsLoading(true);
      const info = await restorePurchases();
      setTier(tierFromCustomerInfo(info));
    } catch (error) {
      console.error('[useSubscription] restore error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
