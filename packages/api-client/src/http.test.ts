import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHttpClient } from './http';
import { createMemoryTokenStore } from './token-store';
import { ApiError } from './errors';

function jsonResponse(status: number, body: unknown, headers?: Record<string, string>) {
  return new Response(body === undefined ? '' : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createHttpClient', () => {
  it('attaches the bearer token and parses JSON', async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) => jsonResponse(200, { id: '1' }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const client = createHttpClient({
      baseUrl: 'http://api.test/api/v1',
      tokenStore: createMemoryTokenStore({ accessToken: 'acc', refreshToken: 'ref' }),
    });
    const data = await client.request<{ id: string }>('/me');

    expect(data).toEqual({ id: '1' });
    const init = fetchMock.mock.calls[0]?.[1];
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer acc');
  });

  it('refreshes once on invalid_token and retries the request', async () => {
    const store = createMemoryTokenStore({ accessToken: 'old', refreshToken: 'ref' });
    const fetchMock = vi
      .fn()
      // 1) original request → 401 invalid_token
      .mockResolvedValueOnce(jsonResponse(401, { error: { code: 'invalid_token', message: '' } }))
      // 2) refresh → new tokens
      .mockResolvedValueOnce(
        jsonResponse(200, { access_token: 'new', refresh_token: 'ref2', token_type: 'bearer' }),
      )
      // 3) retry → success
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    const client = createHttpClient({ baseUrl: 'http://api.test/api/v1', tokenStore: store });
    const data = await client.request<{ ok: boolean }>('/orders');

    expect(data).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(await store.getTokens()).toEqual({ accessToken: 'new', refreshToken: 'ref2' });
  });

  it('logs out and throws when refresh fails', async () => {
    const onLogout = vi.fn();
    const store = createMemoryTokenStore({ accessToken: 'old', refreshToken: 'ref' });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, { error: { code: 'invalid_token', message: '' } }))
      .mockResolvedValueOnce(jsonResponse(401, { error: { code: 'invalid_token', message: '' } }));
    vi.stubGlobal('fetch', fetchMock);

    const client = createHttpClient({
      baseUrl: 'http://api.test/api/v1',
      tokenStore: store,
      onLogout,
    });

    await expect(client.request('/orders')).rejects.toBeInstanceOf(ApiError);
    expect(onLogout).toHaveBeenCalledOnce();
    expect(await store.getTokens()).toBeNull();
  });
});
