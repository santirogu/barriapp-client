import { formatCOP } from '@barriapp/shared';

export default function Home() {
  return (
    <main style={{ padding: 48, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 32, margin: 0 }}>BarriApp — Admin</h1>
      <p style={{ opacity: 0.7 }}>Panel de super administración.</p>
      <p style={{ opacity: 0.5, fontSize: 14 }}>
        Ejemplo de formato COP: {formatCOP(850000)}
      </p>
    </main>
  );
}
