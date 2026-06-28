import { useEffect, useRef, useState } from 'react'

/**
 * Click-to-edit text. Renders as plain text until `editing` is toggled on
 * (via the parent's pencil icon), then becomes a focused input. Commits on
 * blur or Enter, cancels on Escape.
 */
export default function EditableText({ value, onCommit, editing, onStopEditing, className = '' }) {
  const [draft, setDraft] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) {
      setDraft(value)
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      })
    }
  }, [editing, value])

  const commit = () => {
    const trimmed = draft.trim()
    onCommit(trimmed.length ? trimmed : value)
    onStopEditing()
  }

  if (!editing) {
    return <span className={className}>{value}</span>
  }

  return (
    <input
      ref={inputRef}
      className={`edit-input ${className}`}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit()
        if (e.key === 'Escape') onStopEditing()
      }}
    />
  )
}
