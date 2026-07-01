import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ApiError } from '@barriapp/api-client';
import { useCreateErrand } from '@barriapp/api-client/react';
import { Button, ErrorText, Field, Subtitle, Title, colors } from '@/components/ui';

export default function NewErrand() {
  const router = useRouter();
  const createErrand = useCreateErrand();

  const [title, setTitle] = useState('');
  const [line, setLine] = useState('');
  const [fee, setFee] = useState('');
  const [estimated, setEstimated] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    const feeNum = parseInt(fee, 10);
    if (!title.trim() || !line.trim() || !feeNum) {
      setError('Título, dirección y tarifa son obligatorios.');
      return;
    }
    try {
      const errand = await createErrand.mutateAsync({
        title: title.trim(),
        dropoff: {
          label: 'Entrega',
          line: line.trim(),
          geo: { type: 'Point', coordinates: [-74.081, 4.609] },
          is_default: false,
        },
        offered_fee: feeNum,
        estimated_cost: parseInt(estimated, 10) || null,
      });
      router.replace(`/errands/${errand.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo publicar el mandado.');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title>Publicar un mandado</Title>
      <Subtitle>Pide un favor y ofrece una propina.</Subtitle>

      <Field label="¿Qué necesitas?" value={title} onChangeText={setTitle} placeholder="Comprar arroz y aceite" />
      <Field label="Dirección de entrega" value={line} onChangeText={setLine} placeholder="Cra 9 #1-1" />
      <Field label="Tarifa ofrecida (COP)" value={fee} onChangeText={setFee} keyboardType="number-pad" placeholder="8000" />
      <Field label="Costo estimado de compra (opcional)" value={estimated} onChangeText={setEstimated} keyboardType="number-pad" placeholder="20000" />
      <Text style={styles.hint}>El costo de la compra se paga aparte, en efectivo, al recibir.</Text>

      <ErrorText>{error}</ErrorText>
      <Button title="Publicar mandado" onPress={submit} loading={createErrand.isPending} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 14 },
  hint: { fontSize: 12, color: colors.muted },
});
