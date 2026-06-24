'use client';

import { motion } from 'framer-motion';
import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn, formatDate } from '@/utils';
import { CourseStatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function CategoryCard({ category, courseCount, onEdit, onDelete, onView }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card hover:shadow-card-hover transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <CourseStatusBadge status={category.status} />
            {category.deletedAt && <CourseStatusBadge status="archived" />}
          </div>
          <h3 className="font-semibold text-brand-text-primary dark:text-slate-100 truncate">{category.name}</h3>
          <p className="mt-1 text-sm text-brand-text-secondary dark:text-slate-400 line-clamp-2">{category.description}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-brand-text-secondary dark:text-slate-400">
        <span>{courseCount ?? category.courseCount ?? 0} courses</span>
        <span>{formatDate(category.createdAt)}</span>
      </div>
      <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="outline" size="sm" onClick={() => onView(category)}>
          <Eye className="h-3.5 w-3.5" /> View
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(category)}>
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(category)}>
          <Trash2 className="h-3.5 w-3.5 text-brand-text-secondary dark:text-slate-400" />
        </Button>
      </div>
    </motion.div>
  );
}

export function CategoryRow({ category, courseCount, onEdit, onDelete, onView }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

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
        <button type="button" onClick={() => onView(category)} className="font-medium text-brand-primary dark:text-brand-secondary hover:underline text-left">
          {category.name}
        </button>
      </td>
      <td className="px-4 py-3 text-sm text-brand-text-secondary dark:text-slate-400 max-w-xs truncate">{category.description}</td>
      <td className="px-4 py-3 text-sm text-brand-text-primary dark:text-slate-300">{courseCount ?? category.courseCount ?? 0}</td>
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
