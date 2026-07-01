import { ApiError } from './errors';
import { resolveApiUrl } from './config';
import type { TokenStore, Tokens } from './token-store';

export interface HttpClientOptions {
  /** Explicit base URL; falls back to EXPO_PUBLIC/NEXT_PUBLIC env, then local dev. */
  baseUrl?: string;
  tokenStore: TokenStore;
  /** Called when refresh fails (or there is no refresh token) — send user to login. */
  onLogout?: () => void;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** JSON body — serialized automatically; sets Content-Type. */
  json?: unknown;
  /** Query params appended to the path. */
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Skip attaching the bearer token (public endpoints). */
  anonymous?: boolean;
}

interface RawTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface HttpClient {
  request<T>(path: string, options?: RequestOptions): Promise<T>;
  baseUrl: string;
}

export function createHttpClient(options: HttpClientOptions): HttpClient {
  const baseUrl = resolveApiUrl(options.baseUrl);
  const { tokenStore, onLogout } = options;

  // Single-flight refresh: concurrent 401s share one refresh round-trip.
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

  function buildUrl(path: string, query?: RequestOptions['query']): string {
    const url = new URL(`${baseUrl}${path.startsWith('/') ? path : `/${path}`}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  async function doFetch(
    path: string,
    options: RequestOptions,
    accessToken: string | undefined,
  ): Promise<Response> {
    const headers = new Headers(options.headers);
    if (options.json !== undefined) {
      headers.set('Content-Type', 'application/json');
    }
    if (!options.anonymous && accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return fetch(buildUrl(path, options.query), {
      ...options,
      headers,
      body: options.json !== undefined ? JSON.stringify(options.json) : undefined,
    });
  }

  async function parse<T>(res: Response): Promise<T> {
    const requestId = res.headers.get('X-Request-ID') ?? undefined;
    if (res.status === 204) return undefined as T;
    const text = await res.text();
    const body = text ? JSON.parse(text) : undefined;
    if (!res.ok) throw ApiError.fromResponse(res.status, body, requestId);
    return body as T;
  }

  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const tokens = options.anonymous ? null : await tokenStore.getTokens();
    let res = await doFetch(path, options, tokens?.accessToken);

    // On an expired access token, refresh once and retry the original request.
    if (res.status === 401 && !options.anonymous) {
      const requestId = res.headers.get('X-Request-ID') ?? undefined;
      const body = await res
        .clone()
        .json()
        .catch(() => undefined);
      const err = ApiError.fromResponse(401, body, requestId);
      if (err.isInvalidToken) {
        const refreshed = await refreshTokens();
        if (!refreshed) {
          await tokenStore.clear();
          onLogout?.();
          throw err;
        }
        res = await doFetch(path, options, refreshed.accessToken);
      }
    }

    return parse<T>(res);
  }

  return { request, baseUrl };
}
