import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { formatCOP } from '@barriapp/shared';
import { ApiError } from '@barriapp/api-client';
import { useStore, useStoreProducts } from '@barriapp/api-client/react';
import { colors } from '@/components/ui';
import { cartCount, useCart } from '@/lib/cart';

export default function StoreDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const storeId = id ?? '';

  const store = useStore(storeId);
  const products = useStoreProducts(storeId, true);

  const lines = useCart((s) => s.lines);
  const add = useCart((s) => s.add);
  const count = cartCount(lines);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.container}>
        {store.data && (
          <View>
            <Text style={styles.name}>{store.data.name}</Text>
            {store.data.description ? (
              <Text style={styles.muted}>{store.data.description}</Text>
            ) : null}
            <Text style={styles.muted}>
              {store.data.location.line}
              {store.data.location.city ? `, ${store.data.location.city}` : ''} · {store.data.status}
            </Text>
          </View>
        )}

        <Text style={styles.section}>Productos</Text>
        {products.isLoading && <ActivityIndicator />}
        {products.error && (
          <Text style={styles.error}>
            {products.error instanceof ApiError
              ? products.error.message
              : 'No se pudo cargar el catálogo.'}
          </Text>
        )}
        {products.data?.length === 0 && (
          <Text style={styles.muted}>Esta tienda aún no tiene productos.</Text>
        )}
        {products.data?.map((p) => (
          <View key={p.id} style={styles.productRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{p.name}</Text>
              <Text style={styles.price}>
                {formatCOP(p.price)} · {p.unit}
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
              onPress={() => add(storeId, p)}
            >
              <Text style={styles.addBtnText}>Agregar</Text>
            </Pressable>
          </View>
        ))}
        <View style={{ height: 96 }} />
      </ScrollView>

      {count > 0 && (
        <Pressable style={styles.cartBar} onPress={() => router.push('/cart')}>
          <Text style={styles.cartBarText}>
            Ver carrito ({count} {count === 1 ? 'ítem' : 'ítems'})
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 8 },
  name: { fontSize: 22, fontWeight: '700', color: colors.text },
  section: { fontSize: 16, fontWeight: '700', marginTop: 16, color: colors.text },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 14,
    gap: 12,
  },
  productName: { fontSize: 15, fontWeight: '600', color: colors.text },
  price: { color: colors.muted, fontSize: 13, marginTop: 2 },
  addBtn: {
    backgroundColor: '#e7f5ec',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnPressed: { backgroundColor: '#d3ecdd' },
  addBtnText: { color: colors.primaryDark, fontWeight: '700' },
  muted: { color: colors.muted, fontSize: 13, marginTop: 4 },
  error: { color: colors.danger, fontSize: 14 },
  cartBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 28,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cartBarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
