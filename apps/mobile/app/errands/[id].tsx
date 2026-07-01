import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { formatCOP } from '@barriapp/shared';
import { ApiError } from '@barriapp/api-client';
import { useCancelErrand, useErrand } from '@barriapp/api-client/react';
import { Button, ErrorText, colors } from '@/components/ui';
import { ERRAND_STATUS_LABEL } from '@/lib/status';

export default function ErrandDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: errand, isLoading, error } = useErrand(id ?? '', { refetchInterval: 5000 });
  const cancel = useCancelErrand();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }
  if (error || !errand) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error instanceof ApiError ? error.message : 'No se pudo cargar el mandado.'}
        </Text>
      </View>
    );
  }

  const cancellable = errand.status === 'open' || errand.status === 'assigned';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{errand.title}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{ERRAND_STATUS_LABEL[errand.status]}</Text>
      </View>

      {errand.description ? <Text style={styles.body}>{errand.description}</Text> : null}

      <View style={styles.row}>
        <Text style={styles.muted}>Tarifa ofrecida</Text>
        <Text style={styles.value}>{formatCOP(errand.offered_fee)}</Text>
      </View>
      {errand.estimated_cost != null && (
        <View style={styles.row}>
          <Text style={styles.muted}>Costo estimado</Text>
          <Text style={styles.value}>{formatCOP(errand.estimated_cost)}</Text>
        </View>
      )}
      <View style={styles.row}>
        <Text style={styles.muted}>Entrega</Text>
        <Text style={styles.value}>{errand.dropoff.line}</Text>
      </View>

      {cancellable && (
        <>
          <ErrorText>{cancel.error instanceof ApiError ? cancel.error.message : null}</ErrorText>
          <Button
            title="Cancelar mandado"
            variant="ghost"
            loading={cancel.isPending}
            onPress={() => cancel.mutate({ errandId: errand.id })}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e7f5ec',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { color: colors.primaryDark, fontWeight: '700' },
  body: { fontSize: 14, color: colors.text },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  muted: { color: colors.muted, fontSize: 14 },
  value: { color: colors.text, fontSize: 14, fontWeight: '600' },
  error: { color: colors.danger, fontSize: 14 },
});
