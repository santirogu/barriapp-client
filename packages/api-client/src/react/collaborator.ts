import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { DeliveryStatus } from '@barriapp/shared';
import { unwrap } from '../typed-client';
import type { BecomeCollaborator } from '../schemas';
import { useApiClient } from './context';
import { queryKeys } from './query-keys';

/** The caller's collaborator profile. Throws 404 if they haven't applied. */
export function useCollaboratorMe() {
  const client = useApiClient();
  return useQuery({
    queryKey: queryKeys.collaboratorMe(),
    queryFn: () => unwrap(client.GET('/api/v1/collaborator/me')),
    retry: false,
  });
}

/** Apply to become a collaborator (stays pending until an admin approves). */
export function useBecomeCollaborator() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: BecomeCollaborator) =>
      unwrap(client.POST('/api/v1/me/become-collaborator', { body })),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.collaboratorMe() });
    },
  });
}

/** Go online (with GPS) or offline. */
export function useSetAvailability() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { status: 'online' | 'offline'; lng?: number; lat?: number }) =>
      unwrap(client.POST('/api/v1/collaborator/availability', { body })),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.collaboratorMe() });
    },
  });
}

/** The collaborator's assigned deliveries (newest first). */
export function useCollaboratorJobs() {
  const client = useApiClient();
  return useQuery({
    queryKey: ['collaborator', 'jobs'],
    queryFn: () => unwrap(client.GET('/api/v1/collaborator/jobs')),
  });
}

/** Advance a delivery to the next status and (optionally) push a location. */
export function useDeliveryActions() {
  const client = useApiClient();
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['collaborator', 'jobs'] });
    void qc.invalidateQueries({ queryKey: ['deliveries'] });
    void qc.invalidateQueries({ queryKey: ['orders'] });
  };

  const advance = useMutation({
    mutationFn: ({ deliveryId, status }: { deliveryId: string; status: DeliveryStatus }) =>
      unwrap(
        client.POST('/api/v1/deliveries/{delivery_id}/status', {
          params: { path: { delivery_id: deliveryId } },
          body: { status },
        }),
      ),
    onSuccess: invalidate,
  });

  const pushLocation = useMutation({
    mutationFn: ({ deliveryId, lng, lat }: { deliveryId: string; lng: number; lat: number }) =>
      unwrap(
        client.POST('/api/v1/deliveries/{delivery_id}/location', {
          params: { path: { delivery_id: deliveryId } },
          body: { lng, lat },
        }),
      ),
  });

  return { advance, pushLocation };
}
