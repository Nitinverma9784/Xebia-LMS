import { useState } from 'react'
import { ChevronDown, ChevronRight, Pencil, Trash2, Plus } from 'lucide-react'
import Badge from '../common/Badge.jsx'
import EditableText from '../common/EditableText.jsx'
import ContentBlock from './ContentBlock.jsx'
import { useCourseData } from '../../context/CourseDataContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export default function SubmoduleCard({ courseId, moduleId, submodule }) {
  const { renameSubmodule, toggleSubmoduleActive, deleteSubmodule, addContent } = useCourseData()
  const { showToast } = useToast()
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)

  return (
    <div className="submodule-card">
      <div className="submodule-card__header">
        <button
          type="button"
          className="tree-toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? 'Collapse submodule' : 'Expand submodule'}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        <span className="tree-order">{submodule.submoduleOrder}</span>

        <EditableText
          className="submodule-card__title"
          value={submodule.title}
          editing={editing}
          onStopEditing={() => setEditing(false)}
          onCommit={(title) => renameSubmodule(courseId, moduleId, submodule.id, title)}
        />

        <span className="submodule-card__slug mono">/{submodule.slug}</span>

        <Badge color={submodule.isActive ? 'green' : 'gray'}>
          {submodule.isActive ? 'Active' : 'Inactive'}
        </Badge>

        <span className="submodule-card__count">{submodule.contents.length} blocks</span>

        <div className="row-actions">
          <button
            type="button"
            className="row-actions__btn"
            aria-label="Toggle active"
            onClick={() => toggleSubmoduleActive(courseId, moduleId, submodule.id)}
            title="Toggle active"
          >
            <span className={`status-dot ${submodule.isActive ? 'status-dot--on' : ''}`} />
          </button>
          <button
            type="button"
            className="row-actions__btn"
            aria-label="Rename submodule"
            onClick={() => setEditing(true)}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            className="row-actions__btn row-actions__btn--danger"
            aria-label="Delete submodule"
            onClick={() => {
              deleteSubmodule(courseId, moduleId, submodule.id)
              showToast('Submodule deleted', 'delete')
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="submodule-card__contents">
          {submodule.contents.map((item) => (
            <ContentBlock
              key={item.id}
              courseId={courseId}
              moduleId={moduleId}
              submoduleId={submodule.id}
              item={item}
            />
          ))}

          <button
            type="button"
            className="add-inline-btn"
            onClick={() => {
              addContent(courseId, moduleId, submodule.id, 'text')
              showToast('Content block added')
            }}
          >
            <Plus size={14} />
            Add Content Block
          </button>
        </div>
      )}
    </div>
  )
}
