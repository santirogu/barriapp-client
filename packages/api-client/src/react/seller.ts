import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { StoreStatus } from '@barriapp/shared';
import { unwrap } from '../typed-client';
import type { ProductCreate, ProductUpdate, StoreCreate, StoreUpdate } from '../schemas';
import { useApiClient } from './context';
import { queryKeys } from './query-keys';

// --- Store management -------------------------------------------------------

/** Stores owned by the caller (seller area). */
export function useMyStores() {
  const client = useApiClient();
  return useQuery({
    queryKey: queryKeys.myStores(),
    queryFn: () => unwrap(client.GET('/api/v1/stores/mine')),
  });
}

/** Create a store (become-seller). */
export function useCreateStore() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: StoreCreate) => unwrap(client.POST('/api/v1/stores', { body })),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

/** Edit a store's profile / schedule / delivery config. */
export function useUpdateStore(storeId: string) {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: StoreUpdate) =>
      unwrap(client.PATCH('/api/v1/stores/{store_id}', { params: { path: { store_id: storeId } }, body })),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

/** Open / close (owner) or suspend (admin) a store. */
export function useSetStoreStatus(storeId: string) {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: StoreStatus) =>
      unwrap(
        client.PATCH('/api/v1/stores/{store_id}/status', {
          params: { path: { store_id: storeId } },
          body: { status },
        }),
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

// --- Catalog management -----------------------------------------------------

export function useCreateProduct(storeId: string) {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ProductCreate) =>
      unwrap(
        client.POST('/api/v1/stores/{store_id}/products', {
          params: { path: { store_id: storeId } },
          body,
        }),
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['stores', storeId, 'products'] });
    },
  });
}

export function useUpdateProduct(storeId: string) {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, body }: { productId: string; body: ProductUpdate }) =>
      unwrap(
        client.PATCH('/api/v1/products/{product_id}', {
          params: { path: { product_id: productId } },
          body,
        }),
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['stores', storeId, 'products'] });
    },
  });
}

export function useDeleteProduct(storeId: string) {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) =>
      unwrap(
        client.DELETE('/api/v1/products/{product_id}', {
          params: { path: { product_id: productId } },
        }),
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['stores', storeId, 'products'] });
    },
  });
}
