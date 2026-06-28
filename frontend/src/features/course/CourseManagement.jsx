'use client';

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, LayoutGrid, List, BookOpen } from 'lucide-react';
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
import { ConfirmationDialog } from '@/components/ui/Modal';
import CourseCard, { CourseRow } from '@/components/catalog/CourseCard';
import { DEFAULT_PAGE_SIZE, DIFFICULTY_LEVELS, COURSE_STATUSES } from '@/constants';

export default function CourseManagement({ categoryId = null }) {
  const { categories, courses, getCategory, deleteCourse, duplicateCourse, hydrated } = useCatalog();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const category = categoryId ? getCategory(categoryId) : null;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [view, setView] = useState('table');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const baseCourses = useMemo(() => {
    let list = courses.filter((c) => !c.deletedAt);
    if (categoryId) list = list.filter((c) => c.categoryId === Number(categoryId) || c.categoryId === categoryId);
    return list;
  }, [courses, categoryId]);

  const filtered = useMemo(() => {
    let list = baseCourses.filter((c) => {
      const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.technology?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchDiff = difficultyFilter === 'all' || c.difficulty === difficultyFilter;
      return matchSearch && matchStatus && matchDiff;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'difficulty') return a.difficulty.localeCompare(b.difficulty);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      if (sortBy === 'created') return new Date(b.createdAt) - new Date(a.createdAt);
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    return list;
  }, [baseCourses, search, statusFilter, difficultyFilter, sortBy]);

  const { data, total, totalPages } = paginate(filtered, page, pageSize);

  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || '—';
  const getCategoryColor = (id) => categories.find((c) => c.id === id)?.color || '#7C3AED';

  const handleCreate = () => {
    if (!categories || categories.length === 0) {
      showToast('Course creation failed: You must create a Category first before creating a Course!', 'error');
      return;
    }
    navigate('/catalog/courses/new');
  };

  const breadcrumbItems = category
    ? [{ label: category.name, href: `/catalog/categories/${category.id}` }]
    : [];

  if (!hydrated) return null;

  return (
    <div>
      <Header title={category ? `${category.name} — Courses` : 'All Courses'} subtitle="Manage course catalog" />
      <div className="p-4 lg:p-6 space-y-6">
        <Breadcrumb items={breadcrumbItems.length ? [{ label: 'Categories', href: '/catalog/categories' }, ...breadcrumbItems] : [{ label: 'All Courses' }]} />

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-primary dark:text-slate-100">{category ? category.name : 'All Courses'}</h2>
            <p className="text-sm text-brand-text-secondary dark:text-slate-400">{filtered.length} courses</p>
          </div>
          <Button onClick={handleCreate}><Plus className="h-4 w-4" /> Create Course</Button>
        </motion.div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center flex-wrap">
          <SearchBar value={search} onChange={setSearch} placeholder="Search courses..." className="flex-1 min-w-[200px]" />
          <FilterDropdown label="Status" value={statusFilter} onChange={setStatusFilter} options={[{ value: 'all', label: 'All Status' }, ...COURSE_STATUSES.map((s) => ({ value: s.value, label: s.label }))]} />
          <FilterDropdown label="Difficulty" value={difficultyFilter} onChange={setDifficultyFilter} options={[{ value: 'all', label: 'All Levels' }, ...DIFFICULTY_LEVELS.map((d) => ({ value: d, label: d }))]} />
          <FilterDropdown label="Sort" value={sortBy} onChange={setSortBy} options={[{ value: 'updated', label: 'Last Updated' }, { value: 'created', label: 'Created Date' }, { value: 'title', label: 'Title A-Z' }]} />
          <div className="flex rounded-full border border-brand-border dark:border-slate-800 p-0.5 bg-white dark:bg-slate-900">
            <button type="button" onClick={() => setView('grid')} className={`p-2 rounded-full ${view === 'grid' ? 'bg-accent-teal text-white' : 'text-brand-text-secondary dark:text-slate-400'}`}><LayoutGrid className="h-4 w-4" /></button>
            <button type="button" onClick={() => setView('table')} className={`p-2 rounded-full ${view === 'table' ? 'bg-accent-teal text-white' : 'text-brand-text-secondary dark:text-slate-400'}`}><List className="h-4 w-4" /></button>
          </div>
        </div>

        {data.length === 0 ? (
          <EmptyState icon={BookOpen} title="No courses found" description="Create a course to get started." actionLabel="Create Course" onAction={handleCreate} />
        ) : view === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {data.map((course) => (
              <CourseCard key={course.id} course={course} categoryName={getCategoryName(course.categoryId)} categoryColor={getCategoryColor(course.categoryId)} onEdit={(c) => navigate(`/catalog/courses/${c.id}/edit`)} onDelete={setDeleteTarget} onDuplicate={(c) => duplicateCourse(c.id)} />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
            <table className="w-full text-sm">
              <thead className="bg-brand-surface dark:bg-slate-950 border-b border-brand-border dark:border-slate-800">
                <tr className="text-brand-text-primary dark:text-slate-200 select-none">
                  <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-accent-teal-dark" onClick={() => setSortBy(sortBy === 'title' ? 'updated' : 'title')}>
                    Course {sortBy === 'title' ? '▲' : ''}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-accent-teal-dark" onClick={() => setSortBy(sortBy === 'difficulty' ? 'updated' : 'difficulty')}>
                    Level {sortBy === 'difficulty' ? '▲' : ''}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Duration</th>
                  <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-accent-teal-dark" onClick={() => setSortBy(sortBy === 'status' ? 'updated' : 'status')}>
                    Status {sortBy === 'status' ? '▲' : ''}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Content</th>
                  <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-accent-teal-dark" onClick={() => setSortBy(sortBy === 'updated' ? 'title' : 'updated')}>
                    Updated {sortBy === 'updated' ? '▼' : ''}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((course) => (
                  <CourseRow key={course.id} course={course} categoryName={getCategoryName(course.categoryId)} categoryColor={getCategoryColor(course.categoryId)} onEdit={(c) => navigate(`/catalog/courses/${c.id}/edit`)} onDelete={setDeleteTarget} onDuplicate={(c) => duplicateCourse(c.id)} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
      </div>

      <ConfirmationDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { deleteCourse(deleteTarget.id); setDeleteTarget(null); }} title="Delete Course" message="Archive this course? You can restore it later." />
    </div>
  );
}
