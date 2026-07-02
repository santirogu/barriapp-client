'use client';

import { useState } from 'react';
import { formatCOP, formatDate } from '@barriapp/shared';
import { ApiError } from '@barriapp/api-client';
import {
  useAdminSettlements,
  useGenerateSettlement,
  useMarkSettlementPaid,
} from '@barriapp/api-client/react';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagada',
  overdue: 'Vencida',
};

function toIso(date: string): string {
  return date ? `${date}T00:00:00Z` : '';
}

export default function Settlements() {
  const { data, isLoading, error } = useAdminSettlements();
  const markPaid = useMarkSettlementPaid();
  const generate = useGenerateSettlement();

  const [storeId, setStoreId] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [due, setDue] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!storeId.trim() || !start || !end) {
      setFormError('Tienda y periodo son obligatorios.');
      return;
    }
    try {
      await generate.mutateAsync({
        store_id: storeId.trim(),
        period_start: toIso(start),
        period_end: toIso(end),
        due_date: due ? toIso(due) : null,
      });
      setStoreId('');
      setStart('');
      setEnd('');
      setDue('');
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo generar.');
    }
  }

  return (
    <div>
      <h1 style={styles.h1}>Liquidaciones</h1>

      <form style={styles.form} onSubmit={onGenerate}>
        <span style={styles.formTitle}>Generar liquidación</span>
        <input style={styles.input} placeholder="ID de tienda" value={storeId} onChange={(e) => setStoreId(e.target.value)} />
        <label style={styles.lbl}>Desde<input style={styles.date} type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label>
        <label style={styles.lbl}>Hasta<input style={styles.date} type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></label>
        <label style={styles.lbl}>Vence<input style={styles.date} type="date" value={due} onChange={(e) => setDue(e.target.value)} /></label>
        <button style={styles.genBtn} type="submit" disabled={generate.isPending}>
          {generate.isPending ? 'Generando…' : 'Generar'}
        </button>
      </form>
      {formError && <p style={styles.error}>{formError}</p>}

      {isLoading && <p style={styles.muted}>Cargando…</p>}
      {error && <p style={styles.error}>No se pudieron cargar las liquidaciones.</p>}

      {data && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Tienda</th>
              <th style={styles.th}>Periodo</th>
              <th style={styles.th}>Pedidos</th>
              <th style={styles.th}>Comisión</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.id} style={styles.tr}>
                <td style={styles.td}>…{s.store_id.slice(-6)}</td>
                <td style={styles.td}>
                  {formatDate(s.period_start)} – {formatDate(s.period_end)}
                </td>
                <td style={styles.td}>{s.orders_count}</td>
                <td style={styles.td}>{formatCOP(s.commission_total)}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, ...(s.status === 'paid' ? styles.badgeOk : {}) }}>
                    {STATUS_LABEL[s.status] ?? s.status}
                  </span>
                </td>
                <td style={styles.td}>
                  {s.status !== 'paid' && (
                    <button
                      style={styles.payBtn}
                      disabled={markPaid.isPending}
                      onClick={() => markPaid.mutate({ settlementId: s.id })}
                    >
                      Marcar pagada
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td style={styles.td} colSpan={6}>
                  No hay liquidaciones.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  h1: { fontSize: 26, margin: '0 0 16px', color: '#111' },
  form: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    background: '#fff',
    padding: 16,
    borderRadius: 12,
    border: '1px solid #eef0f2',
    marginBottom: 16,
  },
  formTitle: { fontWeight: 700, color: '#111', alignSelf: 'center' },
  lbl: { display: 'flex', flexDirection: 'column', fontSize: 12, color: '#6b7280', gap: 4 },
  input: { padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 },
  date: { padding: '7px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 },
  genBtn: { background: '#1f8a4c', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontWeight: 700 },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden' },
  th: { textAlign: 'left', padding: '12px 14px', fontSize: 12, color: '#6b7280', background: '#f3f4f6' },
  tr: { borderTop: '1px solid #eef0f2' },
  td: { padding: '12px 14px', fontSize: 14, color: '#111' },
  badge: { background: '#eef2f7', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, color: '#374151' },
  badgeOk: { background: '#e7f5ec', color: '#166b3a' },
  payBtn: { background: '#1f8a4c', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 },
  muted: { color: '#6b7280' },
  error: { color: '#c0392b' },
};
