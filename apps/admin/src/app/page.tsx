'use client';

import { useStores } from '@barriapp/api-client/react';
import { ApiError } from '@barriapp/api-client';

export default function Home() {
  // Public endpoint — proves the typed client + React Query wiring end-to-end.
  const { data: stores, isLoading, error } = useStores({ limit: 20 });

  return (
    <main style={{ padding: 48, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 32, margin: 0 }}>BarriApp — Admin</h1>
      <p style={{ opacity: 0.7 }}>Panel de super administración.</p>

      {isLoading && <p style={{ opacity: 0.5 }}>Conectando al backend…</p>}
      {error && (
        <p style={{ color: '#c0392b' }}>
          {error instanceof ApiError ? error.message : 'No se pudo conectar al backend'}
        </p>
      )}
      {stores && (
        <p style={{ opacity: 0.6 }}>
          Backend conectado — {stores.length} tienda(s) registradas.
        </p>
      )}
    </main>
  );
}
