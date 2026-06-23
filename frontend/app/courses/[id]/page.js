'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { use } from 'react'
import { ArrowLeft, BookOpen, Clock, Globe } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { getCourseById } from '@/lib/api'
import { COURSE_HEADER_COLORS } from '@/lib/constants'

export default function CourseDetailPage({ params }) {
  const { id } = use(params)

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourseById(id),
    enabled: Boolean(id),
  })

  const breadcrumbs = [
    { label: 'Courses', href: '/courses' },
    { label: 'All Courses', href: '/courses' },
    { label: course?.title || 'Course Detail' },
  ]

  if (isLoading) {
    return (
      <AppShell breadcrumbs={breadcrumbs}>
        <div className="h-96 animate-pulse rounded-xl bg-white" />
      </AppShell>
    )
  }

  if (isError || !course) {
    return (
      <AppShell breadcrumbs={breadcrumbs}>
        <div className="rounded-xl border border-xebia-border bg-white p-8 text-center">
          <p className="font-semibold text-red-600">Course not found</p>
          <Link
            href="/courses"
            className="mt-4 inline-flex items-center gap-2 text-sm text-xebia-velvet hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Course Library
          </Link>
        </div>
      </AppShell>
    )
  }

  const headerColor = COURSE_HEADER_COLORS[(course.id || 0) % COURSE_HEADER_COLORS.length]

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <Link
        href="/courses"
        className="mb-4 inline-flex items-center gap-2 text-sm text-xebia-velvet hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Course Library
      </Link>

      <article className="overflow-hidden rounded-xl border border-xebia-border bg-white shadow-sm">
        <div className={`px-8 py-10 ${headerColor}`}>
          <div className="flex flex-wrap gap-2">
            <span className="rounded bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              {course.category?.name || 'General'}
            </span>
            {course.isFeatured ? (
              <span className="rounded bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                Featured
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white">{course.title}</h1>
          <p className="mt-2 max-w-2xl text-white/80">{course.shortDescription}</p>
        </div>

        <div className="grid gap-6 p-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section>
              <h2 className="text-lg font-bold">About this course</h2>
              <p className="mt-3 text-sm leading-relaxed text-xebia-muted">
                {course.description}
              </p>
            </section>

            {course.learningOutcomes ? (
              <section>
                <h2 className="text-lg font-bold">Learning outcomes</h2>
                <p className="mt-3 text-sm leading-relaxed text-xebia-muted">
                  {course.learningOutcomes}
                </p>
              </section>
            ) : null}

            {course.prerequisites ? (
              <section>
                <h2 className="text-lg font-bold">Prerequisites</h2>
                <p className="mt-3 text-sm leading-relaxed text-xebia-muted">
                  {course.prerequisites}
                </p>
              </section>
            ) : null}
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-xebia-border bg-xebia-bg p-5">
              <h3 className="text-sm font-bold uppercase tracking-wide text-xebia-muted">
                Course details
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-center gap-2 text-xebia-muted">
                  <BookOpen className="h-4 w-4 text-xebia-velvet" />
                  {course.level || 'All levels'}
                </li>
                <li className="flex items-center gap-2 text-xebia-muted">
                  <Clock className="h-4 w-4 text-xebia-velvet" />
                  {course.duration || 'Self-paced'}
                </li>
                <li className="flex items-center gap-2 text-xebia-muted">
                  <Globe className="h-4 w-4 text-xebia-velvet" />
                  {course.language || 'English'}
                </li>
              </ul>
              <button
                type="button"
                className="mt-5 w-full rounded-lg bg-xebia-emerald py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Enrol now
              </button>
            </div>
          </aside>
        </div>
      </article>
    </AppShell>
  )
}
