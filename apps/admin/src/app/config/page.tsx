'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@barriapp/api-client';
import { useAdminConfig, useUpdateAdminConfig } from '@barriapp/api-client/react';

export default function Config() {
  const { data: config, isLoading } = useAdminConfig();
  const update = useUpdateAdminConfig();

  const [rate, setRate] = useState('');
  const [days, setDays] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (config) {
      setRate(String(config.default_commission_rate));
      setDays(String(config.settlement_frequency_days));
    }
  }, [config]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await update.mutateAsync({
        default_commission_rate: parseFloat(rate),
        settlement_frequency_days: parseInt(days, 10),
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar.');
    }
  }

  if (isLoading) return <p style={styles.muted}>Cargando…</p>;

  return (
    <div>
      <h1 style={styles.h1}>Configuración</h1>
      <form style={styles.card} onSubmit={save}>
        <label style={styles.label}>Comisión por defecto (0–1, p. ej. 0.10 = 10%)</label>
        <input style={styles.input} value={rate} onChange={(e) => setRate(e.target.value)} />

        <label style={styles.label}>Frecuencia de liquidación (días)</label>
        <input style={styles.input} value={days} onChange={(e) => setDays(e.target.value)} />

        {error && <p style={styles.error}>{error}</p>}
        {saved && <p style={styles.saved}>Cambios guardados ✓</p>}
        <button style={styles.button} type="submit" disabled={update.isPending}>
          {update.isPending ? 'Guardando…' : 'Guardar'}
        </button>
        {config && (
          <p style={styles.muted}>Última actualización: {new Date(config.updated_at).toLocaleString('es-CO')}</p>
        )}
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  h1: { fontSize: 26, margin: '0 0 20px', color: '#111' },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 460,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    border: '1px solid #eef0f2',
  },
  label: { fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 8 },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15 },
  button: {
    marginTop: 16,
    padding: '11px',
    borderRadius: 8,
    border: 'none',
    background: '#1f8a4c',
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
  },
  saved: { color: '#166b3a', fontWeight: 600 },
  error: { color: '#c0392b' },
  muted: { color: '#6b7280', fontSize: 13 },
};
