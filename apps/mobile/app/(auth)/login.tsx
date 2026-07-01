import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { View } from 'react-native';
import { ApiError } from '@barriapp/api-client';
import { useLogin } from '@barriapp/api-client/react';
import { Button, ErrorText, Field, Screen, Subtitle, Title } from '@/components/ui';
import { useSession } from '@/lib/api';

export default function Login() {
  const router = useRouter();
  const login = useLogin();
  const authenticate = useSession((s) => s.authenticate);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    try {
      const tokens = await login.mutateAsync({ phone: phone.trim(), password });
      await authenticate({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });
      // The root route guard redirects to the home once authenticated.
    } catch (e) {
      if (e instanceof ApiError && e.code === 'not_verified') {
        router.push({ pathname: '/verify-otp', params: { phone: phone.trim() } });
        return;
      }
      setError(e instanceof ApiError ? e.message : 'No se pudo iniciar sesión.');
    }
  }

  return (
    <Screen>
      <Title>Inicia sesión</Title>
      <Subtitle>Tu barrio, a domicilio.</Subtitle>

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
        placeholder="••••••••"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <ErrorText>{error}</ErrorText>

      <Button title="Entrar" onPress={onSubmit} loading={login.isPending} />

      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <Link href="/register" style={{ color: '#1f8a4c', fontWeight: '600' }}>
          Crear una cuenta
        </Link>
      </View>
    </Screen>
  );
}
