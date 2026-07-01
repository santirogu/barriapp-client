import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unwrap } from '../typed-client';
import { useApiClient } from './context';
import { queryKeys } from './query-keys';

/** The caller's in-app notifications (newest first). */
export function useNotifications(query: { page?: number; limit?: number } = {}) {
  const client = useApiClient();
  return useQuery({
    queryKey: queryKeys.notifications(query),
    queryFn: () => unwrap(client.GET('/api/v1/notifications', { params: { query } })),
  });
}

/** Unread notification count for the badge (polled). */
export function useUnreadCount(options?: { refetchInterval?: number }) {
  const client = useApiClient();
  return useQuery({
    queryKey: queryKeys.notificationsUnread(),
    queryFn: () => unwrap(client.GET('/api/v1/notifications/unread-count')),
    refetchInterval: options?.refetchInterval,
  });
}

/** Mark one notification read; refreshes the list + unread badge. */
export function useMarkNotificationRead() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      unwrap(
        client.POST('/api/v1/notifications/{notification_id}/read', {
          params: { path: { notification_id: notificationId } },
        }),
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/** Register this device's FCM token for push (idempotent). */
export function useRegisterDeviceToken() {
  const client = useApiClient();
  return useMutation({
    mutationFn: (token: string) =>
      unwrap(client.POST('/api/v1/me/device-tokens', { body: { token } })),
  });
}
