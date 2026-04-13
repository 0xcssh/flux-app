import { useState, useEffect, useCallback, useRef } from 'react';
import {
  PurchasesPackage,
  PurchasesOfferings,
  PurchasesStoreProduct,
} from 'react-native-purchases';
import type { PlanTier } from '@/types/subscription';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import {
  initRevenueCat,
  getSubscriptionState,
  purchasePackage,
  purchaseStoreProduct,
  restorePurchases,
  addCustomerInfoListener,
  tierFromCustomerInfo,
} from '@/lib/revenuecat';

type FeatureKey =
  | 'insights'
  | 'infradian'
  | 'pdf_export'
  | 'unlimited_history'
  | 'action_plan'
  | 'challenges';

const PREMIUM_FEATURES: FeatureKey[] = [
  'insights',
  'infradian',
  'pdf_export',
  'unlimited_history',
  'action_plan',
  'challenges',
];

// Module-level flag to prevent multiple RevenueCat inits
let _rcInitialized = false;

interface UseSubscriptionReturn {
  tier: PlanTier;
  isPremium: boolean;
  isTrialActive: boolean;
  trialExpiresAt: Date | null;
  canAccess: (feature: FeatureKey) => boolean;
  offerings: PurchasesOfferings | null;
  fallbackProducts: PurchasesStoreProduct[];
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  purchaseProduct: (product: PurchasesStoreProduct) => Promise<boolean>;
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
  const [fallbackProducts, setFallbackProducts] = useState<PurchasesStoreProduct[]>([]);
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

        const state = await getSubscriptionState();

        if (!mounted) return;

        setSubscription(state.tier, state.trialExpiresAt?.toISOString() ?? null);
        setOfferings(state.offerings);
        setFallbackProducts(state.fallbackProducts);

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

  const isPremium = tier === 'premium';

  const canAccess = useCallback(
    (feature: FeatureKey): boolean => {
      if (PREMIUM_FEATURES.includes(feature)) {
        return isPremium;
      }
      return true;
    },
    [isPremium],
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

  const purchaseProductFn = useCallback(async (product: PurchasesStoreProduct): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await purchaseStoreProduct(product);
      if (result.success) {
        const newTier = tierFromCustomerInfo(result.customerInfo);
        const expiry = result.customerInfo.entitlements.active['premium']?.expirationDate ?? null;
        setSubscription(newTier, expiry);
      }
      return result.success;
    } catch (error) {
      console.error('[useSubscription] purchaseProduct error:', error);
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
    isTrialActive,
    trialExpiresAt,
    canAccess,
    offerings,
    fallbackProducts,
    purchase,
    purchaseProduct: purchaseProductFn,
    restore,
    isLoading,
  };
}
