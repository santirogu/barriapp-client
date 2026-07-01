import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { unwrap } from '../typed-client';
import type { ApiClient } from '../typed-client';
import type { TokenStore, Tokens } from '../token-store';
import type { UserPublic } from '../schemas';

export type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface SessionState {
  user: UserPublic | null;
  status: SessionStatus;
  /** Load the session from stored tokens (call once on app start). */
  bootstrap: () => Promise<void>;
  /** Persist new tokens (after login/verify/social) and load the profile. */
  authenticate: (tokens: Tokens) => Promise<void>;
  /** Clear tokens and reset to unauthenticated. */
  signOut: () => Promise<void>;
  /** Replace the cached user (e.g. after PATCH /me). */
  setUser: (user: UserPublic) => void;
}

export type SessionStore = UseBoundStore<StoreApi<SessionState>>;

/**
 * Create the shared session store. Each app instantiates it with the typed
 * client and its platform TokenStore. The client's `onLogout` should call the
 * returned store's `signOut` (bind it after creation to avoid a cycle).
 */
export function createSessionStore(deps: {
  client: ApiClient;
  tokenStore: TokenStore;
}): SessionStore {
  const { client, tokenStore } = deps;

  async function loadProfile(
    set: (partial: Partial<SessionState>) => void,
  ): Promise<void> {
    try {
      const user = await unwrap(client.GET('/api/v1/me'));
      set({ user, status: 'authenticated' });
    } catch {
      await tokenStore.clear();
      set({ user: null, status: 'unauthenticated' });
    }
  }

  return create<SessionState>((set) => ({
    user: null,
    status: 'loading',
    async bootstrap() {
      const tokens = await tokenStore.getTokens();
      if (!tokens) {
        set({ user: null, status: 'unauthenticated' });
        return;
      }
      await loadProfile(set);
    },
    async authenticate(tokens: Tokens) {
      await tokenStore.setTokens(tokens);
      set({ status: 'loading' });
      await loadProfile(set);
    },
    async signOut() {
      await tokenStore.clear();
      set({ user: null, status: 'unauthenticated' });
    },
    setUser(user: UserPublic) {
      set({ user });
    },
  }));
}
