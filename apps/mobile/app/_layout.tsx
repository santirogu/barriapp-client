import { QueryClientProvider } from '@tanstack/react-query';
import { ApiProvider } from '@barriapp/api-client/react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '@/lib/query-client';
import { apiClient, useSession } from '@/lib/api';

export default function RootLayout() {
  const bootstrap = useSession((s) => s.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider client={apiClient}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaProvider>
      </ApiProvider>
    </QueryClientProvider>
  );
}
