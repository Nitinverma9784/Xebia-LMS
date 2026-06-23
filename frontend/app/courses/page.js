'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import AdminBanner from '@/components/AdminBanner'
import CourseCard from '@/components/CourseCard'
import CourseFilters from '@/components/CourseFilters'
import AppShell from '@/components/layout/AppShell'
import { getCourses } from '@/lib/api'

function filterCourses(courses, status) {
  if (status === 'All') return courses
  if (status === 'Active') return courses.filter((c) => c.isPublished && c.isActive)
  if (status === 'Draft') return courses.filter((c) => !c.isPublished)
  if (status === 'Archived') return courses.filter((c) => !c.isActive)
  return courses
}

export default function CoursesPage() {
  const { data: session } = useSession()
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const perPage = 6

  const { data: courses = [], isLoading, isError, error } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  })

  const filtered = useMemo(() => filterCourses(courses, statusFilter), [courses, statusFilter])
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const canCreate =
    session?.user?.role === 'ADMIN' || session?.user?.role === 'INSTRUCTOR'

  const breadcrumbs = [
    { label: 'Courses', href: '/courses' },
    { label: 'All Courses' },
  ]

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <AdminBanner />

      <CourseFilters
        activeStatus={statusFilter}
        onStatusChange={(s) => {
          setStatusFilter(s)
          setPage(1)
        }}
        courseCount={filtered.length}
        canCreate={canCreate}
      />

      {isLoading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-xl border border-xebia-border bg-white"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p className="font-semibold">Unable to load courses</p>
          <p className="mt-2 text-sm">
            Start the backend services or set{' '}
            <code className="rounded bg-red-100 px-1">NEXT_PUBLIC_API_URL</code> in
            .env.local
          </p>
          <p className="mt-1 text-xs opacity-75">{error?.message}</p>
        </div>
      ) : paginated.length === 0 ? (
        <div className="mt-8 rounded-xl border border-xebia-border bg-white p-12 text-center">
          <p className="text-lg font-semibold text-foreground">No courses found</p>
          <p className="mt-2 text-sm text-xebia-muted">
            Try changing filters or add courses via the API.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {paginated.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>
      )}

      {filtered.length > perPage ? (
        <div className="mt-8 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-xebia-border bg-white p-2 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`h-8 w-8 rounded-lg text-sm font-medium ${
                p === page
                  ? 'bg-xebia-velvet text-white'
                  : 'border border-xebia-border bg-white text-xebia-muted hover:bg-xebia-bg'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-xebia-border bg-white p-2 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </AppShell>
  )
}
