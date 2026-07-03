'use client';

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import {
  BookOpen, FileText, Image as ImageIcon, Settings2, Sparkles, ArrowLeft,
  Clock, Users, Globe2, Plus, Trash2, Search, CheckCircle, Info,
  ChevronRight, Save, LayoutGrid, Cloud, GripVertical, Lock, Link2,
  AlignLeft, Upload, X, ArrowRight, PlayCircle, Video, List, Check, AlertCircle,
  HelpCircle, Eye, ShieldCheck, Code, Layers
} from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { DIFFICULTY_LEVELS, LANGUAGES, TECHNOLOGIES } from '@/constants';
import { slugify } from '@/utils';
import api from '@/services/api';

const EMPTY_FORM = {
  title:'', categoryId:'', technology:'Python', difficulty:'Intermediate',
  duration:'8 weeks', language:'English', shortDescription:'', description:'',
  status:'draft', logo:'', bannerImage:'', thumbnail:'',
  metaTitle:'', metaDescription:'', metaKeywords:'', canonicalUrl:'',
  primaryKeyword:'', secondaryKeywords:'', focusKeywords:'', robots:'index, follow',
  ogTitle:'', ogDescription:'', ogImage:'', ogUrl:'', ogType:'website',
  twitterTitle:'', twitterDescription:'', twitterImage:'', twitterCard:'summary_large_image',
  schemaMarkup:'', faqSchema:'', breadcrumbSchema:'',
  learningOutcomes:'[]', prerequisites:'[]', targetAudience:'[]',
  courseHighlights:'', careerOpportunities:'',
  isActive: true, isPublished: false, isFeatured: false,
  allowIndexing: true, showInSearch: true,
};

function FieldLabel({ children, hint, required }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-[#CBD5E1]">
      {children} {required && <span className="text-rose-500 font-extrabold">*</span>}
      {hint && <span className="ml-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-400 capitalize">({hint})</span>}
    </label>
  );
}

function SectionCard({ title, icon: Icon, children, action }) {
  return (
    <div className="rounded-[20px] border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] shadow-sm overflow-hidden transition-all duration-300">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#334155]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/50 text-[#7C3AED] dark:text-purple-300">
            {Icon && <Icon className="h-4 w-4" />}
          </div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-6 space-y-6">{children}</div>
    </div>
  );
}

