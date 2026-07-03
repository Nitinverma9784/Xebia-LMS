'use client';

import { motion } from 'framer-motion';
import { Pencil, Trash2, BookOpen, Users } from 'lucide-react';

function slugify(name) {
  return (name || 'category').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Status badge matching the design: teal for active, gray for inactive */
function StatusBadge({ status }) {
  const isActive = status === 'active';
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={
        isActive
          ? { backgroundColor: 'var(--brand-success-10)', color: 'var(--brand-success)' }
          : { backgroundColor: 'var(--brand-muted)', color: 'var(--text-secondary)' }
      }
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

export default function CategoryCard({ category, courseCount, onEdit, onDelete, onView }) {
  const color = category.color || '#01AC9F';
  const studentCount = category.studentCount ?? Math.max((courseCount ?? 0) * 120, 0);
  const slug = slugify(category.name);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25 }}
      onClick={() => onView(category)}
      className="group relative cursor-pointer overflow-hidden rounded-[20px] border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] shadow-sm hover:shadow-xl hover:shadow-purple-900/10 transition-all duration-300 flex flex-col justify-between h-full min-h-[270px]"
    >
      {/* Top color accent bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          {/* Icon + Status badge */}
          <div className="mb-4 flex items-start justify-between">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-sm"
              style={{
                backgroundColor: `${color}18`,
                border: `1.5px solid ${color}30`,
              }}
            >
              {category.icon || '💻'}
            </div>
            <StatusBadge status={category.deletedAt ? 'inactive' : (category.status || 'active')} />
          </div>

          {/* Name + slug */}
          <div className="mb-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">{category.name}</h3>
            <p className="mt-0.5 font-mono text-xs text-slate-400 dark:text-[#CBD5E1]">{slug}</p>
          </div>

          {/* Description */}
          <p
            className="mb-4 text-xs leading-relaxed text-slate-600 dark:text-[#CBD5E1] line-clamp-2 min-h-[36px]"
          >
            {category.description || 'No description provided for this learning category.'}
          </p>
        </div>

        <div>
          {/* Stats row */}
          <div className="mb-4 flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-[#CBD5E1]">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-purple-500" />
              {(courseCount ?? category.courseCount ?? 0)} courses
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-teal-500" />
              {studentCount.toLocaleString()} learners
            </span>
          </div>

          {/* Footer: color swatch + action buttons */}
          <div
            className="flex items-center justify-between border-t border-slate-100 dark:border-[#334155] pt-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: color }} />
              <span className="font-mono text-[11px] font-semibold text-slate-400 dark:text-[#CBD5E1]">{color.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onEdit(category); }}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#0B1120] text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors cursor-pointer"
                title="Edit Category"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(category); }}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#0B1120] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                title="Delete Category"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function CategoryRow({ category, courseCount, onEdit, onDelete, onView }) {
  const color = category.color || '#01AC9F';
  const slug = slugify(category.name);

  return (
    <tr className="border-b border-brand-border transition-colors hover:bg-brand-surface/40">
      <td className="px-4 py-3">
        <button type="button" onClick={() => onView(category)} className="flex items-center gap-2.5 text-left">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl text-base"
            style={{ backgroundColor: `${color}18`, border: `1.5px solid ${color}30` }}
          >
            {category.icon || '💻'}
          </span>
          <div>
            <p className="text-sm font-semibold text-brand-text-primary">{category.name}</p>
            <p className="font-mono text-xs text-brand-text-secondary">{slug}</p>
          </div>
        </button>
      </td>
      <td className="max-w-xs truncate px-4 py-3 text-xs text-brand-text-secondary">{category.description}</td>
      <td className="px-4 py-3 text-sm text-brand-text-primary">{courseCount ?? 0}</td>
      <td className="px-4 py-3">
        <StatusBadge status={category.status} />
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-brand-border bg-brand-background hover:bg-brand-surface"
          >
            <Pencil className="h-3 w-3" style={{ color: '#6c1d5f' }} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(category)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-brand-border bg-brand-background hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <Trash2 className="h-3 w-3" style={{ color: '#ff6200' }} />
          </button>
        </div>
      </td>
    </tr>
  );
}
