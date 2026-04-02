export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          onboarding_completed: boolean;
          nofap_enabled: boolean;
          notification_time: string | null;
          language: string;
          dark_mode: boolean;
          subscription_tier: 'free' | 'premium' | 'pro';
          trial_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          onboarding_completed?: boolean;
          nofap_enabled?: boolean;
          notification_time?: string | null;
          language?: string;
          dark_mode?: boolean;
          subscription_tier?: 'free' | 'premium' | 'pro';
          trial_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          onboarding_completed?: boolean;
          nofap_enabled?: boolean;
          notification_time?: string | null;
          language?: string;
          dark_mode?: boolean;
          subscription_tier?: 'free' | 'premium' | 'pro';
          trial_expires_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      daily_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          energy: number;
          mood: number;
          libido: number;
          sleep_quality: number;
          stress: number;
          training: number;
          notes: string | null;
          nofap_day: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          energy: number;
          mood: number;
          libido: number;
          sleep_quality: number;
          stress: number;
          training: number;
          notes?: string | null;
          nofap_day?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          energy?: number;
          mood?: number;
          libido?: number;
          sleep_quality?: number;
          stress?: number;
          training?: number;
          notes?: string | null;
          nofap_day?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      nofap_streaks: {
        Row: {
          id: string;
          user_id: string;
          start_date: string;
          end_date: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          start_date: string;
          end_date?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          start_date?: string;
          end_date?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      push_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          platform: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          platform: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token?: string;
          platform?: string;
        };
        Relationships: [];
      };
      user_insights: {
        Row: {
          id: string;
          user_id: string;
          insight_type: string;
          insight_data: Record<string, unknown>;
          generated_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          insight_type: string;
          insight_data: Record<string, unknown>;
          generated_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          insight_type?: string;
          insight_data?: Record<string, unknown>;
          generated_at?: string;
          expires_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
