import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider } from '@/lib/toast-context';
import { ModalProvider } from '@/lib/modal-context';

export const metadata: Metadata = {
  title: 'Mavenco Commerce Admin | Multi-Tenant Platform & Headless CMS',
  description: 'Enterprise Multi-Tenant SaaS Control Plane, Visual CMS & Catalog Studio',
};

import { Suspense } from 'react';
import { TopLoadingProgressBar } from '@/components/ui/TopLoadingProgressBar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0F1117] text-slate-100 font-sans selection:bg-rose-500 selection:text-white">
        <AuthProvider>
          <ToastProvider>
            <ModalProvider>
              <Suspense fallback={null}>
                <TopLoadingProgressBar />
              </Suspense>
              {children}
            </ModalProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
