export type PlanTier = 'free' | 'premium';

export interface SubscriptionState {
  tier: PlanTier;
  isTrialActive: boolean;
  trialExpiresAt: string | null;
  isLoading: boolean;
}

export type PremiumFeature =
  | 'full_history'
  | 'insights'
  | 'cycle_analysis'
  | 'correlations'
  | 'pdf_export'
  | 'advanced_charts'
  | 'ai_recommendations'
  | 'action_plan'
  | 'challenges';

export const featureAccess: Record<PlanTier, PremiumFeature[]> = {
  free: [],
  premium: [
    'full_history',
    'insights',
    'cycle_analysis',
    'correlations',
    'advanced_charts',
    'ai_recommendations',
    'action_plan',
    'pdf_export',
    'challenges',
  ],
};
