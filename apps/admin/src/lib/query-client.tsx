'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiProvider } from '@barriapp/api-client/react';
import { useState, type ReactNode } from 'react';
import { ApiError } from '@barriapp/api-client';
import { apiClient } from './api';

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (failureCount, error) => {
              if (error instanceof ApiError && [401, 403, 404].includes(error.status)) {
                return false;
              }
              return failureCount < 2;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <ApiProvider client={apiClient}>{children}</ApiProvider>
    </QueryClientProvider>
  );
}
