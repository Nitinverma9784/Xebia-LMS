'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { use } from 'react'
import { getCourseById } from '@/lib/api'

export default function CourseDetailPage({ params }) {
  const { id } = use(params)

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourseById(id),
    enabled: Boolean(id),
  })

  if (isLoading) {
    return <p className="text-zinc-600">Loading course...</p>
  }

  if (isError || !course) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">Course not found.</p>
        <Link href="/courses" className="text-indigo-600 hover:underline">
          Back to courses
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Link href="/courses" className="text-sm text-indigo-600 hover:underline">
        ← Back to courses
      </Link>

      <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            {course.category?.name}
          </span>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
            {course.level}
          </span>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
            {course.duration}
          </span>
        </div>

        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="mt-4 text-zinc-600">{course.description}</p>

        {course.learningOutcomes ? (
          <div className="mt-6">
            <h2 className="text-lg font-semibold">Learning outcomes</h2>
            <p className="mt-2 text-sm text-zinc-600">{course.learningOutcomes}</p>
          </div>
        ) : null}

        {course.prerequisites ? (
          <div className="mt-6">
            <h2 className="text-lg font-semibold">Prerequisites</h2>
            <p className="mt-2 text-sm text-zinc-600">{course.prerequisites}</p>
          </div>
        ) : null}
      </section>
    </div>
  )
}
