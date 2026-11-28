import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Armazenamento simples de texto.
 * - Android/iOS: expo-secure-store (criptografado pelo sistema — Keychain/Keystore).
 * - Web: localStorage do navegador.
 */
export const storage = {
  async get(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') return globalThis.localStorage?.getItem(key) ?? null;
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  async set(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        globalThis.localStorage?.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Armazenamento indisponível: segue só em memória.
    }
  },

  async remove(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        globalThis.localStorage?.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch {
      // ignora
    }
  },
};
