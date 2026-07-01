import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unwrap } from '../typed-client';
import type { OrderCreate } from '../schemas';
import { useApiClient } from './context';
import { queryKeys } from './query-keys';

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

/** Current user profile — bootstraps role-driven UI. */
export function useMe(options?: { enabled?: boolean }) {
  const client = useApiClient();
  return useQuery({
    queryKey: queryKeys.me(),
    queryFn: () => unwrap(client.GET('/api/v1/me')),
    enabled: options?.enabled,
  });
}

// ---------------------------------------------------------------------------
// Stores
// ---------------------------------------------------------------------------

export interface StoresQuery {
  /** "lng,lat" — enables nearest-first geo search. */
  near?: string;
  radius?: number;
  category?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export function useStores(query: StoresQuery = {}) {
  const client = useApiClient();
  return useQuery({
    queryKey: queryKeys.stores(query),
    queryFn: () => unwrap(client.GET('/api/v1/stores', { params: { query } })),
  });
}

export function useStore(id: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: queryKeys.store(id),
    queryFn: () =>
      unwrap(client.GET('/api/v1/stores/{store_id}', { params: { path: { store_id: id } } })),
    enabled: Boolean(id),
  });
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export function useStoreProducts(storeId: string, availableOnly = false) {
  const client = useApiClient();
  return useQuery({
    queryKey: queryKeys.storeProducts(storeId, { availableOnly }),
    queryFn: () =>
      unwrap(
        client.GET('/api/v1/stores/{store_id}/products', {
          params: { path: { store_id: storeId }, query: { available_only: availableOnly } },
        }),
      ),
    enabled: Boolean(storeId),
  });
}

export function useCategories(type?: 'store' | 'product') {
  const client = useApiClient();
  return useQuery({
    queryKey: queryKeys.categories(type),
    queryFn: () =>
      unwrap(client.GET('/api/v1/categories', { params: { query: type ? { type } : {} } })),
  });
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export function useOrders(query: { page?: number; limit?: number } = {}) {
  const client = useApiClient();
  return useQuery({
    queryKey: queryKeys.orders(query),
    queryFn: () => unwrap(client.GET('/api/v1/orders', { params: { query } })),
  });
}

export function useOrder(id: string, options?: { refetchInterval?: number }) {
  const client = useApiClient();
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: () =>
      unwrap(client.GET('/api/v1/orders/{order_id}', { params: { path: { order_id: id } } })),
    enabled: Boolean(id),
    refetchInterval: options?.refetchInterval,
  });
}

export function useCreateOrder() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: OrderCreate) => unwrap(client.POST('/api/v1/orders', { body })),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
