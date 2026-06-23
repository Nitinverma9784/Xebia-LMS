'use client'

import { useQuery } from '@tanstack/react-query'
import CourseCard from '@/components/CourseCard'
import { getCourses } from '@/lib/api'

export default function CoursesPage() {
  const { data: courses = [], isLoading, isError, error } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  })

  if (isLoading) {
    return <p className="text-zinc-600">Loading courses...</p>
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        Failed to load courses. Ensure the API Gateway and LMS service are running.
        <p className="mt-2 text-sm">{error?.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Courses</h1>
        <p className="mt-2 text-zinc-600">
          Explore learning content from the Spring Boot LMS API via the gateway.
        </p>
      </div>

      {courses.length === 0 ? (
        <p className="text-zinc-600">No courses available yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}
