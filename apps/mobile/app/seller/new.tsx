import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ApiError } from '@barriapp/api-client';
import { useCreateStore } from '@barriapp/api-client/react';
import { Button, ErrorText, Field, Subtitle, Title, colors } from '@/components/ui';

export default function NewStore() {
  const router = useRouter();
  const createStore = useCreateStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [line, setLine] = useState('');
  const [city, setCity] = useState('Bogotá');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    if (!name.trim() || !line.trim()) {
      setError('Nombre y dirección son obligatorios.');
      return;
    }
    try {
      const store = await createStore.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
        location: {
          line: line.trim(),
          city: city.trim() || null,
          // Default location; a map picker replaces this later.
          geo: { type: 'Point', coordinates: [-74.081, 4.609] },
        },
      });
      router.replace(`/seller/${store.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo crear la tienda.');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title>Crea tu tienda</Title>
      <Subtitle>Empieza a vender en tu barrio.</Subtitle>

      <Field label="Nombre" value={name} onChangeText={setName} placeholder="Tienda Doña Ana" />
      <Field
        label="Descripción (opcional)"
        value={description}
        onChangeText={setDescription}
        placeholder="Víveres y abarrotes"
      />
      <Field label="Dirección" value={line} onChangeText={setLine} placeholder="Cra 10 #20-30" />
      <Field label="Ciudad" value={city} onChangeText={setCity} placeholder="Bogotá" />
      <Text style={styles.hint}>
        La ubicación exacta en el mapa se configura luego; usamos una por defecto.
      </Text>

      <ErrorText>{error}</ErrorText>
      <Button title="Crear tienda" onPress={onSubmit} loading={createStore.isPending} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 14 },
  hint: { fontSize: 12, color: colors.muted },
});
