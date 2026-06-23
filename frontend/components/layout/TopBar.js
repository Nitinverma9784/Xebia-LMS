'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Bell, ChevronRight, HelpCircle, LogOut, Search } from 'lucide-react'

export default function TopBar({ breadcrumbs = [] }) {
  const { data: session } = useSession()

  const initials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'GU'

  return (
    <header className="sticky top-0 z-20 border-b border-xebia-border bg-white">
      <div className="flex h-14 items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-center gap-1 text-sm text-xebia-muted">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.label} className="flex items-center gap-1">
              {index > 0 ? <ChevronRight className="h-3.5 w-3.5 text-xebia-light" /> : null}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-xebia-velvet">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{crumb.label}</span>
              )}
            </span>
          ))}
        </div>

        <div className="hidden max-w-md flex-1 px-4 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-xebia-muted" />
            <input
              type="search"
              placeholder="Search courses, trainers, or IDs..."
              className="w-full rounded-lg border border-xebia-border bg-xebia-bg py-2 pl-9 pr-4 text-sm outline-none focus:border-xebia-velvet focus:ring-1 focus:ring-xebia-velvet/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg p-2 text-xebia-muted hover:bg-xebia-bg"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-xebia-muted hover:bg-xebia-bg"
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          {session ? (
            <div className="flex items-center gap-2 border-l border-xebia-border pl-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-xebia-velvet text-xs font-semibold text-white">
                {initials}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-medium leading-tight">{session.user?.name}</p>
                <p className="text-[10px] text-xebia-muted">{session.user?.role}</p>
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="rounded-lg p-2 text-xebia-muted hover:bg-xebia-bg"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-xebia-velvet px-3 py-1.5 text-xs font-semibold text-white hover:bg-xebia-velvet-bright"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
