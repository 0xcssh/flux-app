import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';

interface SettingsState {
  notificationTime: string;
  language: string;
  nofapEnabled: boolean;
  darkMode: boolean;
  onboardingSeen: boolean;
}

interface SettingsActions {
  setNotificationTime: (time: string) => void;
  setLanguage: (language: string) => void;
  setNofapEnabled: (enabled: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
  setOnboardingSeen: (seen: boolean) => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      notificationTime: '08:00',
      language: 'en',
      nofapEnabled: false,
      darkMode: false,
      onboardingSeen: false,

      setNotificationTime: (time) => set({ notificationTime: time }),
      setLanguage: (language) => set({ language }),
      setNofapEnabled: (enabled) => set({ nofapEnabled: enabled }),
      setDarkMode: (enabled) => set({ darkMode: enabled }),
      setOnboardingSeen: (seen) => set({ onboardingSeen: seen }),
    }),
    {
      name: 'flux-settings',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
