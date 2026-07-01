import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ApiError } from '@barriapp/api-client';
import { useMyStores } from '@barriapp/api-client/react';
import { Button, colors } from '@/components/ui';

const STORE_STATUS_LABEL: Record<string, string> = {
  open: 'Abierta',
  closed: 'Cerrada',
  suspended: 'Suspendida',
};

export default function SellerHome() {
  const router = useRouter();
  const { data: stores, isLoading, error } = useMyStores();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isLoading && <ActivityIndicator />}
      {error && (
        <Text style={styles.error}>
          {error instanceof ApiError ? error.message : 'No se pudieron cargar tus tiendas.'}
        </Text>
      )}

      {stores?.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Aún no tienes tienda</Text>
          <Text style={styles.muted}>Crea una para empezar a vender.</Text>
          <Button title="Crear tienda" onPress={() => router.push('/seller/new')} />
        </View>
      )}

      {stores?.map((s) => (
        <Pressable
          key={s.id}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          onPress={() => router.push(`/seller/${s.id}`)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{s.name}</Text>
            <Text style={styles.muted}>{STORE_STATUS_LABEL[s.status] ?? s.status}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}

      {!!stores?.length && (
        <Button title="Crear otra tienda" variant="ghost" onPress={() => router.push('/seller/new')} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 12 },
  empty: { gap: 12, alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  pressed: { backgroundColor: '#f3f4f6' },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  chevron: { fontSize: 24, color: colors.muted },
  muted: { color: colors.muted, fontSize: 13, marginTop: 2 },
  error: { color: colors.danger, fontSize: 14 },
});
