'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen, FolderTree, Image, Settings, ChevronLeft, ChevronRight, LayoutDashboard,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils';
import { useCatalog } from '@/hooks/useCatalog';
import Logo from '@/components/ui/Logo';

const NAV_ITEMS = [
  { href: '/catalog/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/catalog/categories', label: 'Categories', icon: FolderTree },
  { href: '/catalog/courses', label: 'All Courses', icon: BookOpen },
  { href: '/catalog/media', label: 'Media Library', icon: Image },
  { href: '/catalog/branding', label: 'Branding', icon: Settings },
];

export default function Sidebar({ collapsed, onToggle }) {
  const pathname = usePathname();
  const { branding } = useCatalog();
  const [localCollapsed, setLocalCollapsed] = useState(false);

  const isCollapsed = collapsed !== undefined ? collapsed : localCollapsed;
  const toggleCollapsed = onToggle !== undefined ? onToggle : () => setLocalCollapsed(!localCollapsed);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300',
        isCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-brand-border dark:border-slate-800 px-4 overflow-hidden">
        <Logo iconOnly={isCollapsed} />
      </div>

      <nav className="flex-1 space-y-1 p-3 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-slate-100'
                  : 'text-brand-text-secondary dark:text-slate-400 hover:bg-brand-surface dark:hover:bg-slate-800 hover:text-brand-text-primary dark:hover:text-slate-100'
              )}
              style={active ? { color: branding.primaryColor, backgroundColor: `${branding.primaryColor}15` } : {}}
              title={isCollapsed ? label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={toggleCollapsed}
        className="flex h-12 items-center justify-center border-t border-brand-border dark:border-slate-800 text-brand-text-secondary dark:text-slate-400 hover:bg-brand-surface dark:hover:bg-slate-800"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
