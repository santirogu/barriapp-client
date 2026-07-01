import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { formatCOP, type PaymentMethod } from '@barriapp/shared';
import { ApiError } from '@barriapp/api-client';
import { useCreateOrder } from '@barriapp/api-client/react';
import { Button, ErrorText, Field, colors } from '@/components/ui';
import { cartSubtotal, useCart } from '@/lib/cart';

export default function Cart() {
  const router = useRouter();
  const createOrder = useCreateOrder();

  const storeId = useCart((s) => s.storeId);
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const clear = useCart((s) => s.clear);

  const items = Object.values(lines);
  const subtotal = cartSubtotal(lines);

  const [label, setLabel] = useState('Casa');
  const [line, setLine] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    if (!storeId || items.length === 0) return;
    if (!line.trim()) {
      setError('Ingresa una dirección de entrega.');
      return;
    }
    try {
      const order = await createOrder.mutateAsync({
        store_id: storeId,
        items: items.map((l) => ({ product_id: l.product.id, qty: l.qty })),
        delivery_address: {
          label: label.trim() || 'Casa',
          line: line.trim(),
          geo: { type: 'Point', coordinates: [-74.081, 4.609] },
          is_default: false,
        },
        payment_method: method,
      });
      clear();
      // Wompi orders go to the payment screen (intent + confirmation); cash
      // settles on delivery, so go straight to the order.
      if (method === 'wompi') {
        router.replace(`/pay/${order.id}`);
      } else {
        router.replace(`/orders/${order.id}`);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo crear el pedido.');
    }
  }

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.muted}>Tu carrito está vacío.</Text>
        <Button title="Explorar tiendas" variant="ghost" onPress={() => router.replace('/')} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {items.map((l) => (
        <View key={l.product.id} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{l.product.name}</Text>
            <Text style={styles.muted}>{formatCOP(l.product.price)}</Text>
          </View>
          <View style={styles.stepper}>
            <Pressable style={styles.stepBtn} onPress={() => setQty(l.product.id, l.qty - 1)}>
              <Text style={styles.stepText}>−</Text>
            </Pressable>
            <Text style={styles.qty}>{l.qty}</Text>
            <Pressable style={styles.stepBtn} onPress={() => setQty(l.product.id, l.qty + 1)}>
              <Text style={styles.stepText}>+</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <View style={styles.subtotalRow}>
        <Text style={styles.subtotalLabel}>Subtotal (productos)</Text>
        <Text style={styles.subtotalValue}>{formatCOP(subtotal)}</Text>
      </View>
      <Text style={styles.hint}>
        El total final (domicilio y comisión) lo calcula el servidor al crear el pedido.
      </Text>

      <Text style={styles.section}>Entrega</Text>
      <Field label="Etiqueta" value={label} onChangeText={setLabel} placeholder="Casa" />
      <Field
        label="Dirección"
        value={line}
        onChangeText={setLine}
        placeholder="Cra 9 #1-1, apto 401"
      />

      <Text style={styles.section}>Pago</Text>
      <View style={styles.methods}>
        <Pressable
          style={[styles.method, method === 'cash' && styles.methodOn]}
          onPress={() => setMethod('cash')}
        >
          <Text style={[styles.methodText, method === 'cash' && styles.methodTextOn]}>
            Efectivo
          </Text>
        </Pressable>
        <Pressable
          style={[styles.method, method === 'wompi' && styles.methodOn]}
          onPress={() => setMethod('wompi')}
        >
          <Text style={[styles.methodText, method === 'wompi' && styles.methodTextOn]}>
            Wompi (online)
          </Text>
        </Pressable>
      </View>
      {method === 'wompi' && (
        <Text style={styles.hint}>
          Al continuar te llevamos a la pantalla de pago para confirmar con Wompi.
        </Text>
      )}

      <ErrorText>{error}</ErrorText>
      <View style={{ height: 8 }} />
      <Button title="Crear pedido" onPress={onSubmit} loading={createOrder.isPending} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
  },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 20, color: colors.text },
  qty: { fontSize: 16, fontWeight: '600', minWidth: 20, textAlign: 'center' },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  subtotalLabel: { fontSize: 15, color: colors.text },
  subtotalValue: { fontSize: 16, fontWeight: '700', color: colors.text },
  hint: { fontSize: 12, color: colors.muted },
  section: { fontSize: 16, fontWeight: '700', marginTop: 16, color: colors.text },
  methods: { flexDirection: 'row', gap: 12 },
  method: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  methodOn: { borderColor: colors.primary, backgroundColor: '#e7f5ec' },
  methodText: { fontWeight: '600', color: colors.muted },
  methodTextOn: { color: colors.primaryDark },
  muted: { color: colors.muted, fontSize: 13 },
});
