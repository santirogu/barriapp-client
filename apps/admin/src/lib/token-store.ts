import type { TokenStore, Tokens } from '@barriapp/api-client';

const ACCESS_KEY = 'barriapp.admin.access';
const REFRESH_KEY = 'barriapp.admin.refresh';

const hasWindow = typeof window !== 'undefined';

/**
 * Web TokenStore backed by localStorage. SSR-safe (returns null on the server).
 * NOTE: for production hardening, move to httpOnly cookies (Fase 6/7).
 */
export const webTokenStore: TokenStore = {
  async getTokens(): Promise<Tokens | null> {
    if (!hasWindow) return null;
    const accessToken = window.localStorage.getItem(ACCESS_KEY);
    const refreshToken = window.localStorage.getItem(REFRESH_KEY);
    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  },
  async setTokens({ accessToken, refreshToken }: Tokens): Promise<void> {
    if (!hasWindow) return;
    window.localStorage.setItem(ACCESS_KEY, accessToken);
    window.localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  async clear(): Promise<void> {
    if (!hasWindow) return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};
