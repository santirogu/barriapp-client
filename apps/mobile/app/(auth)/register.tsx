import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ApiError } from '@barriapp/api-client';
import { useRegister } from '@barriapp/api-client/react';
import { Button, ErrorText, Field, Screen, Subtitle, Title, colors } from '@/components/ui';

export default function Register() {
  const router = useRouter();
  const register = useRegister();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    if (!consent) {
      setError('Debes aceptar el tratamiento de datos (Habeas Data).');
      return;
    }
    try {
      await register.mutateAsync({
        full_name: fullName.trim(),
        phone: phone.trim(),
        password,
        accept_habeas_data: true,
      });
      router.push({ pathname: '/verify-otp', params: { phone: phone.trim() } });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo crear la cuenta.');
    }
  }

  return (
    <Screen>
      <Title>Crea tu cuenta</Title>
      <Subtitle>Regístrate con tu teléfono.</Subtitle>

      <Field label="Nombre completo" placeholder="Ana Pérez" value={fullName} onChangeText={setFullName} />
      <Field
        label="Teléfono"
        placeholder="+57 300 123 4567"
        keyboardType="phone-pad"
        autoCapitalize="none"
        value={phone}
        onChangeText={setPhone}
      />
      <Field
        label="Contraseña"
        placeholder="Mínimo 8 caracteres"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

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
