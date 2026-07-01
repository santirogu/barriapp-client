'use client';

import { formatCOP } from '@barriapp/shared';
import { useAdminMetrics } from '@barriapp/api-client/react';

export default function Dashboard() {
  const { data: m, isLoading, error } = useAdminMetrics();

  return (
    <div>
      <h1 style={styles.h1}>Dashboard</h1>
      {isLoading && <p style={styles.muted}>Cargando métricas…</p>}
      {error && <p style={styles.error}>No se pudieron cargar las métricas.</p>}
      {m && (
        <div style={styles.grid}>
          <Stat label="Usuarios" value={m.users} />
          <Stat label="Tiendas" value={m.stores} />
          <Stat label="Tiendas abiertas" value={m.open_stores} />
          <Stat label="Repartidores activos" value={m.active_collaborators} />
          <Stat label="Pedidos" value={m.orders_total} />
          <Stat label="Pedidos entregados" value={m.orders_delivered} />
          <Stat label="Mandados" value={m.errands_total} />
          <Stat label="GMV" value={formatCOP(m.gmv)} highlight />
          <Stat label="Ingresos plataforma" value={formatCOP(m.platform_revenue)} highlight />
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div style={{ ...styles.card, ...(highlight ? styles.cardHighlight : {}) }}>
      <div style={styles.statLabel}>{label}</div>
      <div style={{ ...styles.statValue, ...(highlight ? { color: '#166b3a' } : {}) }}>{value}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  h1: { fontSize: 26, margin: '0 0 20px', color: '#111' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 16,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    border: '1px solid #eef0f2',
  },
  cardHighlight: { background: '#e7f5ec', border: '1px solid #cdead8' },
  statLabel: { fontSize: 13, color: '#6b7280', fontWeight: 600 },
  statValue: { fontSize: 28, fontWeight: 800, color: '#111', marginTop: 6 },
  muted: { color: '#6b7280' },
  error: { color: '#c0392b' },
};
