'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Upload, Copy, Send, Archive, Layers, FileStack, UploadCloud, ArrowLeft, Bookmark, Sun, Moon
} from 'lucide-react';
import { cn, getTechLogoUrl, formatDateTime, countCourseStats } from '@/utils';
import { CourseStatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import CourseHierarchyTree from '@/components/builder/CourseHierarchyTree';
import CourseDashboardCards, { CourseStatistics } from '@/components/builder/CourseDashboardCards';
import ContentCard from '@/components/builder/ContentCard';
import ContentPreviewDrawer from '@/components/builder/ContentPreviewDrawer';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Select from '@/components/ui/Select';
import { ConfirmationDialog } from '@/components/ui/Modal';
import { CONTENT_TYPES } from '@/constants';
import Link from 'next/link';

// Import New Managers
import ModuleManager from '@/features/module/ModuleManager';
import SubmoduleManager from '@/features/submodule/SubmoduleManager';
import ContentManager from '@/features/content/ContentManager';
import CoursePublishDialog from '@/components/builder/CoursePublishDialog';

export default function CourseBuilderWorkspace({ course, category, students, catalog, showToast }) {
  const [selected, setSelected] = useState({ type: 'course', id: course.id });
  const [activeTab, setActiveTab] = useState('overview');
  const [previewContent, setPreviewContent] = useState(null);
  const [contentModal, setContentModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [bulkSelected, setBulkSelected] = useState([]);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [contentForm, setContentForm] = useState({ title: '', type: 'notes', markdown: '', moduleId: '', submoduleId: '' });
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(savedTheme || systemTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const stats = countCourseStats(course);

  const handleSelect = (node) => {
    setSelected({ type: node.type, id: node.id, moduleId: node.moduleId, submoduleId: node.submoduleId, contentId: node.contentId });
    if (node.type === 'content') setActiveTab('content');
    else if (node.type === 'submodule') setActiveTab('submodule');
    else if (node.type === 'module') setActiveTab('module');
    else setActiveTab('overview');
  };

  const getSelectedData = () => {
    if (selected.type === 'course') return { type: 'course', data: course };
    const mod = course.modules?.find((m) => m.id === selected.id || m.id === selected.moduleId);
    if (selected.type === 'module') return { type: 'module', data: mod };
    const sub = mod?.submodules?.find((s) => s.id === selected.id || s.id === selected.submoduleId);
    if (selected.type === 'submodule') return { type: 'submodule', data: sub, moduleId: mod?.id };
    const ct = sub?.contents?.find((c) => c.id === selected.contentId || c.id === selected.id);
    if (selected.type === 'content') return { type: 'content', data: ct, moduleId: mod?.id, submoduleId: sub?.id };
    return { type: 'course', data: course };
  };

  const selectedData = getSelectedData();

  const handleStatusChange = (status) => {
    catalog.updateCourse(course.id, { status });
    showToast(`Course status updated to ${status.replace('_', ' ')}`);
  };

  const handleAddContent = (moduleId, submoduleId, item = null) => {
    let modId = moduleId;
    let subId = submoduleId;
    
    if (!modId || !subId) {
      // Find first submodule available
      const firstMod = course.modules?.[0];
      const firstSub = firstMod?.submodules?.[0];
      if (firstMod && firstSub) {
        modId = firstMod.id;
        subId = firstSub.id;
      } else {
        showToast('Create a module and submodule first', 'info');
        return;
      }
    }

    if (item) {
      setContentForm({
        id: item.id,
        title: item.title,
        type: item.type,
        markdown: item.markdown || '',
        fileUrl: item.fileUrl || '',
        moduleId: modId,
        submoduleId: subId
      });
    } else {
      setContentForm({ title: '', type: 'notes', markdown: '', fileUrl: '', moduleId: modId, submoduleId: subId });
    }
    setContentModal(true);
  };

  const handleSaveContent = () => {
    if (!contentForm.title.trim()) return;
    if (contentForm.id) {
      catalog.updateContent(course.id, contentForm.moduleId, contentForm.submoduleId, contentForm.id, contentForm);
      showToast('Content updated successfully');
    } else {
      catalog.addContent(course.id, contentForm.moduleId, contentForm.submoduleId, contentForm);
      showToast('Content added successfully');
    }
    setContentModal(false);
  };

  const handleDelete = (node) => {
    setDeleteConfirm(node);
  };

  const confirmDelete = () => {
    const node = deleteConfirm;
    if (node.type === 'module') catalog.deleteModule(course.id, node.id);
    else if (node.type === 'submodule') catalog.deleteSubmodule(course.id, node.moduleId, node.id);
    else if (node.type === 'content') catalog.deleteContent(course.id, node.moduleId, node.submoduleId, node.contentId || node.id);
    setDeleteConfirm(null);
    setSelected({ type: 'course', id: course.id });
    showToast('Item deleted');
  };

  const handleRename = (node, newLabel) => {
    if (node.type === 'module') catalog.updateModule(course.id, node.id, { title: newLabel });
    else if (node.type === 'submodule') catalog.updateSubmodule(course.id, node.moduleId, node.id, { title: newLabel });
    else if (node.type === 'content') catalog.updateContent(course.id, node.moduleId, node.submoduleId, node.contentId || node.id, { title: newLabel });
    else if (node.type === 'course') catalog.updateCourse(course.id, { title: newLabel });
    showToast('Renamed successfully');
  };

  const handleDuplicate = (node) => {
    if (node.type === 'module') {
      catalog.duplicateModule(course.id, node.id);
      showToast('Module duplicated');
    } else if (node.type === 'submodule') {
      catalog.duplicateSubmodule(course.id, node.moduleId, node.id);
      showToast('Submodule duplicated');
    } else if (node.type === 'content') {
      catalog.duplicateContent(course.id, node.moduleId, node.submoduleId, node.contentId || node.id);
      showToast('Content duplicated');
    } else if (node.type === 'course') {
      catalog.duplicateCourse(course.id, { withContent: true });
      showToast('Course duplicated');
    }
  };

  const enrolledStudents = students.slice(0, Math.min(20, course.enrolledStudents || 20));

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-brand-surface dark:bg-slate-950 transition-colors">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 border-b border-brand-border dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link href={`/catalog/categories/${course.categoryId}`} className="p-2 hover:bg-brand-surface dark:hover:bg-slate-800 rounded-lg text-brand-text-secondary dark:text-slate-400">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <img src={course.thumbnail} alt="" className="h-12 w-20 rounded-lg object-cover hidden sm:block border border-brand-border dark:border-slate-800" />
          <img src={getTechLogoUrl(course.technology)} alt="" className="h-10 w-10 rounded-lg bg-brand-surface dark:bg-slate-800 p-1.5 border border-brand-border dark:border-slate-800" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-brand-text-primary dark:text-slate-100 truncate">{course.title}</h1>
              <CourseStatusBadge status={course.status} />
            </div>
            <p className="text-xs text-brand-text-secondary dark:text-slate-400">
              {stats.moduleCount} Modules · {stats.submoduleCount} Submodules · {course.enrolledStudents || 0} Students · Updated {formatDateTime(course.updatedAt)}
            </p>
          </div>
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl p-2 text-brand-text-secondary dark:text-slate-400 hover:bg-brand-surface dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-slate-600" />}
          </button>
        </div>
        {/* Toolbar */}
        <div className="flex items-center gap-2 overflow-x-auto px-4 pb-3 scrollbar-thin">
          <Button size="sm" onClick={() => catalog.addModule(course.id) && showToast('Module created')}>
            <Plus className="h-3.5 w-3.5" /> Module
          </Button>
          <Button size="sm" variant="outline" onClick={() => {
            const mod = course.modules?.[0];
            if (mod) { catalog.addSubmodule(course.id, mod.id); showToast('Submodule created'); }
            else showToast('Create a module first', 'info');
          }}>
            <FileStack className="h-3.5 w-3.5" /> Submodule
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleAddContent(selectedData.moduleId, selectedData.submoduleId)}>
            <Upload className="h-3.5 w-3.5" /> Content
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleDuplicate({ type: 'course', id: course.id })}>
            <Copy className="h-3.5 w-3.5" /> Duplicate
          </Button>
          {course.status !== 'archived' ? (
            <Button size="sm" variant={course.status === 'draft' ? 'secondary' : 'cta'} onClick={() => setPublishDialogOpen(true)}>
              <Send className="h-3.5 w-3.5" /> Publish Console
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => handleStatusChange('draft')}>
              Restore to Draft
            </Button>
          )}
        </div>
      </div>

      {/* 3-Panel Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Tree */}
        <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900">
          <CourseHierarchyTree
            course={course}
            selected={selected}
            onSelect={handleSelect}
            onAddModule={() => { catalog.addModule(course.id); showToast('Module created'); }}
            onAddSubmodule={(moduleId) => { catalog.addSubmodule(course.id, moduleId); showToast('Submodule created'); }}
            onAddContent={handleAddContent}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onRename={handleRename}
            onReorderModules={(ids) => catalog.reorderModules(course.id, ids)}
            onReorderSubmodules={(modId, ids) => catalog.reorderSubmodules(course.id, modId, ids)}
            onReorderContent={(modId, subId, ids) => catalog.reorderContent(course.id, modId, subId, ids)}
          />
        </aside>

        {/* Center Panel */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 lg:p-6 bg-brand-surface dark:bg-slate-950 transition-colors">
          <CenterPanel
            course={course}
            selected={selected}
            selectedData={selectedData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            catalog={catalog}
            showToast={showToast}
            onPreview={setPreviewContent}
            onAddContent={handleAddContent}
            enrolledStudents={enrolledStudents}
            bulkSelected={bulkSelected}
            setBulkSelected={setBulkSelected}
            onSelect={handleSelect}
          />
        </main>

        {/* Right Panel: Metadata & Stats */}
        <aside className="hidden xl:flex w-72 shrink-0 flex-col border-l border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-4 overflow-y-auto scrollbar-thin">
          <h3 className="text-sm font-semibold text-brand-text-primary dark:text-slate-100 mb-3">Metadata</h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-brand-text-secondary dark:text-slate-400">Category</dt>
              <dd className="font-semibold text-brand-text-primary dark:text-slate-200">{category?.name}</dd>
            </div>
            <div>
              <dt className="text-brand-text-secondary dark:text-slate-400">Technology</dt>
              <dd className="font-semibold text-brand-text-primary dark:text-slate-200">{course.technology}</dd>
            </div>
            <div>
              <dt className="text-brand-text-secondary dark:text-slate-400">Difficulty</dt>
              <dd className="font-semibold text-brand-text-primary dark:text-slate-200">{course.difficulty}</dd>
            </div>
            <div>
              <dt className="text-brand-text-secondary dark:text-slate-400">Language</dt>
              <dd className="font-semibold text-brand-text-primary dark:text-slate-200">{course.language}</dd>
            </div>
            <div>
              <dt className="text-brand-text-secondary dark:text-slate-400">Created By</dt>
              <dd className="font-semibold text-brand-text-primary dark:text-slate-200">{course.createdBy}</dd>
            </div>
            <div>
              <dt className="text-brand-text-secondary dark:text-slate-400">Created</dt>
              <dd className="font-semibold text-brand-text-primary dark:text-slate-200">{formatDateTime(course.createdAt)}</dd>
            </div>
          </dl>
          
          <h3 className="text-sm font-semibold text-brand-text-primary dark:text-slate-100 mt-6 mb-3">Statistics</h3>
          <CourseStatistics course={course} />
          
          <h3 className="text-sm font-semibold text-brand-text-primary dark:text-slate-100 mt-6 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleStatusChange('draft')}>
              <Bookmark className="h-4 w-4 mr-2 text-brand-text-secondary" /> Save Draft
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => catalog.duplicateCourse(course.id, { withContent: true }) && showToast('Duplicated with content')}>
              <Copy className="h-4 w-4 mr-2 text-brand-text-secondary" /> Duplicate With Content
            </Button>
          </div>
        </aside>
      </div>

      {/* Slide-over Content Preview Drawer */}
      <ContentPreviewDrawer content={previewContent} open={!!previewContent} onClose={() => setPreviewContent(null)} />

      {/* Publish Dialog checklist wizard */}
      <CoursePublishDialog
        course={course}
        open={publishDialogOpen}
        onClose={() => setPublishDialogOpen(false)}
        onConfirm={handleStatusChange}
      />

      {/* Add Content Modal */}
      <Modal
        open={contentModal}
        onClose={() => setContentModal(false)}
        title={contentForm.id ? "Edit Content" : "Add Content Block"}
        footer={
          <>
            <Button variant="outline" onClick={() => setContentModal(false)}>Cancel</Button>
            <Button onClick={handleSaveContent}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Title" required value={contentForm.title} onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })} />
          <Select label="Type" value={contentForm.type} onChange={(e) => setContentForm({ ...contentForm, type: e.target.value })} options={CONTENT_TYPES.map((t) => ({ value: t.value, label: t.label }))} />
          {contentForm.type === 'notes' && (
            <TextArea label="Content (Markdown)" rows={8} value={contentForm.markdown} onChange={(e) => setContentForm({ ...contentForm, markdown: e.target.value })} />
          )}
        </div>
      </Modal>

      {/* Deletion confirmation dialog */}
      <ConfirmationDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Item Confirmation"
        message="Are you sure you want to delete this element? All nested child records will be permanently removed."
        confirmLabel="Delete"
      />
    </div>
  );
}

function CenterPanel({
  course, selected, selectedData, activeTab, setActiveTab, catalog, showToast,
  onPreview, onAddContent, enrolledStudents, bulkSelected, setBulkSelected, onSelect,
}) {
  const tabs = ['overview', 'students', 'content'];

  if (selectedData.type === 'module') {
    return (
      <ModuleManager
        module={selectedData.data}
        courseId={course.id}
        catalog={catalog}
        showToast={showToast}
        onSelect={onSelect}
      />
    );
  }

  if (selectedData.type === 'submodule') {
    return (
      <SubmoduleManager
        submodule={selectedData.data}
        moduleId={selectedData.moduleId}
        courseId={course.id}
        catalog={catalog}
        showToast={showToast}
        onPreview={onPreview}
        onAddContent={onAddContent}
        onSelect={onSelect}
      />
    );
  }

  if (selectedData.type === 'content') {
    return (
      <ContentManager
        content={selectedData.data}
        submoduleId={selectedData.submoduleId}
        moduleId={selectedData.moduleId}
        courseId={course.id}
        catalog={catalog}
        showToast={showToast}
        onPreview={onPreview}
        onSelect={onSelect}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex gap-2 mb-6 border-b border-brand-border dark:border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-semibold capitalize border-b-2 -mb-px transition-colors',
              activeTab === tab 
                ? 'border-brand-primary dark:border-brand-secondary text-brand-primary dark:text-slate-100' 
                : 'border-transparent text-brand-text-secondary dark:text-slate-400 hover:text-brand-text-primary dark:hover:text-slate-100'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <CourseDashboardCards course={course} />
          {!(course.modules?.length) && (
            <EmptyState
              icon={Layers}
              title="Create your first module"
              description="Start building your course by adding modules and organizing content."
              actionLabel="Create Module"
              onAction={() => { catalog.addModule(course.id); showToast('Module created'); }}
            />
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <StudentsPanel students={enrolledStudents} />
      )}

      {activeTab === 'content' && (
        <AllContentPanel course={course} onPreview={onPreview} catalog={catalog} showToast={showToast} />
      )}
    </motion.div>
  );
}

function StudentsPanel({ students }) {
  const [view, setView] = useState('table');
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-brand-text-primary dark:text-slate-100">Enrolled Students Preview</h3>
        <div className="flex rounded-lg border border-brand-border dark:border-slate-800 p-0.5 bg-white dark:bg-slate-900">
          <button type="button" onClick={() => setView('table')} className={cn('px-3 py-1 text-xs rounded-md font-medium', view === 'table' ? 'bg-brand-primary text-white' : 'text-brand-text-secondary dark:text-slate-400')}>Table</button>
          <button type="button" onClick={() => setView('card')} className={cn('px-3 py-1 text-xs rounded-md font-medium', view === 'card' ? 'bg-brand-primary text-white' : 'text-brand-text-secondary dark:text-slate-400')}>Cards</button>
        </div>
      </div>
      
      {view === 'table' ? (
        <div className="overflow-x-auto rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-brand-surface dark:bg-slate-950 border-b border-brand-border dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Student</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Progress</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-brand-border dark:border-slate-800 last:border-0 hover:bg-brand-surface/40 dark:hover:bg-slate-850/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={s.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                      <span className="font-semibold text-brand-text-primary dark:text-slate-200">{s.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-brand-text-secondary dark:text-slate-400">{s.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-brand-surface dark:bg-slate-800"><div className="h-full rounded-full bg-brand-success" style={{ width: `${s.progress}%` }} /></div>
                      <span className="font-medium text-brand-text-primary dark:text-slate-300">{s.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><CourseStatusBadge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((s) => (
            <div key={s.id} className="rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card">
              <div className="flex items-center gap-3">
                <img src={s.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="font-semibold text-brand-text-primary dark:text-slate-200 truncate">{s.fullName}</p>
                  <p className="text-xs text-brand-text-secondary dark:text-slate-400 truncate">{s.email}</p>
                </div>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-brand-surface dark:bg-slate-800"><div className="h-full rounded-full bg-brand-success" style={{ width: `${s.progress}%` }} /></div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-brand-text-secondary dark:text-slate-400">{s.progress}% complete</span>
                <CourseStatusBadge status={s.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AllContentPanel({ course, onPreview, catalog, showToast }) {
  const allContent = (course.modules || []).flatMap((m) =>
    (m.submodules || []).flatMap((s) =>
      (s.contents || []).map((c) => ({ ...c, moduleTitle: m.title, submoduleTitle: s.title, moduleId: m.id, submoduleId: s.id }))
    )
  );
  if (!allContent.length) {
    return <EmptyState icon={UploadCloud} title="No content available" description="Add content blocks inside submodules to see them summarized here." />;
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {allContent.map((ct) => (
        <ContentCard
          key={ct.id}
          content={ct}
          onPreview={onPreview}
          onEdit={() => showToast('Click item in Hierarchy to edit directly', 'info')}
          onDelete={() => {
            catalog.deleteContent(course.id, ct.moduleId, ct.submoduleId, ct.id);
            showToast('Content item deleted');
          }}
        />
      ))}
    </div>
  );
}
