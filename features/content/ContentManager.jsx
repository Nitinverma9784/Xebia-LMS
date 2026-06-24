'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, UploadCloud, Eye, ExternalLink, Link, FileText, StickyNote, Video, Image, Presentation, FileCode } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Select from '@/components/ui/Select';
import { formatDate, formatFileSize } from '@/utils';

const TYPE_ICONS = {
  video: Video,
  pdf: FileText,
  ppt: Presentation,
  doc: FileCode,
  notes: StickyNote,
  image: Image,
  link: ExternalLink,
};

const TYPE_COLORS = {
  video: 'text-red-500 bg-red-50 dark:bg-red-950/20',
  pdf: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20',
  ppt: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20',
  doc: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20',
  notes: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20',
  image: 'text-green-500 bg-green-50 dark:bg-green-950/20',
  link: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/20',
};

export default function ContentManager({ content, submoduleId, moduleId, courseId, catalog, showToast, onPreview, onSelect }) {
  const [form, setForm] = useState({ 
    type: '', text: '', code: '', language: '', 
    videoUrl: '', imageUrl: '', alt: '', caption: '', 
    title: '', headingLevel: 1, contentOrder: 0, isActive: true 
  });
  const [activeTab, setActiveTab] = useState('edit');
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState({});

  const course = catalog.courses?.find((c) => c.id === courseId);
  const courseTitle = course?.title || 'Course';
  const module = course?.modules?.find((m) => m.id === moduleId);
  const moduleTitle = module?.title || 'Module';
  const submodule = module?.submodules?.find((s) => s.id === submoduleId);
  const submoduleTitle = submodule?.title || 'Submodule';

  useEffect(() => {
    if (content) {
      setForm({
        type: content.type || '',
        text: content.text || '',
        code: content.code || '',
        language: content.language || '',
        videoUrl: content.videoUrl || '',
        imageUrl: content.imageUrl || '',
        alt: content.alt || '',
        caption: content.caption || '',
        title: content.title || '',
        headingLevel: content.headingLevel || 1,
        contentOrder: content.contentOrder || 0,
        isActive: content.isActive ?? true,
      });
      setErrors({});
      setActiveTab('edit');
    }
  }, [content]);

  if (!content) return null;

  const validate = () => {
    const e = {};
    if (!form.type.trim()) e.type = 'Content type is required';
    if (form.type.length > 30) e.type = 'Max 30 characters';
    if (form.language && form.language.length > 50) e.language = 'Max 50 characters';
    if (form.videoUrl && form.videoUrl.length > 500) e.videoUrl = 'Max 500 characters';
    if (form.imageUrl && form.imageUrl.length > 500) e.imageUrl = 'Max 500 characters';
    if (form.alt && form.alt.length > 200) e.alt = 'Max 200 characters';
    if (form.caption && form.caption.length > 300) e.caption = 'Max 300 characters';
    if (form.title && form.title.length > 300) e.title = 'Max 300 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    catalog.updateContent(courseId, moduleId, submoduleId, content.id, form);
    showToast('Content updated successfully');
  };

  // Drag and drop replace file logic
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Simulated upload updating size, name, url
      catalog.updateContent(courseId, moduleId, submoduleId, content.id, {
        fileSize: file.size,
        fileUrl: `/media/${content.type}-${Date.now()}.${file.name.split('.').pop()}`,
        updatedAt: new Date().toISOString(),
      });
      showToast(`Replaced file with: ${file.name}`);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const file = files[0];
      catalog.updateContent(courseId, moduleId, submoduleId, content.id, {
        fileSize: file.size,
        fileUrl: `/media/${content.type}-${Date.now()}.${file.name.split('.').pop()}`,
        updatedAt: new Date().toISOString(),
      });
      showToast(`Uploaded file: ${file.name}`);
    }
  };

  const Icon = TYPE_ICONS[content.type] || FileText;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-brand-text-secondary dark:text-slate-400">
        <button
          type="button"
          onClick={() => onSelect?.({ type: 'course', id: courseId })}
          className="hover:text-brand-primary dark:hover:text-brand-secondary transition-colors"
        >
          {courseTitle}
        </button>
        <span className="text-brand-border dark:text-slate-700">/</span>
        <button
          type="button"
          onClick={() => onSelect?.({ type: 'module', id: moduleId })}
          className="hover:text-brand-primary dark:hover:text-brand-secondary transition-colors truncate max-w-[150px]"
        >
          {moduleTitle}
        </button>
        <span className="text-brand-border dark:text-slate-700">/</span>
        <button
          type="button"
          onClick={() => onSelect?.({ type: 'submodule', id: submoduleId, moduleId })}
          className="hover:text-brand-primary dark:hover:text-brand-secondary transition-colors truncate max-w-[150px]"
        >
          {submoduleTitle}
        </button>
        <span className="text-brand-border dark:text-slate-700">/</span>
        <span className="text-brand-text-primary dark:text-slate-200 truncate max-w-[200px]">
          {content.title}
        </span>
      </div>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card flex items-start gap-4"
      >
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 ${TYPE_COLORS[content.type]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-brand-text-primary dark:text-slate-100 truncate">{content.title}</h2>
            <span className="text-xs uppercase bg-brand-surface dark:bg-slate-800 px-2 py-0.5 rounded text-brand-text-secondary dark:text-slate-400 font-semibold border border-brand-border dark:border-slate-700">
              {content.type}
            </span>
          </div>
          <p className="text-xs text-brand-text-secondary dark:text-slate-400 mt-1">
            Last modified {formatDate(content.updatedAt)} · Created by {content.createdBy || 'Admin'}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => onPreview(content)}>
          <Eye className="h-4 w-4" /> Live Preview
        </Button>
      </motion.div>

      {/* Editor Panel */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card"
      >
        {/* Navigation tabs */}
        <div className="flex gap-4 border-b border-brand-border dark:border-slate-800 pb-3 mb-5 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={activeTab === 'edit' ? 'text-brand-primary dark:text-brand-secondary border-b-2 border-brand-primary dark:border-brand-secondary pb-3 -mb-[14px]' : 'text-brand-text-secondary dark:text-slate-400 hover:text-brand-text-primary dark:hover:text-slate-100'}
          >
            Authoring Form
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={activeTab === 'preview' ? 'text-brand-primary dark:text-brand-secondary border-b-2 border-brand-primary dark:border-brand-secondary pb-3 -mb-[14px]' : 'text-brand-text-secondary dark:text-slate-400 hover:text-brand-text-primary dark:hover:text-slate-100'}
          >
            Real-time Output
          </button>
        </div>

        {activeTab === 'edit' ? (
          <div className="space-y-4">
            <Select
              label="Content Type"
              required
              value={form.type}
              error={errors.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              options={[
                { value: 'text', label: 'Text' },
                { value: 'code', label: 'Code' },
                { value: 'video', label: 'Video' },
                { value: 'image', label: 'Image' },
                { value: 'heading', label: 'Heading' },
              ]}
            />

            <Input
              label="Title"
              maxLength={300}
              value={form.title}
              error={errors.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            {form.type === 'text' && (
              <TextArea
                label="Text Content"
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="Enter text content..."
              />
            )}

            {form.type === 'code' && (
              <>
                <TextArea
                  label="Code"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="Enter code..."
                />
                <Input
                  label="Language"
                  maxLength={50}
                  value={form.language}
                  error={errors.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  placeholder="javascript, python, etc."
                />
              </>
            )}

            {form.type === 'video' && (
              <Input
                label="Video URL"
                maxLength={500}
                value={form.videoUrl}
                error={errors.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="https://..."
              />
            )}

            {form.type === 'image' && (
              <>
                <Input
                  label="Image URL"
                  maxLength={500}
                  value={form.imageUrl}
                  error={errors.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://..."
                />
                <Input
                  label="Alt Text"
                  maxLength={200}
                  value={form.alt}
                  error={errors.alt}
                  onChange={(e) => setForm({ ...form, alt: e.target.value })}
                  placeholder="Image description"
                />
                <Input
                  label="Caption"
                  maxLength={300}
                  value={form.caption}
                  error={errors.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  placeholder="Image caption"
                />
              </>
            )}

            {form.type === 'heading' && (
              <>
                <Input
                  label="Heading Text"
                  maxLength={300}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Heading text"
                />
                <Select
                  label="Heading Level"
                  value={form.headingLevel}
                  onChange={(e) => setForm({ ...form, headingLevel: parseInt(e.target.value) })}
                  options={[
                    { value: 1, label: 'H1' },
                    { value: 2, label: 'H2' },
                    { value: 3, label: 'H3' },
                    { value: 4, label: 'H4' },
                    { value: 5, label: 'H5' },
                    { value: 6, label: 'H6' },
                  ]}
                />
              </>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Content Order"
                type="number"
                value={form.contentOrder}
                onChange={(e) => setForm({ ...form, contentOrder: parseInt(e.target.value) || 0 })}
              />
              <Select
                label="Active"
                value={form.isActive ? 'true' : 'false'}
                onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                options={[
                  { value: 'true', label: 'Yes' },
                  { value: 'false', label: 'No' },
                ]}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-brand-border dark:border-slate-800">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 border border-brand-border dark:border-slate-800 rounded-xl bg-brand-surface dark:bg-slate-950 max-h-[500px] overflow-y-auto scrollbar-thin">
            <PreviewContentBox content={{ ...content, ...form }} />
          </div>
        )}
      </motion.div>
    </div>
  );
}

function PreviewContentBox({ content }) {
  switch (content.type) {
    case 'video':
      return (
        <div className="aspect-video bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white p-4 relative">
          <Video className="h-12 w-12 text-white/50 mb-2" />
          <p className="font-semibold text-sm">Video Stream Workspace</p>
          <p className="text-xs text-slate-400 mt-1">Duration: {content.duration || '10:00'}</p>
        </div>
      );
    case 'pdf':
    case 'ppt':
    case 'doc':
      return (
        <div className="p-10 border border-brand-border dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-center">
          <FileText className="h-12 w-12 mx-auto text-brand-primary dark:text-brand-secondary mb-2" />
          <p className="font-semibold text-sm text-brand-text-primary dark:text-slate-200">Document Reader View</p>
          <p className="text-xs text-brand-text-secondary dark:text-slate-400 mt-1">
            {content.pageCount ? `${content.pageCount} pages` : content.slideCount ? `${content.slideCount} slides` : 'Ready to read'}
          </p>
        </div>
      );
    case 'notes':
      return (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <h4 className="text-brand-text-primary dark:text-slate-100 font-bold border-b border-brand-border dark:border-slate-800 pb-2 mb-3">
            Markdown Notes Preview
          </h4>
          <pre className="whitespace-pre-wrap text-brand-text-primary dark:text-slate-350 text-sm font-sans bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 p-3 rounded-lg">
            {content.markdown || 'No content written yet.'}
          </pre>
        </div>
      );
    case 'image':
      return (
        <div className="rounded-lg overflow-hidden border border-brand-border dark:border-slate-800">
          <img src={content.fileUrl || 'https://picsum.photos/600/400'} alt="" className="w-full h-auto object-cover max-h-[350px]" />
        </div>
      );
    case 'link':
      return (
        <div className="rounded-lg border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-surface dark:bg-slate-950 text-brand-primary dark:text-brand-secondary">
              <Link className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate">{content.title}</p>
              <a href={content.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-primary dark:text-brand-secondary hover:underline truncate block">
                {content.fileUrl || 'https://link.com'}
              </a>
            </div>
            <ExternalLink className="h-4 w-4 text-brand-text-secondary dark:text-slate-500" />
          </div>
        </div>
      );
    default:
      return null;
  }
}
