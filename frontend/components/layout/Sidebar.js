'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Route,
  Settings,
  Users,
} from 'lucide-react'
import { NAV_ITEMS } from '@/lib/constants'

const ICONS = {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Route,
  Settings,
}

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role || 'STUDENT'

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role),
  )

  return (
    <aside className="sidebar-scroll fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-xebia-velvet-dark text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-sm font-bold">
            X
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Xebia Academy</p>
            <p className="text-[10px] uppercase tracking-wider text-white/60">LMS Platform</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {visibleItems.map((item) => {
          const Icon = ICONS[item.icon]
          const isActive =
            pathname === item.href ||
            (item.href === '/courses' && pathname.startsWith('/courses'))

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'border-l-[3px] border-xebia-emerald bg-white/10 text-white'
                  : 'text-white/75 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-xs text-white/50">Powered by Xebia</p>
      </div>
    </aside>
  )
}
