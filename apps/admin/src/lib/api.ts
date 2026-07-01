import { createApiClient } from '@barriapp/api-client';
import { createSessionStore } from '@barriapp/api-client/react';
import { webTokenStore } from './token-store';

let handleLogout = () => {};

export const apiClient = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  tokenStore: webTokenStore,
  onLogout: () => handleLogout(),
});

export const useSession = createSessionStore({
  client: apiClient,
  tokenStore: webTokenStore,
});

handleLogout = () => {
  void useSession.getState().signOut();
};
