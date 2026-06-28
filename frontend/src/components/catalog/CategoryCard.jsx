'use client';

import { motion } from 'framer-motion';
import { MoreHorizontal, Pencil, Trash2, Eye, BookOpen } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn, formatDate } from '@/utils';
import { CourseStatusBadge } from '@/components/ui/Badge';

export default function CategoryCard({ category, courseCount, onEdit, onDelete, onView }) {
  const color = category.color || '#0EA89C';

  return (
    <motion.div
      whileHover={{ y: -3 }}
      onClick={() => onView(category)}
      className="group relative overflow-hidden rounded-2xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card hover:shadow-card-hover transition-all cursor-pointer"
    >
      {/* Colored accent bar, driven by the category's own color */}
      <div className="h-1.5" style={{ backgroundColor: color }} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
            style={{ backgroundColor: `${color}1A` }}
          >
            <span>{category.icon || '💻'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CourseStatusBadge status={category.deletedAt ? 'archived' : category.status} />
          </div>
        </div>

        <h3 className="font-bold text-brand-text-primary dark:text-slate-100 truncate">{category.name}</h3>
        <p className="mt-1 text-sm text-brand-text-secondary dark:text-slate-400 line-clamp-2 min-h-[2.5rem]">{category.description}</p>

        <div className="mt-4 flex items-center justify-between text-xs text-brand-text-secondary dark:text-slate-400 border-t border-brand-border dark:border-slate-800 pt-3">
          <span className="flex items-center gap-1.5 font-semibold" style={{ color }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
            {courseCount ?? category.courseCount ?? 0} courses
          </span>
          <span>{formatDate(category.createdAt)}</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onEdit(category)}
          className="rounded-lg bg-white/95 dark:bg-slate-800/95 p-1.5 shadow-sm hover:bg-brand-surface dark:hover:bg-slate-700 text-brand-text-secondary dark:text-slate-300"
          title="Edit category"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(category)}
          className="rounded-lg bg-white/95 dark:bg-slate-800/95 p-1.5 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500"
          title="Delete category"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

export function CategoryRow({ category, courseCount, onEdit, onDelete, onView }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const color = category.color || '#0EA89C';

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <tr className="border-b border-brand-border dark:border-slate-800 hover:bg-brand-surface/50 dark:hover:bg-slate-850/40 transition-colors">
      <td className="px-4 py-3">
        <button type="button" onClick={() => onView(category)} className="flex items-center gap-2.5 text-left">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg text-base" style={{ backgroundColor: `${color}1A` }}>{category.icon || '💻'}</span>
          <span className="font-semibold text-brand-text-primary dark:text-slate-200 hover:text-accent-teal-dark transition-colors">{category.name}</span>
        </button>
      </td>
      <td className="px-4 py-3 text-sm text-brand-text-secondary dark:text-slate-400 max-w-xs truncate">{category.description}</td>
      <td className="px-4 py-3 text-sm text-brand-text-primary dark:text-slate-300">
        <span className="inline-flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-brand-text-secondary" />{courseCount ?? category.courseCount ?? 0}</span>
      </td>
      <td className="px-4 py-3"><CourseStatusBadge status={category.status} /></td>
      <td className="px-4 py-3 text-sm text-brand-text-secondary dark:text-slate-400">{formatDate(category.createdAt)}</td>
      <td className="px-4 py-3">
        <div className="relative" ref={menuRef}>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg p-1.5 hover:bg-brand-surface dark:hover:bg-slate-800 text-brand-text-secondary dark:text-slate-400">
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 py-1 shadow-card">
              <button type="button" className="w-full px-3 py-2 text-left text-sm text-brand-text-primary dark:text-slate-300 hover:bg-brand-surface dark:hover:bg-slate-800" onClick={() => { onView(category); setMenuOpen(false); }}>View</button>
              <button type="button" className="w-full px-3 py-2 text-left text-sm text-brand-text-primary dark:text-slate-300 hover:bg-brand-surface dark:hover:bg-slate-800" onClick={() => { onEdit(category); setMenuOpen(false); }}>Edit</button>
              <button type="button" className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => { onDelete(category); setMenuOpen(false); }}>Delete</button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
