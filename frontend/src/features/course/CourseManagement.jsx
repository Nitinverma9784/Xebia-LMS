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

function SelectDropdown({ value, options, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none cursor-pointer rounded-lg border bg-brand-background border-brand-border py-2.5 pl-3.5 pr-8 text-sm text-brand-text-primary focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-text-secondary" />
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

  const activeCourses   = baseCourses.filter((c) => c.status !== 'archived').length;
  const publishedCourses = baseCourses.filter((c) => c.status === 'published').length;

  const handleCreate = () => {
    if (!categories?.length) {
      showToast('Create a category first before adding a course.', 'error');
      return;
    }
    navigate('/admin/courses/new');
  };

  if (!hydrated) return null;

  return (
    <div className="flex min-h-screen flex-col bg-brand-surface text-brand-text-primary transition-colors">
      {/* Page header bar */}
      <div className="flex items-center justify-between px-8 py-4 bg-brand-background border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-bold text-brand-text-primary">
            {category ? `${category.name} — Courses` : 'All Courses'}
          </h1>
          <p className="mt-0.5 text-sm text-brand-text-secondary">
            {category ? `Manage courses under category ${category.name}` : 'Browse and manage all courses on the platform.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick stat pills */}
          <span
            className="rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{ color: '#6c1d5f', borderColor: '#6c1d5f40', backgroundColor: '#6c1d5f0d' }}
          >
            {baseCourses.length} Courses
          </span>
          <span
            className="rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{ color: '#01ac9f', borderColor: '#01ac9f40', backgroundColor: '#01ac9f0d' }}
          >
            {activeCourses} Active
          </span>
          <span
            className="rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{ color: '#ff6200', borderColor: '#ff620040', backgroundColor: '#ff62000d' }}
          >
            {publishedCourses} Published
          </span>
          <button
            type="button"
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            style={{ backgroundColor: '#01ac9f' }}
          >
            <Plus className="h-3.5 w-3.5" />
            Create Course
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 px-8 py-7">

        {/* Filters toolbar */}
        <div className="mb-6 flex items-center gap-3">
          {/* Search */}
          <div
            className="flex flex-1 items-center gap-2.5 rounded-lg border bg-brand-background border-brand-border px-4 py-2.5 text-sm"
            style={{ maxWidth: 420 }}
          >
            <Search className="h-[15px] w-[15px] shrink-0 text-brand-text-secondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search courses by title or slug..."
              className="w-full bg-transparent text-sm text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none"
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

          <div className="ml-auto flex items-center gap-2">
            <span className="whitespace-nowrap text-xs font-medium text-brand-text-secondary mr-2">
              {filtered.length} courses
            </span>
            <div className="flex items-center gap-1 rounded-lg border border-brand-border bg-brand-background p-1 select-none">
              <button
                type="button"
                onClick={() => setViewMode('card')}
                className={cn(
                  "p-1.5 rounded-md hover:bg-brand-surface transition-colors cursor-pointer",
                  viewMode === 'card' ? "bg-brand-primary/10 text-brand-primary font-bold" : "text-brand-text-secondary"
                )}
                title="Card View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5 rounded-md hover:bg-brand-surface transition-colors cursor-pointer",
                  viewMode === 'list' ? "bg-brand-primary/10 text-brand-primary font-bold" : "text-brand-text-secondary"
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
          <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-background shadow-sm">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-brand-border bg-brand-surface/50 text-[11px] font-bold uppercase tracking-wider text-brand-text-secondary select-none">
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
              <tbody className="divide-y divide-brand-border bg-brand-background">
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
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
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
