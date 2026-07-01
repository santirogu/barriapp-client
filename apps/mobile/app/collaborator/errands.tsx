import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatCOP } from '@barriapp/shared';
import { ApiError } from '@barriapp/api-client';
import { useAssignedErrands, useAvailableErrands, useErrandActions } from '@barriapp/api-client/react';
import { Button, ErrorText, colors } from '@/components/ui';
import { ERRAND_STATUS_LABEL } from '@/lib/status';

// Example search location (a map/GPS picker replaces this later).
const NEAR = '-74.0812,4.6095';

export default function CollaboratorErrands() {
  const available = useAvailableErrands(NEAR, 8000);
  const assigned = useAssignedErrands();
  const { accept, advance } = useErrandActions();
  const [error, setError] = useState<string | null>(null);

  function run(p: Promise<unknown>) {
    setError(null);
    p.catch((e) => setError(e instanceof ApiError ? e.message : 'No se pudo actualizar el mandado.'));
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ErrorText>{error}</ErrorText>

      <Text style={styles.section}>Mandados en curso</Text>
      {assigned.isLoading && <ActivityIndicator />}
      {assigned.data?.filter((e) => e.status !== 'completed' && e.status !== 'cancelled').length ===
        0 && <Text style={styles.muted}>No tienes mandados en curso.</Text>}
      {assigned.data
        ?.filter((e) => e.status !== 'completed' && e.status !== 'cancelled')
        .map((e) => (
          <View key={e.id} style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.title}>{e.title}</Text>
              <Text style={styles.fee}>{formatCOP(e.offered_fee)}</Text>
            </View>
            <Text style={styles.status}>{ERRAND_STATUS_LABEL[e.status]}</Text>
            {e.status === 'assigned' && (
              <Button
                title="Empezar"
                loading={advance.isPending}
                onPress={() => run(advance.mutateAsync({ errandId: e.id, status: 'in_progress' }))}
              />
            )}
            {e.status === 'in_progress' && (
              <Button
                title="Completar (cobrar en efectivo)"
                loading={advance.isPending}
                onPress={() => run(advance.mutateAsync({ errandId: e.id, status: 'completed' }))}
              />
            )}
          </View>
        ))}

      <Text style={styles.section}>Disponibles cerca</Text>
      {available.isLoading && <ActivityIndicator />}
      {available.data?.length === 0 && <Text style={styles.muted}>No hay mandados cerca ahora.</Text>}
      {available.data?.map((e) => (
        <View key={e.id} style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.title}>{e.title}</Text>
            <Text style={styles.fee}>{formatCOP(e.offered_fee)}</Text>
          </View>
          <Text style={styles.muted}>Entrega: {e.dropoff.line}</Text>
          <Button title="Aceptar" loading={accept.isPending} onPress={() => run(accept.mutateAsync(e.id))} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 12 },
  section: { fontSize: 16, fontWeight: '700', marginTop: 8, color: colors.text },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 },
  fee: { fontSize: 15, fontWeight: '700', color: colors.primaryDark },
  status: { color: colors.primaryDark, fontWeight: '600', fontSize: 13 },
  muted: { color: colors.muted, fontSize: 13 },
});
