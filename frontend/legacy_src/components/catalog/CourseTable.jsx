import { ChevronLeft, ChevronRight } from 'lucide-react'
import CourseRow from './CourseRow.jsx'

export default function CourseTable({ courses, categories, onDelete }) {
  const categoryById = (id) => categories.find((c) => c.id === id)

  return (
    <div className="data-card">
      <table className="data-table">
        <thead>
          <tr>
            <th>Course</th>
            <th>Category</th>
            <th>Level</th>
            <th>Modules</th>
            <th>Status</th>
            <th className="data-table__actions-head">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.length === 0 ? (
            <tr>
              <td colSpan={6} className="data-table__empty">
                No courses match your filters.
              </td>
            </tr>
          ) : (
            courses.map((course) => (
              <CourseRow
                key={course.id}
                course={course}
                category={categoryById(course.categoryId)}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>

      <div className="data-card__footer">
        <span>
          Showing 1 - {courses.length} of {courses.length} courses
        </span>
        <div className="pagination">
          <button type="button" className="pagination__btn" disabled>
            <ChevronLeft size={16} />
          </button>
          <button type="button" className="pagination__btn pagination__btn--active" disabled>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
