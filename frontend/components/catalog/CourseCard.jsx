'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Copy, MoreHorizontal, Pencil, Trash2, Clock, Globe, BarChart3 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn, formatDate, getTechLogoUrl, countCourseStats } from '@/utils';
import { CourseStatusBadge } from '@/components/ui/Badge';
import Badge from '@/components/ui/Badge';

export default function CourseCard({ course, categoryName, onEdit, onDelete, onDuplicate }) {
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
      className="group relative overflow-hidden rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card hover:shadow-card-hover transition-all"
    >
      <Link href={`/catalog/courses/${course.id}`} className="block">
        <div className="relative h-36 bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-80"
            />
          ) : null}
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
            <Badge color="purple">{categoryName}</Badge>
            <Badge color="blue">{course.difficulty}</Badge>
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

export function CourseRow({ course, categoryName, onEdit, onDelete, onDuplicate }) {
  const stats = countCourseStats(course);
  return (
    <tr className="border-b border-brand-border dark:border-slate-800 hover:bg-brand-surface/50 dark:hover:bg-slate-850/40">
      <td className="px-4 py-3">
        <Link href={`/catalog/courses/${course.id}`} className="flex items-center gap-3">
          <img src={getTechLogoUrl(course.technology)} alt="" className="h-8 w-8 rounded-lg bg-brand-surface dark:bg-slate-950 p-1 border border-brand-border dark:border-slate-800" />
          <div>
            <p className="font-semibold text-brand-text-primary dark:text-slate-200 hover:text-brand-primary dark:hover:text-brand-secondary">{course.title}</p>
            <p className="text-xs text-brand-text-secondary dark:text-slate-400">{course.technology}</p>
          </div>
        </Link>
      </td>
      <td className="px-4 py-3 text-sm text-brand-text-primary dark:text-slate-300">{categoryName}</td>
      <td className="px-4 py-3 text-sm text-brand-text-primary dark:text-slate-300">{course.difficulty}</td>
      <td className="px-4 py-3 text-sm text-brand-text-primary dark:text-slate-300">{course.duration}</td>
      <td className="px-4 py-3"><CourseStatusBadge status={course.status} /></td>
      <td className="px-4 py-3 text-sm text-brand-text-secondary dark:text-slate-400">{stats.moduleCount} / {stats.contentCount}</td>
      <td className="px-4 py-3 text-sm text-brand-text-secondary dark:text-slate-400">{formatDate(course.updatedAt)}</td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          <button type="button" onClick={() => onEdit(course)} className="rounded p-1 hover:bg-brand-surface dark:hover:bg-slate-800 text-brand-text-secondary dark:text-slate-400"><Pencil className="h-4 w-4" /></button>
          <button type="button" onClick={() => onDuplicate(course)} className="rounded p-1 hover:bg-brand-surface dark:hover:bg-slate-800 text-brand-text-secondary dark:text-slate-400"><Copy className="h-4 w-4" /></button>
          <button type="button" onClick={() => onDelete(course)} className="rounded p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400"><Trash2 className="h-4 w-4" /></button>
        </div>
      </td>
    </tr>
  );
}
