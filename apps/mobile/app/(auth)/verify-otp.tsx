import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ApiError } from '@barriapp/api-client';
import { useVerifyOtp } from '@barriapp/api-client/react';
import { Button, ErrorText, Field, Screen, Subtitle, Title } from '@/components/ui';
import { useSession } from '@/lib/api';

export default function VerifyOtp() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const verify = useVerifyOtp();
  const authenticate = useSession((s) => s.authenticate);

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    try {
      const tokens = await verify.mutateAsync({ phone: phone ?? '', code: code.trim() });
      await authenticate({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });
      // Route guard redirects to the home once authenticated.
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Código inválido.');
    }
  }

  return (
    <Screen>
      <Title>Verifica tu teléfono</Title>
      <Subtitle>Ingresa el código de 6 dígitos enviado a {phone}.</Subtitle>

      <Field
        label="Código"
        placeholder="123456"
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={setCode}
      />

      <ErrorText>{error}</ErrorText>

      <Button title="Verificar" onPress={onSubmit} loading={verify.isPending} />
    </Screen>
  );
}
