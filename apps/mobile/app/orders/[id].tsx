import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { formatCOP } from '@barriapp/shared';
import { ApiError } from '@barriapp/api-client';
import { useOrder } from '@barriapp/api-client/react';
import { colors } from '@/components/ui';
import { ReviewSection } from '@/components/ReviewSection';
import { DELIVERY_STATUS_LABEL, ORDER_STATUS_LABEL, ORDER_STEPS } from '@/lib/status';
import { useDeliveryTracking } from '@/lib/useDeliveryTracking';

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // Poll every 5s so status changes (accept → preparing → …) show live.
  const { data: order, isLoading, error } = useOrder(id ?? '', { refetchInterval: 5000 });
  // Live courier tracking once the order has a delivery (after assignment).
  const tracking = useDeliveryTracking(order?.delivery_id ?? null);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }
  if (error || !order) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error instanceof ApiError ? error.message : 'No se pudo cargar el pedido.'}
        </Text>
      </View>
    );
  }

  const cancelled = order.status === 'cancelled';
  const currentStep = ORDER_STEPS.indexOf(order.status);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.code}>{order.code}</Text>
      <View style={[styles.badge, cancelled && styles.badgeCancelled]}>
        <Text style={[styles.badgeText, cancelled && styles.badgeTextCancelled]}>
          {ORDER_STATUS_LABEL[order.status]}
        </Text>
      </View>

      {!cancelled && (
        <View style={styles.timeline}>
          {ORDER_STEPS.map((step, i) => {
            const done = i <= currentStep;
            return (
              <View key={step} style={styles.stepRow}>
                <View style={[styles.dot, done && styles.dotDone]} />
                <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>
                  {ORDER_STATUS_LABEL[step]}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {order.delivery_id && (
        <View style={styles.tracking}>
          <View style={styles.trackingHeader}>
            <Text style={styles.trackingTitle}>Seguimiento en vivo</Text>
            <View style={styles.liveTag}>
              <View
                style={[styles.liveDot, tracking.connected ? styles.liveDotOn : styles.liveDotOff]}
              />
              <Text style={styles.liveTagText}>
                {tracking.mode === 'ws' && tracking.connected
                  ? 'En vivo'
                  : tracking.mode === 'polling'
                    ? 'Actualizando'
                    : 'Conectando…'}
              </Text>
            </View>
          </View>
          {tracking.error ? (
            <Text style={styles.muted}>{tracking.error}</Text>
          ) : (
            <>
              <Text style={styles.trackingStatus}>
                {tracking.status ? DELIVERY_STATUS_LABEL[tracking.status] : 'Esperando al repartidor…'}
              </Text>
              {tracking.lastPoint && (
                <Text style={styles.muted}>
                  Última ubicación del repartidor: {tracking.lastPoint[1].toFixed(5)},{' '}
                  {tracking.lastPoint[0].toFixed(5)}
                </Text>
              )}
            </>
          )}
        </View>
      )}

      <Text style={styles.section}>Productos</Text>
      {order.items.map((it) => (
        <View key={it.product_id} style={styles.itemRow}>
          <Text style={styles.itemName}>
            {it.qty}× {it.name}
          </Text>
          <Text style={styles.muted}>{formatCOP(it.subtotal)}</Text>
        </View>
      ))}

      <Text style={styles.section}>Resumen</Text>
      <Amount label="Productos" value={order.amounts.items_total} />
      <Amount label="Domicilio" value={order.amounts.delivery_fee} />
      {order.amounts.discount > 0 && <Amount label="Descuento" value={-order.amounts.discount} />}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total a pagar</Text>
        <Text style={styles.totalValue}>{formatCOP(order.amounts.total)}</Text>
      </View>
      <Text style={styles.muted}>
        Pago: {order.payment_method === 'cash' ? 'Efectivo (contra entrega)' : 'Wompi'} · Comisión
        plataforma {formatCOP(order.amounts.platform_fee)}
      </Text>

      {order.status === 'delivered' && (
        <ReviewSection orderId={order.id} hasCollaborator={Boolean(order.collaborator_id)} />
      )}
    </ScrollView>
  );
}

function Amount({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.amountRow}>
      <Text style={styles.amountLabel}>{label}</Text>
      <Text style={styles.amountValue}>{formatCOP(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  code: { fontSize: 22, fontWeight: '700', color: colors.text },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e7f5ec',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 4,
  },
  badgeCancelled: { backgroundColor: '#fdecea' },
  badgeText: { color: colors.primaryDark, fontWeight: '700' },
  badgeTextCancelled: { color: colors.danger },
  timeline: { marginTop: 16, gap: 10 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  dotDone: { backgroundColor: colors.primary },
  stepLabel: { color: colors.muted, fontSize: 14 },
  stepLabelDone: { color: colors.text, fontWeight: '600' },
  tracking: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 6,
    backgroundColor: '#f9fafb',
  },
  trackingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  trackingTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  trackingStatus: { fontSize: 16, fontWeight: '600', color: colors.primaryDark },
  liveTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveDotOn: { backgroundColor: colors.primary },
  liveDotOff: { backgroundColor: colors.muted },
  liveTagText: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  section: { fontSize: 16, fontWeight: '700', marginTop: 20, color: colors.text },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  itemName: { fontSize: 15, color: colors.text },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  amountLabel: { color: colors.muted, fontSize: 14 },
  amountValue: { color: colors.text, fontSize: 14 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  totalValue: { fontSize: 18, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, fontSize: 13, marginTop: 8 },
  error: { color: colors.danger, fontSize: 14 },
});
