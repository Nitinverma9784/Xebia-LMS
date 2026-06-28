'use client';

import { useState, useMemo } from 'react';
import { Plus, LayoutGrid, List, FolderTree, CheckCircle2, BookOpen, XCircle } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { paginate } from '@/utils';
import PageHeader from '@/components/layout/PageHeader';
import SearchBar from '@/components/ui/SearchBar';
import FilterDropdown from '@/components/ui/FilterDropdown';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import StatCard from '@/components/ui/StatCard';
import { ConfirmationDialog } from '@/components/ui/Modal';
import CategoryCard, { CategoryRow } from '@/components/catalog/CategoryCard';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import { useNavigate } from 'react-router-dom';

export default function CategoryManagement() {
  const { categories, courses, deleteCategory, restoreCategory, hydrated } = useCatalog();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const getCourseCount = (catId) => courses.filter((c) => c.categoryId === catId && !c.deletedAt).length;

  const liveCategories = categories.filter((c) => !c.deletedAt);
  const stats = {
    total: liveCategories.length,
    active: liveCategories.filter((c) => c.status === 'active').length,
    inactive: liveCategories.filter((c) => c.status === 'inactive').length,
    totalCourses: courses.filter((c) => !c.deletedAt).length,
  };

  const filtered = useMemo(() => {
    let list = categories.filter((c) => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const showDeleted = statusFilter === 'deleted';
      if (showDeleted) return !!c.deletedAt;
      return matchSearch && matchStatus && !c.deletedAt;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'courses') return getCourseCount(b.id) - getCourseCount(a.id);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      if (sortBy === 'created') return new Date(b.createdAt) - new Date(a.createdAt);
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [categories, search, statusFilter, sortBy, courses]);

  const { data, total, totalPages } = paginate(filtered, page, pageSize);

  if (!hydrated) return null;

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Categories"
        subtitle="Manage all learning categories on the platform"
        action={
          <Button onClick={() => navigate('/catalog/categories/new')}>
            <Plus className="h-4 w-4" /> Create Category
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderTree} label="Total Categories" value={stats.total} color="purple" index={0} />
        <StatCard icon={CheckCircle2} label="Active" value={stats.active} color="teal" index={1} />
        <StatCard icon={XCircle} label="Inactive" value={stats.inactive} color="orange" index={2} />
        <StatCard icon={BookOpen} label="Total Courses" value={stats.totalCourses} color="purple" index={3} />
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search categories..." className="flex-1" />
        <FilterDropdown
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
        <FilterDropdown
          label="Sort"
          value={sortBy}
          onChange={setSortBy}
          options={[
            { value: 'name', label: 'Sort: Name A-Z' },
            { value: 'courses', label: 'Most Courses' },
            { value: 'created', label: 'Created Date' },
          ]}
        />
        <div className="flex items-center gap-3 lg:ml-auto">
          <div className="flex rounded-xl border border-brand-border bg-white p-0.5">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`rounded-lg p-2 ${view === 'grid' ? 'bg-accent-teal text-white' : 'text-brand-text-secondary'}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('table')}
              className={`rounded-lg p-2 ${view === 'table' ? 'bg-accent-teal text-white' : 'text-brand-text-secondary'}`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <span className="text-sm text-brand-text-secondary whitespace-nowrap">{filtered.length} categories</span>
        </div>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No categories found"
          description="Create your first category to organize courses."
          actionLabel="Create Category"
          onAction={() => navigate('/catalog/categories/new')}
        />
      ) : view === 'grid' ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              courseCount={getCourseCount(cat.id)}
              onEdit={(c) => navigate(`/catalog/categories/${c.id}/edit`)}
              onDelete={setDeleteTarget}
              onView={(c) => navigate(`/catalog/categories/${c.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-brand-border bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="border-b border-brand-border bg-brand-surface">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">
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
                  onEdit={(c) => navigate(`/catalog/categories/${c.id}/edit`)}
                  onDelete={setDeleteTarget}
                  onView={(c) => navigate(`/catalog/categories/${c.id}`)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

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

      <ConfirmationDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget?.deletedAt) restoreCategory(deleteTarget.id);
          else deleteCategory(deleteTarget.id);
          setDeleteTarget(null);
        }}
        title={deleteTarget?.deletedAt ? 'Restore Category' : 'Delete Category'}
        message={deleteTarget?.deletedAt ? 'Restore this category?' : 'This will delete the category. Courses will remain.'}
        confirmLabel={deleteTarget?.deletedAt ? 'Restore' : 'Delete'}
        variant={deleteTarget?.deletedAt ? 'primary' : 'danger'}
      />
    </div>
  );
}
