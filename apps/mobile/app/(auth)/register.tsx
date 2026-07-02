import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DocumentType, Gender, Role } from '@barriapp/shared';
import { ApiError, type RegisterRequest } from '@barriapp/api-client';
import { useRegister } from '@barriapp/api-client/react';
import { Button, ErrorText, Field, Screen, Subtitle, Title, colors } from '@/components/ui';

type RegisterRole = Extract<Role, 'client' | 'seller' | 'collaborator'>;

const ROLES: { key: RegisterRole; label: string }[] = [
  { key: 'client', label: 'Cliente' },
  { key: 'seller', label: 'Vendedor' },
  { key: 'collaborator', label: 'Repartidor' },
];
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

function Chips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.chipsWrap}>
      <Text style={styles.chipsLabel}>{label}</Text>
      <View style={styles.chips}>
        {options.map((o) => (
          <Pressable
            key={o.key}
            style={[styles.chip, value === o.key && styles.chipOn]}
            onPress={() => onChange(o.key)}
          >
            <Text style={[styles.chipText, value === o.key && styles.chipTextOn]}>{o.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function Register() {
  const router = useRouter();
  const register = useRegister();

  const [role, setRole] = useState<RegisterRole>('client');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [docType, setDocType] = useState<DocumentType>('CC');
  const [docNumber, setDocNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<Gender>('female');
  const [birthDate, setBirthDate] = useState(''); // YYYY-MM-DD
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsPersonal = role !== 'seller'; // client & collaborator require gender + birth_date

  async function onSubmit() {
    setError(null);
    if (!firstName.trim() || !lastName.trim() || !docNumber.trim() || !phone.trim() || !email.trim() || !password) {
      setError('Completa todos los campos.');
      return;
    }
    if (!consent) {
      setError('Debes aceptar el tratamiento de datos (Habeas Data).');
      return;
    }
    if (needsPersonal && !is18Plus(birthDate)) {
      setError('Debes ser mayor de 18 años (fecha AAAA-MM-DD).');
      return;
    }
    const common = {
      role,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      document_type: docType,
      document_number: docNumber.trim(),
      phone: phone.trim(),
      email: email.trim(),
      password,
      accept_habeas_data: true as const,
    };
    // Runtime shape matches the discriminated member for `role`; cast to satisfy TS.
    const body = (
      needsPersonal ? { ...common, gender, birth_date: birthDate } : common
    ) as RegisterRequest;
    try {
      await register.mutateAsync(body);
      router.push({ pathname: '/verify-otp', params: { phone: phone.trim() } });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo crear la cuenta.');
    }
  }

  return (
    <Screen>
      <Title>Crea tu cuenta</Title>
      <Subtitle>Elige tu tipo de cuenta y regístrate.</Subtitle>

      <Chips label="Quiero registrarme como" options={ROLES} value={role} onChange={setRole} />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Field label="Nombre" value={firstName} onChangeText={setFirstName} placeholder="Ana" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Apellido" value={lastName} onChangeText={setLastName} placeholder="Pérez" />
        </View>
      </View>

      <Chips label="Documento" options={DOC_TYPES.map((d) => ({ key: d, label: d }))} value={docType} onChange={setDocType} />
      <Field label="Número de documento" value={docNumber} onChangeText={setDocNumber} keyboardType="number-pad" />

      <Field label="Teléfono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoCapitalize="none" placeholder="+57 300 123 4567" />
      <Field label="Correo" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="ana@example.com" />
      <Field label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry placeholder="Mínimo 8 caracteres" />

      {needsPersonal && (
        <>
          <Chips label="Género" options={GENDERS} value={gender} onChange={setGender} />
          <Field label="Fecha de nacimiento (AAAA-MM-DD)" value={birthDate} onChangeText={setBirthDate} placeholder="1998-05-20" autoCapitalize="none" />
        </>
      )}

      <Pressable style={styles.consentRow} onPress={() => setConsent((c) => !c)}>
        <View style={[styles.checkbox, consent && styles.checkboxOn]}>
          {consent ? <Text style={styles.check}>✓</Text> : null}
        </View>
        <Text style={styles.consentText}>
          Acepto el tratamiento de mis datos personales (Habeas Data, Ley 1581).
        </Text>
      </Pressable>

      <ErrorText>{error}</ErrorText>
      <Button title="Continuar" onPress={onSubmit} loading={register.isPending} />

      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <Link href="/login" style={{ color: colors.primary, fontWeight: '600' }}>
          Ya tengo cuenta
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  chipsWrap: { gap: 6 },
  chipsLabel: { fontSize: 13, fontWeight: '600', color: colors.text },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.muted, fontWeight: '600', fontSize: 13 },
  chipTextOn: { color: '#fff' },
  consentRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  check: { color: '#fff', fontWeight: '700' },
  consentText: { flex: 1, fontSize: 13, color: colors.muted },
});
