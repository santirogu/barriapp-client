import type { TokenStore, Tokens } from './token-store';

export interface AuthenticatedFetchOptions {
  baseUrl: string;
  tokenStore: TokenStore;
  /** Called when refresh fails (or no refresh token) — send user to login. */
  onLogout?: () => void;
}

interface RawTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/**
 * Build a `fetch`-compatible function that transparently:
 * - attaches the bearer access token,
 * - on `401 invalid_token`, refreshes once (single-flight) and retries,
 * - clears tokens + calls `onLogout` when refresh fails.
 *
 * It returns the raw `Response` (does NOT throw on non-2xx) so callers —
 * `createHttpClient` (imperative) and `openapi-fetch` (typed) — can decode it.
 * Requests are normalized to `(url, init)` so a retry can be re-issued cleanly.
 */
export function createAuthenticatedFetch(options: AuthenticatedFetchOptions) {
  const { baseUrl, tokenStore, onLogout } = options;

  let refreshInFlight: Promise<Tokens | null> | null = null;

  async function refreshTokens(): Promise<Tokens | null> {
    if (!refreshInFlight) {
      refreshInFlight = (async () => {
        const current = await tokenStore.getTokens();
        if (!current?.refreshToken) return null;
        const res = await fetch(`${baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: current.refreshToken }),
        });
        if (!res.ok) return null;
        const data = (await res.json()) as RawTokenResponse;
        const next: Tokens = {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
        };
        await tokenStore.setTokens(next);
        return next;
      })().finally(() => {
        refreshInFlight = null;
      });
    }
    return refreshInFlight;
  }

  return async function authenticatedFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    // Normalize any input (including a Request from openapi-fetch) to url + init
    // so retries re-issue an identical request with a fresh header.
    let url: string;
    let baseInit: RequestInit;
    if (input instanceof Request) {
      const buffer = await input.arrayBuffer();
      url = input.url;
      baseInit = {
        method: input.method,
        headers: new Headers(input.headers),
        body: buffer.byteLength ? buffer : undefined,
        credentials: input.credentials,
      };
    } else {
      url = String(input);
      baseInit = { ...init, headers: new Headers(init?.headers) };
    }

    const send = async (accessToken?: string): Promise<Response> => {
      const headers = new Headers(baseInit.headers);
      if (accessToken && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
      return fetch(url, { ...baseInit, headers });
    };

    const tokens = await tokenStore.getTokens();
    let res = await send(tokens?.accessToken);

    if (res.status === 401) {
      const body = await res
        .clone()
        .json()
        .catch(() => undefined);
      const code = (body as { error?: { code?: string } } | undefined)?.error?.code;
      if (code === 'invalid_token') {
        const refreshed = await refreshTokens();
        if (!refreshed) {
          await tokenStore.clear();
          onLogout?.();
          return res;
        }
        res = await send(refreshed.accessToken);
      }
    }

    return res;
  };
}
