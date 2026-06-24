'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, LayoutGrid, List, FolderTree } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/useToast';
import { paginate } from '@/utils';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Header from '@/components/layout/Header';
import SearchBar from '@/components/ui/SearchBar';
import FilterDropdown from '@/components/ui/FilterDropdown';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Select from '@/components/ui/Select';
import { ConfirmationDialog } from '@/components/ui/Modal';
import CategoryCard, { CategoryRow } from '@/components/catalog/CategoryCard';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import { useRouter } from 'next/navigation';

export default function CategoryManagement() {
  const { categories, courses, createCategory, updateCategory, deleteCategory, loading } = useCatalog();
  const { showToast } = useToast();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [view, setView] = useState('table');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', icon: '', description: '', color: '', isActive: true });
  const [errors, setErrors] = useState({});

  const getCourseCount = (catId) => courses.filter((c) => c.categoryId === catId).length;

  const filtered = useMemo(() => {
    let list = categories.filter((c) => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && c.isActive) || 
        (statusFilter === 'inactive' && !c.isActive);
      return matchSearch && matchStatus;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'courses') return getCourseCount(b.id) - getCourseCount(a.id);
      if (sortBy === 'status') return (a.isActive === b.isActive) ? 0 : a.isActive ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [categories, search, statusFilter, sortBy]);

  const { data, total, totalPages } = paginate(filtered, page, pageSize);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (form.name.length > 100) e.name = 'Max 100 characters';
    if (form.icon && form.icon.length > 1000) e.icon = 'Max 1000 characters';
    if (form.color && form.color.length > 20) e.color = 'Max 20 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCreate = () => {
    setForm({ name: '', icon: '', description: '', color: '', isActive: true });
    setErrors({});
    setModal('create');
  };

  const openEdit = (cat) => {
    setForm({ name: cat.name, icon: cat.icon || '', description: cat.description || '', color: cat.color || '', isActive: cat.isActive });
    setErrors({});
    setModal({ type: 'edit', id: cat.id });
  };

  const handleSave = (continueEditing = false) => {
    if (!validate()) return;
    if (modal === 'create') {
      createCategory(form);
      showToast('Category created successfully');
      if (!continueEditing) setModal(null);
      else setForm({ name: '', icon: '', description: '', color: '', isActive: true });
    } else if (modal?.type === 'edit') {
      updateCategory(modal.id, form);
      showToast('Category updated');
      setModal(null);
    }
  };

  const handleView = (cat) => router.push(`/catalog/categories/${cat.id}`);

  if (loading) return null;

  return (
    <div>
      <Header title="Category Management" subtitle="Organize courses into categories" />
      <div className="p-4 lg:p-6 space-y-6">
        <Breadcrumb items={[]} />

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-text-primary dark:text-slate-100">Categories</h2>
            <p className="text-sm text-brand-text-secondary dark:text-slate-400">{filtered.length} categories</p>
          </div>
          <Button onClick={openCreate}><Plus className="h-4 w-4" /> Create Category</Button>
        </motion.div>

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
            ]}
          />
          <div className="flex rounded-xl border border-brand-border dark:border-slate-800 p-0.5 bg-white dark:bg-slate-900">
            <button type="button" onClick={() => setView('table')} className={`p-2 rounded-lg ${view === 'table' ? 'bg-brand-primary text-white' : 'text-brand-text-secondary dark:text-slate-400'}`} aria-label="Table view"><List className="h-4 w-4" /></button>
            <button type="button" onClick={() => setView('grid')} className={`p-2 rounded-lg ${view === 'grid' ? 'bg-brand-primary text-white' : 'text-brand-text-secondary dark:text-slate-400'}`} aria-label="Grid view"><LayoutGrid className="h-4 w-4" /></button>
          </div>
        </div>

        {data.length === 0 ? (
          <EmptyState icon={FolderTree} title="No categories found" description="Create your first category to organize courses." actionLabel="Create Category" onAction={openCreate} />
        ) : view === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((cat) => (
              <CategoryCard key={cat.id} category={cat} courseCount={getCourseCount(cat.id)} onEdit={openEdit} onDelete={setDeleteTarget} onView={handleView} />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
            <table className="w-full text-sm">
              <thead className="bg-brand-surface dark:bg-slate-950 border-b border-brand-border dark:border-slate-800">
                <tr className="text-brand-text-primary dark:text-slate-200 select-none">
                  <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-brand-primary" onClick={() => setSortBy('name')}>
                    Name {sortBy === 'name' ? '▲' : ''}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Description</th>
                  <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-brand-primary" onClick={() => setSortBy('courses')}>
                    Courses {sortBy === 'courses' ? '▼' : ''}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-brand-primary" onClick={() => setSortBy('status')}>
                    Status {sortBy === 'status' ? '▲' : ''}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((cat) => (
                  <CategoryRow key={cat.id} category={cat} courseCount={getCourseCount(cat.id)} onEdit={openEdit} onDelete={setDeleteTarget} onView={handleView} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
      </div>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Create Category' : 'Edit Category'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            {modal === 'create' && <Button variant="outline" onClick={() => handleSave(true)}>Create & Add Another</Button>}
            <Button onClick={() => handleSave()}>{modal === 'create' ? 'Create' : 'Save Changes'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Name" required maxLength={100} value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Icon URL" maxLength={1000} value={form.icon} error={errors.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="https://..." />
          <TextArea label="Description" maxLength={1000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-brand-text-primary dark:text-slate-200">Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={form.color || '#3b82f6'}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="h-10 w-14 rounded-lg border border-brand-border dark:border-slate-800 cursor-pointer bg-white dark:bg-slate-900"
              />
              <Input
                value={form.color}
                error={errors.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                placeholder="#3b82f6"
              />
            </div>
          </div>
          <Select label="Status" value={form.isActive ? 'active' : 'inactive'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'active' })} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
        </div>
      </Modal>

      <ConfirmationDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteCategory(deleteTarget.id);
          showToast('Category deleted');
          setDeleteTarget(null);
        }}
        title="Delete Category"
        message="This will permanently delete the category. Courses will remain."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
