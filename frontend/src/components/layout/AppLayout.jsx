'use client';

import { useEffect } from 'react';
import Sidebar from './Sidebar';
import { useCatalog } from '@/hooks/useCatalog';

export default function AppLayout({ children }) {
  const { branding, hydrated } = useCatalog();

  useEffect(() => {
    if (hydrated) {
      document.documentElement.style.setProperty('--brand-primary', branding.primaryColor);
      document.documentElement.style.setProperty('--brand-secondary', branding.secondaryColor);
    }
  }, [branding, hydrated]);

  return (
    <div className="min-h-screen bg-brand-surface">
      <Sidebar />
      <div className="pl-60">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
