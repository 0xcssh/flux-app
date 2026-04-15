import { create } from 'zustand';
import type { PlanTier, PremiumFeature } from '@/types/subscription';
import { featureAccess } from '@/types/subscription';

interface SubscriptionState {
  tier: PlanTier;
  isTrialActive: boolean;
  trialExpiresAt: string | null;
  isLoading: boolean;
}

interface SubscriptionActions {
  setSubscription: (tier: PlanTier, trialExpiresAt: string | null, isTrialActive: boolean) => void;
  checkEntitlements: () => void;
  canAccess: (feature: PremiumFeature) => boolean;
}

export const useSubscriptionStore = create<SubscriptionState & SubscriptionActions>()(
  (set, get) => ({
    tier: 'free', // PRODUCTION: must be 'free'. Set to 'premium' only for local testing.
    isTrialActive: false,
    trialExpiresAt: null,
    isLoading: false,

    setSubscription: (tier, trialExpiresAt, isTrialActive) => {
      set({ tier, trialExpiresAt, isTrialActive });
    },

    checkEntitlements: () => {
      const { trialExpiresAt, isTrialActive } = get();
      if (isTrialActive && trialExpiresAt) {
        const stillActive = new Date(trialExpiresAt) > new Date();
        if (!stillActive) {
          set({ tier: 'free', isTrialActive: false, trialExpiresAt: null });
        }
      }
    },

    canAccess: (feature: PremiumFeature) => {
      const { tier, isTrialActive } = get();
      if (isTrialActive) {
        return featureAccess.premium.includes(feature);
      }
      return featureAccess[tier].includes(feature);
    },
  })
);
