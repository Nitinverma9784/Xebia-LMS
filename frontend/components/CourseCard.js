import Link from 'next/link'
import { BookOpen, MoreVertical, Users } from 'lucide-react'
import { COURSE_HEADER_COLORS } from '@/lib/constants'

function getStatus(course) {
  if (course.isPublished && course.isActive) return { label: 'Active', color: 'bg-xebia-emerald' }
  if (!course.isPublished) return { label: 'Draft', color: 'bg-xebia-orange' }
  return { label: 'Archived', color: 'bg-xebia-muted' }
}

export default function CourseCard({ course, index = 0 }) {
  const status = getStatus(course)
  const headerColor = COURSE_HEADER_COLORS[index % COURSE_HEADER_COLORS.length]
  const categoryName = course.category?.name || 'GENERAL'

  return (
    <article className="group overflow-hidden rounded-xl border border-xebia-border bg-white shadow-sm transition hover:shadow-md">
      <div className={`relative px-4 py-5 ${headerColor}`}>
        <div className="flex items-start justify-between">
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              {categoryName}
            </span>
            {course.isFeatured ? (
              <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Featured
              </span>
            ) : null}
          </div>
          <button
            type="button"
            className="rounded p-1 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="More options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${status.color}`} />
            <span className="text-xs font-medium text-xebia-muted">{status.label}</span>
          </div>
          <span className="text-xs text-xebia-muted">ID: C-{course.id}</span>
        </div>

        <Link href={`/courses/${course.id}`}>
          <h3 className="text-base font-bold text-foreground group-hover:text-xebia-velvet">
            {course.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-xebia-muted">
            {course.shortDescription || course.description}
          </p>
        </Link>

        <div className="mt-4 flex items-center justify-between border-t border-xebia-border pt-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-xebia-velvet/10 text-[10px] font-bold text-xebia-velvet">
              {(course.author || categoryName).slice(0, 2).toUpperCase()}
            </div>
            <span className="text-xs text-xebia-muted">
              {course.author || `${categoryName} Team`}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-xebia-muted">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {course.totalViews || 0}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {course.level || 'All'}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
