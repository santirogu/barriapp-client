import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unwrap } from '../typed-client';
import type { ErrandCreate } from '../schemas';
import { useApiClient } from './context';
import { queryKeys } from './query-keys';

// --- Client side ------------------------------------------------------------

/** The caller's posted errands (newest first). */
export function useMyErrands() {
  const client = useApiClient();
  return useQuery({
    queryKey: queryKeys.errands(),
    queryFn: () => unwrap(client.GET('/api/v1/errands', { params: { query: {} } })),
  });
}

export function useErrand(id: string, options?: { refetchInterval?: number }) {
  const client = useApiClient();
  return useQuery({
    queryKey: queryKeys.errand(id),
    queryFn: () =>
      unwrap(client.GET('/api/v1/errands/{errand_id}', { params: { path: { errand_id: id } } })),
    enabled: Boolean(id),
    refetchInterval: options?.refetchInterval,
  });
}

export function useCreateErrand() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ErrandCreate) => unwrap(client.POST('/api/v1/errands', { body })),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['errands'] }),
  });
}

export function useCancelErrand() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ errandId, reason }: { errandId: string; reason?: string }) =>
      unwrap(
        client.POST('/api/v1/errands/{errand_id}/cancel', {
          params: { path: { errand_id: errandId } },
          body: { reason: reason ?? null },
        }),
      ),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['errands'] }),
  });
}

// --- Collaborator side ------------------------------------------------------

/** Open errands near a point ("lng,lat"). */
export function useAvailableErrands(near: string | null, radius = 5000) {
  const client = useApiClient();
  return useQuery({
    queryKey: queryKeys.errandsAvailable(near ?? ''),
    queryFn: () =>
      unwrap(client.GET('/api/v1/errands/available', { params: { query: { near: near!, radius } } })),
    enabled: Boolean(near),
  });
}

/** Errands the caller accepted as a collaborator. */
export function useAssignedErrands() {
  const client = useApiClient();
  return useQuery({
    queryKey: queryKeys.errandsAssigned(),
    queryFn: () => unwrap(client.GET('/api/v1/errands/assigned', { params: { query: {} } })),
  });
}

/** Collaborator errand actions: accept and advance (in_progress → completed). */
export function useErrandActions() {
  const client = useApiClient();
  const qc = useQueryClient();
  const invalidate = () => void qc.invalidateQueries({ queryKey: ['errands'] });

  const accept = useMutation({
    mutationFn: (errandId: string) =>
      unwrap(client.POST('/api/v1/errands/{errand_id}/accept', { params: { path: { errand_id: errandId } } })),
    onSuccess: invalidate,
  });

  const advance = useMutation({
    mutationFn: ({ errandId, status }: { errandId: string; status: 'in_progress' | 'completed' }) =>
      unwrap(
        client.POST('/api/v1/errands/{errand_id}/status', {
          params: { path: { errand_id: errandId } },
          body: { status },
        }),
      ),
    onSuccess: invalidate,
  });

  return { accept, advance };
}
