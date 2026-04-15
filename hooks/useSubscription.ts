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

// Module-level cache — shared across all hook instances
let _rcInitialized = false;
let _cachedOfferings: PurchasesOfferings | null = null;
let _cachedFallbackProducts: PurchasesStoreProduct[] = [];

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

  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(_cachedOfferings);
  const [fallbackProducts, setFallbackProducts] = useState<PurchasesStoreProduct[]>(_cachedFallbackProducts);
  const [isLoading, setIsLoading] = useState(!_rcInitialized);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const isTrialActive = storeTrial;
  const trialExpiresAt = storeTrialExpiry ? new Date(storeTrialExpiry) : null;

  useEffect(() => {
    if (_rcInitialized) return;
    _rcInitialized = true;
    let mounted = true;

    async function init() {
      try {
        await initRevenueCat();

        const state = await getSubscriptionState();

        if (!mounted) return;

        setSubscription(
          state.tier,
          state.trialExpiresAt?.toISOString() ?? null,
          state.isTrialActive,
        );
        _cachedOfferings = state.offerings;
        _cachedFallbackProducts = state.fallbackProducts;
        setOfferings(state.offerings);
        setFallbackProducts(state.fallbackProducts);

        unsubscribeRef.current = addCustomerInfoListener((info) => {
          if (!mounted) return;
          const newTier = tierFromCustomerInfo(info);
          const premiumEntitlement = info.entitlements.active['premium'];
          const expiry = premiumEntitlement?.expirationDate ?? null;
          const trialActive = premiumEntitlement?.periodType === 'TRIAL' || false;
          setSubscription(newTier, expiry, trialActive);
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
        return isPremium || isTrialActive;
      }
      return true;
    },
    [isPremium, isTrialActive],
  );

  const purchase = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await purchasePackage(pkg);
      if (result.success) {
        const newTier = tierFromCustomerInfo(result.customerInfo);
        const premiumEntitlement = result.customerInfo.entitlements.active['premium'];
        const expiry = premiumEntitlement?.expirationDate ?? null;
        const trialActive = premiumEntitlement?.periodType === 'TRIAL' || false;
        setSubscription(newTier, expiry, trialActive);
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
        const premiumEntitlement = result.customerInfo.entitlements.active['premium'];
        const expiry = premiumEntitlement?.expirationDate ?? null;
        const trialActive = premiumEntitlement?.periodType === 'TRIAL' || false;
        setSubscription(newTier, expiry, trialActive);
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
      const premiumEntitlement = info.entitlements.active['premium'];
      const expiry = premiumEntitlement?.expirationDate ?? null;
      const trialActive = premiumEntitlement?.periodType === 'TRIAL' || false;
      setSubscription(newTier, expiry, trialActive);
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
