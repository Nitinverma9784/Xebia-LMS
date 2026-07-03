'use client';

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronDown, Grid, List } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/useToast';
import { paginate, cn } from '@/utils';
import { ConfirmationDialog } from '@/components/ui/Modal';
import CourseCard, { CourseRow } from '@/components/catalog/CourseCard';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import { DEFAULT_PAGE_SIZE, DIFFICULTY_LEVELS, COURSE_STATUSES } from '@/constants';

import StatCard from '@/components/ui/StatCard';
import { BookOpen, CheckCircle, Clock, Tag } from 'lucide-react';

function SelectDropdown({ value, options, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 appearance-none cursor-pointer rounded-xl border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] py-2 pl-4 pr-9 text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="dark:bg-[#1E293B] dark:text-[#F8FAFC]">{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-[#CBD5E1]" />
    </div>
  );
}

export default function CourseManagement({ categoryId = null }) {
  const { categories, courses, getCategory, deleteCourse, duplicateCourse, hydrated } = useCatalog();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const category = categoryId ? getCategory(categoryId) : null;

  const [search, setSearch]                   = useState('');
  const [statusFilter, setStatusFilter]       = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter]   = useState('all');
  const [sortBy, setSortBy]                   = useState('updated');
  const [page, setPage]                       = useState(1);
  const [pageSize, setPageSize]               = useState(DEFAULT_PAGE_SIZE);
  const [deleteTarget, setDeleteTarget]       = useState(null);
  const [viewMode, setViewMode]               = useState('card');

  const baseCourses = useMemo(() => {
    let list = courses.filter((c) => !c.deletedAt);
    if (categoryId) list = list.filter((c) => c.categoryId === Number(categoryId) || c.categoryId === categoryId);
    return list;
  }, [courses, categoryId]);

  const filtered = useMemo(() => {
    let list = baseCourses.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch   = !search || c.title.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q);
      const matchStatus   = statusFilter === 'all'     || c.status === statusFilter;
      const matchDiff     = difficultyFilter === 'all' || c.difficulty === difficultyFilter;
      const matchCat      = categoryFilter === 'all'   || String(c.categoryId) === categoryFilter;
      return matchSearch && matchStatus && matchDiff && matchCat;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === 'title')      return a.title.localeCompare(b.title);
      if (sortBy === 'difficulty') return a.difficulty.localeCompare(b.difficulty);
      if (sortBy === 'status')     return a.status.localeCompare(b.status);
      if (sortBy === 'created')    return new Date(b.createdAt) - new Date(a.createdAt);
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    return list;
  }, [baseCourses, search, statusFilter, difficultyFilter, categoryFilter, sortBy]);

  const { data, total, totalPages } = paginate(filtered, page, pageSize);

  const getCategoryName  = (id) => categories.find((c) => c.id === id)?.name  || '—';
  const getCategoryColor = (id) => categories.find((c) => c.id === id)?.color || '#6c1d5f';

  const activeCourses    = baseCourses.filter((c) => c.status !== 'archived').length;
  const publishedCourses = baseCourses.filter((c) => c.status === 'published').length;
  const draftCourses     = baseCourses.filter((c) => c.status === 'draft').length;

  const handleCreate = () => {
    if (!categories?.length) {
      showToast('Create a category first before adding a course.', 'error');
      return;
    }
    navigate('/admin/courses/new');
  };

  if (!hydrated) return null;

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-800 dark:text-[#F8FAFC] transition-colors duration-300">
      {/* Page header bar */}
      <div className="flex items-center justify-between px-8 py-5 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-[#334155]">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight">
            {category ? `${category.name} — Courses` : 'All Courses'}
          </h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">
            {category ? `Manage learning modules and course content under ${category.name}` : 'Browse, filter, and manage all learning courses on the platform.'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:opacity-90 cursor-pointer"
          style={{ backgroundColor: '#10B5A5' }}
        >
          <Plus className="h-4 w-4" />
          Create Course
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 px-8 py-7">

        {/* Top Summary Stats Cards */}
        <div className="mb-8 grid grid-cols-2 gap-5 lg:gap-6 lg:grid-cols-4">
          <StatCard icon={BookOpen}     label="Total Courses"   value={baseCourses.length}  color="purple" index={0} />
          <StatCard icon={CheckCircle}  label="Published"       value={publishedCourses}    color="teal"   index={1} />
          <StatCard icon={Clock}        label="Draft"           value={draftCourses}        color="orange" index={2} />
          <StatCard icon={Tag}          label="Categories"      value={categories.filter(c => !c.deletedAt).length} color="plum" index={3} />
        </div>

        {/* Filters toolbar */}
        <div className="mb-6 flex flex-wrap items-center gap-3.5">
          {/* Search */}
          <div
            className="flex h-11 flex-1 items-center gap-2.5 rounded-xl border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] px-3.5 max-w-xs transition-all focus-within:border-[#7C3AED]"
          >
            <Search className="h-4 w-4 shrink-0 text-slate-400 dark:text-[#CBD5E1]" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search courses by title or slug..."
              className="w-full bg-transparent text-xs font-medium text-slate-800 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          {/* Level filter */}
          <SelectDropdown
            value={difficultyFilter}
            onChange={(v) => { setDifficultyFilter(v); setPage(1); }}
            options={[{ value: 'all', label: 'All Levels' }, ...DIFFICULTY_LEVELS.map((d) => ({ value: d, label: d }))]}
          />

          {/* Category filter (only when not scoped) */}
          {!categoryId && (
            <SelectDropdown
              value={categoryFilter}
              onChange={(v) => { setCategoryFilter(v); setPage(1); }}
              options={[
                { value: 'all', label: 'All Categories' },
                ...categories.filter((c) => !c.deletedAt).map((c) => ({ value: String(c.id), label: c.name })),
              ]}
            />
          )}

          {/* Status filter */}
          <SelectDropdown
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            options={[
              { value: 'all', label: 'All Status' },
              ...COURSE_STATUSES.map((s) => ({ value: s.value, label: s.label })),
            ]}
          />

          <div className="ml-auto flex items-center gap-3">
            <span className="whitespace-nowrap text-xs font-semibold text-slate-500 dark:text-[#CBD5E1]">
              {filtered.length} courses
            </span>
            <div className="flex h-11 items-center gap-1 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-1 select-none">
              <button
                type="button"
                onClick={() => setViewMode('card')}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-colors cursor-pointer",
                  viewMode === 'card' ? "bg-[#7C3AED]/15 text-[#7C3AED] dark:text-purple-300 font-bold" : "text-slate-400 hover:text-slate-600"
                )}
                title="Card View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-colors cursor-pointer",
                  viewMode === 'list' ? "bg-[#7C3AED]/15 text-[#7C3AED] dark:text-purple-300 font-bold" : "text-slate-400 hover:text-slate-600"
                )}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Course Content */}
        {data.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="No courses found"
            description="Create a course to get started."
            actionLabel="Create Course"
            onAction={handleCreate}
          />
        ) : viewMode === 'list' ? (
          <div className="overflow-x-auto rounded-[20px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] shadow-sm">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#111827] text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#CBD5E1] select-none">
                  <th className="px-4 py-3.5">#</th>
                  <th className="px-4 py-3.5">Course Name / Slug</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Difficulty</th>
                  <th className="px-4 py-3.5">Curriculum Stats</th>
                  <th className="px-4 py-3.5">Language / Duration</th>
                  <th className="px-4 py-3.5">Last Updated</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Featured</th>
                  <th className="px-4 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#334155] bg-white dark:bg-[#1E293B]">
                {data.map((course, idx) => (
                  <CourseRow
                    key={course.id}
                    course={course}
                    index={(page - 1) * pageSize + idx + 1}
                    categoryName={getCategoryName(course.categoryId)}
                    categoryColor={getCategoryColor(course.categoryId)}
                    onEdit={(c)      => navigate(`/admin/courses/${c.id}/edit`)}
                    onDelete={setDeleteTarget}
                    onDuplicate={(c) => duplicateCourse(c.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {data.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                categoryName={getCategoryName(course.categoryId)}
                categoryColor={getCategoryColor(course.categoryId)}
                onEdit={(c)      => navigate(`/admin/courses/${c.id}/edit`)}
                onDelete={setDeleteTarget}
                onDuplicate={(c) => duplicateCourse(c.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            itemLabel="courses"
          />
        </div>
      </div>

      {/* Delete confirmation */}
      <ConfirmationDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { deleteCourse(deleteTarget.id); setDeleteTarget(null); }}
        title="Delete Course"
        message="Archive this course? You can restore it later."
      />
    </div>
  );
}
