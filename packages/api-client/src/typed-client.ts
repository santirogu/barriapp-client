import createClient, { type Client } from 'openapi-fetch';
import { resolveApiUrl } from './config';
import { createAuthenticatedFetch } from './auth-fetch';
import { ApiError } from './errors';
import type { TokenStore } from './token-store';
import type { paths } from './generated/schema';

export type ApiClient = Client<paths>;

export interface ApiClientOptions {
  /** API base URL incl. `/api/v1`; falls back to env, then local dev. */
  baseUrl?: string;
  tokenStore: TokenStore;
  onLogout?: () => void;
}

/**
 * Fully-typed API client (openapi-fetch) sharing the same authenticated fetch
 * as {@link createHttpClient}. Generated `paths` already include the `/api/v1`
 * prefix, so openapi-fetch is given the server **origin** as its baseUrl while
 * token refresh uses the full API base.
 */
export function createApiClient(options: ApiClientOptions): ApiClient {
  const apiBaseUrl = resolveApiUrl(options.baseUrl);
  const origin = apiBaseUrl.replace(/\/api\/v\d+$/, '');
  const authFetch = createAuthenticatedFetch({
    baseUrl: apiBaseUrl,
    tokenStore: options.tokenStore,
    onLogout: options.onLogout,
  });
  return createClient<paths>({ baseUrl: origin, fetch: authFetch });
}

/** Result shape returned by openapi-fetch calls. */
interface FetchResult<T> {
  data?: T;
  error?: unknown;
  response: Response;
}

/**
 * Unwrap an openapi-fetch result: return `data` on success, or throw a typed
 * {@link ApiError} built from the error body + status + `X-Request-ID`.
 */
export async function unwrap<T>(promise: Promise<FetchResult<T>>): Promise<T> {
  const { data, error, response } = await promise;
  if (error !== undefined || !response.ok) {
    const requestId = response.headers.get('X-Request-ID') ?? undefined;
    throw ApiError.fromResponse(response.status, error, requestId);
  }
  return data as T;
}
