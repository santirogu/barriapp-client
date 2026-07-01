import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useStores } from '@barriapp/api-client/react';
import { ApiError } from '@barriapp/api-client';

export default function Home() {
  // Public endpoint — proves the typed client + React Query wiring end-to-end.
  const { data: stores, isLoading, error } = useStores({ limit: 20 });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BarriApp</Text>
      <Text style={styles.subtitle}>Tu barrio, a domicilio.</Text>

      {isLoading && <ActivityIndicator style={styles.status} />}
      {error && (
        <Text style={styles.error}>
          {error instanceof ApiError ? error.message : 'No se pudo conectar al backend'}
        </Text>
      )}
      {stores && (
        <Text style={styles.status}>
          {stores.length} {stores.length === 1 ? 'tienda' : 'tiendas'} cerca
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
  title: { fontSize: 32, fontWeight: '700' },
  subtitle: { fontSize: 16, opacity: 0.7 },
  status: { fontSize: 14, opacity: 0.6, marginTop: 12 },
  error: { fontSize: 14, color: '#c0392b', marginTop: 12, textAlign: 'center' },
});
