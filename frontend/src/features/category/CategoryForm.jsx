'use client';

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FolderTree, Sparkles, Check, Circle, Lightbulb } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Toggle from '@/components/ui/Toggle';
import ColorSwatchPicker from '@/components/ui/ColorSwatchPicker';
import IconPicker from '@/components/ui/IconPicker';
import { CourseStatusBadge } from '@/components/ui/Badge';

const EMPTY_FORM = {
  name: '',
  description: '',
  status: 'active',
  icon: '💻',
  color: '#01AC9F',
};

function slugify(name) {
  return (name || 'category').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function CategoryForm() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { categories, createCategory, updateCategory, hydrated } = useCatalog();

  const isEdit = !!categoryId;
  const existing = isEdit ? categories.find((c) => String(c.id) === String(categoryId)) : null;

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name || '',
        description: existing.description || '',
        status: existing.status || 'active',
        icon: existing.icon || '💻',
        color: existing.color || '#01AC9F',
      });
    }
  }, [existing]);

  const fieldChecks = useMemo(() => ([
    { label: 'Category Name', done: !!form.name.trim() },
    { label: 'Icon / Thumbnail', done: !!form.icon },
    { label: 'Description', done: !!form.description.trim() },
    { label: 'Accent Color', done: !!form.color },
    { label: 'Status', done: !!form.status },
  ]), [form]);

  if (!hydrated) return null;

  if (isEdit && !existing) {
    return (
      <div className="p-10 text-center text-brand-text-secondary">
        Category not found.{' '}
        <button className="font-semibold text-accent-teal-dark" onClick={() => navigate('/catalog/categories')}>
          Go back
        </button>
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (asDraft = false) => {
    if (!validate()) return;
    const payload = { ...form, status: asDraft ? 'inactive' : form.status };
    try {
      if (isEdit) {
        await updateCategory(existing.id, payload);
      } else {
        await createCategory(payload);
      }
      navigate('/catalog/categories');
    } catch {
      /* toast shown in useCatalog */
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <nav className="mb-4 text-sm text-brand-text-secondary">
        <Link to="/catalog/dashboard" className="hover:text-accent-teal-dark">Dashboard</Link>
        <span className="mx-2">›</span>
        <Link to="/catalog/categories" className="hover:text-accent-teal-dark">Categories</Link>
        <span className="mx-2">›</span>
        <span className="text-slate-800">{isEdit ? 'Edit' : 'Create'}</span>
      </nav>

      <PageHeader
        title={isEdit ? 'Edit Category' : 'Create New Category'}
        subtitle="Add a new category to organize your courses"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-brand-border bg-white p-6 shadow-card">
            <h3 className="mb-5 text-base font-bold text-slate-900">Category Details</h3>
            <div className="space-y-5">
              <Input
                label="Category Name"
                required
                maxLength={100}
                placeholder="e.g. Web Development"
                value={form.name}
                error={errors.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <IconPicker value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
                <ColorSwatchPicker value={form.color} onChange={(color) => setForm({ ...form, color })} />
              </div>
              <TextArea
                label="Description"
                required
                rows={4}
                placeholder="A short summary of what learners will find in this category..."
                value={form.description}
                error={errors.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-brand-border bg-white p-6 shadow-card">
            <h3 className="mb-2 text-base font-bold text-slate-900">Status</h3>
            <Toggle
              label="Active"
              description="Visible to all learners on the platform."
              checked={form.status === 'active'}
              onChange={(checked) => setForm({ ...form, status: checked ? 'active' : 'inactive' })}
            />
          </section>
        </div>

        <div className="space-y-5">
          <div className="sticky top-6 overflow-hidden rounded-2xl border border-brand-border bg-white shadow-card">
            <div className="h-1.5 bg-accent-teal" />
            <div className="p-5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary">Live Preview</p>
              <div className="rounded-xl border border-brand-border p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full text-xl"
                    style={{ backgroundColor: `${form.color}18` }}
                  >
                    {form.icon}
                  </div>
                  <CourseStatusBadge status={form.status} />
                </div>
                <h4 className="font-bold text-slate-900">{form.name || 'Category name'}</h4>
                <p className="text-xs text-brand-text-secondary">{slugify(form.name)}</p>
                <p className="mt-2 line-clamp-3 text-sm text-brand-text-secondary">
                  {form.description || 'Category description will appear here.'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary">Field Summary</p>
            <ul className="space-y-2.5">
              {fieldChecks.map((field) => (
                <li key={field.label} className="flex items-center gap-2.5 text-sm">
                  {field.done ? (
                    <Check className="h-4 w-4 text-accent-teal" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-300" />
                  )}
                  <span className={field.done ? 'text-slate-800' : 'text-brand-text-secondary'}>{field.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-5">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand-primary">
              <Lightbulb className="h-3.5 w-3.5" /> Quick Tips
            </p>
            <ul className="list-disc space-y-1.5 pl-4 text-xs text-brand-text-secondary">
              <li>Pick a distinct accent color — it appears on cards and tags.</li>
              <li>Keep descriptions under two sentences for clean layouts.</li>
              <li>Category names must be unique across the platform.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3 border-t border-brand-border pt-6">
        <Button variant="ghost" onClick={() => navigate('/catalog/categories')}>Cancel</Button>
        {!isEdit && (
          <Button variant="outline" onClick={() => handleSave(true)}>Save as Draft</Button>
        )}
        <Button onClick={() => handleSave(false)}>
          <Sparkles className="h-4 w-4" />
          {isEdit ? 'Save Changes' : 'Create Category'}
        </Button>
      </div>
    </div>
  );
}
