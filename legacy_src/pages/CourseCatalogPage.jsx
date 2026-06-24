import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useCourseData } from '../context/CourseDataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import CourseFilters from '../components/catalog/CourseFilters.jsx'
import CourseTable from '../components/catalog/CourseTable.jsx'
import { statusBadge } from '../utils/badgeColors.js'

const EMPTY_FILTERS = { query: '', categoryId: 'all', status: 'all' }

export default function CourseCatalogPage() {
  const { courses, categories, addCourse } = useCourseData()
  const { showToast } = useToast()
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  const filtered = useMemo(() => {
    return courses.filter((course) => {
      const matchesQuery =
        !filters.query ||
        course.title.toLowerCase().includes(filters.query.toLowerCase()) ||
        course.slug.toLowerCase().includes(filters.query.toLowerCase())

      const matchesCategory =
        filters.categoryId === 'all' || String(course.categoryId) === String(filters.categoryId)

      const matchesStatus =
        filters.status === 'all' || statusBadge(course).label === filters.status

      return matchesQuery && matchesCategory && matchesStatus
    })
  }, [courses, filters])

  const handleDelete = (courseId) => {
    // Demo-only confirm; wire up to a real confirmation modal in production.
    if (window.confirm('Delete this course? This cannot be undone.')) {
      // No deleteCourse mutation is exposed yet — placeholder for now.
      showToast('Course deletion is not wired up in this demo', 'info')
    }
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Course Catalog</h1>
          <p className="page__subtitle">
            Manage courses, modules, submodules and content blocks across every batch.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--primary btn--md"
          onClick={() => {
            addCourse({})
            showToast('Course added')
          }}
        >
          <Plus size={16} />
          Add Course
        </button>
      </div>

      <CourseFilters filters={filters} onChange={setFilters} categories={categories} />
      <CourseTable courses={filtered} categories={categories} onDelete={handleDelete} />
    </div>
  )
}
