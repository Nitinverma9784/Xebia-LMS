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
  const title = isStudentView ? 'Student Portal' : 'Admin Portal';
  const subtitle = isStudentView 
    ? 'Learning dashboard and student workspace' 
    : 'Manage courses, users, assessments, reports, and platform settings.';

  useEffect(() => {
    document.title = isStudentView ? 'Xebia LMS | Student Portal' : 'Xebia LMS | Admin Portal';
    if (hydrated) {
      document.documentElement.style.setProperty('--brand-primary', branding.primaryColor || '#6C1D5F');
      document.documentElement.style.setProperty('--brand-secondary', branding.secondaryColor || '#84117C');
    }
  }, [branding, hydrated, isStudentView]);

  return (
    <div className="min-h-screen bg-brand-surface dark:bg-[#0B1120] text-brand-text-primary dark:text-[#F8FAFC] transition-colors duration-300">
      <Sidebar />
      <div style={{ paddingLeft: 270 }}>
        <Header title={title} subtitle={subtitle} />
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
