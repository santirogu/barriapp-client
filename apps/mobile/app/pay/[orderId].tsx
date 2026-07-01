import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { formatCOP } from '@barriapp/shared';
import { ApiError, type IntentResponse } from '@barriapp/api-client';
import { usePayment, usePaymentIntent } from '@barriapp/api-client/react';
import { Button, ErrorText, colors } from '@/components/ui';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente de confirmación',
  approved: 'Pago aprobado',
  declined: 'Pago rechazado',
  refunded: 'Reembolsado',
};

export default function Pay() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();

  const createIntent = usePaymentIntent();
  const [intent, setIntent] = useState<IntentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  // Create the payment intent once on entry.
  useEffect(() => {
    if (started.current || !orderId) return;
    started.current = true;
    createIntent
      .mutateAsync(orderId)
      .then(setIntent)
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : 'No se pudo iniciar el pago.'),
      );
  }, [orderId, createIntent]);

  // Poll the payment until it resolves.
  const { data: payment } = usePayment(intent?.payment_id ?? null, {
    refetchInterval: intent && intent.status !== 'approved' ? 3000 : undefined,
  });
  const status = payment?.status ?? intent?.status ?? 'pending';

  // On approval, continue to the order.
  useEffect(() => {
    if (status === 'approved' && orderId) {
      const t = setTimeout(() => router.replace(`/orders/${orderId}`), 900);
      return () => clearTimeout(t);
    }
  }, [status, orderId, router]);

  if (createIntent.isPending && !intent) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>Iniciando el pago…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pago con Wompi</Text>
      <ErrorText>{error}</ErrorText>

      {intent && (
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.muted}>Monto</Text>
            <Text style={styles.amount}>{formatCOP(intent.amount)}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.muted}>Referencia</Text>
            <Text style={styles.ref}>{intent.reference}</Text>
          </View>
        </View>
      )}

      <View style={[styles.badge, status === 'approved' && styles.badgeOk, status === 'declined' && styles.badgeBad]}>
        {status === 'pending' && <ActivityIndicator size="small" color={colors.primaryDark} />}
        <Text style={[styles.badgeText, status === 'declined' && styles.badgeTextBad]}>
          {STATUS_LABEL[status] ?? status}
        </Text>
      </View>

      {status === 'pending' && (
        <Text style={styles.muted}>
          Completa el pago en Wompi. Confirmamos automáticamente cuando Wompi nos
          notifique (webhook). Esta pantalla se actualiza sola.
        </Text>
      )}
      {status === 'approved' && (
        <Text style={styles.okText}>¡Pago confirmado! Abriendo tu pedido…</Text>
      )}

      <View style={{ height: 8 }} />
      {status !== 'approved' && (
        <Button title="Ver mi pedido" variant="ghost" onPress={() => router.replace(`/orders/${orderId}`)} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount: { fontSize: 18, fontWeight: '700', color: colors.text },
  ref: { fontSize: 14, color: colors.text, fontWeight: '600' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#eef2f7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  badgeOk: { backgroundColor: '#e7f5ec' },
  badgeBad: { backgroundColor: '#fdecea' },
  badgeText: { color: colors.primaryDark, fontWeight: '700' },
  badgeTextBad: { color: colors.danger },
  okText: { color: colors.primaryDark, fontWeight: '600', fontSize: 15 },
  muted: { color: colors.muted, fontSize: 13 },
});
