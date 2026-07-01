import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { formatCOP } from '@barriapp/shared';
import { ApiError } from '@barriapp/api-client';
import {
  useCreateProduct,
  useDeleteProduct,
  useStoreProducts,
  useUpdateProduct,
} from '@barriapp/api-client/react';
import { Button, ErrorText, Field, colors } from '@/components/ui';

export default function SellerProducts() {
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const id = storeId ?? '';

  const { data: products, isLoading } = useStoreProducts(id, false);
  const createProduct = useCreateProduct(id);
  const updateProduct = useUpdateProduct(id);
  const deleteProduct = useDeleteProduct(id);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('und');
  const [error, setError] = useState<string | null>(null);

  async function add() {
    setError(null);
    const priceNum = parseInt(price, 10);
    if (!name.trim() || !priceNum) {
      setError('Nombre y precio son obligatorios.');
      return;
    }
    try {
      await createProduct.mutateAsync({ name: name.trim(), price: priceNum, unit: unit.trim() || 'und' });
      setName('');
      setPrice('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo crear el producto.');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.section}>Agregar producto</Text>
      <Field label="Nombre" value={name} onChangeText={setName} placeholder="Arroz 500g" />
      <View style={styles.row}>
        <View style={{ flex: 2 }}>
          <Field label="Precio (COP)" value={price} onChangeText={setPrice} keyboardType="number-pad" placeholder="3500" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Unidad" value={unit} onChangeText={setUnit} placeholder="und" />
        </View>
      </View>
      <ErrorText>{error}</ErrorText>
      <Button title="Agregar" onPress={add} loading={createProduct.isPending} />

      <Text style={styles.section}>Catálogo</Text>
      {isLoading && <ActivityIndicator />}
      {products?.length === 0 && <Text style={styles.muted}>Sin productos todavía.</Text>}
      {products?.map((p) => (
        <View key={p.id} style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{p.name}</Text>
            <Text style={styles.muted}>
              {formatCOP(p.price)} · {p.unit}
            </Text>
          </View>
          <Pressable
            style={[styles.avail, p.is_available ? styles.availOn : styles.availOff]}
            onPress={() =>
              updateProduct.mutate({ productId: p.id, body: { is_available: !p.is_available } })
            }
          >
            <Text style={[styles.availText, p.is_available ? styles.availTextOn : styles.availTextOff]}>
              {p.is_available ? 'Disponible' : 'Agotado'}
            </Text>
          </Pressable>
          <Pressable onPress={() => deleteProduct.mutate(p.id)} hitSlop={8} style={styles.del}>
            <Text style={styles.delText}>🗑</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  section: { fontSize: 16, fontWeight: '700', marginTop: 12, color: colors.text },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  muted: { color: colors.muted, fontSize: 13, marginTop: 2 },
  avail: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  availOn: { backgroundColor: '#e7f5ec' },
  availOff: { backgroundColor: '#fdecea' },
  availText: { fontWeight: '700', fontSize: 12 },
  availTextOn: { color: colors.primaryDark },
  availTextOff: { color: colors.danger },
  del: { padding: 4 },
  delText: { fontSize: 18 },
});
