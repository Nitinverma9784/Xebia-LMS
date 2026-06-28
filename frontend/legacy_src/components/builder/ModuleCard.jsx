import { useState } from 'react'
import { ChevronDown, ChevronRight, Pencil, Trash2, Plus, Layers } from 'lucide-react'
import Badge from '../common/Badge.jsx'
import EditableText from '../common/EditableText.jsx'
import SubmoduleCard from './SubmoduleCard.jsx'
import { useCourseData } from '../../context/CourseDataContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export default function ModuleCard({ courseId, module: mod }) {
  const { renameModule, toggleModuleActive, deleteModule, addSubmodule } = useCourseData()
  const { showToast } = useToast()
  const [expanded, setExpanded] = useState(true)
  const [editing, setEditing] = useState(false)

  return (
    <div className="module-card">
      <div className="module-card__header">
        <button
          type="button"
          className="tree-toggle tree-toggle--lg"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? 'Collapse module' : 'Expand module'}
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="module-card__icon">
          <Layers size={16} />
        </div>

        <div className="module-card__title-wrap">
          <span className="module-card__order">Module {mod.moduleOrder}</span>
          <EditableText
            className="module-card__title"
            value={mod.title}
            editing={editing}
            onStopEditing={() => setEditing(false)}
            onCommit={(title) => renameModule(courseId, mod.id, title)}
          />
        </div>

        <Badge color={mod.isActive ? 'green' : 'gray'}>
          {mod.isActive ? 'Active' : 'Inactive'}
        </Badge>

        <span className="module-card__count">{mod.submodules.length} submodules</span>

        <div className="row-actions">
          <button
            type="button"
            className="row-actions__btn"
            aria-label="Toggle active"
            onClick={() => toggleModuleActive(courseId, mod.id)}
            title="Toggle active"
          >
            <span className={`status-dot ${mod.isActive ? 'status-dot--on' : ''}`} />
          </button>
          <button
            type="button"
            className="row-actions__btn"
            aria-label="Rename module"
            onClick={() => setEditing(true)}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            className="row-actions__btn row-actions__btn--danger"
            aria-label="Delete module"
            onClick={() => {
              deleteModule(courseId, mod.id)
              showToast('Module deleted', 'delete')
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {mod.description && expanded && <p className="module-card__description">{mod.description}</p>}

      {expanded && (
        <div className="module-card__submodules">
          {mod.submodules.map((sub) => (
            <SubmoduleCard key={sub.id} courseId={courseId} moduleId={mod.id} submodule={sub} />
          ))}

          <button
            type="button"
            className="add-inline-btn add-inline-btn--indent"
            onClick={() => {
              addSubmodule(courseId, mod.id)
              showToast('Submodule added')
            }}
          >
            <Plus size={14} />
            Add Submodule
          </button>
        </div>
      )}
    </div>
  )
}
