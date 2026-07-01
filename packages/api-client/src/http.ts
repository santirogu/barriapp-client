import { ApiError } from './errors';
import { resolveApiUrl } from './config';
import { createAuthenticatedFetch } from './auth-fetch';
import type { TokenStore } from './token-store';

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

export interface HttpClient {
  request<T>(path: string, options?: RequestOptions): Promise<T>;
  baseUrl: string;
}

/**
 * Imperative, typed-by-generic HTTP client. Wraps the shared authenticated fetch
 * (bearer + single-flight refresh + retry) and decodes the response, throwing a
 * typed {@link ApiError} on any non-2xx. Used for auth flows and one-off calls;
 * the typed openapi-fetch client is used for the query hooks.
 */
export function createHttpClient(options: HttpClientOptions): HttpClient {
  const baseUrl = resolveApiUrl(options.baseUrl);
  const authFetch = createAuthenticatedFetch({
    baseUrl,
    tokenStore: options.tokenStore,
    onLogout: options.onLogout,
  });

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

  async function parse<T>(res: Response): Promise<T> {
    const requestId = res.headers.get('X-Request-ID') ?? undefined;
    if (res.status === 204) return undefined as T;
    const text = await res.text();
    const body = text ? JSON.parse(text) : undefined;
    if (!res.ok) throw ApiError.fromResponse(res.status, body, requestId);
    return body as T;
  }

  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { json, query, anonymous, headers, ...rest } = options;
    const finalHeaders = new Headers(headers);
    if (json !== undefined) finalHeaders.set('Content-Type', 'application/json');
    // `anonymous` requests skip auth by not carrying a token; the shared fetch
    // only attaches a bearer when one exists and the header is unset.
    const res = await authFetch(buildUrl(path, query), {
      ...rest,
      headers: finalHeaders,
      body: json !== undefined ? JSON.stringify(json) : undefined,
    });
    return parse<T>(res);
  }

  return { request, baseUrl };
}
