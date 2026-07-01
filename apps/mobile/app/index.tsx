import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ApiError } from '@barriapp/api-client';
import { useLogout, useStores, useUnreadCount } from '@barriapp/api-client/react';
import { Button, colors } from '@/components/ui';
import { useSession } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const user = useSession((s) => s.user);
  const signOut = useSession((s) => s.signOut);
  const logout = useLogout();
  const { data: stores, isLoading, error, refetch, isRefetching } = useStores({ limit: 20 });
  const { data: unread } = useUnreadCount({ refetchInterval: 15000 });

  async function onLogout() {
    try {
      await logout.mutateAsync();
    } catch {
      // best-effort server logout
    }
    await signOut();
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      onScrollEndDrag={() => void refetch()}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>Hola, {user?.full_name ?? 'usuario'} 👋</Text>
          <View style={styles.roles}>
            {(user?.roles ?? []).map((r) => (
              <View key={r} style={styles.chip}>
                <Text style={styles.chipText}>{r}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={() => router.push('/notifications')} hitSlop={8}>
            <View>
              <Text style={styles.bell}>🔔</Text>
              {!!unread?.unread && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unread.unread > 9 ? '9+' : unread.unread}</Text>
                </View>
              )}
            </View>
          </Pressable>
          <Pressable onPress={() => router.push('/orders')} hitSlop={8}>
            <Text style={styles.link}>Mis pedidos</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.section}>Tiendas cerca</Text>
      {(isLoading || isRefetching) && <ActivityIndicator />}
      {error && (
        <Text style={styles.error}>
          {error instanceof ApiError ? error.message : 'No se pudieron cargar las tiendas.'}
        </Text>
      )}
      {stores?.length === 0 && <Text style={styles.muted}>No hay tiendas aún.</Text>}
      {stores?.map((s) => (
        <Pressable
          key={s.id}
          style={({ pressed }) => [styles.storeCard, pressed && styles.pressed]}
          onPress={() => router.push(`/store/${s.id}`)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.storeName}>{s.name}</Text>
            <Text style={styles.muted}>
              {s.location.city ?? s.location.line} · {s.status}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}

      <View style={{ height: 24 }} />
      <Button title="Cerrar sesión" variant="ghost" onPress={onLogout} loading={logout.isPending} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 64, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'flex-start' },
  hello: { fontSize: 24, fontWeight: '700', color: colors.text },
  roles: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  chip: { backgroundColor: '#e7f5ec', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  chipText: { color: colors.primaryDark, fontSize: 12, fontWeight: '600' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: 4 },
  bell: { fontSize: 22 },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  link: { color: colors.primary, fontWeight: '600' },
  section: { fontSize: 16, fontWeight: '700', marginTop: 16, color: colors.text },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  pressed: { backgroundColor: '#f3f4f6' },
  storeName: { fontSize: 16, fontWeight: '600', color: colors.text },
  chevron: { fontSize: 24, color: colors.muted },
  muted: { color: colors.muted, fontSize: 13 },
  error: { color: colors.danger, fontSize: 14 },
});
