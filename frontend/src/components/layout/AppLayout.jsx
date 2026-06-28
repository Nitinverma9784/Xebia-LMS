'use client';

import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { useCatalog } from '@/hooks/useCatalog';
import { cn } from '@/utils';

export default function AppLayout({ children }) {
  const { branding, hydrated } = useCatalog();
  const [collapsed, setCollapsed] = useState(false);

  // Initialize CSS brand variables globally
  useEffect(() => {
    if (hydrated) {
      document.documentElement.style.setProperty('--brand-primary', branding.primaryColor);
      document.documentElement.style.setProperty('--brand-secondary', branding.secondaryColor);
    }
  }, [branding, hydrated]);

  // Initialize dark/light mode theme globally
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const activeTheme = savedTheme || systemTheme;
    if (activeTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-brand-surface dark:bg-slate-950 transition-colors duration-300">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={cn("transition-all duration-300", collapsed ? "pl-[76px]" : "pl-64", "max-lg:pl-[76px]")}>
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}

