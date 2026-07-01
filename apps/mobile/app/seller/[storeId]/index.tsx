import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ApiError } from '@barriapp/api-client';
import { useSetStoreStatus, useStore, useUpdateStore } from '@barriapp/api-client/react';
import { Button, ErrorText, Field, colors } from '@/components/ui';

export default function ManageStore() {
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const router = useRouter();
  const id = storeId ?? '';

  const { data: store, isLoading } = useStore(id);
  const setStatus = useSetStoreStatus(id);
  const updateStore = useUpdateStore(id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [baseFee, setBaseFee] = useState('0');
  const [minOrder, setMinOrder] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Seed the form once the store loads.
  useEffect(() => {
    if (store) {
      setName(store.name);
      setDescription(store.description ?? '');
      setBaseFee(String(store.delivery.base_fee));
      setMinOrder(String(store.delivery.min_order));
    }
  }, [store]);

  if (isLoading || !store) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const isOpen = store.status === 'open';

  async function save() {
    setError(null);
    setSaved(false);
    try {
      await updateStore.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
        delivery: {
          ...store!.delivery,
          base_fee: parseInt(baseFee, 10) || 0,
          min_order: parseInt(minOrder, 10) || 0,
        },
      });
      setSaved(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar.');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.name}>{store.name}</Text>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>
          Estado: <Text style={{ fontWeight: '700' }}>{isOpen ? 'Abierta' : 'Cerrada'}</Text>
        </Text>
        <Pressable
          style={[styles.toggle, isOpen ? styles.toggleOpen : styles.toggleClosed]}
          onPress={() => setStatus.mutate(isOpen ? 'closed' : 'open')}
          disabled={setStatus.isPending}
        >
          <Text style={styles.toggleText}>{isOpen ? 'Cerrar' : 'Abrir'}</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Datos</Text>
      <Field label="Nombre" value={name} onChangeText={setName} />
      <Field label="Descripción" value={description} onChangeText={setDescription} />

      <Text style={styles.section}>Domicilio (COP)</Text>
      <Field label="Tarifa base" value={baseFee} onChangeText={setBaseFee} keyboardType="number-pad" />
      <Field label="Pedido mínimo" value={minOrder} onChangeText={setMinOrder} keyboardType="number-pad" />

      <ErrorText>{error}</ErrorText>
      {saved && <Text style={styles.saved}>Cambios guardados ✓</Text>}
      <Button title="Guardar cambios" onPress={save} loading={updateStore.isPending} />

      <View style={{ height: 8 }} />
      <Button
        title="Pedidos de la tienda"
        onPress={() => router.push(`/seller/${id}/orders`)}
      />
      <Button
        title="Gestionar productos"
        variant="ghost"
        onPress={() => router.push(`/seller/${id}/products`)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 22, fontWeight: '700', color: colors.text },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
  },
  statusLabel: { fontSize: 15, color: colors.text },
  toggle: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  toggleOpen: { backgroundColor: '#fdecea' },
  toggleClosed: { backgroundColor: '#e7f5ec' },
  toggleText: { fontWeight: '700', color: colors.text },
  section: { fontSize: 16, fontWeight: '700', marginTop: 12, color: colors.text },
  saved: { color: colors.primaryDark, fontWeight: '600' },
});
