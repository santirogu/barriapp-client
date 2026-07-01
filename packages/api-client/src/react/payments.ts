import { useMutation, useQuery } from '@tanstack/react-query';
import { unwrap } from '../typed-client';
import { useApiClient } from './context';
import { queryKeys } from './query-keys';

/** Create (or fetch) the Wompi payment intent for a Wompi order. */
export function usePaymentIntent() {
  const client = useApiClient();
  return useMutation({
    mutationFn: (orderId: string) =>
      unwrap(client.POST('/api/v1/payments/intent', { body: { order_id: orderId } })),
  });
}

/** Poll a payment's status (pending → approved | declined). */
export function usePayment(
  paymentId: string | null,
  options?: { refetchInterval?: number },
) {
  const client = useApiClient();
  return useQuery({
    queryKey: queryKeys.payment(paymentId ?? ''),
    queryFn: () =>
      unwrap(
        client.GET('/api/v1/payments/{payment_id}', {
          params: { path: { payment_id: paymentId! } },
        }),
      ),
    enabled: Boolean(paymentId),
    refetchInterval: options?.refetchInterval,
  });
}
