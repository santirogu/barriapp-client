import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Role, UserStatus } from '@barriapp/shared';
import { unwrap } from '../typed-client';
import type { ConfigUpdate } from '../schemas';
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
