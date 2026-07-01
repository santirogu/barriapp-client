import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Providers } from '@/lib/query-client';

export const metadata: Metadata = {
  title: 'BarriApp — Admin',
  description: 'Panel de administración de BarriApp',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
