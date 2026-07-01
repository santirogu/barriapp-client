import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { formatDateTime } from '@barriapp/shared';
import { ApiError } from '@barriapp/api-client';
import { useMarkNotificationRead, useNotifications } from '@barriapp/api-client/react';
import { colors } from '@/components/ui';

export default function Notifications() {
  const router = useRouter();
  const { data: items, isLoading, error } = useNotifications({ limit: 30 });
  const markRead = useMarkNotificationRead();

  function onPress(id: string, data: unknown, read: boolean) {
    if (!read) markRead.mutate(id);
    const orderId = (data as { order_id?: string } | null)?.order_id;
    if (orderId) router.push(`/orders/${orderId}`);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isLoading && <ActivityIndicator />}
      {error && (
        <Text style={styles.error}>
          {error instanceof ApiError ? error.message : 'No se pudieron cargar las notificaciones.'}
        </Text>
      )}
      {items?.length === 0 && <Text style={styles.muted}>No tienes notificaciones.</Text>}
      {items?.map((n) => (
        <Pressable
          key={n.id}
          style={({ pressed }) => [styles.card, !n.read && styles.unread, pressed && styles.pressed]}
          onPress={() => onPress(n.id, n.data, n.read)}
        >
          <View style={styles.row}>
            {!n.read && <View style={styles.dot} />}
            <Text style={styles.title}>{n.title}</Text>
          </View>
          <Text style={styles.body}>{n.body}</Text>
          <Text style={styles.time}>{formatDateTime(n.created_at)}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 12 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  unread: { backgroundColor: '#f0f9f4', borderColor: '#cdead8' },
  pressed: { opacity: 0.7 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  body: { fontSize: 14, color: colors.text },
  time: { fontSize: 12, color: colors.muted, marginTop: 2 },
  muted: { color: colors.muted, fontSize: 13 },
  error: { color: colors.danger, fontSize: 14 },
});
