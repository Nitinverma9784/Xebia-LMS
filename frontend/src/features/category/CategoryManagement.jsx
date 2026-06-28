'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, LayoutGrid, List, FolderTree, CheckCircle2, BookOpen, Layers } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { paginate } from '@/utils';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Header from '@/components/layout/Header';
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
  }, [categories, search, statusFilter, sortBy]);

  const { data, total, totalPages } = paginate(filtered, page, pageSize);

  const handleView = (cat) => navigate(`/catalog/categories/${cat.id}`);
  const handleEdit = (cat) => navigate(`/catalog/categories/${cat.id}/edit`);

  if (!hydrated) return null;

  return (
    <div>
      <Header title="Category Management" subtitle="Organize courses into categories" />
      <div className="p-4 lg:p-6 space-y-6">
        <Breadcrumb items={[]} />

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-primary dark:text-slate-100">Categories</h2>
            <p className="text-sm text-brand-text-secondary dark:text-slate-400">{filtered.length} categories</p>
          </div>
          <Button onClick={() => navigate('/catalog/categories/new')}><Plus className="h-4 w-4" /> Create Category</Button>
        </motion.div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard icon={FolderTree} label="Total Categories" value={stats.total} color="teal" index={0} />
          <StatCard icon={CheckCircle2} label="Active" value={stats.active} color="orange" index={1} />
          <StatCard icon={Layers} label="Inactive" value={stats.inactive} color="purple" index={2} />
          <StatCard icon={BookOpen} label="Total Courses" value={stats.totalCourses} color="pink" index={3} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar value={search} onChange={setSearch} placeholder="Search categories..." className="flex-1" />
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'deleted', label: 'Deleted' },
            ]}
          />
          <FilterDropdown
            label="Sort"
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'name', label: 'Name A-Z' },
              { value: 'courses', label: 'Most Courses' },
              { value: 'status', label: 'Status' },
              { value: 'created', label: 'Created Date' },
            ]}
          />
          <div className="flex rounded-full border border-brand-border dark:border-slate-800 p-0.5 bg-white dark:bg-slate-900">
            <button type="button" onClick={() => setView('grid')} className={`p-2 rounded-full ${view === 'grid' ? 'bg-accent-teal text-white' : 'text-brand-text-secondary dark:text-slate-400'}`} aria-label="Grid view"><LayoutGrid className="h-4 w-4" /></button>
            <button type="button" onClick={() => setView('table')} className={`p-2 rounded-full ${view === 'table' ? 'bg-accent-teal text-white' : 'text-brand-text-secondary dark:text-slate-400'}`} aria-label="Table view"><List className="h-4 w-4" /></button>
          </div>
        </div>

        {data.length === 0 ? (
          <EmptyState icon={FolderTree} title="No categories found" description="Create your first category to organize courses." actionLabel="Create Category" onAction={() => navigate('/catalog/categories/new')} />
        ) : view === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((cat) => (
              <CategoryCard key={cat.id} category={cat} courseCount={getCourseCount(cat.id)} onEdit={handleEdit} onDelete={setDeleteTarget} onView={handleView} />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
            <table className="w-full text-sm">
              <thead className="bg-brand-surface dark:bg-slate-950 border-b border-brand-border dark:border-slate-800">
                <tr className="text-brand-text-primary dark:text-slate-200 select-none">
                  <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-accent-teal-dark" onClick={() => setSortBy(sortBy === 'name' ? 'created' : 'name')}>
                    Name {sortBy === 'name' ? '▲' : ''}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Description</th>
                  <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-accent-teal-dark" onClick={() => setSortBy(sortBy === 'courses' ? 'name' : 'courses')}>
                    Courses {sortBy === 'courses' ? '▼' : ''}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-accent-teal-dark" onClick={() => setSortBy(sortBy === 'status' ? 'name' : 'status')}>
                    Status {sortBy === 'status' ? '▲' : ''}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-accent-teal-dark" onClick={() => setSortBy(sortBy === 'created' ? 'name' : 'created')}>
                    Created {sortBy === 'created' ? '▼' : ''}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((cat) => (
                  <CategoryRow key={cat.id} category={cat} courseCount={getCourseCount(cat.id)} onEdit={handleEdit} onDelete={setDeleteTarget} onView={handleView} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
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
        message={deleteTarget?.deletedAt ? 'Restore this category?' : 'This will soft-delete the category. Courses will remain.'}
        confirmLabel={deleteTarget?.deletedAt ? 'Restore' : 'Delete'}
        variant={deleteTarget?.deletedAt ? 'primary' : 'danger'}
      />
    </div>
  );
}
