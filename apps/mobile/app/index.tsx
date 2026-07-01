import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ApiError } from '@barriapp/api-client';
import { useLogout, useStores } from '@barriapp/api-client/react';
import { Button, colors } from '@/components/ui';
import { useSession } from '@/lib/api';

export default function Home() {
  const user = useSession((s) => s.user);
  const signOut = useSession((s) => s.signOut);
  const logout = useLogout();
  const { data: stores, isLoading, error } = useStores({ limit: 20 });

  async function onLogout() {
    try {
      await logout.mutateAsync();
    } catch {
      // best-effort server logout; clear locally regardless
    }
    await signOut();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
      </View>

      <Text style={styles.section}>Tiendas cerca</Text>
      {isLoading && <ActivityIndicator />}
      {error && (
        <Text style={styles.error}>
          {error instanceof ApiError ? error.message : 'No se pudieron cargar las tiendas.'}
        </Text>
      )}
      {stores?.length === 0 && <Text style={styles.muted}>No hay tiendas aún.</Text>}
      {stores?.map((s) => (
        <View key={s.id} style={styles.storeCard}>
          <Text style={styles.storeName}>{s.name}</Text>
          <Text style={styles.muted}>
            {s.location.city ?? s.location.line} · {s.status}
          </Text>
        </View>
      ))}

      <View style={{ height: 24 }} />
      <Button title="Cerrar sesión" variant="ghost" onPress={onLogout} loading={logout.isPending} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 64, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center' },
  hello: { fontSize: 24, fontWeight: '700', color: colors.text },
  roles: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  chip: {
    backgroundColor: '#e7f5ec',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipText: { color: colors.primaryDark, fontSize: 12, fontWeight: '600' },
  section: { fontSize: 16, fontWeight: '700', marginTop: 16, color: colors.text },
  storeCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  storeName: { fontSize: 16, fontWeight: '600', color: colors.text },
  muted: { color: colors.muted, fontSize: 13 },
  error: { color: colors.danger, fontSize: 14 },
});
