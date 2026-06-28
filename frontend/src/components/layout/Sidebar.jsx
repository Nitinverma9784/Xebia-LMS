'use client';

import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen, FolderTree, Image, Settings, ChevronLeft, ChevronRight, LayoutDashboard, LogOut, Layers,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils';
import { useCatalog } from '@/hooks/useCatalog';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/ui/Logo';

const NAV_ITEMS = [
  { href: '/catalog/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/catalog/categories', label: 'Categories', icon: FolderTree },
  { href: '/catalog/courses', label: 'Courses', icon: BookOpen },
  { href: '/catalog/curriculum', label: 'Curriculum', icon: Layers },
  { href: '/catalog/media', label: 'Media Library', icon: Image },
  { href: '/catalog/branding', label: 'Branding', icon: Settings },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [localCollapsed, setLocalCollapsed] = useState(false);

  const isCollapsed = collapsed !== undefined ? collapsed : localCollapsed;
  const toggleCollapsed = onToggle !== undefined ? onToggle : () => setLocalCollapsed(!localCollapsed);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col bg-brand-primary-dark transition-all duration-300',
        isCollapsed ? 'w-[76px]' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center gap-3 px-4 overflow-hidden border-b border-white/10">
        <Logo iconOnly={isCollapsed} variant="dark" />
      </div>

      {!isCollapsed && (
        <p className="px-5 pt-4 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/35">Main Menu</p>
      )}

      <nav className="flex-1 space-y-1 px-3 py-1.5 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 relative overflow-hidden',
                active
                  ? 'bg-gradient-to-r from-accent-pink/85 to-brand-secondary/95 text-white shadow-[0_4px_16px_rgba(219,39,119,0.3)] border-l-4 border-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white',
                (!active && !isCollapsed) && 'hover:pl-4'
              )}
              title={isCollapsed ? label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
              {!isCollapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User profile & logout */}
      {user && (
        <div className="border-t border-white/10 p-3 flex items-center justify-between gap-2 overflow-hidden">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img src={user.avatar} alt={user.fullName} className="h-9 w-9 rounded-xl border border-white/15 bg-white/10 shrink-0" />
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
                <p className="text-[10px] text-white/45 truncate">{user.email}</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              type="button"
              onClick={logout}
              className="p-2 rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition-colors shrink-0"
              title="Log Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={toggleCollapsed}
        className="flex h-11 items-center justify-center border-t border-white/10 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
