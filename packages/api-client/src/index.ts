// Imperative client (auth flows, one-off calls)
export { createHttpClient } from './http';
export type { HttpClient, HttpClientOptions, RequestOptions } from './http';

// Typed client (openapi-fetch) for query hooks
export { createApiClient, unwrap } from './typed-client';
export type { ApiClient, ApiClientOptions } from './typed-client';

// Shared auth fetch (advanced use)
export { createAuthenticatedFetch } from './auth-fetch';

export { ApiError } from './errors';
export { resolveApiUrl, DEFAULT_API_URL } from './config';
export { createMemoryTokenStore } from './token-store';
export type { TokenStore, Tokens } from './token-store';

// Generated types + DTO aliases
export type { paths, components, operations } from './generated/schema';
export type * from './schemas';
