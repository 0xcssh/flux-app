export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  nofap_enabled: boolean;
  notification_time: string | null;
  language: string;
  dark_mode: boolean;
  subscription_tier: 'free' | 'premium';
  trial_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  notification_time: string;
  language: string;
  nofap_enabled: boolean;
  dark_mode: boolean;
}
