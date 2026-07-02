'use client';

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useCatalog } from '@/hooks/useCatalog';

export default function AppLayout({ children }) {
  const { branding, hydrated } = useCatalog();
  const location = useLocation();
  const isStudentView = location.pathname.startsWith('/student');
  const title = 'Student Portal';
  const subtitle = isStudentView ? 'Learning dashboard and student workspace' : 'Course and content management';

  useEffect(() => {
    if (hydrated) {
      document.documentElement.style.setProperty('--brand-primary', branding.primaryColor || '#6C1D5F');
      document.documentElement.style.setProperty('--brand-secondary', branding.secondaryColor || '#84117C');
    }
  }, [branding, hydrated]);

  return (
    <div className="min-h-screen bg-brand-surface text-brand-text-primary transition-colors duration-200">
      <Sidebar />
      <div style={{ paddingLeft: 220 }}>
        <Header title={title} subtitle={subtitle} />
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
