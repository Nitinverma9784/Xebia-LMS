'use client';

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/useToast';
import { paginate } from '@/utils';
import PageHeader from '@/components/layout/PageHeader';
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
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [publishedFilter, setPublishedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
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
      const q = search.toLowerCase();
      const matchSearch = !search || c.title.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchDiff = difficultyFilter === 'all' || c.difficulty === difficultyFilter;
      const matchCat = categoryFilter === 'all' || String(c.categoryId) === categoryFilter;
      const matchPublished = publishedFilter === 'all'
        || (publishedFilter === 'published' && c.status === 'published')
        || (publishedFilter === 'draft' && c.status !== 'published');
      return matchSearch && matchStatus && matchDiff && matchCat && matchPublished;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'difficulty') return a.difficulty.localeCompare(b.difficulty);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      if (sortBy === 'created') return new Date(b.createdAt) - new Date(a.createdAt);
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    return list;
  }, [baseCourses, search, statusFilter, difficultyFilter, categoryFilter, publishedFilter, sortBy]);

  const { data, total, totalPages } = paginate(filtered, page, pageSize);

  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || '—';
  const getCategoryColor = (id) => categories.find((c) => c.id === id)?.color || '#84117C';

  const handleCreate = () => {
    if (!categories?.length) {
      showToast('Create a category first before adding a course.', 'error');
      return;
    }
    navigate('/catalog/courses/new');
  };

  if (!hydrated) return null;

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title={category ? `${category.name} — Courses` : 'Courses'}
        subtitle="Manage all learning courses on the platform"
        action={
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4" /> Create Course
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by title or slug..."
          className="flex-1 min-w-[220px]"
        />
        <FilterDropdown
          label="Level"
          value={difficultyFilter}
          onChange={setDifficultyFilter}
          options={[{ value: 'all', label: 'All Levels' }, ...DIFFICULTY_LEVELS.map((d) => ({ value: d, label: d }))]}
        />
        {!categoryId && (
          <FilterDropdown
            label="Category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[{ value: 'all', label: 'All Categories' }, ...categories.filter((c) => !c.deletedAt).map((c) => ({ value: String(c.id), label: c.name }))]}
          />
        )}
        <FilterDropdown
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[{ value: 'all', label: 'All Status' }, ...COURSE_STATUSES.map((s) => ({ value: s.value, label: s.label }))]}
        />
        <FilterDropdown
          label="Published"
          value={publishedFilter}
          onChange={setPublishedFilter}
          options={[
            { value: 'all', label: 'All Published' },
            { value: 'published', label: 'Published' },
            { value: 'draft', label: 'Draft' },
          ]}
        />
        <span className="text-sm text-brand-text-secondary whitespace-nowrap xl:ml-auto">{filtered.length} courses</span>
      </div>

      {data.length === 0 ? (
        <EmptyState icon={Plus} title="No courses found" description="Create a course to get started." actionLabel="Create Course" onAction={handleCreate} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-brand-border bg-white shadow-card">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="border-b border-brand-border bg-brand-surface">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-brand-text-secondary">
                <th className="px-4 py-3 w-10">#</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((course, index) => (
                <CourseRow
                  key={course.id}
                  index={(page - 1) * pageSize + index + 1}
                  course={course}
                  categoryName={getCategoryName(course.categoryId)}
                  categoryColor={getCategoryColor(course.categoryId)}
                  onEdit={(c) => navigate(`/catalog/courses/${c.id}/edit`)}
                  onDelete={setDeleteTarget}
                  onDuplicate={(c) => duplicateCourse(c.id)}
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
          itemLabel="courses"
        />
      </div>

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
