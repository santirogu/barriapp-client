import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Role, UserStatus, VerificationStatus } from '@barriapp/shared';
import { unwrap } from '../typed-client';
import type { ConfigUpdate, GenerateSettlement } from '../schemas';
import { useApiClient } from './context';
import { queryKeys } from './query-keys';

/** Platform KPIs. */
export function useAdminMetrics() {
  const client = useApiClient();
  return useQuery({
    queryKey: queryKeys.adminMetrics(),
    queryFn: () => unwrap(client.GET('/api/v1/admin/metrics')),
  });
}

export interface AdminUsersQuery {
  role?: Role;
  user_status?: UserStatus;
  q?: string;
  page?: number;
  limit?: number;
}

/** Search/list users (super_admin). */
export function useAdminUsers(query: AdminUsersQuery = {}) {
  const client = useApiClient();
  return useQuery({
    queryKey: queryKeys.adminUsers(query),
    queryFn: () => unwrap(client.GET('/api/v1/admin/users', { params: { query } })),
  });
}

/** Suspend / activate / reset a user's status. */
export function useUpdateUserStatus() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: UserStatus }) =>
      unwrap(
        client.PATCH('/api/v1/admin/users/{user_id}/status', {
          params: { path: { user_id: userId } },
          body: { status },
        }),
      ),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export type AuditModule =
  | 'auth'
  | 'users'
  | 'stores'
  | 'catalog'
  | 'orders'
  | 'errands'
  | 'delivery'
  | 'payments'
  | 'reviews'
  | 'notifications'
  | 'ai'
  | 'admin';

export interface AuditLogsQuery {
  module?: AuditModule;
  action?: string;
  actor_id?: string;
  result?: string;
  page?: number;
  limit?: number;
}

/** Search the append-only audit trail (newest first). */
export function useAuditLogs(query: AuditLogsQuery = {}) {
  const client = useApiClient();
  return useQuery({
    queryKey: queryKeys.auditLogs(query),
    queryFn: () => unwrap(client.GET('/api/v1/admin/audit-logs', { params: { query } })),
  });
}

/** Global platform config. */
export function useAdminConfig() {
  const client = useApiClient();
  return useQuery({
    queryKey: queryKeys.adminConfig(),
    queryFn: () => unwrap(client.GET('/api/v1/admin/config')),
  });
}

export function useUpdateAdminConfig() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ConfigUpdate) => unwrap(client.PATCH('/api/v1/admin/config', { body })),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.adminConfig() }),
  });
}

// --- Collaborator verification queue ---------------------------------------

/** Collaborator profiles for the admin verification queue, optionally filtered. */
export function useAdminCollaborators(status?: VerificationStatus) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['admin', 'collaborators', status ?? 'all'],
    queryFn: () =>
      unwrap(
        client.GET('/api/v1/admin/collaborators', {
          params: { query: status ? { status } : {} },
        }),
      ),
  });
}

/** Approve / reject / request-more-info on a collaborator. */
export function useVerifyCollaborator() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      status,
      reason,
    }: {
      userId: string;
      status: VerificationStatus;
      reason?: string;
    }) =>
      unwrap(
        client.PATCH('/api/v1/collaborator/{user_id}/verification', {
          params: { path: { user_id: userId } },
          body: { status, reason: reason ?? null },
        }),
      ),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'collaborators'] }),
  });
}

// --- Settlements ------------------------------------------------------------

/** Seller commission settlements (admin), optionally by store. */
export function useAdminSettlements(storeId?: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['admin', 'settlements', storeId ?? 'all'],
    queryFn: () =>
      unwrap(
        client.GET('/api/v1/admin/settlements', {
          params: { query: storeId ? { store_id: storeId } : {} },
        }),
      ),
  });
}

export function useGenerateSettlement() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: GenerateSettlement) =>
      unwrap(client.POST('/api/v1/admin/settlements', { body })),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'settlements'] }),
  });
}

export function useMarkSettlementPaid() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ settlementId, paymentRef }: { settlementId: string; paymentRef?: string }) =>
      unwrap(
        client.POST('/api/v1/admin/settlements/{settlement_id}/pay', {
          params: { path: { settlement_id: settlementId } },
          body: { payment_ref: paymentRef ?? null },
        }),
      ),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'settlements'] }),
  });
}
