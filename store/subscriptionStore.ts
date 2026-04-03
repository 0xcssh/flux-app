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
  setSubscription: (tier: PlanTier, trialExpiresAt?: string | null) => void;
  checkEntitlements: () => void;
  canAccess: (feature: PremiumFeature) => boolean;
}

export const useSubscriptionStore = create<SubscriptionState & SubscriptionActions>()(
  (set, get) => ({
    tier: 'premium', // TODO: change back to 'free' before production
    isTrialActive: false,
    trialExpiresAt: null,
    isLoading: false,

    setSubscription: (tier, trialExpiresAt = null) => {
      const isTrialActive = trialExpiresAt
        ? new Date(trialExpiresAt) > new Date()
        : false;
      set({ tier, trialExpiresAt, isTrialActive });
    },

    checkEntitlements: () => {
      const { trialExpiresAt } = get();
      if (trialExpiresAt) {
        const isTrialActive = new Date(trialExpiresAt) > new Date();
        if (!isTrialActive) {
          set({ tier: 'free', isTrialActive: false, trialExpiresAt: null });
        } else {
          set({ isTrialActive: true });
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
