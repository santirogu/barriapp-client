import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { TokenStore, Tokens } from '@barriapp/api-client';

const ACCESS_KEY = 'barriapp.access';
const REFRESH_KEY = 'barriapp.refresh';

// SecureStore is unavailable on web; fall back to localStorage there.
const webStore = {
  getItem: (k: string) => (typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null),
  setItem: (k: string, v: string) => localStorage?.setItem(k, v),
  removeItem: (k: string) => localStorage?.removeItem(k),
};

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return webStore.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') return void webStore.setItem(key, value);
  return SecureStore.setItemAsync(key, value);
}

async function removeItem(key: string): Promise<void> {
  if (Platform.OS === 'web') return void webStore.removeItem(key);
  return SecureStore.deleteItemAsync(key);
}

/** TokenStore backed by Expo SecureStore (native) / localStorage (web). */
export const secureTokenStore: TokenStore = {
  async getTokens(): Promise<Tokens | null> {
    const [accessToken, refreshToken] = await Promise.all([
      getItem(ACCESS_KEY),
      getItem(REFRESH_KEY),
    ]);
    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  },
  async setTokens({ accessToken, refreshToken }: Tokens): Promise<void> {
    await Promise.all([setItem(ACCESS_KEY, accessToken), setItem(REFRESH_KEY, refreshToken)]);
  },
  async clear(): Promise<void> {
    await Promise.all([removeItem(ACCESS_KEY), removeItem(REFRESH_KEY)]);
  },
};
