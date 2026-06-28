import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { useCourseData } from '../context/CourseDataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Badge from '../components/common/Badge.jsx'
import ModuleCard from '../components/builder/ModuleCard.jsx'
import { LEVEL_COLOR, statusBadge, countModules, countSubmodules } from '../utils/badgeColors.js'

export default function ModuleBuilderPage() {
  const { courseId } = useParams()
  const { getCourse, getCategory, addModule } = useCourseData()
  const { showToast } = useToast()

  const course = getCourse(courseId)
  if (!course) return <Navigate to="/" replace />

  const category = getCategory(course.categoryId)
  const status = statusBadge(course)

  return (
    <div className="page">
      <Link to="/" className="back-link">
        <ArrowLeft size={15} />
        Back to Course Catalog
      </Link>

      <div className="course-header">
        <div className="course-header__icon">{course.icon}</div>
        <div className="course-header__info">
          <h1 className="page__title">{course.title}</h1>
          <p className="page__subtitle">{course.shortDescription}</p>
          <div className="course-header__tags">
            <Badge color={category?.color || 'gray'}>
              {category?.icon} {category?.name}
            </Badge>
            <Badge color={LEVEL_COLOR[course.level] || 'gray'}>{course.level}</Badge>
            <Badge color={status.color}>{status.label}</Badge>
            <span className="course-header__meta">{course.duration}</span>
            <span className="course-header__meta">{course.language}</span>
          </div>
        </div>
        <div className="course-header__stats">
          <div>
            <strong>{countModules(course)}</strong>
            <span>Modules</span>
          </div>
          <div>
            <strong>{countSubmodules(course)}</strong>
            <span>Submodules</span>
          </div>
        </div>
      </div>

      <div className="page__header page__header--tight">
        <h2 className="section-title">Modules</h2>
        <button
          type="button"
          className="btn btn--primary btn--md"
          onClick={() => {
            addModule(course.id)
            showToast('Module added')
          }}
        >
          <Plus size={16} />
          Add Module
        </button>
      </div>

      <div className="module-tree">
        {course.modules.length === 0 ? (
          <div className="empty-state">
            This course has no modules yet. Click <strong>Add Module</strong> to start building it out.
          </div>
        ) : (
          course.modules.map((mod) => <ModuleCard key={mod.id} courseId={course.id} module={mod} />)
        )}
      </div>
    </div>
  )
}
