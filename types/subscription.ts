export type PlanTier = 'free' | 'premium' | 'pro';

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
  | 'priority_support'
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
    'challenges',
  ],
  pro: [
    'full_history',
    'insights',
    'cycle_analysis',
    'correlations',
    'advanced_charts',
    'ai_recommendations',
    'action_plan',
    'pdf_export',
    'priority_support',
    'challenges',
  ],
};
