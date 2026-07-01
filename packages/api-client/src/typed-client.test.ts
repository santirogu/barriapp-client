import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApiClient, unwrap } from './typed-client';
import { createMemoryTokenStore } from './token-store';
import { ApiError } from './errors';

function jsonResponse(status: number, body: unknown, headers?: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

afterEach(() => vi.restoreAllMocks());

describe('createApiClient + unwrap', () => {
  it('GET returns typed data and sends the bearer + full /api/v1 path', async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        jsonResponse(200, [{ id: '1', name: 'Tienda Ana' }]),
    );
    vi.stubGlobal('fetch', fetchMock);

    const client = createApiClient({
      baseUrl: 'http://api.test/api/v1',
      tokenStore: createMemoryTokenStore({ accessToken: 'acc', refreshToken: 'ref' }),
    });
    const data = await unwrap(client.GET('/api/v1/stores', { params: { query: {} } }));

    expect(data).toEqual([{ id: '1', name: 'Tienda Ana' }]);
    const call = fetchMock.mock.calls[0]!;
    expect(call[0]).toBe('http://api.test/api/v1/stores');
    expect(new Headers(call[1]?.headers).get('Authorization')).toBe('Bearer acc');
  });

  it('unwrap throws a typed ApiError on an error body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse(422, { error: { code: 'invalid_query', message: 'bad near' } }),
      ),
    );
    const client = createApiClient({
      baseUrl: 'http://api.test/api/v1',
      tokenStore: createMemoryTokenStore(),
    });

    await expect(
      unwrap(client.GET('/api/v1/stores', { params: { query: {} } })),
    ).rejects.toMatchObject({ code: 'invalid_query', status: 422 });
    await expect(
      unwrap(client.GET('/api/v1/stores', { params: { query: {} } })),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
