import { createContext, useContext, type ReactNode } from 'react';
import type { ApiClient } from '../typed-client';

const ApiClientContext = createContext<ApiClient | null>(null);

/**
 * Provides the typed API client to the hooks below. Each app creates the client
 * with its own platform TokenStore + onLogout and wraps its tree in this.
 */
export function ApiProvider({
  client,
  children,
}: {
  client: ApiClient;
  children: ReactNode;
}) {
  return <ApiClientContext.Provider value={client}>{children}</ApiClientContext.Provider>;
}

export function useApiClient(): ApiClient {
  const client = useContext(ApiClientContext);
  if (!client) {
    throw new Error('useApiClient must be used within an <ApiProvider>');
  }
  return client;
}
