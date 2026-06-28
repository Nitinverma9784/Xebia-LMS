import { Link, useParams, useLocation } from 'react-router-dom'
import { Bell, ChevronDown } from 'lucide-react'
import { useCourseData } from '../../context/CourseDataContext.jsx'

function useBreadcrumb() {
  const location = useLocation()
  const { courseId } = useParams()
  const { getCourse } = useCourseData()

  if (location.pathname.startsWith('/course/') && courseId) {
    const course = getCourse(courseId)
    return [
      { label: 'LMS Portal', to: '/' },
      { label: 'Course Catalog', to: '/' },
      { label: course ? course.title : 'Course', to: null },
    ]
  }

  return [
    { label: 'LMS Portal', to: '/' },
    { label: 'Course Catalog', to: null },
  ]
}

export default function Topbar() {
  const crumbs = useBreadcrumb()

  return (
    <header className="topbar">
      <div className="topbar__breadcrumb">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <span key={`${c.label}-${i}`} className="topbar__crumb-wrap">
              {c.to && !isLast ? (
                <Link to={c.to} className="topbar__crumb">
                  {c.label}
                </Link>
              ) : (
                <span className={`topbar__crumb ${isLast ? 'topbar__crumb--active' : ''}`}>
                  {c.label}
                </span>
              )}
              {!isLast && <span className="topbar__crumb-sep">›</span>}
            </span>
          )
        })}
      </div>

      <div className="topbar__actions">
        <button type="button" className="topbar__roleview">
          <span className="topbar__roleview-label">ROLE VIEW:</span>
          <span className="topbar__roleview-value">Administrator View</span>
          <ChevronDown size={14} />
        </button>

        <button type="button" className="topbar__icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="topbar__notif-dot" />
        </button>

        <div className="topbar__profile">
          <div className="topbar__avatar">AS</div>
          <div className="topbar__profile-text">
            <div className="topbar__profile-name">Ananya Sharma</div>
            <div className="topbar__profile-org">XEBIA GLOBAL</div>
          </div>
        </div>
      </div>
    </header>
  )
}
