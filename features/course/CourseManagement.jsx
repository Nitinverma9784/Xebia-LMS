'use client';

import { useState, useMemo } from 'react';
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
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Select from '@/components/ui/Select';
import { ConfirmationDialog } from '@/components/ui/Modal';
import CourseCard, { CourseRow } from '@/components/catalog/CourseCard';
import { DEFAULT_PAGE_SIZE, DIFFICULTY_LEVELS, LANGUAGES, TECHNOLOGIES, COURSE_STATUSES } from '@/constants';

export default function CourseManagement({ categoryId = null }) {
  const { categories, courses, getCategory, createCourse, updateCourse, deleteCourse, loading } = useCatalog();
  const { showToast } = useToast();
  const category = categoryId ? getCategory(categoryId) : null;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({
    title: '', slug: '', description: '', shortDescription: '', categoryId: categoryId || '',
    level: '', language: '', duration: '', icon: '', thumbnail: '', bannerImage: '',
    isActive: true, isFeatured: false,
    // SEO Fields
    metaTitle: '', metaDescription: '', metaKeywords: '', canonicalUrl: '',
    primaryKeyword: '', secondaryKeywords: '', focusKeywords: '', robots: '', author: '',
    seoCategory: '', seoTags: '', ogTitle: '', ogDescription: '', ogImage: '', ogUrl: '', ogType: '',
    twitterTitle: '', twitterDescription: '', twitterImage: '', twitterCard: '',
    schemaMarkup: '', faqSchema: '', breadcrumbSchema: '',
    // Course Content
    youtubeVideoUrl: '', previewVideoUrl: '', learningOutcomes: '', prerequisites: '',
    targetAudience: '', courseHighlights: '', careerOpportunities: '',
    // Programmatic SEO
    searchIntent: '', semanticKeywords: '', relatedTopics: '', searchSynonyms: '',
    // FAQ Content
    faqContent: '',
    // Custom Scripts
    customHeadScript: '', customBodyScript: '',
    // Flags
    isPublished: false, allowIndexing: true, showInSearch: true,
  });
  const [errors, setErrors] = useState({});

  const baseCourses = useMemo(() => {
    let list = courses;
    if (categoryId) list = list.filter((c) => c.categoryId === Number(categoryId) || c.categoryId === categoryId);
    return list;
  }, [courses, categoryId]);

  const filtered = useMemo(() => {
    let list = baseCourses.filter((c) => {
      const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && c.isActive) || 
        (statusFilter === 'inactive' && !c.isActive);
      return matchSearch && matchStatus;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return a.title.localeCompare(b.title);
    });
    return list;
  }, [baseCourses, search, statusFilter, sortBy]);

  const { data, total, totalPages } = paginate(filtered, page, pageSize);

  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || '—';

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (form.title.length > 200) e.title = 'Max 200 characters';
    if (!form.slug.trim()) e.slug = 'Slug is required';
    if (form.slug.length > 250) e.slug = 'Max 250 characters';
    if (!form.categoryId) e.categoryId = 'Category is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCreate = () => {
    if (!categories || categories.length === 0) {
      showToast('Course creation failed: You must create a Category first before creating a Course!', 'error');
      return;
    }
    setForm({
      title: '', slug: '', description: '', shortDescription: '',
      categoryId: categoryId || categories[0]?.id || '',
      level: '', language: '', duration: '', icon: '', thumbnail: '', bannerImage: '',
      isActive: true, isFeatured: false,
      // SEO Fields
      metaTitle: '', metaDescription: '', metaKeywords: '', canonicalUrl: '',
      primaryKeyword: '', secondaryKeywords: '', focusKeywords: '', robots: '', author: '',
      seoCategory: '', seoTags: '', ogTitle: '', ogDescription: '', ogImage: '', ogUrl: '', ogType: '',
      twitterTitle: '', twitterDescription: '', twitterImage: '', twitterCard: '',
      schemaMarkup: '', faqSchema: '', breadcrumbSchema: '',
      // Course Content
      youtubeVideoUrl: '', previewVideoUrl: '', learningOutcomes: '', prerequisites: '',
      targetAudience: '', courseHighlights: '', careerOpportunities: '',
      // Programmatic SEO
      searchIntent: '', semanticKeywords: '', relatedTopics: '', searchSynonyms: '',
      // FAQ Content
      faqContent: '',
      // Custom Scripts
      customHeadScript: '', customBodyScript: '',
      // Flags
      isPublished: false, allowIndexing: true, showInSearch: true,
    });
    setErrors({});
    setModal('create');
  };

  const openEdit = (course) => {
    setForm({
      title: course.title,
      slug: course.slug || '',
      description: course.description || '',
      shortDescription: course.shortDescription || '',
      categoryId: course.categoryId,
      level: course.level || '',
      language: course.language || '',
      duration: course.duration || '',
      icon: course.icon || '',
      thumbnail: course.thumbnail || '',
      bannerImage: course.bannerImage || '',
      isActive: course.isActive,
      isFeatured: course.isFeatured,
      // SEO Fields
      metaTitle: course.metaTitle || '',
      metaDescription: course.metaDescription || '',
      metaKeywords: course.metaKeywords || '',
      canonicalUrl: course.canonicalUrl || '',
      primaryKeyword: course.primaryKeyword || '',
      secondaryKeywords: course.secondaryKeywords || '',
      focusKeywords: course.focusKeywords || '',
      robots: course.robots || '',
      author: course.author || '',
      seoCategory: course.seoCategory || '',
      seoTags: course.seoTags || '',
      ogTitle: course.ogTitle || '',
      ogDescription: course.ogDescription || '',
      ogImage: course.ogImage || '',
      ogUrl: course.ogUrl || '',
      ogType: course.ogType || '',
      twitterTitle: course.twitterTitle || '',
      twitterDescription: course.twitterDescription || '',
      twitterImage: course.twitterImage || '',
      twitterCard: course.twitterCard || '',
      schemaMarkup: course.schemaMarkup || '',
      faqSchema: course.faqSchema || '',
      breadcrumbSchema: course.breadcrumbSchema || '',
      // Course Content
      youtubeVideoUrl: course.youtubeVideoUrl || '',
      previewVideoUrl: course.previewVideoUrl || '',
      learningOutcomes: course.learningOutcomes || '',
      prerequisites: course.prerequisites || '',
      targetAudience: course.targetAudience || '',
      courseHighlights: course.courseHighlights || '',
      careerOpportunities: course.careerOpportunities || '',
      // Programmatic SEO
      searchIntent: course.searchIntent || '',
      semanticKeywords: course.semanticKeywords || '',
      relatedTopics: course.relatedTopics || '',
      searchSynonyms: course.searchSynonyms || '',
      // FAQ Content
      faqContent: course.faqContent || '',
      // Custom Scripts
      customHeadScript: course.customHeadScript || '',
      customBodyScript: course.customBodyScript || '',
      // Flags
      isPublished: course.isPublished || false,
      allowIndexing: course.allowIndexing !== undefined ? course.allowIndexing : true,
      showInSearch: course.showInSearch !== undefined ? course.showInSearch : true,
    });
    setModal({ type: 'edit', id: course.id });
  };

  const handleSave = () => {
    if (!validate()) return;
    if (modal === 'create') {
      createCourse(form);
      showToast('Course created');
    } else {
      updateCourse(modal.id, form);
      showToast('Course updated');
    }
    setModal(null);
  };

  const breadcrumbItems = category
    ? [{ label: category.name, href: `/catalog/categories/${category.id}` }]
    : [];

  if (loading) return null;

  return (
    <div>
      <Header title={category ? `${category.name} — Courses` : 'All Courses'} subtitle="Manage course catalog" />
      <div className="p-4 lg:p-6 space-y-6">
        <Breadcrumb items={breadcrumbItems.length ? [{ label: 'Categories', href: '/catalog/categories' }, ...breadcrumbItems] : [{ label: 'All Courses' }]} />

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-text-primary dark:text-slate-100">{category ? category.name : 'All Courses'}</h2>
            <p className="text-sm text-brand-text-secondary dark:text-slate-400">{filtered.length} courses</p>
          </div>
          <Button onClick={openCreate}><Plus className="h-4 w-4" /> Create Course</Button>
        </motion.div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center flex-wrap">
          <SearchBar value={search} onChange={setSearch} placeholder="Search courses..." className="flex-1 min-w-[200px]" />
          <FilterDropdown label="Status" value={statusFilter} onChange={setStatusFilter} options={[{ value: 'all', label: 'All Status' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          <div className="flex rounded-xl border border-brand-border dark:border-slate-800 p-0.5 bg-white dark:bg-slate-900">
            <button type="button" onClick={() => setView('grid')} className={`p-2 rounded-lg ${view === 'grid' ? 'bg-brand-primary text-white' : 'text-brand-text-secondary dark:text-slate-400'}`}><LayoutGrid className="h-4 w-4" /></button>
            <button type="button" onClick={() => setView('table')} className={`p-2 rounded-lg ${view === 'table' ? 'bg-brand-primary text-white' : 'text-brand-text-secondary dark:text-slate-400'}`}><List className="h-4 w-4" /></button>
          </div>
        </div>

        {data.length === 0 ? (
          <EmptyState icon={BookOpen} title="No courses found" description="Create a course to get started." actionLabel="Create Course" onAction={openCreate} />
        ) : view === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {data.map((course) => (
              <CourseCard key={course.id} course={course} categoryName={getCategoryName(course.categoryId)} onEdit={openEdit} onDelete={setDeleteTarget} />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
            <table className="w-full text-sm">
              <thead className="bg-brand-surface dark:bg-slate-950 border-b border-brand-border dark:border-slate-800">
                <tr className="text-brand-text-primary dark:text-slate-200 select-none">
                  <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-brand-primary" onClick={() => setSortBy('title')}>
                    Course {sortBy === 'title' ? '▲' : ''}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-brand-primary" onClick={() => setSortBy('status')}>
                    Status {sortBy === 'status' ? '▲' : ''}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((course) => (
                  <CourseRow key={course.id} course={course} categoryName={getCategoryName(course.categoryId)} onEdit={openEdit} onDelete={setDeleteTarget} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Create Course' : 'Edit Course'} size="xl"
        footer={<><Button variant="outline" onClick={() => setModal(null)}>Cancel</Button><Button onClick={handleSave}>Save</Button></>}
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Information */}
          <div>
            <h4 className="text-sm font-semibold text-brand-text-primary dark:text-slate-100 mb-3">Basic Information</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Title" required maxLength={200} className="sm:col-span-2" value={form.title} error={errors.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Input label="Slug" required maxLength={250} className="sm:col-span-2" value={form.slug} error={errors.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="course-url-slug" />
              <Select label="Category" required value={form.categoryId} error={errors.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} options={categories.map((c) => ({ value: c.id, label: c.name }))} />
              <Input label="Level" maxLength={50} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="Beginner, Intermediate, Advanced" />
              <Input label="Language" maxLength={100} value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="English" />
              <Input label="Duration" maxLength={100} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="8 weeks" />
              <Input label="Icon URL" maxLength={1000} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="https://..." />
              <Input label="Thumbnail URL" maxLength={1000} value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} placeholder="https://..." />
              <Input label="Banner Image URL" maxLength={1000} className="sm:col-span-2" value={form.bannerImage} onChange={(e) => setForm({ ...form, bannerImage: e.target.value })} placeholder="https://..." />
              <TextArea label="Short Description" className="sm:col-span-2" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
              <TextArea label="Description" className="sm:col-span-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Select label="Active" value={form.isActive ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })} options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} />
              <Select label="Featured" value={form.isFeatured ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isFeatured: e.target.value === 'true' })} options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} />
            </div>
          </div>

          {/* SEO Fields */}
          <div>
            <h4 className="text-sm font-semibold text-brand-text-primary dark:text-slate-100 mb-3">SEO Settings</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Meta Title" maxLength={70} value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} placeholder="SEO meta title" />
              <TextArea label="Meta Description" maxLength={320} className="sm:col-span-2" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} placeholder="SEO meta description" />
              <Input label="Meta Keywords" value={form.metaKeywords} onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })} placeholder="keyword1, keyword2" />
              <Input label="Canonical URL" maxLength={1000} value={form.canonicalUrl} onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })} placeholder="https://..." />
              <Input label="Primary Keyword" value={form.primaryKeyword} onChange={(e) => setForm({ ...form, primaryKeyword: e.target.value })} />
              <Input label="Secondary Keywords" value={form.secondaryKeywords} onChange={(e) => setForm({ ...form, secondaryKeywords: e.target.value })} />
              <Input label="Focus Keywords" value={form.focusKeywords} onChange={(e) => setForm({ ...form, focusKeywords: e.target.value })} />
              <Input label="Robots" value={form.robots} onChange={(e) => setForm({ ...form, robots: e.target.value })} placeholder="index, follow" />
              <Input label="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
              <Input label="SEO Category" value={form.seoCategory} onChange={(e) => setForm({ ...form, seoCategory: e.target.value })} />
              <Input label="SEO Tags" value={form.seoTags} onChange={(e) => setForm({ ...form, seoTags: e.target.value })} />
            </div>
          </div>

          {/* Open Graph */}
          <div>
            <h4 className="text-sm font-semibold text-brand-text-primary dark:text-slate-100 mb-3">Open Graph</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="OG Title" maxLength={150} value={form.ogTitle} onChange={(e) => setForm({ ...form, ogTitle: e.target.value })} />
              <TextArea label="OG Description" maxLength={500} className="sm:col-span-2" value={form.ogDescription} onChange={(e) => setForm({ ...form, ogDescription: e.target.value })} />
              <Input label="OG Image URL" maxLength={1000} value={form.ogImage} onChange={(e) => setForm({ ...form, ogImage: e.target.value })} placeholder="https://..." />
              <Input label="OG URL" maxLength={1000} value={form.ogUrl} onChange={(e) => setForm({ ...form, ogUrl: e.target.value })} placeholder="https://..." />
              <Input label="OG Type" value={form.ogType} onChange={(e) => setForm({ ...form, ogType: e.target.value })} placeholder="website" />
            </div>
          </div>

          {/* Twitter Card */}
          <div>
            <h4 className="text-sm font-semibold text-brand-text-primary dark:text-slate-100 mb-3">Twitter Card</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Twitter Title" value={form.twitterTitle} onChange={(e) => setForm({ ...form, twitterTitle: e.target.value })} />
              <TextArea label="Twitter Description" value={form.twitterDescription} onChange={(e) => setForm({ ...form, twitterDescription: e.target.value })} />
              <Input label="Twitter Image URL" maxLength={1000} value={form.twitterImage} onChange={(e) => setForm({ ...form, twitterImage: e.target.value })} placeholder="https://..." />
              <Input label="Twitter Card Type" value={form.twitterCard} onChange={(e) => setForm({ ...form, twitterCard: e.target.value })} placeholder="summary_large_image" />
            </div>
          </div>

          {/* Schema Markup */}
          <div>
            <h4 className="text-sm font-semibold text-brand-text-primary dark:text-slate-100 mb-3">Schema Markup</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextArea label="Schema Markup" className="sm:col-span-2" value={form.schemaMarkup} onChange={(e) => setForm({ ...form, schemaMarkup: e.target.value })} placeholder="JSON-LD schema" />
              <TextArea label="FAQ Schema" className="sm:col-span-2" value={form.faqSchema} onChange={(e) => setForm({ ...form, faqSchema: e.target.value })} />
              <TextArea label="Breadcrumb Schema" className="sm:col-span-2" value={form.breadcrumbSchema} onChange={(e) => setForm({ ...form, breadcrumbSchema: e.target.value })} />
            </div>
          </div>

          {/* Course Content */}
          <div>
            <h4 className="text-sm font-semibold text-brand-text-primary dark:text-slate-100 mb-3">Course Content</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="YouTube Video URL" maxLength={500} value={form.youtubeVideoUrl} onChange={(e) => setForm({ ...form, youtubeVideoUrl: e.target.value })} placeholder="https://youtube.com/..." />
              <Input label="Preview Video URL" maxLength={500} value={form.previewVideoUrl} onChange={(e) => setForm({ ...form, previewVideoUrl: e.target.value })} placeholder="https://..." />
              <TextArea label="Learning Outcomes" className="sm:col-span-2" value={form.learningOutcomes} onChange={(e) => setForm({ ...form, learningOutcomes: e.target.value })} />
              <TextArea label="Prerequisites" className="sm:col-span-2" value={form.prerequisites} onChange={(e) => setForm({ ...form, prerequisites: e.target.value })} />
              <TextArea label="Target Audience" className="sm:col-span-2" value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} />
              <TextArea label="Course Highlights" className="sm:col-span-2" value={form.courseHighlights} onChange={(e) => setForm({ ...form, courseHighlights: e.target.value })} />
              <TextArea label="Career Opportunities" className="sm:col-span-2" value={form.careerOpportunities} onChange={(e) => setForm({ ...form, careerOpportunities: e.target.value })} />
            </div>
          </div>

          {/* Programmatic SEO */}
          <div>
            <h4 className="text-sm font-semibold text-brand-text-primary dark:text-slate-100 mb-3">Programmatic SEO</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Search Intent" value={form.searchIntent} onChange={(e) => setForm({ ...form, searchIntent: e.target.value })} />
              <TextArea label="Semantic Keywords" className="sm:col-span-2" value={form.semanticKeywords} onChange={(e) => setForm({ ...form, semanticKeywords: e.target.value })} />
              <TextArea label="Related Topics" className="sm:col-span-2" value={form.relatedTopics} onChange={(e) => setForm({ ...form, relatedTopics: e.target.value })} />
              <TextArea label="Search Synonyms" className="sm:col-span-2" value={form.searchSynonyms} onChange={(e) => setForm({ ...form, searchSynonyms: e.target.value })} />
            </div>
          </div>

          {/* FAQ Content */}
          <div>
            <h4 className="text-sm font-semibold text-brand-text-primary dark:text-slate-100 mb-3">FAQ Content</h4>
            <TextArea className="sm:col-span-2" value={form.faqContent} onChange={(e) => setForm({ ...form, faqContent: e.target.value })} />
          </div>

          {/* Custom Scripts */}
          <div>
            <h4 className="text-sm font-semibold text-brand-text-primary dark:text-slate-100 mb-3">Custom Scripts</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextArea label="Custom Head Script" className="sm:col-span-2" value={form.customHeadScript} onChange={(e) => setForm({ ...form, customHeadScript: e.target.value })} placeholder="<script>...</script>" />
              <TextArea label="Custom Body Script" className="sm:col-span-2" value={form.customBodyScript} onChange={(e) => setForm({ ...form, customBodyScript: e.target.value })} placeholder="<script>...</script>" />
            </div>
          </div>

          {/* Flags */}
          <div>
            <h4 className="text-sm font-semibold text-brand-text-primary dark:text-slate-100 mb-3">Publishing Flags</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Published" value={form.isPublished ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isPublished: e.target.value === 'true' })} options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} />
              <Select label="Allow Indexing" value={form.allowIndexing ? 'true' : 'false'} onChange={(e) => setForm({ ...form, allowIndexing: e.target.value === 'true' })} options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} />
              <Select label="Show in Search" value={form.showInSearch ? 'true' : 'false'} onChange={(e) => setForm({ ...form, showInSearch: e.target.value === 'true' })} options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} />
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmationDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { deleteCourse(deleteTarget.id); showToast('Course deleted'); setDeleteTarget(null); }} title="Delete Course" message="This will permanently delete the course." confirmLabel="Delete" variant="danger" />
    </div>
  );
}
