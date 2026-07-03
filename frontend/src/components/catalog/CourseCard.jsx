'use client';

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Globe, Clock, ChevronRight, Star, MoreVertical, User, Calendar } from 'lucide-react';
import { countCourseStats, formatDate } from '@/utils';

function StatusPill({ children, color }) {
  const colors = {
    active:    { bg: '#01ac9f18', text: '#01ac9f' },
    inactive:  { bg: '#f1f1f7',   text: '#6b7280' },
    published: { bg: '#6c1d5f18', text: '#6c1d5f' },
    draft:     { bg: '#f1f1f7',   text: '#6b7280' },
    archived:  { bg: '#ff620015', text: '#ff6200' },
  };
  const s = colors[color] || colors.draft;
  return (
    <span
      className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold select-none"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ backgroundColor: s.text }} />
      {children}
    </span>
  );
}

export default function CourseCard({ course, categoryName, categoryColor = '#6c1d5f', onEdit, onDelete, onDuplicate, isCurriculumView = false }) {
  const navigate = useNavigate();
  const stats = countCourseStats(course);
  const isPublished = course.status === 'published';
  const isActive = course.status !== 'archived';

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const targetUrl = `/admin/curriculum/${course.id}`;

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(targetUrl);
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25 }}
      onClick={handleCardClick}
      className="group flex flex-col justify-between overflow-hidden rounded-[20px] border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] h-full min-h-[390px] shadow-sm hover:shadow-xl hover:shadow-purple-900/10 transition-all duration-300 cursor-pointer relative select-none"
    >
      {/* Thumbnail */}
      <div className="relative block overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800 shrink-0">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 aspect-video"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
            No Thumbnail
          </div>
        )}
        {/* Featured star */}
        {(course.isFeatured || isPublished) && (
          <div
            className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full text-xs shadow-md bg-amber-400 text-amber-950 font-bold"
          >
            ⭐
          </div>
        )}
        {/* Tech icon bottom left */}
        <div
          className="absolute bottom-3 left-3 flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-sm shadow-sm overflow-hidden"
        >
          {(() => {
            const logoVal = course.logo || course.icon || '';
            if (logoVal) {
              if (logoVal.startsWith('http') || logoVal.startsWith('/') || logoVal.startsWith('data:') || logoVal.startsWith('blob:')) {
                const srcUrl = (logoVal.startsWith('/') && !logoVal.startsWith('/uploads/'))
                  ? `https://res.cloudinary.com${logoVal}`
                  : logoVal;
                return <img src={srcUrl} alt="icon" className="h-full w-full object-cover" />;
              }
            }
            return <span>{logoVal || '💻'}</span>;
          })()}
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col justify-between gap-3 p-5">
        <div className="space-y-2.5">
          {/* Category + level tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide"
              style={{ backgroundColor: `${categoryColor}18`, color: categoryColor }}
            >
              {categoryName}
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white tracking-wide"
              style={{ backgroundColor: categoryColor }}
            >
              {course.difficulty || 'Intermediate'}
            </span>
          </div>

          {/* Title */}
          <div>
            <h3 className="text-sm font-extrabold leading-snug text-slate-900 dark:text-[#F8FAFC] tracking-tight line-clamp-2 min-h-[40px]">
              {course.title}
            </h3>
          </div>

          {/* Instructor */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#CBD5E1]">
            <User className="h-3.5 w-3.5 text-purple-500 shrink-0" />
            <span>Instructor: <strong className="text-slate-800 dark:text-[#F8FAFC] font-semibold">{course.author || 'Xebia Academy'}</strong></span>
          </div>

          <div className="border-t border-slate-100 dark:border-[#334155] pt-2" />

          {/* Meta stats & last updated */}
          <div className="flex flex-col gap-1 text-xs text-slate-500 dark:text-[#CBD5E1]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3 text-slate-400" />
                {course.language || 'English'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" />
                {course.duration || '—'}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-bold text-purple-600 dark:text-purple-400">
                📦 {stats.moduleCount} Modules
              </span>
              <span className="font-bold text-teal-600 dark:text-teal-400">
                📑 {stats.submoduleCount} Lessons
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-medium text-slate-400 dark:text-[#CBD5E1]">
              <Calendar className="h-3 w-3" />
              <span>Updated: {formatDate(course.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Status pills + dropdown menu */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-[#334155] pt-3 mt-2">
          <div className="flex flex-wrap gap-1.5">
            <StatusPill color={isActive ? 'active' : 'inactive'}>
              {isActive ? 'Active' : 'Inactive'}
            </StatusPill>
            <StatusPill color={isPublished ? 'published' : 'draft'}>
              {isPublished ? 'Published' : 'Draft'}
            </StatusPill>
          </div>

          {/* Three-dot Action Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu); }}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#0B1120] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Course Actions"
            >
              <MoreVertical className="h-4 w-4 text-slate-600 dark:text-[#CBD5E1]" />
            </button>
            {showMenu && (
              <div className="absolute right-0 bottom-full mb-1.5 z-30 w-48 rounded-2xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-1.5 shadow-xl select-none">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); onEdit(course); }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-[#F8FAFC] hover:bg-purple-50 dark:hover:bg-purple-950/50 cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" /> Edit Settings
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); navigate(targetUrl); }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-[#F8FAFC] hover:bg-purple-50 dark:hover:bg-purple-950/50 cursor-pointer"
                >
                  📖 Open Builder
                </button>
                {onDuplicate && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); onDuplicate(course); }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-[#F8FAFC] hover:bg-purple-50 dark:hover:bg-purple-950/50 cursor-pointer"
                  >
                    👥 Duplicate Course
                  </button>
                )}
                <div className="h-px bg-slate-100 dark:bg-[#334155] my-1" />
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); onDelete(course); }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete Course
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function CourseRow({ course, index, categoryName, categoryColor = '#6c1d5f', onEdit, onDelete, onDuplicate }) {
  const navigate = useNavigate();
  const stats = countCourseStats(course);
  const isPublished = course.status === 'published';
  const isActive    = course.status !== 'archived';
  const isFeatured  = course.isFeatured || isPublished;

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const targetUrl = `/admin/curriculum/${course.id}`;

  return (
    <tr className="border-b border-brand-border transition-colors hover:bg-brand-surface/40">
      <td className="px-4 py-4 text-sm text-brand-text-secondary">{index}</td>
      <td className="px-4 py-4">
        <div onClick={() => navigate(targetUrl)} className="flex items-center gap-3 cursor-pointer group">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt=""
              className="h-10 w-14 shrink-0 rounded-lg border border-brand-border bg-brand-surface object-cover"
            />
          ) : (
            <div className="h-10 w-14 shrink-0 rounded-lg border border-brand-border bg-brand-surface flex items-center justify-center text-[9px] text-brand-text-secondary font-medium">
              No Image
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-brand-text-primary group-hover:underline">{course.title}</p>
            <p className="truncate text-[11px] text-brand-text-secondary/80 flex items-center gap-1 mt-0.5">
              <User className="h-3 w-3 shrink-0" />
              <span>By {course.author || 'Xebia Academy'}</span>
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <span
          className="rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ backgroundColor: `${categoryColor}18`, color: categoryColor }}
        >
          {categoryName}
        </span>
      </td>
      <td className="px-4 py-4">
        <span
          className="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: categoryColor }}
        >
          {course.difficulty || 'Intermediate'}
        </span>
      </td>
      <td className="px-4 py-4 text-sm text-brand-text-secondary">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-brand-primary">{stats.moduleCount} Modules</span>
          <span className="text-accent-teal text-xs font-medium">{stats.submoduleCount} Submodules</span>
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-brand-text-secondary">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs">{course.language || 'English'}</span>
          <span className="text-[11px] text-brand-text-secondary/70">{course.duration || '—'}</span>
        </div>
      </td>
      <td className="px-4 py-4 text-xs text-brand-text-secondary">
        <span className="flex items-center gap-1 select-none">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(course.updatedAt)}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-1.5">
          <StatusPill color={isActive ? 'active' : 'inactive'}>{isActive ? 'Active' : 'Inactive'}</StatusPill>
          <StatusPill color={isPublished ? 'published' : 'draft'}>{isPublished ? 'Published' : 'Draft'}</StatusPill>
        </div>
      </td>
      <td className="px-4 py-4">
        <Star className={`h-4 w-4 ${isFeatured ? 'fill-amber-400 text-amber-400' : 'text-brand-border'}`} />
      </td>
      <td className="px-4 py-4 relative animate-fade-in">
        <div ref={menuRef} className="inline-block text-left">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-brand-surface dark:hover:bg-slate-800 transition-colors cursor-pointer border border-brand-border/40"
            title="Actions"
          >
            <MoreVertical className="h-4 w-4 text-brand-text-secondary" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 z-30 w-44 rounded-lg border border-brand-border bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit(course); }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-brand-text-primary hover:bg-brand-surface dark:hover:bg-slate-800 cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5 text-brand-primary" /> Edit Settings
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); navigate(targetUrl); }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-brand-text-primary hover:bg-brand-surface dark:hover:bg-slate-800 cursor-pointer"
              >
                📖 Open Course
              </button>
              {onDuplicate && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDuplicate(course); }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-brand-text-primary hover:bg-brand-surface dark:hover:bg-slate-800 cursor-pointer"
                >
                  👥 Duplicate Course
                </button>
              )}
              <div className="h-px bg-brand-border dark:bg-slate-800 my-1" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(course); }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete / Archive
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
