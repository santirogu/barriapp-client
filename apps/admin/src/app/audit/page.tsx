'use client';

import { useState } from 'react';
import { formatDateTime } from '@barriapp/shared';
import { useAuditLogs, type AuditModule } from '@barriapp/api-client/react';

const MODULES: AuditModule[] = [
  'auth',
  'users',
  'stores',
  'catalog',
  'orders',
  'errands',
  'delivery',
  'payments',
  'reviews',
  'admin',
];

export default function Audit() {
  const [module, setModule] = useState<AuditModule | ''>('');
  const [result, setResult] = useState('');
  const { data: logs, isLoading, error } = useAuditLogs({
    module: module || undefined,
    result: result || undefined,
    limit: 100,
  });

  return (
    <div>
      <h1 style={styles.h1}>Auditoría</h1>
      <p style={styles.muted}>Registro append-only de acciones (solo lectura).</p>

      <div style={styles.filters}>
        <select style={styles.select} value={module} onChange={(e) => setModule(e.target.value as AuditModule | '')}>
          <option value="">Todos los módulos</option>
          {MODULES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select style={styles.select} value={result} onChange={(e) => setResult(e.target.value)}>
          <option value="">Todos los resultados</option>
          <option value="success">success</option>
          <option value="failure">failure</option>
        </select>
      </div>

      {isLoading && <p style={styles.muted}>Cargando…</p>}
      {error && <p style={styles.error}>No se pudo cargar la auditoría.</p>}

      {logs && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Fecha</th>
              <th style={styles.th}>Módulo</th>
              <th style={styles.th}>Acción</th>
              <th style={styles.th}>Rol</th>
              <th style={styles.th}>Resultado</th>
              <th style={styles.th}>Severidad</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} style={styles.tr}>
                <td style={styles.td}>{formatDateTime(l.created_at)}</td>
                <td style={styles.td}>{l.module}</td>
                <td style={styles.tdMono}>{l.action}</td>
                <td style={styles.td}>{l.actor_role ?? '—'}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, ...(l.result === 'failure' ? styles.badgeBad : {}) }}>
                    {l.result}
                  </span>
                </td>
                <td style={styles.td}>{l.severity}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td style={styles.td} colSpan={6}>
                  Sin registros.
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
  h1: { fontSize: 26, margin: '0 0 6px', color: '#111' },
  muted: { color: '#6b7280', marginTop: 0 },
  filters: { display: 'flex', gap: 12, margin: '16px 0' },
  select: { padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden' },
  th: { textAlign: 'left', padding: '10px 14px', fontSize: 12, color: '#6b7280', background: '#f3f4f6' },
  tr: { borderTop: '1px solid #eef0f2' },
  td: { padding: '10px 14px', fontSize: 13, color: '#111' },
  tdMono: { padding: '10px 14px', fontSize: 13, color: '#111', fontFamily: 'ui-monospace, monospace' },
  badge: { background: '#e7f5ec', color: '#166b3a', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700 },
  badgeBad: { background: '#fdecea', color: '#c0392b' },
  error: { color: '#c0392b' },
};
