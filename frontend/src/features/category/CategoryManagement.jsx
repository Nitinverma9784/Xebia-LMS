'use client';

import { useState, useMemo } from 'react';
import { Plus, LayoutGrid, List, Tag, CheckCircle, BookOpen, XCircle, Search, ChevronDown } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { paginate } from '@/utils';
import { ConfirmationDialog } from '@/components/ui/Modal';
import CategoryCard, { CategoryRow } from '@/components/catalog/CategoryCard';
import StatCard from '@/components/ui/StatCard';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import { useNavigate } from 'react-router-dom';

const SORT_OPTIONS = [
  { value: 'name',    label: 'Sort: Name A–Z' },
  { value: 'courses', label: 'Most Courses' },
  { value: 'created', label: 'Created Date' },
];

const STATUS_OPTIONS = [
  { value: 'all',      label: 'All Status' },
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'deleted',  label: 'Deleted' },
];

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

export default function CategoryManagement() {
  const { categories, courses, deleteCategory, restoreCategory, hydrated } = useCatalog();
  const navigate = useNavigate();

  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy]           = useState('name');
  const [view, setView]               = useState('grid');
  const [page, setPage]               = useState(1);
  const [pageSize, setPageSize]       = useState(DEFAULT_PAGE_SIZE);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const getCourseCount = (catId) =>
    courses.filter((c) => c.categoryId === catId && !c.deletedAt).length;

  const liveCategories = categories.filter((c) => !c.deletedAt);
  const stats = {
    total: liveCategories.length,
    active: liveCategories.filter((c) => c.status === 'active').length,
    inactive: liveCategories.filter((c) => c.status === 'inactive').length,
    totalCourses: courses.filter((c) => !c.deletedAt).length,
  };

  const filtered = useMemo(() => {
    let list = categories.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch = !search || c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      if (statusFilter === 'deleted') return !!c.deletedAt;
      return matchSearch && matchStatus && !c.deletedAt;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === 'courses') return getCourseCount(b.id) - getCourseCount(a.id);
      if (sortBy === 'status')  return a.status.localeCompare(b.status);
      if (sortBy === 'created') return new Date(b.createdAt) - new Date(a.createdAt);
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [categories, search, statusFilter, sortBy, courses]);

  const { data, total, totalPages } = paginate(filtered, page, pageSize);

  if (!hydrated) return null;

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-800 dark:text-[#F8FAFC] transition-colors duration-300">
      {/* Page header bar */}
      <div
        className="flex items-center justify-between px-8 py-5 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-[#334155]"
      >
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight">Categories</h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">Manage all learning categories and course structures across the organization</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/categories/new')}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:opacity-90 cursor-pointer"
          style={{ backgroundColor: '#10B5A5' }}
        >
          <Plus className="h-4 w-4" />
          Create Category
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 px-8 py-7">
        {/* Stats grid */}
        <div className="mb-8 grid grid-cols-2 gap-5 lg:gap-6 lg:grid-cols-4">
          <StatCard icon={Tag}          label="Total Categories" value={stats.total}        color="purple" index={0} />
          <StatCard icon={CheckCircle}  label="Active"           value={stats.active}       color="teal"   index={1} />
          <StatCard icon={XCircle}      label="Inactive"         value={stats.inactive}     color="orange" index={2} />
          <StatCard icon={BookOpen}     label="Total Courses"    value={stats.totalCourses} color="plum"   index={3} />
        </div>

        {/* Filters toolbar */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          {/* Search */}
          <div
            className="flex h-11 flex-1 items-center gap-2.5 rounded-xl border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] px-3.5 max-w-xs transition-all focus-within:border-[#7C3AED]"
          >
            <Search className="h-4 w-4 shrink-0 text-slate-400 dark:text-[#CBD5E1]" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search categories..."
              className="w-full bg-transparent text-xs font-medium text-slate-800 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          {/* Status filter */}
          <SelectDropdown value={statusFilter} options={STATUS_OPTIONS} onChange={(v) => { setStatusFilter(v); setPage(1); }} />

          {/* Sort */}
          <SelectDropdown value={sortBy} options={SORT_OPTIONS} onChange={(v) => { setSortBy(v); setPage(1); }} />

          {/* View toggle */}
          <div
            className="ml-auto flex h-11 items-center gap-1 rounded-xl border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] p-1"
          >
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors cursor-pointer ${view === 'grid' ? 'bg-[#7C3AED]/15 text-[#7C3AED] dark:text-purple-300' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('table')}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors cursor-pointer ${view === 'table' ? 'bg-[#7C3AED]/15 text-[#7C3AED] dark:text-purple-300' : 'text-slate-400 hover:text-slate-600'}`}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Result count */}
          <span className="whitespace-nowrap text-xs font-semibold text-slate-500 dark:text-[#CBD5E1]">
            {filtered.length} categories
          </span>
        </div>

        {/* Grid / Table */}
        {data.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="No categories found"
            description="Create your first category to organize courses."
            actionLabel="Create Category"
            onAction={() => navigate('/admin/categories/new')}
          />
        ) : view === 'grid' ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                courseCount={getCourseCount(cat.id)}
                onEdit={(c)   => navigate(`/admin/categories/${c.id}/edit`)}
                onDelete={setDeleteTarget}
                onView={(c)   => navigate(`/admin/categories/${c.id}`)}
              />
            ))}
          </div>
        ) : (
          <div
            className="overflow-x-auto rounded-[20px] border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] shadow-sm"
          >
            <table className="w-full text-xs">
              <thead className="border-b border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#111827]">
                <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#CBD5E1]">
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Courses</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    category={cat}
                    courseCount={getCourseCount(cat.id)}
                    onEdit={(c)   => navigate(`/admin/categories/${c.id}/edit`)}
                    onDelete={setDeleteTarget}
                    onView={(c)   => navigate(`/admin/categories/${c.id}`)}
                  />
                ))}
              </tbody>
            </table>
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
            itemLabel="categories"
          />
        </div>
      </div>

      {/* Delete confirmation */}
      <ConfirmationDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget?.deletedAt) restoreCategory(deleteTarget.id);
          else deleteCategory(deleteTarget.id);
          setDeleteTarget(null);
        }}
        title={deleteTarget?.deletedAt ? 'Restore Category' : 'Delete Category'}
        message={
          deleteTarget?.deletedAt
            ? 'Restore this category?'
            : 'This will delete the category. Courses will remain.'
        }
        confirmLabel={deleteTarget?.deletedAt ? 'Restore' : 'Delete'}
        variant={deleteTarget?.deletedAt ? 'primary' : 'danger'}
      />
    </div>
  );
}
