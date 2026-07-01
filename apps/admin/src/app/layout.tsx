import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Providers } from '@/lib/query-client';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'BarriApp — Admin',
  description: 'Panel de administración de BarriApp',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0 }}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