function ToggleSwitch({ value, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50/50 dark:bg-[#0B1120]/50 transition-colors">
      <div>
        <div className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC]">{label}</div>
        {description && <div className="text-[11px] text-slate-400 dark:text-[#CBD5E1] mt-0.5">{description}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full p-0.5 flex items-center shrink-0 ml-3 transition-colors cursor-pointer ${value ? 'bg-[#7C3AED]' : 'bg-slate-300 dark:bg-slate-700'}`}
      >
        <div
          className="w-5 h-5 rounded-full bg-white shadow-md transition-transform"
          style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}

function ensureArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
      return [parsed];
    } catch {
      if (val.trim() === '') return [];
      return [val];
    }
  }
  return [];
}

function CourseListBuilder({
  label,
  hint,
  items,
  input,
  setInput,
  onAdd,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  placeholder,
  bulletColor = '#7C3AED',
  addButtonLabel,
  dragType
}) {
  const safeItems = ensureArray(items);
  return (
    <div>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div className="rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] overflow-hidden">
        {safeItems.map((item, idx) => (
          <div
            key={idx}
            draggable
            onDragStart={(e) => onDragStart(e, idx, dragType)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, idx, dragType)}
            className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-[#334155] hover:bg-slate-50 dark:hover:bg-[#0B1120]/50 transition-colors cursor-grab active:cursor-grabbing text-xs font-semibold text-slate-800 dark:text-[#F8FAFC]"
          >
            <GripVertical className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0" />
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: bulletColor }} />
            <span className="flex-1">{item}</span>
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 dark:border-[#334155]">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), onAdd())}
            placeholder={placeholder}
            className="w-full bg-transparent text-xs font-medium text-slate-800 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        <div className="p-3 bg-slate-50/50 dark:bg-[#0B1120]/30 flex justify-end">
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-purple-200 dark:border-purple-800/40 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            {addButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageField({ label, hint, value, onChange }) {
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type?.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const uploadedUrl = response.data.data.url;
      onChange(uploadedUrl);
      showToast('Image uploaded successfully');
    } catch (err) {
      showToast('Image upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const isImage = value && (value.startsWith('http') || value.startsWith('/') || value.startsWith('data:') || value.startsWith('blob:'));

  return (
    <div>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div className="flex h-11 items-center gap-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3.5 text-xs mb-2 transition-all focus-within:border-[#7C3AED]">
        <ImageIcon className="h-4 w-4 text-slate-400 dark:text-[#CBD5E1] shrink-0" />
        <input
          type="url"
          placeholder="https://cdn.example.com/image.jpg"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-transparent font-medium text-slate-800 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
        />
        {value && (
          <button type="button" onClick={() => onChange('')} className="text-slate-400 hover:text-slate-600">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {uploading ? (
        <div className="rounded-xl flex items-center justify-center gap-2 bg-slate-50 dark:bg-[#0B1120] border border-dashed border-slate-300 dark:border-slate-700 h-20">
          <div className="h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Uploading media...</span>
        </div>
      ) : isImage ? (
        <div className="rounded-xl overflow-hidden relative group border border-slate-200 dark:border-[#334155] h-24">
          <img
            src={(value.startsWith('/') && !value.startsWith('/uploads/')) ? `https://res.cloudinary.com${value}` : value}
            alt="preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-3 py-1.5 bg-white rounded-lg text-xs font-bold text-slate-900 hover:bg-slate-100 cursor-pointer shadow"
            >
              Replace Image
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current?.click()}
          className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all hover:bg-purple-50/50 dark:hover:bg-purple-950/20 text-center ${dragOver ? 'border-[#7C3AED] bg-purple-50/50' : 'border-slate-200 dark:border-[#334155]'}`}
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          <Upload className="h-5 w-5 text-purple-500 mb-1" />
          <span className="text-xs font-bold text-slate-700 dark:text-[#F8FAFC]">Click to upload or drag & drop</span>
          <span className="text-[10px] text-slate-400 dark:text-[#CBD5E1]">PNG, JPG, WEBP up to 5MB</span>
        </div>
      )}
    </div>
  );
}

export default function CourseForm() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { courses, categories, createCourse, updateCourse, hydrated } = useCatalog();

  const isEdit = !!courseId;
  const existing = isEdit ? courses.find(c => String(c.id) === String(courseId)) : null;

  const [step, setStep]           = useState(1);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [errors, setErrors]       = useState({});
  const [slugLocked, setSlugLocked] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const [outcomeInput, setOutcomeInput] = useState('');
  const [prereqInput,  setPrereqInput]  = useState('');
  const [audInput,     setAudInput]     = useState('');
  const [outcomes, setOutcomes] = useState([]);
  const [prereqs,  setPrereqs]  = useState([]);
  const [audience, setAudience] = useState([]);

  const [dragIdx,  setDragIdx]  = useState(null);
  const [dragType, setDragType] = useState('');

  const slugPreview = slugLocked ? slugify(form.title || 'course') : (form.slug || slugify(form.title || 'course'));
  const categoryObj = categories.find(c => String(c.id) === String(form.categoryId));
  const categoryColor = categoryObj?.color || '#7C3AED';
  const categoryName  = categoryObj?.name  || '—';

  useEffect(() => {
    if (existing) {
      setForm({
        ...EMPTY_FORM,
        title: existing.title || '',
        categoryId: existing.categoryId || '',
        technology: existing.technology || 'Python',
        difficulty: existing.difficulty || 'Intermediate',
        duration:   existing.duration   || '8 weeks',
        language:   existing.language   || 'English',
        status:     existing.status     || 'draft',
        shortDescription: existing.shortDescription || '',
        description: existing.description || '',
        logo:        existing.logo || existing.icon || '',
        bannerImage: existing.bannerImage || '',
        thumbnail:   existing.thumbnail || '',
        metaTitle:   existing.metaTitle || '',
        metaDescription: existing.metaDescription || '',
        metaKeywords: existing.metaKeywords || '',
        canonicalUrl: existing.canonicalUrl || '',
        primaryKeyword: existing.primaryKeyword || '',
        ogTitle: existing.ogTitle || '',
        ogDescription: existing.ogDescription || '',
        ogImage: existing.ogImage || '',
        ogType: existing.ogType || 'website',
        twitterTitle: existing.twitterTitle || '',
        twitterDescription: existing.twitterDescription || '',
        twitterImage: existing.twitterImage || '',
        twitterCard: existing.twitterCard || 'summary_large_image',
        schemaMarkup: existing.schemaMarkup || '',
        faqSchema: existing.faqSchema || '',
        breadcrumbSchema: existing.breadcrumbSchema || '',
        isActive: existing.isActive !== undefined ? existing.isActive : true,
        isPublished: existing.status === 'published',
        isFeatured: existing.isFeatured || false,
        allowIndexing: existing.allowIndexing !== undefined ? existing.allowIndexing : true,
        showInSearch: existing.showInSearch !== undefined ? existing.showInSearch : true,
        robots: existing.robots || 'index, follow',
        courseHighlights: existing.courseHighlights || '',
        careerOpportunities: existing.careerOpportunities || '',
      });
      try { setOutcomes(JSON.parse(existing.learningOutcomes || '[]')); } catch { setOutcomes([]); }
      try { setPrereqs(JSON.parse(existing.prerequisites || '[]')); } catch { setPrereqs([]); }
      try { setAudience(JSON.parse(existing.targetAudience || '[]')); } catch { setAudience([]); }
    }
  }, [existing]);

  const setF = (patch) => setForm(prev => ({ ...prev, ...patch }));

  const addItem = (list, setList, input, setInput, field) => {
    if (!input.trim()) return;
    const next = [...list, input.trim()];
    setList(next); setInput('');
    setF({ [field]: JSON.stringify(next) });
  };
  const removeItem = (list, setList, idx, field) => {
    const next = list.filter((_, i) => i !== idx);
    setList(next); setF({ [field]: JSON.stringify(next) });
  };
  const dragStart = (e, idx, type) => { setDragIdx(idx); setDragType(type); e.dataTransfer.effectAllowed = 'move'; };
  const dropItem = (e, targetIdx, list, setList, field, type) => {
    e.preventDefault();
    if (dragType !== type || dragIdx === null || dragIdx === targetIdx) return;
    const next = [...list];
    const [rem] = next.splice(dragIdx, 1);
    next.splice(targetIdx, 0, rem);
    setList(next); setF({ [field]: JSON.stringify(next) });
    setDragIdx(null); setDragType('');
  };

  const handleGenerateDescription = () => {
    if (!form.title.trim()) {
      showToast('Please enter a course title first to generate a relevant description.', 'error');
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const categoryNameSelected = categories.find(c => String(c.id) === String(form.categoryId))?.name || 'Technology';
        const generatedText = `Welcome to the comprehensive enterprise course on **${form.title}**!

This course is designed to take software engineers and solution architects from foundational understanding to production-ready deployment in **${categoryNameSelected}**.

### Key Learning Objectives:
- **Foundational Concepts**: Core architecture, syntax, design patterns, and platform tooling.
- **Hands-on Projects**: Build end-to-end applications through laboratory exercises.
- **Enterprise Best Practices**: Performance optimization, security hardening, and CI/CD automation.

### Target Audience:
- Engineers and technical leads aiming to master ${form.title}.
- Enterprise practitioners leveraging ${categoryNameSelected} solutions.`;

        setForm(prev => ({ ...prev, description: generatedText }));
        showToast('AI Description generated successfully!', 'success');
      } catch (err) {
        showToast('Failed to generate description', 'error');
      } finally {
        setIsGenerating(false);
      }
    }, 1200);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.categoryId)   e.categoryId = 'Category is required';
    if (!form.shortDescription.trim()) e.shortDescription = 'Short description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (forceStatus = null) => {
    if (!validate()) { setStep(1); return; }
    try {
      const finalStatus = forceStatus || (form.isPublished ? 'published' : 'draft');
      const payload = { 
        ...form, 
        status: finalStatus,
        slug: slugPreview, 
        learningOutcomes: JSON.stringify(outcomes), 
        prerequisites: JSON.stringify(prereqs), 
        targetAudience: JSON.stringify(audience) 
      };
      if (isEdit) await updateCourse(existing.id, payload);
      else        await createCourse(payload);
      showToast(`Course ${finalStatus === 'published' ? 'published' : 'saved as draft'} successfully`);
      navigate('/admin/courses');
    } catch { showToast('Failed to save course', 'error'); }
  };

  const completionChecklist = [
    { label: 'Course Title', check: !!form.title.trim() },
    { label: 'Category Selected', check: !!form.categoryId },
    { label: 'Short Description', check: !!form.shortDescription.trim() },
    { label: 'Course Thumbnail', check: !!form.thumbnail },
    { label: 'Learning Outcomes', check: outcomes.length > 0 },
  ];
  const completedCount = completionChecklist.filter(c => c.check).length;
  const completionPercent = Math.round((completedCount / completionChecklist.length) * 100);

  if (!hydrated) return null;

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-800 dark:text-[#F8FAFC] transition-colors duration-300">

      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-8 py-5 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-[#334155]">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/courses"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-[#334155] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              {isEdit ? 'Edit Course' : 'Create Course'} — {step === 1 ? 'Core Details' : 'SEO & Marketing'}
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">
              {step === 1 ? 'Define basic info, media assets, curriculum builders, and access flags.' : 'Configure search engine optimization, open graph metadata, and schema tags.'}
            </p>
          </div>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 items-center gap-1 rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] p-1 select-none">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${step === 1 ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
            >
              <Info className="h-3.5 w-3.5" />
              1. Core Details
            </button>
            <button
              type="button"
              onClick={() => validate() && setStep(2)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${step === 2 ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
            >
              <Search className="h-3.5 w-3.5" />
              2. SEO &amp; Meta
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex flex-1 gap-8 px-8 py-8 max-w-7xl w-full mx-auto">

        {/* LEFT COLUMN: Form Cards */}
        <div className="flex-1 min-w-0 space-y-8">
          {step === 1 ? (
            <>
              {/* Basic Information */}
              <SectionCard title="Basic Information" icon={Info}>
                <div>
                  <FieldLabel hint="max 200 chars" required>Course Title</FieldLabel>
                  <div className="flex h-11 items-center gap-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3.5 transition-all focus-within:border-[#7C3AED]">
                    <input
                      type="text"
                      maxLength={200}
                      placeholder="e.g. Master Enterprise Spring Boot Architectures"
                      value={form.title}
                      onChange={e => setF({ title: e.target.value })}
                      className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                    />
                    <span className="text-[10px] font-semibold text-slate-400 shrink-0">{form.title.length}/200</span>
                  </div>
                  {errors.title && <p className="mt-1 text-xs text-rose-500 font-semibold">{errors.title}</p>}
                </div>

                <div>
                  <FieldLabel hint="auto-generated permalink" required>Course Slug</FieldLabel>
                  <div className="flex h-11 items-center gap-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3.5 transition-all">
                    <Link2 className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="flex-1 font-mono text-xs font-semibold text-slate-700 dark:text-[#F8FAFC] truncate">{slugPreview}</span>
                    <button
                      type="button"
                      onClick={() => setSlugLocked(!slugLocked)}
                      className="p-1 text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"
                      title={slugLocked ? "Unlock to edit slug manually" : "Lock slug"}
                    >
                      <Lock className={`h-3.5 w-3.5 ${!slugLocked ? 'text-purple-600' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FieldLabel required>Category</FieldLabel>
                    <div className="relative">
                      <select
                        value={form.categoryId}
                        onChange={e => setF({ categoryId: e.target.value })}
                        className="h-11 w-full appearance-none cursor-pointer rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] py-2 pl-4 pr-9 text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all outline-none"
                      >
                        <option value="">Select category</option>
                        {categories.map(c => <option key={c.id} value={c.id} className="dark:bg-[#1E293B]">{c.name}</option>)}
                      </select>
                      <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" />
                    </div>
                    {errors.categoryId && <p className="mt-1 text-xs text-rose-500 font-semibold">{errors.categoryId}</p>}
                  </div>

                  <div>
                    <FieldLabel>Difficulty Level</FieldLabel>
                    <div className="relative">
                      <select
                        value={form.difficulty}
                        onChange={e => setF({ difficulty: e.target.value })}
                        className="h-11 w-full appearance-none cursor-pointer rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] py-2 pl-4 pr-9 text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all outline-none"
                      >
                        {DIFFICULTY_LEVELS.map(d => <option key={d} value={d} className="dark:bg-[#1E293B]">{d}</option>)}
                      </select>
                      <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FieldLabel>Language</FieldLabel>
                    <div className="relative">
                      <select
                        value={form.language}
                        onChange={e => setF({ language: e.target.value })}
                        className="h-11 w-full appearance-none cursor-pointer rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] py-2 pl-4 pr-9 text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all outline-none"
                      >
                        {LANGUAGES.map(l => <option key={l} value={l} className="dark:bg-[#1E293B]">{l}</option>)}
                      </select>
                      <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <FieldLabel hint="e.g. 8 weeks / 24 hrs">Estimated Duration</FieldLabel>
                    <div className="flex h-11 items-center gap-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3.5 transition-all focus-within:border-[#7C3AED]">
                      <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="e.g. 8 weeks, 32 hrs"
                        value={form.duration}
                        onChange={e => setF({ duration: e.target.value })}
                        className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Descriptions & AI Generator */}
              <SectionCard
                title="Course Descriptions"
                icon={AlignLeft}
                action={
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 transition-colors cursor-pointer border border-purple-200 dark:border-purple-800/40"
                  >
                    {isGenerating ? (
                      <>
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                        <span>AI Generate Description</span>
                      </>
                    )}
                  </button>
                }
              >
                <div>
                  <FieldLabel required>Short Description</FieldLabel>
                  <textarea
                    rows={2}
                    placeholder="Brief summary displayed on course cards and search engines..."
                    value={form.shortDescription}
                    onChange={e => setF({ shortDescription: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-3.5 text-xs font-medium text-slate-800 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all outline-none resize-none"
                  />
                  {errors.shortDescription && <p className="mt-1 text-xs text-rose-500 font-semibold">{errors.shortDescription}</p>}
                </div>

                <div>
                  <FieldLabel hint="Markdown Supported">Full Detailed Overview</FieldLabel>
                  <textarea
                    rows={6}
                    placeholder="Comprehensive course breakdown, prerequisites, and learning path..."
                    value={form.description}
                    onChange={e => setF({ description: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-3.5 text-xs font-medium text-slate-800 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all outline-none leading-relaxed resize-none"
                  />
                </div>
              </SectionCard>

              {/* Course Media */}
              <SectionCard title="Course Media & Uploads" icon={ImageIcon}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ImageField label="Course Icon / Logo" value={form.logo} onChange={v => setF({ logo: v })} />
                  <ImageField label="Course Card Thumbnail" hint="Main card image" value={form.thumbnail} onChange={v => setF({ thumbnail: v })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ImageField label="Banner Header Image" value={form.bannerImage} onChange={v => setF({ bannerImage: v })} />
                  <div>
                    <FieldLabel hint="YouTube Embed URL">Trailer Video URL</FieldLabel>
                    <div className="flex h-11 items-center gap-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3.5 transition-all focus-within:border-[#7C3AED]">
                      <PlayCircle className="h-4 w-4 text-purple-500 shrink-0" />
                      <input
                        type="url"
                        placeholder="https://youtube.com/watch?v=..."
                        value={form.youtubeVideoUrl || ''}
                        onChange={e => setF({ youtubeVideoUrl: e.target.value })}
                        className="w-full bg-transparent text-xs font-medium text-slate-800 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Course Content Builders */}
              <SectionCard title="Curriculum & Objectives Builder" icon={List}>
                <CourseListBuilder
                  label="Learning Outcomes"
                  hint="Key skills students will gain"
                  items={outcomes}
                  input={outcomeInput}
                  setInput={setOutcomeInput}
                  placeholder="e.g. Build enterprise Spring Boot microservices"
                  bulletColor="#10B5A5"
                  addButtonLabel="Add Outcome"
                  dragType="outcome"
                  onAdd={() => addItem(outcomes, setOutcomes, outcomeInput, setOutcomeInput, 'learningOutcomes')}
                  onRemove={idx => removeItem(outcomes, setOutcomes, idx, 'learningOutcomes')}
                  onDragStart={(e, idx) => dragStart(e, idx, 'outcome')}
                  onDragOver={e => e.preventDefault()}
                  onDrop={(e, idx) => dropItem(e, idx, outcomes, setOutcomes, 'learningOutcomes', 'outcome')}
                />

                <CourseListBuilder
                  label="Prerequisites"
                  items={prereqs}
                  input={prereqInput}
                  setInput={setPrereqInput}
                  placeholder="e.g. Basic Java & OOP knowledge"
                  bulletColor="#7C3AED"
                  addButtonLabel="Add Prerequisite"
                  dragType="prereq"
                  onAdd={() => addItem(prereqs, setPrereqs, prereqInput, setPrereqInput, 'prerequisites')}
                  onRemove={idx => removeItem(prereqs, setPrereqs, idx, 'prerequisites')}
                  onDragStart={(e, idx) => dragStart(e, idx, 'prereq')}
                  onDragOver={e => e.preventDefault()}
                  onDrop={(e, idx) => dropItem(e, idx, prereqs, setPrereqs, 'prerequisites', 'prereq')}
                />

                <CourseListBuilder
                  label="Target Audience"
                  items={audience}
                  input={audInput}
                  setInput={setAudInput}
                  placeholder="e.g. Backend Engineers & Tech Leads"
                  bulletColor="#F59E0B"
                  addButtonLabel="Add Audience"
                  dragType="audience"
                  onAdd={() => addItem(audience, setAudience, audInput, setAudInput, 'targetAudience')}
                  onRemove={idx => removeItem(audience, setAudience, idx, 'targetAudience')}
                  onDragStart={(e, idx) => dragStart(e, idx, 'audience')}
                  onDragOver={e => e.preventDefault()}
                  onDrop={(e, idx) => dropItem(e, idx, audience, setAudience, 'targetAudience', 'audience')}
                />
              </SectionCard>

              {/* Course Flags */}
              <SectionCard title="Course Access & Flags" icon={Settings2}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ToggleSwitch label="Active Status" description="Enable course visibility in system" value={form.isActive} onChange={v => setF({ isActive: v })} />
                  <ToggleSwitch label="Published Status" description="Make course live to students" value={form.status === 'published'} onChange={v => setF({ status: v ? 'published' : 'draft', isPublished: v })} />
                  <ToggleSwitch label="Featured Course" description="Highlight on main landing page" value={form.isFeatured} onChange={v => setF({ isFeatured: v })} />
                  <ToggleSwitch label="Allow SEO Indexing" description="Permit search engine crawlers" value={form.allowIndexing} onChange={v => setF({ allowIndexing: v })} />
                </div>
              </SectionCard>
            </>
          ) : (
            <>
              {/* Step 2: SEO & Meta */}
              <SectionCard title="SEO Meta Information" icon={Search}>
                <div>
                  <FieldLabel hint="max 70 chars">Meta Title</FieldLabel>
                  <div className="flex h-11 items-center gap-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3.5 transition-all focus-within:border-[#7C3AED]">
                    <input
                      type="text"
                      maxLength={70}
                      placeholder="Custom Title Tag for Search Engines"
                      value={form.metaTitle}
                      onChange={e => setF({ metaTitle: e.target.value })}
                      className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] focus:outline-none"
                    />
                    <span className="text-[10px] font-semibold text-slate-400 shrink-0">{form.metaTitle.length}/70</span>
                  </div>
                </div>

                <div>
                  <FieldLabel hint="max 320 chars">Meta Description</FieldLabel>
                  <textarea
                    rows={3}
                    placeholder="Snippet description displayed in Google search results..."
                    value={form.metaDescription}
                    onChange={e => setF({ metaDescription: e.target.value.slice(0, 320) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-3.5 text-xs font-medium text-slate-800 dark:text-[#F8FAFC] placeholder:text-slate-400 focus:border-[#7C3AED] outline-none resize-none"
                  />
                  <div className="text-right text-[10px] font-medium text-slate-400 mt-1">{form.metaDescription.length}/320</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FieldLabel>Primary Focus Keyword</FieldLabel>
                    <div className="flex h-11 items-center gap-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3.5">
                      <input
                        type="text"
                        placeholder="e.g. spring boot course"
                        value={form.primaryKeyword}
                        onChange={e => setF({ primaryKeyword: e.target.value })}
                        className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Canonical URL</FieldLabel>
                    <div className="flex h-11 items-center gap-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3.5">
                      <input
                        type="url"
                        placeholder="https://xebia.com/courses/spring-boot"
                        value={form.canonicalUrl}
                        onChange={e => setF({ canonicalUrl: e.target.value })}
                        className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Social Open Graph */}
              <SectionCard title="Social Open Graph Preview" icon={Sparkles}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FieldLabel>OG Title</FieldLabel>
                    <div className="flex h-11 items-center gap-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3.5">
                      <input
                        type="text"
                        placeholder="Title for Facebook/LinkedIn shares"
                        value={form.ogTitle}
                        onChange={e => setF({ ogTitle: e.target.value })}
                        className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>OG Type</FieldLabel>
                    <div className="flex h-11 items-center gap-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3.5">
                      <input
                        type="text"
                        placeholder="website"
                        value={form.ogType}
                        onChange={e => setF({ ogType: e.target.value })}
                        className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <ImageField label="OG Share Image" value={form.ogImage} onChange={v => setF({ ogImage: v })} />
              </SectionCard>
            </>
          )}

          {/* Footer Action Bar */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-[#334155]">
            <button
              type="button"
              onClick={() => navigate('/admin/courses')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSave('draft')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-xs font-bold text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
              >
                Save Draft
              </button>

              {step === 1 ? (
                <button
                  type="button"
                  onClick={() => validate() && setStep(2)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: '#7C3AED' }}
                >
                  Next: SEO &amp; Meta <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSave('published')}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: '#10B5A5' }}
                >
                  <Save className="h-4 w-4" />
                  {isEdit ? 'Save Changes' : 'Publish Course'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Sidebar */}
        <div className="w-80 shrink-0 space-y-6">
          <div className="sticky top-6 space-y-6">

            {/* Course Completion Progress Card */}
            <div className="rounded-[20px] border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">Course Completion</span>
                <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">{completionPercent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-teal-500 transition-all duration-500 rounded-full"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>

              {/* Required Checklist */}
              <div className="space-y-2.5 pt-1">
                {completionChecklist.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${item.check ? 'text-slate-700 dark:text-[#F8FAFC]' : 'text-slate-400 dark:text-slate-500'}`}>
                      {item.label}
                    </span>
                    {item.check ? (
                      <CheckCircle className="h-4 w-4 text-teal-500 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-slate-300 dark:text-slate-700 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Live Card Preview */}
            <div className="rounded-[20px] border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-[#334155] flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-purple-500" />
                  Live Card Preview
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300">
                  {form.status === 'published' ? 'Live' : 'Draft'}
                </span>
              </div>

              {/* Mini Preview Component */}
              <div className="p-4 space-y-3">
                <div className="relative aspect-video rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {form.thumbnail ? (
                    <img src={form.thumbnail} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      Thumbnail Preview
                    </div>
                  )}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold text-white bg-[#7C3AED]">
                    {categoryName}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-[#F8FAFC] line-clamp-1">
                    {form.title || 'Course Title...'}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-[#CBD5E1] line-clamp-2 mt-1">
                    {form.shortDescription || 'Short description will appear here on course cards.'}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-[#334155] pt-2 text-[10px] font-semibold text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {form.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe2 className="h-3 w-3" /> {form.language}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Enterprise Tips */}
            <div className="rounded-[20px] border border-purple-100 dark:border-purple-900/30 bg-purple-50/40 dark:bg-purple-950/20 p-5">
              <h4 className="text-xs font-extrabold text-purple-900 dark:text-purple-300 flex items-center gap-1.5 mb-2">
                <ShieldCheck className="h-4 w-4 text-purple-600" />
                Enterprise Best Practices
              </h4>
              <ul className="text-[11px] text-purple-800/80 dark:text-purple-300/80 space-y-1.5 leading-relaxed">
                <li>• Use clear titles mentioning key tech stacks.</li>
                <li>• Add at least 3 concrete learning outcomes.</li>
                <li>• Upload 16:9 high-resolution card thumbnails.</li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
