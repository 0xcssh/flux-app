import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/user';
import type { Database } from '@/types/database';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setSession: (session: Session | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  error: null,

  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      isLoading: false,
    });
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      set({ session: data.session, user: data.user, isLoading: false });
      await get().fetchProfile();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  signUp: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      set({ session: data.session, user: data.user, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sign up failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ session: null, user: null, profile: null, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sign out failed';
      set({ error: message, isLoading: false });
    }
  },

  fetchProfile: async () => {
    const user = get().user;
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      set({ profile: data as UserProfile });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch profile';
      set({ error: message });
    }
  },

  updateProfile: async (updates) => {
    const user = get().user;
    if (!user) return;
    try {
      const updateData: ProfileUpdate = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      set({ profile: data as UserProfile });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      set({ error: message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
