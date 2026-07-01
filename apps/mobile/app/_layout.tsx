import { QueryClientProvider } from '@tanstack/react-query';
import { ApiProvider } from '@barriapp/api-client/react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '@/lib/query-client';
import { apiClient, useSession } from '@/lib/api';

function RootNavigator() {
  const status = useSession((s) => s.status);
  const bootstrap = useSession((s) => s.bootstrap);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  // Redirect based on auth state: unauthenticated → (auth) group; authenticated
  // users bounced out of the auth group back to the app.
  useEffect(() => {
    if (status === 'loading') return;
    const inAuthGroup = segments[0] === '(auth)';
    if (status === 'unauthenticated' && !inAuthGroup) {
      router.replace('/login');
    } else if (status === 'authenticated' && inAuthGroup) {
      router.replace('/');
    }
  }, [status, segments, router]);

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerTintColor: '#166b3a' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="store/[id]" options={{ title: 'Tienda' }} />
      <Stack.Screen name="cart" options={{ title: 'Tu carrito', presentation: 'modal' }} />
      <Stack.Screen name="orders/index" options={{ title: 'Mis pedidos' }} />
      <Stack.Screen name="orders/[id]" options={{ title: 'Pedido' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notificaciones' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider client={apiClient}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <RootNavigator />
        </SafeAreaProvider>
      </ApiProvider>
    </QueryClientProvider>
  );
}
