'use client';

import { Link, useLocation } from 'react-router-dom';
import { BookOpen, FolderTree, Layers, LayoutDashboard, LogOut, Image, Settings } from 'lucide-react';
import { cn } from '@/utils';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/ui/Logo';

const NAV_ITEMS = [
  { href: '/catalog/courses', label: 'Courses', icon: BookOpen },
  { href: '/catalog/categories', label: 'Categories', icon: FolderTree },
  { href: '/catalog/curriculum', label: 'Curriculum', icon: Layers },
  { href: '/catalog/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/catalog/media', label: 'Media Library', icon: Image },
  { href: '/catalog/branding', label: 'Branding', icon: Settings },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col bg-brand-primary-dark">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <Logo variant="dark" />
      </div>

      <p className="px-5 pb-2 pt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Main Menu</p>

      <nav className="flex-1 space-y-0.5 px-3 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'border-l-[3px] border-accent-teal bg-white/10 text-white pl-[9px]'
                  : 'border-l-[3px] border-transparent text-white/60 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <img
                src={user.avatar}
                alt={user.fullName}
                className="h-9 w-9 shrink-0 rounded-full border border-white/15 bg-white/10"
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">{user.fullName}</p>
                <p className="truncate text-[10px] text-white/45">{user.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="shrink-0 rounded-lg p-2 text-white/45 transition-colors hover:bg-white/10 hover:text-white"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
