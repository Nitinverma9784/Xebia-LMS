'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, FolderOpen, Route, Users } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { getCategories, getCourses } from '@/lib/api'

const STAT_CARDS = [
  { key: 'courses', label: 'Total Courses', icon: BookOpen, color: 'bg-xebia-velvet' },
  { key: 'categories', label: 'Categories', icon: FolderOpen, color: 'bg-[#533754]' },
  { key: 'students', label: 'Active Learners', icon: Users, color: 'bg-xebia-emerald' },
  { key: 'paths', label: 'Learning Paths', icon: Route, color: 'bg-xebia-velvet-bright' },
]

export default function DashboardPage() {
  const { data: session } = useSession()

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const stats = {
    courses: courses.length,
    categories: categories.length,
    students: 128,
    paths: 12,
  }

  const breadcrumbs = [{ label: 'Admin Dashboard' }]

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-xebia-muted">
          Welcome back, {session?.user?.name}. You are signed in as{' '}
          <span className="font-semibold text-xebia-velvet">{session?.user?.role}</span>.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
          <div
            key={key}
            className="overflow-hidden rounded-xl border border-xebia-border bg-white shadow-sm"
          >
            <div className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-xebia-muted">{label}</p>
                <p className="text-2xl font-bold">{stats[key]}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-xebia-border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Recent courses</h2>
          <ul className="mt-4 space-y-3">
            {courses.slice(0, 5).map((course) => (
              <li
                key={course.id}
                className="flex items-center justify-between border-b border-xebia-border pb-3 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{course.title}</p>
                  <p className="text-xs text-xebia-muted">{course.category?.name}</p>
                </div>
                <span className="text-xs text-xebia-muted">C-{course.id}</span>
              </li>
            ))}
            {courses.length === 0 ? (
              <li className="text-sm text-xebia-muted">No courses loaded</li>
            ) : null}
          </ul>
        </section>

        <section className="rounded-xl border border-xebia-border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Quick actions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="rounded-lg bg-xebia-velvet px-4 py-2 text-sm font-semibold text-white hover:bg-xebia-velvet-bright"
            >
              Open Course Library
            </Link>
            {(session?.user?.role === 'ADMIN' || session?.user?.role === 'INSTRUCTOR') && (
              <span className="rounded-lg border border-xebia-border px-4 py-2 text-sm text-xebia-muted">
                Manage via API
              </span>
            )}
          </div>
          <div className="mt-6 rounded-lg bg-xebia-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-xebia-muted">
              System status
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-xebia-emerald" />
              <span className="text-sm">API Gateway connected</span>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
