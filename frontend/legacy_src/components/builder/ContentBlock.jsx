import { useState } from 'react'
import {
  Heading as HeadingIcon,
  FileText,
  Code2,
  Image as ImageIcon,
  Video,
  Megaphone,
  Table2,
  Pencil,
  Trash2,
  GripVertical,
} from 'lucide-react'
import Badge from '../common/Badge.jsx'
import { CONTENT_TYPE_COLOR } from '../../utils/badgeColors.js'
import { useCourseData } from '../../context/CourseDataContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

const TYPE_ICON = {
  heading: HeadingIcon,
  text: FileText,
  code: Code2,
  image: ImageIcon,
  video: Video,
  callout: Megaphone,
  table: Table2,
}

function preview(item) {
  switch (item.type) {
    case 'heading':
      return item.title
    case 'code':
      return item.code
    case 'image':
      return item.alt || item.imageUrl
    case 'video':
      return item.caption || item.videoUrl
    case 'callout':
      return `${item.title ? item.title + ' — ' : ''}${item.text || ''}`
    case 'table':
      return item.title || item.caption || 'Table block'
    default:
      return item.text
  }
}

export default function ContentBlock({ courseId, moduleId, submoduleId, item }) {
  const { deleteContent, updateContentText } = useCourseData()
  const { showToast } = useToast()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(preview(item))

  const Icon = TYPE_ICON[item.type] || FileText

  const commit = () => {
    updateContentText(courseId, moduleId, submoduleId, item.id, draft)
    setEditing(false)
  }

  return (
    <div className="content-block">
      <GripVertical size={14} className="content-block__grip" />
      <Icon size={15} className="content-block__icon" />
      <Badge color={CONTENT_TYPE_COLOR[item.type] || 'gray'}>{item.type}</Badge>

      <div className="content-block__body">
        {editing ? (
          <textarea
            className="content-block__textarea"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setEditing(false)
            }}
          />
        ) : (
          <span className={`content-block__preview ${item.type === 'code' ? 'mono' : ''}`}>
            {preview(item) || <em>Empty — click the pencil to add content</em>}
          </span>
        )}
      </div>

      <span className="content-block__order">#{item.contentOrder}</span>

      <div className="row-actions">
        <button
          type="button"
          className="row-actions__btn"
          aria-label="Edit content"
          onClick={() => setEditing((v) => !v)}
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          className="row-actions__btn row-actions__btn--danger"
          aria-label="Delete content"
          onClick={() => {
            deleteContent(courseId, moduleId, submoduleId, item.id)
            showToast('Content block deleted', 'delete')
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
