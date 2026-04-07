import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

// SecureStore has a 2048 byte key limit, so we use a prefix
// and localStorage fallback for web
export const zustandStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' ? localStorage.getItem(name) : null;
    }
    try {
      return await SecureStore.getItemAsync(name);
    } catch (error) {
      console.warn('[Storage] getItem error:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.setItem(name, value);
      return;
    }
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (error) {
      console.warn('[Storage] setItem error:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.removeItem(name);
      return;
    }
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.warn('[Storage] removeItem error:', error);
    }
  },
};
