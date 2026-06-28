'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, GripVertical, Pencil, Copy, Trash2, Eye, Download, ShieldAlert, CheckCircle, X, FileStack, BookOpen } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Toggle from '@/components/ui/Toggle';
import SectionCard from '@/components/ui/SectionCard';
import { CourseStatusBadge } from '@/components/ui/Badge';
import ContentCard from '@/components/builder/ContentCard';

function SortableContentWrapper({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div {...attributes} {...listeners} className="absolute top-3 right-10 z-10 p-1 rounded hover:bg-brand-surface dark:hover:bg-slate-800 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4 text-brand-text-secondary dark:text-slate-500" />
      </div>
      {children}
    </div>
  );
}

import { getAIPlaceholderImage } from '@/utils/placeholderUtils';
import ImageUploader from '@/components/ui/ImageUploader';

export default function SubmoduleManager({
  submodule, moduleId, courseId, catalog, showToast, onPreview, onAddContent, onSelect,
}) {
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    status: 'active',
    logo: '',
    banner: '',
    backgroundImage: '',
    thumbnail: '',
    slug: '',
    metaTitle: '',
    metaDescription: ''
  });
  const [errors, setErrors] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);

  const course = catalog.courses?.find((c) => c.id === courseId);
  const courseTitle = course?.title || 'Course';
  const module = course?.modules?.find((m) => m.id === moduleId);
  const moduleTitle = module?.title || 'Module';

  useEffect(() => {
    if (submodule) {
      setForm({
        title: submodule.title || '',
        description: submodule.description || '',
        status: submodule.status || 'active',
        logo: submodule.logo || '',
        banner: submodule.banner || '',
        backgroundImage: submodule.backgroundImage || '',
        thumbnail: submodule.thumbnail || '',
        slug: submodule.slug || '',
        metaTitle: submodule.metaTitle || '',
        metaDescription: submodule.metaDescription || '',
      });
      setErrors({});
      setSelectedItems([]);
    }
  }, [submodule]);

  if (!submodule) return null;

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Submodule title is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveSubmodule = () => {
    if (!validate()) return;
    catalog.updateSubmodule(courseId, moduleId, submodule.id, form);
    showToast('Submodule details updated');
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const contentIds = (submodule.contents || []).map((c) => c.id);
    const oldIndex = contentIds.indexOf(active.id);
    const newIndex = contentIds.indexOf(over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = [...contentIds];
      reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, active.id);
      catalog.reorderContent(courseId, moduleId, submodule.id, reordered);
      showToast('Content order updated');
    }
  };

  const handleSelectToggle = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const contents = submodule.contents || [];
    if (selectedItems.length === contents.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(contents.map((c) => c.id));
    }
  };

  // Bulk Actions
  const handleBulkDelete = () => {
    selectedItems.forEach((id) => {
      catalog.deleteContent(courseId, moduleId, submodule.id, id);
    });
    setSelectedItems([]);
    showToast(`Deleted ${selectedItems.length} items`);
  };

  const handleBulkDuplicate = () => {
    selectedItems.forEach((id) => {
      catalog.duplicateContent(courseId, moduleId, submodule.id, id);
    });
    setSelectedItems([]);
    showToast(`Duplicated ${selectedItems.length} items`);
  };

  const handleBulkStatusChange = (status) => {
    selectedItems.forEach((id) => {
      catalog.updateContent(courseId, moduleId, submodule.id, id, { status });
    });
    setSelectedItems([]);
    showToast(`Updated status to ${status} for ${selectedItems.length} items`);
  };

  const handleBulkDownload = () => {
    const downloadables = (submodule.contents || []).filter(
      (c) => selectedItems.includes(c.id) && c.downloadEnabled
    );
    if (!downloadables.length) {
      showToast('No downloadable files selected', 'info');
      return;
    }
    showToast(`Downloading ${downloadables.length} files...`);
    downloadables.forEach((c) => {
      // Simulate file download
      const link = document.createElement('a');
      link.href = '#';
      link.setAttribute('download', c.title);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const contents = submodule.contents || [];

  return (
    <div className="space-y-6 pb-20">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-brand-text-secondary dark:text-slate-400">
        <button
          type="button"
          onClick={() => onSelect?.({ type: 'course', id: courseId })}
          className="hover:text-accent-teal-dark dark:hover:text-accent-teal transition-colors"
        >
          {courseTitle}
        </button>
        <span className="text-brand-border dark:text-slate-700">/</span>
        <button
          type="button"
          onClick={() => onSelect?.({ type: 'module', id: moduleId })}
          className="hover:text-accent-teal-dark dark:hover:text-accent-teal transition-colors truncate max-w-[150px]"
        >
          {moduleTitle}
        </button>
        <span className="text-brand-border dark:text-slate-700">/</span>
        <span className="text-brand-text-primary dark:text-slate-200 truncate max-w-[200px]">
          {submodule.title}
        </span>
      </div>

      {/* Submodule Edit Form */}
      <SectionCard icon={FileStack} title="Submodule Settings" accent="teal">
        <div className="space-y-4">
          <Input
            label="Submodule Title"
            required
            value={form.title}
            error={errors.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <TextArea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="border-t border-brand-border dark:border-slate-800 pt-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary">Submodule Graphics & Assets</h4>
            <div className="grid gap-6 sm:grid-cols-2">
              <ImageUploader 
                label="Submodule Logo"
                value={form.logo} 
                onChange={(val) => setForm({ ...form, logo: val })}
                aspectRatio="square"
              />
              <ImageUploader 
                label="Submodule Thumbnail"
                value={form.thumbnail} 
                onChange={(val) => setForm({ ...form, thumbnail: val })}
                aspectRatio="video"
              />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <ImageUploader 
                label="Submodule Banner"
                value={form.banner} 
                onChange={(val) => setForm({ ...form, banner: val })}
                aspectRatio="banner"
              />
              <ImageUploader 
                label="Submodule Background Image"
                value={form.backgroundImage} 
                onChange={(val) => setForm({ ...form, backgroundImage: val })}
                aspectRatio="banner"
              />
            </div>
          </div>

          <div className="border-t border-brand-border dark:border-slate-800 pt-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary font-mono">SEO Settings</h4>
            <div className="space-y-3">
              <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="URL friendly path (e.g. intro-to-hooks)" />
              <Input label="Meta Title" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} placeholder="SEO Title Tag" />
              <TextArea label="Meta Description" rows={2} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} placeholder="Brief search engine snippet description..." />
            </div>
          </div>

          <Toggle
            label="Active"
            description="Inactive submodules are hidden from learners."
            checked={form.status === 'active'}
            onChange={(checked) => setForm({ ...form, status: checked ? 'active' : 'inactive' })}
          />
          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveSubmodule}>Save Settings</Button>
          </div>
        </div>
      </SectionCard>

      {/* Content Section */}
      <SectionCard
        icon={BookOpen}
        title="Learning Content"
        subtitle="Manage video lectures, handouts, slides, and cheat sheets"
        accent="purple"
        delay={0.05}
        actions={<Button size="sm" onClick={() => onAddContent(moduleId, submodule.id)}><Plus className="h-4 w-4" /> Add Content Block</Button>}
      >
        {contents.length > 0 && (
          <div className="flex items-center justify-between border-b border-brand-border dark:border-slate-800 pb-3 mb-4 text-sm text-brand-text-secondary dark:text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={contents.length > 0 && selectedItems.length === contents.length}
                onChange={handleSelectAll}
                className="rounded border-brand-border dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              Select All
            </label>
            <span>{selectedItems.length} selected</span>
          </div>
        )}

        {contents.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-brand-border dark:border-slate-800 rounded-xl">
            <p className="text-sm text-brand-text-secondary dark:text-slate-400 mb-4">No content items inside this submodule.</p>
            <Button variant="outline" size="sm" onClick={() => onAddContent(moduleId, submodule.id)}>
              <Plus className="h-4 w-4" /> Upload first item
            </Button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={contents.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="grid gap-4 sm:grid-cols-2">
                {contents.map((ct) => (
                  <SortableContentWrapper key={ct.id} id={ct.id}>
                    <ContentCard
                      content={ct}
                      onPreview={onPreview}
                      onEdit={(item) => onAddContent(moduleId, submodule.id, item)}
                      onDelete={(item) => {
                        catalog.deleteContent(courseId, moduleId, submodule.id, item.id);
                        showToast('Content item deleted');
                      }}
                      onDownload={(item) => {
                        showToast(`Downloading: ${item.title}`);
                      }}
                      selected={selectedItems.includes(ct.id)}
                      onSelect={handleSelectToggle}
                    />
                  </SortableContentWrapper>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </SectionCard>
      <AnimatePresence>
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-55 flex items-center gap-4 rounded-full border border-brand-border dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-6 py-3 shadow-modal max-w-lg w-full flex-wrap sm:flex-nowrap justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-brand-text-primary dark:text-slate-200">
                {selectedItems.length} selected
              </span>
              <button
                type="button"
                onClick={() => setSelectedItems([])}
                className="rounded-full p-0.5 text-brand-text-secondary hover:bg-brand-surface dark:hover:bg-slate-800"
                aria-label="Clear selection"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
              <Button size="xs" variant="outline" onClick={handleBulkDownload} title="Download selected files">
                <Download className="h-3.5 w-3.5" />
              </Button>
              <Button size="xs" variant="outline" onClick={() => handleBulkStatusChange('active')} title="Set status to Active">
                <CheckCircle className="h-3.5 w-3.5 text-brand-success" />
              </Button>
              <Button size="xs" variant="outline" onClick={() => handleBulkStatusChange('inactive')} title="Set status to Inactive">
                <ShieldAlert className="h-3.5 w-3.5 text-brand-text-secondary" />
              </Button>
              <Button size="xs" variant="outline" onClick={handleBulkDuplicate} title="Duplicate selected items">
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button size="xs" variant="danger" onClick={handleBulkDelete} title="Delete selected items">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
