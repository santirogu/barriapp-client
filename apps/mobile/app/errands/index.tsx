import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { formatCOP } from '@barriapp/shared';
import { ApiError } from '@barriapp/api-client';
import { useMyErrands } from '@barriapp/api-client/react';
import { Button, colors } from '@/components/ui';
import { ERRAND_STATUS_LABEL } from '@/lib/status';

export default function MyErrands() {
  const router = useRouter();
  const { data: errands, isLoading, error } = useMyErrands();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Publicar mandado" onPress={() => router.push('/errands/new')} />

      <Text style={styles.section}>Mis mandados</Text>
      {isLoading && <ActivityIndicator />}
      {error && (
        <Text style={styles.error}>
          {error instanceof ApiError ? error.message : 'No se pudieron cargar tus mandados.'}
        </Text>
      )}
      {errands?.length === 0 && <Text style={styles.muted}>Aún no has publicado mandados.</Text>}
      {errands?.map((e) => (
        <Pressable
          key={e.id}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          onPress={() => router.push(`/errands/${e.id}`)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{e.title}</Text>
            <Text style={styles.muted}>{ERRAND_STATUS_LABEL[e.status] ?? e.status}</Text>
          </View>
          <Text style={styles.fee}>{formatCOP(e.offered_fee)}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 12 },
  section: { fontSize: 16, fontWeight: '700', marginTop: 8, color: colors.text },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  pressed: { backgroundColor: '#f3f4f6' },
  title: { fontSize: 15, fontWeight: '600', color: colors.text },
  fee: { fontSize: 15, fontWeight: '700', color: colors.primaryDark },
  muted: { color: colors.muted, fontSize: 13, marginTop: 2 },
  error: { color: colors.danger, fontSize: 14 },
});
