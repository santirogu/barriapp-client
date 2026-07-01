import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { VehicleType } from '@barriapp/shared';
import { ApiError } from '@barriapp/api-client';
import { useBecomeCollaborator } from '@barriapp/api-client/react';
import { Button, ErrorText, Field, Subtitle, Title, colors } from '@/components/ui';

const VEHICLES: { key: VehicleType; label: string }[] = [
  { key: 'walk', label: 'A pie' },
  { key: 'bike', label: 'Bici' },
  { key: 'motorcycle', label: 'Moto' },
  { key: 'car', label: 'Carro' },
];

export default function ApplyCollaborator() {
  const router = useRouter();
  const become = useBecomeCollaborator();

  const [vehicle, setVehicle] = useState<VehicleType>('bike');
  const [idNumber, setIdNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!idNumber.trim()) {
      setError('Ingresa tu número de cédula.');
      return;
    }
    try {
      await become.mutateAsync({ vehicle_type: vehicle, id_number: idNumber.trim() });
      router.replace('/collaborator');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo enviar la solicitud.');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title>Sé repartidor</Title>
      <Subtitle>Gana dinero haciendo entregas y mandados en tu barrio.</Subtitle>

      <Text style={styles.label}>Vehículo</Text>
      <View style={styles.vehicles}>
        {VEHICLES.map((v) => (
          <Pressable
            key={v.key}
            style={[styles.vehicle, vehicle === v.key && styles.vehicleOn]}
            onPress={() => setVehicle(v.key)}
          >
            <Text style={[styles.vehicleText, vehicle === v.key && styles.vehicleTextOn]}>
              {v.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Field label="Cédula" value={idNumber} onChangeText={setIdNumber} keyboardType="number-pad" placeholder="1032456789" />
      <Text style={styles.hint}>Un administrador revisará tu solicitud antes de activarte.</Text>

      <ErrorText>{error}</ErrorText>
      <Button title="Enviar solicitud" onPress={submit} loading={become.isPending} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 14 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  vehicles: { flexDirection: 'row', gap: 8 },
  vehicle: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  vehicleOn: { borderColor: colors.primary, backgroundColor: '#e7f5ec' },
  vehicleText: { fontWeight: '600', color: colors.muted, fontSize: 13 },
  vehicleTextOn: { color: colors.primaryDark },
  hint: { fontSize: 12, color: colors.muted },
});
