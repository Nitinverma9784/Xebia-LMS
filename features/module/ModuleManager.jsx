'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, GripVertical, Pencil, Copy, Trash2 } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Select from '@/components/ui/Select';
import { CourseStatusBadge } from '@/components/ui/Badge';

function SortableRow({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <tr ref={setNodeRef} style={style} className="border-b border-brand-border dark:border-slate-800 hover:bg-brand-surface/40 dark:hover:bg-slate-800/40">
      <td className="px-4 py-3 cursor-grab" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4 text-brand-text-secondary dark:text-slate-500" />
      </td>
      {children}
    </tr>
  );
}

export default function ModuleManager({ module, courseId, catalog, showToast, onSelect }) {
  const [form, setForm] = useState({ title: '', description: '', moduleOrder: 0, isActive: true });
  const [errors, setErrors] = useState({});
  const [editingSub, setEditingSub] = useState(null);
  const [subForm, setSubForm] = useState({ title: '', description: '', slug: '', isActive: true });

  const course = catalog.courses?.find((c) => c.id === courseId);
  const courseTitle = course?.title || 'Course';

  useEffect(() => {
    if (module) {
      setForm({
        title: module.title || '',
        description: module.description || '',
        moduleOrder: module.moduleOrder || 0,
        isActive: module.isActive ?? true,
      });
      setErrors({});
    }
  }, [module]);

  if (!module) return null;

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Module name is required';
    if (form.title.length > 200) e.title = 'Maximum 200 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveModule = () => {
    if (!validate()) return;
    catalog.updateModule(courseId, module.id, form);
    showToast('Module details updated');
  };

  const handleAddSubmodule = () => {
    catalog.addSubmodule(courseId, module.id, {
      title: 'New Submodule',
      description: 'Structured learning unit.',
      slug: 'new-submodule',
    });
    showToast('Submodule created successfully');
  };

  const handleEditSubmodule = (sub) => {
    setSubForm({ title: sub.title, description: sub.description, slug: sub.slug || '', isActive: sub.isActive ?? true });
    setEditingSub(sub.id);
  };

  const handleSaveSubmodule = () => {
    if (!subForm.title.trim()) return;
    catalog.updateSubmodule(courseId, module.id, editingSub, subForm);
    setEditingSub(null);
    showToast('Submodule updated');
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const subIds = (module.submodules || []).map((s) => s.id);
    const oldIndex = subIds.indexOf(active.id);
    const newIndex = subIds.indexOf(over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = [...subIds];
      reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, active.id);
      catalog.reorderSubmodules(courseId, module.id, reordered);
      showToast('Submodule order updated');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const submodules = module.submodules || [];

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
        <span className="text-brand-text-primary dark:text-slate-200 truncate max-w-[200px]">
          {module.title}
        </span>
      </div>

      {/* Module Edit Form */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card"
      >
        <h3 className="text-lg font-semibold text-brand-text-primary dark:text-slate-100 mb-4">Module Settings</h3>
        <div className="space-y-4">
          <Input
            label="Module Name"
            required
            maxLength={200}
            value={form.title}
            error={errors.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <TextArea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label="Module Order"
            type="number"
            value={form.moduleOrder}
            onChange={(e) => setForm({ ...form, moduleOrder: parseInt(e.target.value) || 0 })}
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
          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveModule}>Save Settings</Button>
          </div>
        </div>
      </motion.div>

      {/* Submodule Section */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-brand-text-primary dark:text-slate-100">Submodules</h3>
            <p className="text-xs text-brand-text-secondary dark:text-slate-400">Drag rows to reorder</p>
          </div>
          <Button size="sm" onClick={handleAddSubmodule}>
            <Plus className="h-4 w-4" /> Add Submodule
          </Button>
        </div>

        {submodules.length === 0 ? (
          <div className="text-center py-8 text-sm text-brand-text-secondary dark:text-slate-400 border-2 border-dashed border-brand-border dark:border-slate-800 rounded-xl">
            No submodules inside this module yet. Click Add Submodule to create one.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full text-sm">
              <thead className="bg-brand-surface dark:bg-slate-950 border-b border-brand-border dark:border-slate-800 text-left font-semibold">
                <tr>
                  <th className="w-10 px-4 py-3" />
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Contents</th>
                  <th className="px-4 py-3">Active</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={submodules.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    {submodules.map((sub) => {
                      const isEditing = editingSub === sub.id;
                      return (
                        <SortableRow key={sub.id} id={sub.id}>
                          <td className="px-4 py-3 font-medium">
                            {isEditing ? (
                              <input
                                autoFocus
                                value={subForm.title}
                                onChange={(e) => setSubForm({ ...subForm, title: e.target.value })}
                                className="rounded border border-brand-primary dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm text-brand-text-primary dark:text-slate-100"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => onSelect?.({ type: 'submodule', id: sub.id, moduleId: module.id })}
                                className="font-semibold text-brand-primary dark:text-brand-secondary hover:underline text-left transition-colors focus:outline-none"
                              >
                                {sub.title}
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3 text-brand-text-secondary dark:text-slate-400">
                            {isEditing ? (
                              <input
                                value={subForm.description}
                                onChange={(e) => setSubForm({ ...subForm, description: e.target.value })}
                                className="rounded border border-brand-primary dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm text-brand-text-primary dark:text-slate-100 w-full"
                              />
                            ) : sub.description ? (
                              <button
                                type="button"
                                onClick={() => onSelect?.({ type: 'submodule', id: sub.id, moduleId: module.id })}
                                className="hover:text-brand-primary dark:hover:text-brand-secondary text-left transition-colors focus:outline-none w-full"
                              >
                                {sub.description}
                              </button>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-4 py-3 text-brand-text-secondary dark:text-slate-400">
                            {sub.contents?.length || 0} items
                          </td>
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <select
                                value={subForm.isActive ? 'true' : 'false'}
                                onChange={(e) => setSubForm({ ...subForm, isActive: e.target.value === 'true' })}
                                className="rounded border border-brand-primary dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm text-brand-text-primary dark:text-slate-100"
                              >
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                              </select>
                            ) : (
                              <span className={sub.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                                {sub.isActive ? 'Yes' : 'No'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <div className="flex gap-1.5">
                                <Button size="xs" onClick={handleSaveSubmodule}>Save</Button>
                                <Button size="xs" variant="outline" onClick={() => setEditingSub(null)}>Cancel</Button>
                              </div>
                            ) : (
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditSubmodule(sub)}
                                  className="rounded p-1 hover:bg-brand-surface dark:hover:bg-slate-800"
                                  title="Edit Submodule"
                                >
                                  <Pencil className="h-4 w-4 text-brand-text-secondary dark:text-slate-400" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    catalog.duplicateSubmodule(courseId, module.id, sub.id);
                                    showToast('Submodule duplicated');
                                  }}
                                  className="rounded p-1 hover:bg-brand-surface dark:hover:bg-slate-800"
                                  title="Duplicate Submodule"
                                >
                                  <Copy className="h-4 w-4 text-brand-text-secondary dark:text-slate-400" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    catalog.deleteSubmodule(courseId, module.id, sub.id);
                                    showToast('Submodule deleted');
                                  }}
                                  className="rounded p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-650 dark:text-red-400"
                                  title="Delete Submodule"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </SortableRow>
                      );
                    })}
                  </SortableContext>
                </DndContext>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
