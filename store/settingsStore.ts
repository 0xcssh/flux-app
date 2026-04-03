import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';
import { HormonalProfile } from '@/lib/hormonalProfile';

interface SettingsState {
  notificationTime: string;
  notificationMode: 'single' | 'phase_aware';
  language: string;
  nofapEnabled: boolean;
  darkMode: boolean;
  onboardingSeen: boolean;
  hormonalProfile: HormonalProfile | null;
  smartRemindersEnabled: boolean;
}

interface SettingsActions {
  setNotificationTime: (time: string) => void;
  setNotificationMode: (mode: 'single' | 'phase_aware') => void;
  setLanguage: (language: string) => void;
  setNofapEnabled: (enabled: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
  setOnboardingSeen: (seen: boolean) => void;
  setHormonalProfile: (profile: HormonalProfile) => void;
  setSmartRemindersEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      notificationTime: '08:00',
      notificationMode: 'phase_aware',
      language: 'en',
      nofapEnabled: true,
      darkMode: false,
      onboardingSeen: false,
      hormonalProfile: null,
      smartRemindersEnabled: true,

      setNotificationTime: (time) => set({ notificationTime: time }),
      setNotificationMode: (mode) => set({ notificationMode: mode }),
      setLanguage: (language) => set({ language }),
      setNofapEnabled: (enabled) => set({ nofapEnabled: enabled }),
      setDarkMode: (enabled) => set({ darkMode: enabled }),
      setOnboardingSeen: (seen) => set({ onboardingSeen: seen }),
      setHormonalProfile: (profile) => set({ hormonalProfile: profile }),
      setSmartRemindersEnabled: (enabled) => set({ smartRemindersEnabled: enabled }),
    }),
    {
      name: 'flux-settings',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
