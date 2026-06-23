'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getCategories, getCourses } from '@/lib/api'

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

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-zinc-600">
          Welcome back, {session?.user?.name}. Role: {session?.user?.role}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-500">Courses</p>
          <p className="mt-2 text-3xl font-bold">{courses.length}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-500">Categories</p>
          <p className="mt-2 text-3xl font-bold">{categories.length}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-500">API Gateway</p>
          <p className="mt-2 text-lg font-semibold text-emerald-600">Connected</p>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/courses"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Browse courses
          </Link>
          {(session?.user?.role === 'ADMIN' || session?.user?.role === 'INSTRUCTOR') && (
            <span className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600">
              Create content via API (admin/instructor)
            </span>
          )}
        </div>
      </section>
    </div>
  )
}
