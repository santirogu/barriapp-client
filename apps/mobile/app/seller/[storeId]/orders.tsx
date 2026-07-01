import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { formatCOP } from '@barriapp/shared';
import type { OrderStatus } from '@barriapp/shared';
import { ApiError } from '@barriapp/api-client';
import { useSellerOrderActions, useStoreOrders } from '@barriapp/api-client/react';
import { Button, ErrorText, colors } from '@/components/ui';
import { ORDER_STATUS_LABEL } from '@/lib/status';

const FILTERS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'pending', label: 'Nuevos' },
  { key: 'accepted', label: 'Aceptados' },
  { key: 'preparing', label: 'Preparando' },
  { key: 'ready', label: 'Listos' },
];

export default function SellerOrders() {
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const id = storeId ?? '';

  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const { data: orders, isLoading } = useStoreOrders(id, filter === 'all' ? undefined : filter);
  const actions = useSellerOrderActions(id);
  const [error, setError] = useState<string | null>(null);

  function run(p: Promise<unknown>) {
    setError(null);
    p.catch((e) =>
      setError(e instanceof ApiError ? e.message : 'No se pudo actualizar el pedido.'),
    );
  }

  const busy =
    actions.accept.isPending ||
    actions.advance.isPending ||
    actions.assign.isPending ||
    actions.reject.isPending;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            style={[styles.chip, filter === f.key && styles.chipOn]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.chipText, filter === f.key && styles.chipTextOn]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      <ErrorText>{error}</ErrorText>
      {isLoading && <ActivityIndicator />}
      {orders?.length === 0 && <Text style={styles.muted}>No hay pedidos en esta vista.</Text>}

      {orders?.map((o) => (
        <View key={o.id} style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.code}>{o.code}</Text>
            <Text style={styles.total}>{formatCOP(o.amounts.total)}</Text>
          </View>
          <Text style={styles.status}>{ORDER_STATUS_LABEL[o.status] ?? o.status}</Text>
          <Text style={styles.items}>
            {o.items.map((it) => `${it.qty}× ${it.name}`).join(', ')}
          </Text>

          <View style={styles.actions}>
            {o.status === 'pending' && (
              <>
                <Button title="Aceptar" onPress={() => run(actions.accept.mutateAsync(o.id))} loading={busy} />
                <Button
                  title="Rechazar"
                  variant="ghost"
                  onPress={() => run(actions.reject.mutateAsync({ orderId: o.id }))}
                  loading={busy}
                />
              </>
            )}
            {o.status === 'accepted' && (
              <Button
                title="Poner en preparación"
                onPress={() => run(actions.advance.mutateAsync({ orderId: o.id, status: 'preparing' }))}
                loading={busy}
              />
            )}
            {o.status === 'preparing' && (
              <Button
                title="Marcar listo"
                onPress={() => run(actions.advance.mutateAsync({ orderId: o.id, status: 'ready' }))}
                loading={busy}
              />
            )}
            {o.status === 'ready' && (
              <Button
                title="Asignar repartidor"
                onPress={() => run(actions.assign.mutateAsync(o.id))}
                loading={busy}
              />
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.muted, fontWeight: '600', fontSize: 13 },
  chipTextOn: { color: '#fff' },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  code: { fontSize: 15, fontWeight: '700', color: colors.text },
  total: { fontSize: 15, fontWeight: '700', color: colors.text },
  status: { color: colors.primaryDark, fontWeight: '600', fontSize: 13 },
  items: { color: colors.muted, fontSize: 13 },
  actions: { gap: 8, marginTop: 8 },
  muted: { color: colors.muted, fontSize: 13 },
});
