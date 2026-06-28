'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderTree, Sparkles, Info, ArrowLeft } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { formatDate } from '@/utils';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Toggle from '@/components/ui/Toggle';
import SectionCard from '@/components/ui/SectionCard';
import ColorSwatchPicker from '@/components/ui/ColorSwatchPicker';
import IconPicker from '@/components/ui/IconPicker';
import { CourseStatusBadge } from '@/components/ui/Badge';
import { getAIPlaceholderImage } from '@/utils/placeholderUtils';
import ImageUploader from '@/components/ui/ImageUploader';

const EMPTY_FORM = { 
  name: '', 
  description: '', 
  status: 'active', 
  icon: '💻', 
  color: '#0EA89C',
  logo: '',
  bannerImage: '',
  backgroundImage: '',
  thumbnail: ''
};

export default function CategoryForm() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { categories, courses, createCategory, updateCategory, hydrated } = useCatalog();

  const isEdit = !!categoryId;
  const existing = isEdit ? categories.find((c) => String(c.id) === String(categoryId)) : null;
  const courseCount = existing ? courses.filter((c) => c.categoryId === existing.id && !c.deletedAt).length : 0;

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name || '',
        description: existing.description || '',
        status: existing.status || 'active',
        icon: existing.icon || '💻',
        color: existing.color || '#0EA89C',
        logo: existing.logo || '',
        bannerImage: existing.bannerImage || '',
        backgroundImage: existing.backgroundImage || '',
        thumbnail: existing.thumbnail || '',
      });
    }
  }, [existing]);

  if (!hydrated) return null;

  if (isEdit && !existing) {
    return (
      <div className="p-10 text-center text-brand-text-secondary">
        Category not found. <button className="text-accent-teal-dark font-semibold" onClick={() => navigate('/catalog/categories')}>Go back</button>
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (form.name.length > 100) e.name = 'Max 100 characters';
    if (!form.description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (continueEditing = false) => {
    if (!validate()) return;
    try {
      if (isEdit) {
        await updateCategory(existing.id, form);
        navigate('/catalog/categories');
      } else {
        await createCategory(form);
        if (continueEditing) {
          setForm(EMPTY_FORM);
          setErrors({});
        } else {
          navigate('/catalog/categories');
        }
      }
    } catch {
      // toast already shown by useCatalog
    }
  };

  return (
    <div>
      <Header title={isEdit ? 'Edit Category' : 'Create Category'} subtitle="Organize courses into categories" />
      <div className="p-4 lg:p-6 space-y-6 pb-16">
        <Breadcrumb items={[{ label: 'Categories', href: '/catalog/categories' }, { label: isEdit ? 'Edit' : 'Create' }]} />

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/catalog/categories')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-border dark:border-slate-800 text-brand-text-secondary hover:bg-brand-surface dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-teal/10 text-accent-teal-dark">
            <FolderTree className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-brand-primary dark:text-slate-100">{isEdit ? 'Edit Category' : 'Create New Category'}</h2>
            <p className="text-sm text-brand-text-secondary dark:text-slate-400">{isEdit ? 'Update the details for this category' : 'Add a new category to organize your courses'}</p>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main form column */}
          <div className="lg:col-span-2 space-y-6">
            <SectionCard icon={FolderTree} title="Category Details" subtitle="Basic information shown across the catalog" accent="teal">
              <div className="space-y-5">
                <Input
                  label="Category Name"
                  required
                  maxLength={100}
                  placeholder="e.g. Artificial Intelligence"
                  value={form.name}
                  error={errors.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <div>
                  <label className="block text-sm font-medium text-brand-text-primary dark:text-slate-200 mb-1.5">Status</label>
                  <div className="inline-flex rounded-full border border-brand-border dark:border-slate-800 bg-brand-surface dark:bg-slate-950 p-1">
                    {['active', 'inactive'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm({ ...form, status: s })}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-all ${
                          form.status === s ? 'bg-accent-teal text-white shadow-sm' : 'text-brand-text-secondary dark:text-slate-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <IconPicker value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
                  <ColorSwatchPicker value={form.color} onChange={(color) => setForm({ ...form, color })} />
                </div>

                <TextArea
                  label="Description"
                  required
                  maxLength={500}
                  rows={4}
                  placeholder="A short summary of what learners will find in this category..."
                  value={form.description}
                  error={errors.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </SectionCard>

            <SectionCard icon={Sparkles} title="Category Media & Assets" subtitle="Upload branding graphics or use AI placeholders" accent="orange" delay={0.03}>
              <div className="grid gap-6 sm:grid-cols-2">
                <ImageUploader 
                  label="Category Logo (Square)"
                  value={form.logo} 
                  onChange={(val) => setForm({ ...form, logo: val })}
                  aspectRatio="square"
                />
                <ImageUploader 
                  label="Category Thumbnail (Card Preview)"
                  value={form.thumbnail} 
                  onChange={(val) => setForm({ ...form, thumbnail: val })}
                  aspectRatio="video"
                />
              </div>
              <div className="space-y-4 mt-4">
                <ImageUploader 
                  label="Cover / Banner Image (Wide)"
                  value={form.bannerImage} 
                  onChange={(val) => setForm({ ...form, bannerImage: val })}
                  aspectRatio="banner"
                />
                <ImageUploader 
                  label="Background Image (Subtle Pattern)"
                  value={form.backgroundImage} 
                  onChange={(val) => setForm({ ...form, backgroundImage: val })}
                  aspectRatio="banner"
                />
              </div>
            </SectionCard>

            <SectionCard icon={Info} title="Visibility" subtitle="Control how this category behaves in the catalog" accent="purple" delay={0.05}>
              <Toggle
                label="Active in catalog"
                description="Inactive categories are hidden from learners but keep their courses."
                checked={form.status === 'active'}
                onChange={(checked) => setForm({ ...form, status: checked ? 'active' : 'inactive' })}
              />
            </SectionCard>
          </div>

          {/* Right rail: live preview + stats + tips */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card overflow-hidden sticky top-20">
              <div className="h-28 w-full bg-slate-100 dark:bg-slate-950 relative overflow-hidden">
                <img 
                  src={form.bannerImage || getAIPlaceholderImage(form.name, 'banner', form.color)} 
                  alt="" 
                  className="h-full w-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                <div className="absolute bottom-3 left-3 flex h-12 w-12 items-center justify-center rounded-xl text-xl shadow-lg border border-white/10" style={{ backgroundColor: form.color || '#0EA89C' }}>
                  {form.logo ? <img src={form.logo} alt="" className="h-full w-full object-cover rounded-xl" /> : form.icon}
                </div>
              </div>
              <div className="p-5 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary">Live Card Preview</p>
                  <CourseStatusBadge status={form.status} />
                </div>
                <h4 className="font-bold text-brand-text-primary dark:text-slate-100 truncate">{form.name || 'Category name'}</h4>
                <p className="mt-1 text-sm text-brand-text-secondary dark:text-slate-400 line-clamp-2">{form.description || 'Category description will appear here.'}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-brand-text-secondary dark:text-slate-400 border-t border-brand-border dark:border-slate-800 pt-3">
                  <span className="font-semibold" style={{ color: form.color }}>{courseCount} courses</span>
                  <span>{isEdit ? formatDate(existing?.createdAt) : 'New'}</span>
                </div>
              </div>
            </div>

            {isEdit && (
              <div className="rounded-2xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary mb-3">Quick Stats</p>
                <dl className="space-y-2.5 text-sm">
                  <div className="flex justify-between"><dt className="text-brand-text-secondary">Courses</dt><dd className="font-semibold text-brand-text-primary dark:text-slate-200">{courseCount}</dd></div>
                  <div className="flex justify-between"><dt className="text-brand-text-secondary">Created</dt><dd className="font-semibold text-brand-text-primary dark:text-slate-200">{formatDate(existing?.createdAt)}</dd></div>
                  <div className="flex justify-between"><dt className="text-brand-text-secondary">Last updated</dt><dd className="font-semibold text-brand-text-primary dark:text-slate-200">{formatDate(existing?.updatedAt)}</dd></div>
                </dl>
              </div>
            )}

            <div className="rounded-2xl border border-accent-orange/20 bg-accent-orange/5 p-5">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-accent-orange mb-2">
                <Sparkles className="h-3.5 w-3.5" /> Tips
              </p>
              <ul className="space-y-1.5 text-xs text-brand-text-secondary dark:text-slate-400 list-disc pl-4">
                <li>Pick a distinct color — it's used as the accent across category cards and tags.</li>
                <li>Keep descriptions under 2 sentences for clean card layouts.</li>
              </ul>
            </div>
          </div>
        {/* Save/Cancel Action Bar */}
        <div className="border-t border-brand-border dark:border-slate-800 pt-6 flex items-center justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => navigate('/catalog/categories')}>Cancel</Button>
          {!isEdit && <Button variant="outline" onClick={() => handleSave(true)}>Create &amp; Add Another</Button>}
          <Button onClick={() => handleSave(false)} variant="cta">{isEdit ? 'Save Changes' : 'Create Category'}</Button>
        </div>
      </div>
    </div>
  </div>
  );
}
