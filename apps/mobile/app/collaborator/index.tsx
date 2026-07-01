import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ApiError } from '@barriapp/api-client';
import {
  useCollaboratorJobs,
  useCollaboratorMe,
  useDeliveryActions,
  useSetAvailability,
} from '@barriapp/api-client/react';
import { Button, colors } from '@/components/ui';
import { DELIVERY_ADVANCE_LABEL, DELIVERY_STATUS_LABEL, nextDeliveryStatus } from '@/lib/status';

// Example location used when going online (a map/GPS picker replaces this later).
const DEMO_LOCATION = { lng: -74.0812, lat: 4.6095 };

const VERIFICATION_MESSAGE: Record<string, string> = {
  pending: 'Tu solicitud está pendiente de revisión.',
  under_review: 'Estamos revisando tus documentos.',
  needs_more_info: 'Necesitamos más información. Revisa tu correo.',
  rejected: 'Tu solicitud fue rechazada.',
};

export default function CollaboratorHome() {
  const router = useRouter();
  const me = useCollaboratorMe();
  const setAvailability = useSetAvailability();
  const jobs = useCollaboratorJobs();
  const { advance, pushLocation } = useDeliveryActions();

  if (me.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  // No collaborator profile yet → invite to apply.
  if (me.error instanceof ApiError && me.error.status === 404) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Aún no eres repartidor.</Text>
        <Button title="Aplicar como repartidor" onPress={() => router.push('/collaborator/apply')} />
      </View>
    );
  }

  const profile = me.data;
  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>No se pudo cargar tu perfil.</Text>
      </View>
    );
  }

  const approved = profile.verification_status === 'approved';
  const online = profile.availability === 'online';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!approved && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            {VERIFICATION_MESSAGE[profile.verification_status] ?? 'En revisión.'}
          </Text>
        </View>
      )}

      {approved && (
        <Button title="🧺 Mandados disponibles" variant="ghost" onPress={() => router.push('/collaborator/errands')} />
      )}

      {approved && (
        <View style={styles.statusCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>{online ? 'Estás en línea' : 'Estás desconectado'}</Text>
            <Text style={styles.muted}>Saldo: ${profile.balance.toLocaleString('es-CO')}</Text>
          </View>
          <Button
            title={online ? 'Desconectarme' : 'Conectarme'}
            variant={online ? 'ghost' : 'primary'}
            loading={setAvailability.isPending}
            onPress={() =>
              setAvailability.mutate(
                online ? { status: 'offline' } : { status: 'online', ...DEMO_LOCATION },
              )
            }
          />
        </View>
      )}

      {approved && (
        <>
          <Text style={styles.section}>Mis entregas</Text>
          {jobs.isLoading && <ActivityIndicator />}
          {jobs.data?.length === 0 && (
            <Text style={styles.muted}>No tienes entregas asignadas. Conéctate para recibir.</Text>
          )}
          {jobs.data?.map((d) => {
            const next = nextDeliveryStatus(d.status);
            return (
              <View key={d.id} style={styles.job}>
                <Text style={styles.jobTitle}>
                  {d.ref_type === 'order' ? 'Pedido' : 'Mandado'} · {d.ref_id.slice(-6)}
                </Text>
                <Text style={styles.jobStatus}>{DELIVERY_STATUS_LABEL[d.status]}</Text>
                <View style={styles.jobActions}>
                  {next && (
                    <Button
                      title={DELIVERY_ADVANCE_LABEL[next]}
                      loading={advance.isPending}
                      onPress={() => advance.mutate({ deliveryId: d.id, status: next })}
                    />
                  )}
                  {(d.status === 'picked_up' || d.status === 'en_route_dropoff') && (
                    <Button
                      title="Compartir ubicación"
                      variant="ghost"
                      loading={pushLocation.isPending}
                      onPress={() => pushLocation.mutate({ deliveryId: d.id, ...DEMO_LOCATION })}
                    />
                  )}
                </View>
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  notice: { backgroundColor: '#fff7e6', borderRadius: 12, padding: 16 },
  noticeText: { color: '#8a6d1f', fontSize: 14 },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  statusTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  section: { fontSize: 16, fontWeight: '700', marginTop: 8, color: colors.text },
  job: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  jobTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  jobStatus: { color: colors.primaryDark, fontWeight: '600', fontSize: 13 },
  jobActions: { gap: 8, marginTop: 6 },
  muted: { color: colors.muted, fontSize: 13 },
  error: { color: colors.danger, fontSize: 14 },
});
