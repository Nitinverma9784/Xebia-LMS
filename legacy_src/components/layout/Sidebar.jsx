import { Link, useLocation } from 'react-router-dom'
import {
  LayoutGrid,
  Users,
  ShieldCheck,
  Building2,
  Link2,
  BookOpen,
  CalendarDays,
  UserPlus,
  LogOut,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/users', label: 'User Directory', icon: Users },
  { to: '/roles', label: 'Role & Permissions', icon: ShieldCheck },
  { to: '/organizations', label: 'Organizations', icon: Building2 },
  { to: '/trainers', label: 'Trainer Affiliations', icon: Link2 },
  // matchPrefix covers the /course/:id drill-down, so the catalog stays
  // highlighted while building out a course's modules.
  { to: '/', label: 'Course Catalog', icon: BookOpen, matchPrefix: '/course' },
  { to: '/batches', label: 'Batch Directory', icon: CalendarDays },
  { to: '/enrollments', label: 'Enrollments', icon: UserPlus },
]

export default function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo">X</span>
        <span className="sidebar__brand-text">
          Xebia<strong>LMS</strong>
        </span>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon, matchPrefix }) => {
          const isActive =
            pathname === to || (matchPrefix && pathname.startsWith(matchPrefix))
          return (
            <Link
              key={label}
              to={to}
              className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar">AS</div>
          <div>
            <div className="sidebar__user-name">Ananya Sharma</div>
            <div className="sidebar__user-role">ADMIN</div>
          </div>
        </div>
        <button className="sidebar__signout" type="button">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
