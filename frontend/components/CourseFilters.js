'use client'

import { useState } from 'react'
import { ChevronDown, Filter, LayoutGrid, List, Plus } from 'lucide-react'
import { STATUS_FILTERS } from '@/lib/constants'

export default function CourseFilters({
  activeStatus,
  onStatusChange,
  courseCount,
  canCreate,
}) {
  const [view, setView] = useState('grid')

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Course Library</h1>
          <p className="mt-1 text-sm text-xebia-muted">
            {courseCount} course{courseCount !== 1 ? 's' : ''} across all organisations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-xebia-border bg-white p-0.5">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`rounded-md p-2 ${view === 'grid' ? 'bg-xebia-velvet text-white' : 'text-xebia-muted hover:bg-xebia-bg'}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`rounded-md p-2 ${view === 'list' ? 'bg-xebia-velvet text-white' : 'text-xebia-muted hover:bg-xebia-bg'}`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {canCreate ? (
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-xebia-velvet px-4 py-2 text-sm font-semibold text-white hover:bg-xebia-velvet-bright"
            >
              <Plus className="h-4 w-4" />
              New course
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-xebia-border bg-white p-0.5">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatusChange(status)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                activeStatus === status
                  ? 'bg-xebia-velvet text-white'
                  : 'text-xebia-muted hover:bg-xebia-bg'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {['Organisation', 'Subject Matter', 'Trainer'].map((label) => (
          <button
            key={label}
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-xebia-border bg-white px-3 py-1.5 text-xs font-medium text-xebia-muted hover:border-xebia-velvet/30"
          >
            {label}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        ))}

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-xebia-border bg-white px-3 py-1.5 text-xs font-medium text-xebia-muted hover:border-xebia-velvet/30"
        >
          <Filter className="h-3.5 w-3.5" />
          More filters
        </button>
      </div>
    </div>
  )
}
