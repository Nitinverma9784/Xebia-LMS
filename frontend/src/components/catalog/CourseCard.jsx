'use client';

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, MoreHorizontal, Pencil, Trash2, Clock, Globe, BarChart3, Star } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { getTechLogoUrl, countCourseStats } from '@/utils';
import { CourseStatusBadge, LevelBadge, CategoryBadge } from '@/components/ui/Badge';

export default function CourseCard({ course, categoryName, categoryColor = '#7C3AED', onEdit, onDelete, onDuplicate }) {
  const stats = countCourseStats(course);
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
    <motion.div
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card hover:shadow-card-hover transition-all"
    >
      <Link to={`/catalog/courses/${course.id}`} className="block">
        <div className="relative h-36 bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10">
          <img
            src={course.thumbnail}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          <div className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-md p-1.5 border border-brand-border dark:border-slate-800">
            <img src={getTechLogoUrl(course.technology)} alt={course.technology} className="h-full w-full object-contain" />
          </div>
          <div className="absolute top-3 right-3">
            <CourseStatusBadge status={course.status} />
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-brand-text-primary dark:text-slate-100 line-clamp-1">{course.title}</h3>
          </div>
          <p className="mt-1 text-xs text-brand-text-secondary dark:text-slate-400 line-clamp-2">{course.shortDescription}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <CategoryBadge name={categoryName} color={categoryColor} />
            <LevelBadge level={course.difficulty} />
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-brand-text-secondary dark:text-slate-400">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>
            <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{course.language}</span>
            <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" />{stats.moduleCount} modules</span>
          </div>
        </div>
      </Link>
      <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity" ref={menuRef}>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setMenuOpen(!menuOpen); }}
          className="rounded-lg bg-white/90 dark:bg-slate-900/90 p-1.5 shadow-sm hover:bg-white dark:hover:bg-slate-850 text-brand-text-secondary dark:text-slate-300"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div className="absolute left-0 top-full z-10 mt-1 w-40 rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 py-1 shadow-card">
            <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-brand-surface dark:hover:bg-slate-800 text-brand-text-primary dark:text-slate-300" onClick={() => onEdit(course)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
            <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-brand-surface dark:hover:bg-slate-800 text-brand-text-primary dark:text-slate-300" onClick={() => onDuplicate(course)}>
              <Copy className="h-3.5 w-3.5" /> Duplicate
            </button>
            <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => onDelete(course)}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function CourseRow({ course, index, categoryName, categoryColor = '#84117C', onEdit, onDelete, onDuplicate }) {
  const isPublished = course.status === 'published';
  const isActive = course.status !== 'archived';
  const isFeatured = course.isFeatured || course.status === 'published';

  return (
    <tr className="border-b border-brand-border transition-colors hover:bg-brand-surface/50">
      <td className="px-4 py-4 text-sm text-brand-text-secondary">{index}</td>
      <td className="px-4 py-4">
        <Link to={`/catalog/courses/${course.id}`} className="flex items-center gap-3">
          <img
            src={course.thumbnail}
            alt=""
            className="h-10 w-14 shrink-0 rounded-lg border border-brand-border bg-brand-surface object-cover"
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900 hover:text-accent-teal-dark">{course.title}</p>
            <p className="truncate text-xs text-brand-text-secondary">{course.slug}</p>
          </div>
        </Link>
      </td>
      <td className="px-4 py-4">
        <CategoryBadge name={categoryName} color={categoryColor} />
      </td>
      <td className="px-4 py-4">
        <LevelBadge level={course.difficulty} />
      </td>
      <td className="px-4 py-4 text-sm text-slate-700">{course.language || 'English'}</td>
      <td className="px-4 py-4 text-sm text-slate-700">{course.duration}</td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-1.5">
          <CourseStatusBadge status={isActive ? 'active' : 'inactive'} />
          <CourseStatusBadge status={isPublished ? 'published' : 'draft'} />
        </div>
      </td>
      <td className="px-4 py-4">
        <Star
          className={`h-4 w-4 ${isFeatured ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
        />
      </td>
      <td className="px-4 py-4">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(course)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border text-brand-primary hover:bg-brand-surface"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(course)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-orange-200 text-orange-500 hover:bg-orange-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
