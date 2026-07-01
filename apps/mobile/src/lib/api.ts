import { createHttpClient } from '@barriapp/api-client';
import { secureTokenStore } from './secure-token-store';

/**
 * App-wide HTTP client. `onLogout` is wired in Phase 2 to reset the auth store
 * and redirect to the login screen; for now it clears tokens only.
 */
export const api = createHttpClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL,
  tokenStore: secureTokenStore,
  onLogout: () => {
    // Wired to router + auth store in Phase 2.
  },
});
