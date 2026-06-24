import { Link } from 'react-router-dom'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import Badge from '../common/Badge.jsx'
import { LEVEL_COLOR, countModules, statusBadge } from '../../utils/badgeColors.js'

export default function CourseRow({ course, category, onDelete }) {
  const status = statusBadge(course)

  return (
    <tr className="course-row">
      <td>
        <Link to={`/course/${course.id}`} className="course-row__profile">
          <span className="course-row__icon">{course.icon}</span>
          <span>
            <span className="course-row__title">{course.title}</span>
            <span className="course-row__slug">{course.slug}</span>
          </span>
        </Link>
      </td>
      <td>
        <Badge color={category?.color || 'gray'}>
          {category?.icon} {category?.name}
        </Badge>
      </td>
      <td>
        <Badge color={LEVEL_COLOR[course.level] || 'gray'}>{course.level}</Badge>
      </td>
      <td className="course-row__modules">{countModules(course)} modules</td>
      <td>
        <Badge color={status.color}>{status.label}</Badge>
      </td>
      <td>
        <div className="row-actions">
          <Link to={`/course/${course.id}`} className="row-actions__btn" aria-label="View modules">
            <Eye size={16} />
          </Link>
          <button type="button" className="row-actions__btn" aria-label="Edit course">
            <Pencil size={16} />
          </button>
          <button
            type="button"
            className="row-actions__btn row-actions__btn--danger"
            aria-label="Delete course"
            onClick={() => onDelete(course.id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  )
}
