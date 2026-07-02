'use client';

import { useState } from 'react';
import type { VerificationStatus } from '@barriapp/shared';
import { ApiError } from '@barriapp/api-client';
import { useAdminCollaborators, useVerifyCollaborator } from '@barriapp/api-client/react';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  under_review: 'En revisión',
  needs_more_info: 'Falta info',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

const FILTERS: { key: VerificationStatus | 'all'; label: string }[] = [
  { key: 'pending', label: 'Pendientes' },
  { key: 'approved', label: 'Aprobados' },
  { key: 'rejected', label: 'Rechazados' },
  { key: 'all', label: 'Todos' },
];

export default function Collaborators() {
  const [filter, setFilter] = useState<VerificationStatus | 'all'>('pending');
  const { data, isLoading, error } = useAdminCollaborators(filter === 'all' ? undefined : filter);
  const verify = useVerifyCollaborator();

  return (
    <div>
      <h1 style={styles.h1}>Verificación de repartidores</h1>

      <div style={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            style={{ ...styles.chip, ...(filter === f.key ? styles.chipOn : {}) }}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && <p style={styles.muted}>Cargando…</p>}
      {error && <p style={styles.error}>No se pudieron cargar los repartidores.</p>}
      {verify.error instanceof ApiError && <p style={styles.error}>{verify.error.message}</p>}

      {data && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Cédula</th>
              <th style={styles.th}>Vehículo</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id} style={styles.tr}>
                <td style={styles.td}>{c.documents.id_number}</td>
                <td style={styles.td}>{c.vehicle_type}</td>
                <td style={styles.td}>
                  <span style={styles.badge}>{STATUS_LABEL[c.verification_status] ?? c.verification_status}</span>
                </td>
                <td style={styles.td}>
                  {c.verification_status !== 'approved' && (
                    <button
                      style={styles.approve}
                      disabled={verify.isPending}
                      onClick={() => verify.mutate({ userId: c.user_id, status: 'approved' })}
                    >
                      Aprobar
                    </button>
                  )}
                  {c.verification_status !== 'rejected' && (
                    <button
                      style={styles.reject}
                      disabled={verify.isPending}
                      onClick={() => verify.mutate({ userId: c.user_id, status: 'rejected' })}
                    >
                      Rechazar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td style={styles.td} colSpan={4}>
                  Sin repartidores en esta vista.
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
  filters: { display: 'flex', gap: 8, marginBottom: 16 },
  chip: {
    padding: '8px 14px',
    borderRadius: 999,
    border: '1px solid #d1d5db',
    background: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13,
    color: '#6b7280',
  },
  chipOn: { background: '#1f8a4c', borderColor: '#1f8a4c', color: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden' },
  th: { textAlign: 'left', padding: '12px 14px', fontSize: 12, color: '#6b7280', background: '#f3f4f6' },
  tr: { borderTop: '1px solid #eef0f2' },
  td: { padding: '12px 14px', fontSize: 14, color: '#111' },
  badge: { background: '#eef2f7', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, color: '#374151' },
  approve: {
    background: '#1f8a4c',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '6px 12px',
    cursor: 'pointer',
    fontWeight: 600,
    marginRight: 8,
  },
  reject: {
    background: '#fff',
    color: '#c0392b',
    border: '1px solid #f0c4bd',
    borderRadius: 8,
    padding: '6px 12px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  muted: { color: '#6b7280' },
  error: { color: '#c0392b' },
};
