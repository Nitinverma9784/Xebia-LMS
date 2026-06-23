import Link from 'next/link'

export default function CourseCard({ course }) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
          {course.category?.name || 'General'}
        </span>
        {course.isFeatured ? (
          <span className="text-xs font-medium text-amber-600">Featured</span>
        ) : null}
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-indigo-600">
        {course.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
        {course.shortDescription || course.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-500">
        <span>{course.level || 'All levels'}</span>
        <span>{course.duration || 'Self-paced'}</span>
        <span>{course.language || 'English'}</span>
      </div>
    </Link>
  )
}
