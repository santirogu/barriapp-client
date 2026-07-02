'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useSession } from '@/lib/api';

const NAV = [
  { href: '/', label: 'Dashboard' },
  { href: '/users', label: 'Usuarios' },
  { href: '/collaborators', label: 'Repartidores' },
  { href: '/settlements', label: 'Liquidaciones' },
  { href: '/audit', label: 'Auditoría' },
  { href: '/config', label: 'Configuración' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const status = useSession((s) => s.status);
  const user = useSession((s) => s.user);
  const bootstrap = useSession((s) => s.bootstrap);
  const signOut = useSession((s) => s.signOut);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/login') {
      router.replace('/login');
    }
  }, [status, pathname, router]);

  // The login page renders outside the shell.
  if (pathname === '/login') return <>{children}</>;

  if (status === 'loading') {
    return <div style={styles.centered}>Cargando…</div>;
  }

  const isAdmin = user?.role === 'super_admin';
  if (status === 'authenticated' && !isAdmin) {
    return (
      <div style={styles.centered}>
        <div>
          <p>Esta cuenta no tiene acceso de administrador.</p>
          <button style={styles.linkBtn} onClick={() => void signOut()}>
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated') return <div style={styles.centered}>Redirigiendo…</div>;

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>BarriApp</div>
        <nav style={styles.nav}>
          {NAV.map((n) => {
            const active = n.href === '/' ? pathname === '/' : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                style={{ ...styles.navLink, ...(active ? styles.navLinkActive : {}) }}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div style={styles.sidebarFoot}>
          <div style={styles.userName}>
            {user ? `${user.first_name} ${user.last_name}` : ''}
          </div>
          <button style={styles.linkBtn} onClick={() => void signOut()}>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontFamily: 'system-ui, sans-serif',
    color: '#374151',
  },
  layout: { display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' },
  sidebar: {
    width: 230,
    background: '#0f2e1c',
    color: '#e7f5ec',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
  },
  brand: { fontSize: 22, fontWeight: 800, marginBottom: 28, paddingLeft: 8 },
  nav: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  navLink: {
    padding: '10px 12px',
    borderRadius: 8,
    color: '#bfe0cd',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14,
  },
  navLinkActive: { background: '#1f8a4c', color: '#fff' },
  sidebarFoot: { borderTop: '1px solid #23503a', paddingTop: 16 },
  userName: { fontSize: 13, opacity: 0.8, marginBottom: 8, paddingLeft: 8 },
  linkBtn: {
    background: 'transparent',
    border: 'none',
    color: '#9fd6b5',
    cursor: 'pointer',
    fontWeight: 600,
    padding: '4px 8px',
  },
  main: { flex: 1, background: '#f7f8fa', padding: 32, overflow: 'auto' },
};
