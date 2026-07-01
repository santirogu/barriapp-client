import { createApiClient } from '@barriapp/api-client';
import { createSessionStore } from '@barriapp/api-client/react';
import { secureTokenStore } from './secure-token-store';

// `onLogout` must call the session store's signOut, but the store needs the
// client — break the cycle with a mutable handler bound right after creation.
let handleLogout = () => {};

export const apiClient = createApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL,
  tokenStore: secureTokenStore,
  onLogout: () => handleLogout(),
});

/** App-wide session store (user + auth status + actions). */
export const useSession = createSessionStore({
  client: apiClient,
  tokenStore: secureTokenStore,
});

handleLogout = () => {
  void useSession.getState().signOut();
};
