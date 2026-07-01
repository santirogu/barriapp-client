/**
 * Platform-agnostic token storage contract. The mobile app backs this with
 * Expo SecureStore; the admin app with a secure web store. Implementations are
 * injected into `createHttpClient` so this package stays platform-free.
 */
export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenStore {
  getTokens(): Promise<Tokens | null>;
  setTokens(tokens: Tokens): Promise<void>;
  clear(): Promise<void>;
}

/** Simple in-memory TokenStore — useful for tests and SSR. */
export function createMemoryTokenStore(initial?: Tokens | null): TokenStore {
  let tokens: Tokens | null = initial ?? null;
  return {
    async getTokens() {
      return tokens;
    },
    async setTokens(next) {
      tokens = next;
    },
    async clear() {
      tokens = null;
    },
  };
}
