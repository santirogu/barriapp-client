import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { ApiError, type SocialLoginRequest } from '@barriapp/api-client';
import { useSocialLogin } from '@barriapp/api-client/react';
import { useSession } from '@/lib/api';
import { colors } from './ui';

// Finish any pending web auth session (required by expo-auth-session).
WebBrowser.maybeCompleteAuthSession();

// Google OAuth client IDs (configure to enable Google sign-in).
const GOOGLE = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
};
const googleConfigured = Boolean(
  GOOGLE.webClientId || GOOGLE.iosClientId || GOOGLE.androidClientId,
);

export function SocialButtons() {
  const socialLogin = useSocialLogin();
  const authenticate = useSession((s) => s.authenticate);
  const [error, setError] = useState<string | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest(GOOGLE);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      void AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
    }
  }, []);

  // Exchange a provider ID token for BarriApp tokens; the route guard then routes
  // (profile_incomplete → complete-profile, otherwise → home).
  async function signIn(body: SocialLoginRequest) {
    setError(null);
    try {
      const tokens = await socialLogin.mutateAsync(body);
      await authenticate({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });
    } catch (e) {
      if (e instanceof ApiError && e.code === 'provider_not_configured') {
        setError('Ese método aún no está disponible.');
        return;
      }
      setError(e instanceof ApiError ? e.message : 'No se pudo iniciar sesión.');
    }
  }

  // Handle the Google redirect result.
  useEffect(() => {
    if (response?.type !== 'success') return;
    const idToken = response.params?.id_token ?? response.authentication?.idToken;
    if (idToken) void signIn({ provider: 'google', id_token: idToken });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  async function onApple() {
    setError(null);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential.identityToken) {
        await signIn({ provider: 'apple', id_token: credential.identityToken });
      }
    } catch (e) {
      // User canceled the native sheet → ignore.
      if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') return;
      setError('No se pudo iniciar sesión con Apple.');
    }
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>o</Text>
        <View style={styles.line} />
      </View>

      <Pressable
        style={({ pressed }) => [styles.btn, (!request || !googleConfigured) && styles.btnDisabled, pressed && styles.btnPressed]}
        disabled={!request || !googleConfigured || socialLogin.isPending}
        onPress={() => void promptAsync()}
      >
        <Text style={styles.btnText}>
          {googleConfigured ? 'Continuar con Google' : 'Google (no configurado)'}
        </Text>
      </Pressable>

      {Platform.OS === 'ios' && appleAvailable && (
        <Pressable
          style={({ pressed }) => [styles.btn, styles.apple, pressed && styles.btnPressed]}
          onPress={onApple}
          disabled={socialLogin.isPending}
        >
          <Text style={[styles.btnText, styles.appleText]}>Continuar con Apple</Text>
        </Pressable>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10, marginTop: 4 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.muted, fontSize: 12 },
  btn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  btnDisabled: { opacity: 0.5 },
  btnPressed: { backgroundColor: '#f3f4f6' },
  btnText: { fontSize: 15, fontWeight: '600', color: colors.text },
  apple: { backgroundColor: '#000', borderColor: '#000' },
  appleText: { color: '#fff' },
  error: { color: colors.danger, fontSize: 13, textAlign: 'center' },
});
