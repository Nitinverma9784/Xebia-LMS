'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Settings2, Sparkles, ArrowLeft, Clock, Users, Globe2 } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { DIFFICULTY_LEVELS, LANGUAGES, TECHNOLOGIES, COURSE_STATUSES } from '@/constants';
import { slugify } from '@/utils';
import Breadcrumb from '@/components/layout/Breadcrumb';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Select from '@/components/ui/Select';
import SectionCard from '@/components/ui/SectionCard';
import { CourseStatusBadge } from '@/components/ui/Badge';

import { getAIPlaceholderImage } from '@/utils/placeholderUtils';
import ImageUploader from '@/components/ui/ImageUploader';

const EMPTY_FORM = {
  title: '', categoryId: '', technology: 'Python', difficulty: 'Intermediate',
  duration: '8 weeks', language: 'English', shortDescription: '', description: '', status: 'draft',
  logo: '', bannerImage: '', backgroundImage: '', thumbnail: ''
};

export default function CourseForm() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, categories, createCourse, updateCourse, hydrated } = useCatalog();

  const isEdit = !!courseId;
  const existing = isEdit ? courses.find((c) => String(c.id) === String(courseId)) : null;

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title || '',
        categoryId: existing.categoryId || '',
        technology: existing.technology || 'Python',
        difficulty: existing.difficulty || 'Intermediate',
        duration: existing.duration || '8 weeks',
        language: existing.language || 'English',
        shortDescription: existing.shortDescription || '',
        description: existing.description || '',
        status: existing.status || 'draft',
        logo: existing.logo || existing.icon || '',
        bannerImage: existing.bannerImage || '',
        backgroundImage: existing.backgroundImage || '',
        thumbnail: existing.thumbnail || '',
      });
    } else if (categories.length && !form.categoryId) {
      setForm((f) => ({ ...f, categoryId: categories[0].id }));
    }
  }, [existing, categories]);

  if (!hydrated) return null;

  if (isEdit && !existing) {
    return (
      <div className="p-10 text-center text-brand-text-secondary">
        Course not found. <button className="text-accent-teal-dark font-semibold" onClick={() => navigate('/catalog/courses')}>Go back</button>
      </div>
    );
  }

  const slugPreview = slugify(form.title || 'untitled-course');

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.categoryId) e.categoryId = 'Select a category';
    if (!form.shortDescription.trim()) e.shortDescription = 'Short description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      if (isEdit) {
        await updateCourse(existing.id, form);
        navigate(`/catalog/courses/${existing.id}`);
      } else {
        await createCourse(form);
        navigate('/catalog/courses');
      }
    } catch {
      // toast already shown by useCatalog
    }
  };

  const categoryColor = categories.find((c) => String(c.id) === String(form.categoryId))?.color || '#0EA89C';
  const categoryName = categories.find((c) => String(c.id) === String(form.categoryId))?.name || 'Uncategorized';

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Course' : 'Create Course'} subtitle="Course basic details" />
      <div className="p-4 lg:p-6 space-y-6 pb-16">
        <Breadcrumb items={[{ label: 'Courses', href: '/catalog/courses' }, { label: isEdit ? 'Edit' : 'Create' }]} />

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/catalog/courses')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-border dark:border-slate-800 text-brand-text-secondary hover:bg-brand-surface dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-teal/10 text-accent-teal-dark">
            <BookOpen className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-brand-primary dark:text-slate-100">{isEdit ? 'Edit Course — Basic Details' : 'Create New Course — Basic Details'}</h2>
            <p className="text-sm text-brand-text-secondary dark:text-slate-400">Set up the core information learners will see first</p>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <SectionCard icon={BookOpen} title="Course Basics" subtitle="Title, category and classification" accent="teal">
              <div className="space-y-5">
                <Input
                  label="Course Title"
                  required
                  placeholder="e.g. Mastering React Hooks"
                  value={form.title}
                  error={errors.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <p className="text-xs text-brand-text-secondary -mt-3">
                  URL slug: <span className="font-mono text-accent-teal-dark">/{slugPreview}</span>
                </p>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Select
                    label="Category"
                    required
                    value={form.categoryId}
                    error={errors.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  />
                  <Select
                    label="Difficulty Level"
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    options={DIFFICULTY_LEVELS.map((d) => ({ value: d, label: d }))}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Select
                    label="Technology"
                    value={form.technology}
                    onChange={(e) => setForm({ ...form, technology: e.target.value })}
                    options={Object.keys(TECHNOLOGIES).map((t) => ({ value: t, label: t }))}
                  />
                  <Select
                    label="Language"
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    options={LANGUAGES.map((l) => ({ value: l, label: l }))}
                  />
                </div>

                <Input
                  label="Duration"
                  placeholder="e.g. 8 weeks"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                />
              </div>
            </SectionCard>

            <SectionCard icon={FileText} title="Description" subtitle="Help learners understand what they'll gain" accent="purple" delay={0.05}>
              <div className="space-y-5">
                <Input
                  label="Short Description"
                  required
                  maxLength={160}
                  placeholder="One-line summary shown on course cards"
                  value={form.shortDescription}
                  error={errors.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                />
                <TextArea
                  label="Full Description"
                  rows={6}
                  placeholder="Detailed course overview, what's covered, and who it's for..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </SectionCard>

            <SectionCard icon={Sparkles} title="Course Graphics & Assets" subtitle="Upload custom course designs or use AI placeholders" accent="orange" delay={0.07}>
              <div className="grid gap-6 sm:grid-cols-2">
                <ImageUploader 
                  label="Course Logo (Icon)"
                  value={form.logo} 
                  onChange={(val) => setForm({ ...form, logo: val })}
                  aspectRatio="square"
                />
                <ImageUploader 
                  label="Course Thumbnail"
                  value={form.thumbnail} 
                  onChange={(val) => setForm({ ...form, thumbnail: val })}
                  aspectRatio="video"
                />
              </div>
              <div className="space-y-4 mt-4">
                <ImageUploader 
                  label="Course Banner (Wide)"
                  value={form.bannerImage} 
                  onChange={(val) => setForm({ ...form, bannerImage: val })}
                  aspectRatio="banner"
                />
                <ImageUploader 
                  label="Course Background Image (Header/Layout)"
                  value={form.backgroundImage} 
                  onChange={(val) => setForm({ ...form, backgroundImage: val })}
                  aspectRatio="banner"
                />
              </div>
            </SectionCard>

            <SectionCard icon={Settings2} title="Publishing" subtitle="Control the course's visibility" accent="orange" delay={0.1} className="bg-brand-surface/95 dark:bg-slate-900/95 ring-1 ring-accent-orange/20">
              <div className="flex flex-wrap gap-2">
                {COURSE_STATUSES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setForm({ ...form, status: s.value })}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all border ${
                      form.status === s.value
                        ? 'bg-accent-orange text-white border-accent-orange shadow-sm'
                        : 'border-brand-border dark:border-slate-800 text-brand-text-secondary hover:border-accent-orange/40'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Right rail */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card overflow-hidden sticky top-20">
              <div className="relative aspect-video bg-slate-900 overflow-hidden">
                <img 
                  src={form.thumbnail || getAIPlaceholderImage(form.title, 'thumbnail')} 
                  alt="" 
                  className="h-full w-full object-cover opacity-90" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                <div className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 p-1 shadow border border-white/20">
                  <img 
                    src={form.logo || getAIPlaceholderImage(form.title, 'logo')} 
                    alt="" 
                    className="h-full w-full object-contain" 
                  />
                </div>
              </div>
              <div className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary mb-3">Live Preview</p>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white" style={{ backgroundColor: categoryColor }}>{categoryName}</span>
                  <CourseStatusBadge status={form.status} />
                </div>
                <h4 className="font-bold text-brand-text-primary dark:text-slate-100 truncate">{form.title || 'Course title'}</h4>
                <p className="mt-1 text-sm text-brand-text-secondary dark:text-slate-400 line-clamp-2">{form.shortDescription || 'Short description preview...'}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-brand-text-secondary dark:text-slate-400 border-t border-brand-border dark:border-slate-800 pt-3">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{form.duration}</span>
                  <span className="flex items-center gap-1"><Globe2 className="h-3.5 w-3.5" />{form.language}</span>
                  {isEdit && <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{existing?.enrolledStudents || 0}</span>}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-accent-orange/20 bg-accent-orange/5 p-5">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-accent-orange mb-2">
                <Sparkles className="h-3.5 w-3.5" /> Tips
              </p>
              <ul className="space-y-1.5 text-xs text-brand-text-secondary dark:text-slate-400 list-disc pl-4">
                <li>Once created, manage modules and content from the Curriculum tab.</li>
                <li>Keep the short description under 160 characters for clean cards.</li>
              </ul>
            </div>
          </div>
        </div>
        {/* Save/Cancel Action Bar */}
        <div className="border-t border-brand-border dark:border-slate-800 pt-6 flex items-center justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => navigate('/catalog/courses')}>Cancel</Button>
          <Button onClick={handleSave} variant="cta">{isEdit ? 'Save Changes' : 'Create Course'}</Button>
        </div>
      </div>
    </div>
  );
}
