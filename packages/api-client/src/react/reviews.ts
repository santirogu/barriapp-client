import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unwrap } from '../typed-client';
import type { ReviewCreate } from '../schemas';
import { useApiClient } from './context';

/** Create a review (store or collaborator) for a delivered order. */
export function useCreateReview() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ReviewCreate) => unwrap(client.POST('/api/v1/reviews', { body })),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: ['stores', undefined, 'reviews'] });
      void qc.invalidateQueries({ queryKey: ['reviews', variables.order_id] });
    },
  });
}

/** A store's public reviews (newest first). */
export function useStoreReviews(storeId: string, query: { page?: number; limit?: number } = {}) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['stores', storeId, 'reviews', query],
    queryFn: () =>
      unwrap(
        client.GET('/api/v1/stores/{store_id}/reviews', {
          params: { path: { store_id: storeId }, query },
        }),
      ),
    enabled: Boolean(storeId),
  });
}
