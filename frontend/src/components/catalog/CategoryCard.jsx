'use client';

import { motion } from 'framer-motion';
import { Pencil, Trash2, BookOpen, Users } from 'lucide-react';
import { CourseStatusBadge } from '@/components/ui/Badge';

function slugify(name) {
  return (name || 'category').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function CategoryCard({ category, courseCount, onEdit, onDelete, onView }) {
  const color = category.color || '#01AC9F';
  const studentCount = category.studentCount ?? Math.max(courseCount * 120, 0);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={() => onView(category)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-brand-border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="h-1" style={{ backgroundColor: color }} />

      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl"
            style={{ backgroundColor: `${color}18` }}
          >
            <span>{category.icon || '💻'}</span>
          </div>
          <CourseStatusBadge status={category.deletedAt ? 'archived' : category.status} />
        </div>

        <h3 className="truncate text-base font-bold text-slate-900">{category.name}</h3>
        <p className="mt-0.5 text-xs text-brand-text-secondary">{slugify(category.name)}</p>
        <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-brand-text-secondary">
          {category.description}
        </p>

        <div className="mt-4 flex items-center gap-4 text-xs text-brand-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            {courseCount ?? category.courseCount ?? 0} courses
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {studentCount.toLocaleString()} students
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-brand-border pt-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border border-black/5" style={{ backgroundColor: color }} />
            <span className="text-xs font-medium text-brand-text-secondary">{color.toUpperCase()}</span>
          </div>
          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => onEdit(category)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-border text-brand-primary transition-colors hover:bg-brand-surface"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(category)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-red-200 text-red-500 transition-colors hover:bg-red-50"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function CategoryRow({ category, courseCount, onEdit, onDelete, onView }) {
  const color = category.color || '#01AC9F';

  return (
    <tr className="border-b border-brand-border transition-colors hover:bg-brand-surface/60">
      <td className="px-4 py-3">
        <button type="button" onClick={() => onView(category)} className="flex items-center gap-2.5 text-left">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-base"
            style={{ backgroundColor: `${color}18` }}
          >
            {category.icon || '💻'}
          </span>
          <div>
            <p className="font-semibold text-slate-900">{category.name}</p>
            <p className="text-xs text-brand-text-secondary">{slugify(category.name)}</p>
          </div>
        </button>
      </td>
      <td className="max-w-xs truncate px-4 py-3 text-sm text-brand-text-secondary">{category.description}</td>
      <td className="px-4 py-3 text-sm text-slate-800">{courseCount ?? 0}</td>
      <td className="px-4 py-3"><CourseStatusBadge status={category.status} /></td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5">
          <button type="button" onClick={() => onEdit(category)} className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-border text-brand-primary hover:bg-brand-surface">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => onDelete(category)} className="flex h-8 w-8 items-center justify-center rounded-full border border-red-200 text-red-500 hover:bg-red-50">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
