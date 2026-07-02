'use client';

import { useState } from 'react';
import type { UserStatus } from '@barriapp/shared';
import { ApiError } from '@barriapp/api-client';
import { useAdminUsers, useUpdateUserStatus } from '@barriapp/api-client/react';

const STATUS_LABEL: Record<string, string> = {
  active: 'Activo',
  suspended: 'Suspendido',
  pending_verification: 'Sin verificar',
};

export default function Users() {
  const [q, setQ] = useState('');
  const { data: users, isLoading, error } = useAdminUsers({ q: q || undefined, limit: 50 });
  const updateStatus = useUpdateUserStatus();

  function toggle(userId: string, current: UserStatus) {
    const next: UserStatus = current === 'suspended' ? 'active' : 'suspended';
    updateStatus.mutate({ userId, status: next });
  }

  return (
    <div>
      <h1 style={styles.h1}>Usuarios</h1>
      <input
        style={styles.search}
        placeholder="Buscar por teléfono o correo…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {isLoading && <p style={styles.muted}>Cargando…</p>}
      {error && <p style={styles.error}>No se pudieron cargar los usuarios.</p>}

      {users && (
        <table style={styles.table}>
          <thead>
            <tr>
              <Th>Nombre</Th>
              <Th>Teléfono</Th>
              <Th>Rol</Th>
              <Th>Estado</Th>
              <Th>Acción</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={styles.tr}>
                <Td>
                  {u.first_name} {u.last_name}
                </Td>
                <Td>{u.phone ?? '—'}</Td>
                <Td>{u.role}</Td>
                <Td>
                  <span style={{ ...styles.badge, ...(u.status === 'suspended' ? styles.badgeBad : {}) }}>
                    {STATUS_LABEL[u.status] ?? u.status}
                  </span>
                </Td>
                <Td>
                  <button
                    style={styles.action}
                    disabled={updateStatus.isPending}
                    onClick={() => toggle(u.id, u.status)}
                  >
                    {u.status === 'suspended' ? 'Activar' : 'Suspender'}
                  </button>
                </Td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <Td colSpan={5}>Sin resultados.</Td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      {updateStatus.error instanceof ApiError && (
        <p style={styles.error}>{updateStatus.error.message}</p>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={styles.th}>{children}</th>;
}
function Td({ children, colSpan }: { children: React.ReactNode; colSpan?: number }) {
  return (
    <td style={styles.td} colSpan={colSpan}>
      {children}
    </td>
  );
}

const styles: Record<string, React.CSSProperties> = {
  h1: { fontSize: 26, margin: '0 0 20px', color: '#111' },
  search: {
    width: 360,
    maxWidth: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: 14,
    marginBottom: 16,
  },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden' },
  th: { textAlign: 'left', padding: '12px 14px', fontSize: 12, color: '#6b7280', background: '#f3f4f6' },
  tr: { borderTop: '1px solid #eef0f2' },
  td: { padding: '12px 14px', fontSize: 14, color: '#111' },
  badge: { background: '#e7f5ec', color: '#166b3a', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700 },
  badgeBad: { background: '#fdecea', color: '#c0392b' },
  action: {
    background: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    padding: '6px 12px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13,
  },
  muted: { color: '#6b7280' },
  error: { color: '#c0392b' },
};
