'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiError } from '@barriapp/api-client';
import { useLogin } from '@barriapp/api-client/react';
import { useSession } from '@/lib/api';

export default function Login() {
  const router = useRouter();
  const login = useLogin();
  const authenticate = useSession((s) => s.authenticate);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const tokens = await login.mutateAsync({ phone: phone.trim(), password });
      await authenticate({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });
      router.replace('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo iniciar sesión.');
    }
  }

  return (
    <div style={styles.wrap}>
      <form style={styles.card} onSubmit={onSubmit}>
        <div style={styles.brand}>BarriApp</div>
        <h1 style={styles.title}>Panel de administración</h1>
        <label style={styles.label}>Teléfono</label>
        <input
          style={styles.input}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+57 300 123 4567"
          autoComplete="username"
        />
        <label style={styles.label}>Contraseña</label>
        <input
          style={styles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.button} type="submit" disabled={login.isPending}>
          {login.isPending ? 'Entrando…' : 'Entrar'}
        </button>
        <p style={styles.hint}>Solo cuentas con rol super_admin.</p>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#0f2e1c',
    fontFamily: 'system-ui, sans-serif',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: 36,
    width: 360,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
  },
  brand: { fontSize: 22, fontWeight: 800, color: '#1f8a4c' },
  title: { fontSize: 18, margin: '4px 0 16px', color: '#111' },
  label: { fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 8 },
  input: {
    padding: '11px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: 15,
  },
  button: {
    marginTop: 16,
    padding: '12px',
    borderRadius: 8,
    border: 'none',
    background: '#1f8a4c',
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
  },
  error: { color: '#c0392b', fontSize: 14, margin: '8px 0 0' },
  hint: { color: '#6b7280', fontSize: 12, textAlign: 'center', marginTop: 12 },
};
