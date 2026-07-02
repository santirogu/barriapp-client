import { useState } from 'react';
import type { DocumentType, Gender } from '@barriapp/shared';
import { ApiError } from '@barriapp/api-client';
import { useCompleteProfile } from '@barriapp/api-client/react';
import { Button, ErrorText, Field, Screen, Subtitle, Title, colors } from '@/components/ui';
import { useSession } from '@/lib/api';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const DOC_TYPES: DocumentType[] = ['CC', 'CE', 'PA', 'NIT'];
const GENDERS: { key: Gender; label: string }[] = [
  { key: 'female', label: 'Femenino' },
  { key: 'male', label: 'Masculino' },
  { key: 'other', label: 'Otro' },
];

function is18Plus(iso: string): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age >= 18;
}

export default function CompleteProfile() {
  const complete = useCompleteProfile();
  const bootstrap = useSession((s) => s.bootstrap);

  const [docType, setDocType] = useState<DocumentType>('CC');
  const [docNumber, setDocNumber] = useState('');
  const [gender, setGender] = useState<Gender>('female');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    if (!docNumber.trim()) {
      setError('Ingresa tu número de documento.');
      return;
    }
    if (!is18Plus(birthDate)) {
      setError('Debes ser mayor de 18 años (fecha AAAA-MM-DD).');
      return;
    }
    try {
      await complete.mutateAsync({
        document_type: docType,
        document_number: docNumber.trim(),
        gender,
        birth_date: birthDate,
      });
      // Reload the profile so status flips to active; the guard routes home.
      await bootstrap();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo completar el perfil.');
    }
  }

  return (
    <Screen>
      <Title>Completa tu perfil</Title>
      <Subtitle>Necesitamos unos datos más para activar tu cuenta.</Subtitle>

      <View style={styles.chipsWrap}>
        <Text style={styles.chipsLabel}>Documento</Text>
        <View style={styles.chips}>
          {DOC_TYPES.map((d) => (
            <Pressable key={d} style={[styles.chip, docType === d && styles.chipOn]} onPress={() => setDocType(d)}>
              <Text style={[styles.chipText, docType === d && styles.chipTextOn]}>{d}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Field label="Número de documento" value={docNumber} onChangeText={setDocNumber} keyboardType="number-pad" />

      <View style={styles.chipsWrap}>
        <Text style={styles.chipsLabel}>Género</Text>
        <View style={styles.chips}>
          {GENDERS.map((g) => (
            <Pressable key={g.key} style={[styles.chip, gender === g.key && styles.chipOn]} onPress={() => setGender(g.key)}>
              <Text style={[styles.chipText, gender === g.key && styles.chipTextOn]}>{g.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Field label="Fecha de nacimiento (AAAA-MM-DD)" value={birthDate} onChangeText={setBirthDate} placeholder="1998-05-20" autoCapitalize="none" />

      <ErrorText>{error}</ErrorText>
      <Button title="Activar cuenta" onPress={onSubmit} loading={complete.isPending} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipsWrap: { gap: 6 },
  chipsLabel: { fontSize: 13, fontWeight: '600', color: colors.text },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.muted, fontWeight: '600', fontSize: 13 },
  chipTextOn: { color: '#fff' },
});
