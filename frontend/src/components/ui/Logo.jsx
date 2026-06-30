'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils';
import { useCatalog } from '@/hooks/useCatalog';

export default function Logo({ className, iconOnly = false, variant = 'light' }) {
  const isDark = variant === 'dark';
  let branding = null;

  try {
    const catalog = useCatalog();
    branding = catalog?.branding;
  } catch (e) {
    // Context may not be available outside CatalogProvider
  }

  const companyName = branding?.companyName || 'Xebia LMS';
  
  // Resolve logos to assets provided
  let logoUrl = isDark 
    ? (branding?.darkModeLogo || branding?.sidebarLogo || '/assets/Logo-White.png') 
    : (branding?.lightModeLogo || branding?.headerLogo || branding?.websiteLogo || '/assets/Logo-Purple.png');

  if (!logoUrl || logoUrl.includes('xebia-logo.svg')) {
    logoUrl = isDark ? '/assets/Logo-White.png' : '/assets/Logo-Purple.png';
  }

  return (
    <div className={cn('flex items-center gap-3 select-none', className)}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden cursor-pointer"
      >
        <img 
          src={logoUrl} 
          alt="Xebia" 
          className="h-full w-full object-contain bg-transparent" 
        />
      </motion.div>

      {!iconOnly && (
        <div className="flex flex-col">
          <span
            className={cn(
              'text-sm font-bold tracking-tight transition-colors truncate',
              isDark ? 'text-white' : 'text-brand-text-primary dark:text-slate-50'
            )}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {companyName}
          </span>
          <span 
            className="text-[10px]" 
            style={{ color: isDark ? 'rgba(255, 255, 255, 0.45)' : '#6b7280' }}
          >
            Admin Panel
          </span>
        </div>
      )}
    </div>
  );
}
