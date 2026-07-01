import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { formatCOP } from '@barriapp/shared';
import { ApiError } from '@barriapp/api-client';
import { useOrders } from '@barriapp/api-client/react';
import { colors } from '@/components/ui';
import { ORDER_STATUS_LABEL } from '@/lib/status';

export default function Orders() {
  const router = useRouter();
  const { data: orders, isLoading, error } = useOrders({ limit: 20 });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isLoading && <ActivityIndicator />}
      {error && (
        <Text style={styles.error}>
          {error instanceof ApiError ? error.message : 'No se pudieron cargar los pedidos.'}
        </Text>
      )}
      {orders?.length === 0 && <Text style={styles.muted}>Aún no tienes pedidos.</Text>}
      {orders?.map((o) => (
        <Pressable
          key={o.id}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          onPress={() => router.push(`/orders/${o.id}`)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.code}>{o.code}</Text>
            <Text style={styles.muted}>{ORDER_STATUS_LABEL[o.status] ?? o.status}</Text>
          </View>
          <Text style={styles.total}>{formatCOP(o.amounts.total)}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 12 },
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
  code: { fontSize: 15, fontWeight: '700', color: colors.text },
  total: { fontSize: 15, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, fontSize: 13, marginTop: 2 },
  error: { color: colors.danger, fontSize: 14 },
});
