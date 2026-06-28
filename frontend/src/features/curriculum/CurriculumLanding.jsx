'use client';

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, BookOpen, FileStack, FolderTree, ArrowRight, PlayCircle, Clock } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { countCourseStats } from '@/utils';
import PageHeader from '@/components/layout/PageHeader';
import Breadcrumb from '@/components/layout/Breadcrumb';
import SearchBar from '@/components/ui/SearchBar';
import FilterDropdown from '@/components/ui/FilterDropdown';
import EmptyState from '@/components/ui/EmptyState';
import Badge, { CourseStatusBadge } from '@/components/ui/Badge';

export default function CurriculumLanding() {
  const { courses, categories, hydrated } = useCatalog();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const liveCourses = useMemo(() => courses.filter((c) => !c.deletedAt), [courses]);

  const totals = useMemo(() => {
    let modules = 0, submodules = 0, contents = 0;
    liveCourses.forEach((c) => {
      const s = countCourseStats(c);
      modules += s.moduleCount;
      submodules += s.submoduleCount;
      contents += s.contentCount;
    });
    return { modules, submodules, contents };
  }, [liveCourses]);

  const filtered = useMemo(() => {
    return liveCourses.filter((c) => {
      const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'all' || String(c.categoryId) === String(categoryFilter);
      return matchSearch && matchCategory;
    });
  }, [liveCourses, search, categoryFilter]);

  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || '—';
  const getCategoryColor = (id) => categories.find((c) => c.id === id)?.color || '#0EA89C';

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-brand-surface p-6 lg:p-8">
      <PageHeader title="Curriculum" subtitle="Pick a course to manage its modules and content" />
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Curriculum' }]} />

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-primary dark:text-slate-100">Curriculum Builder</h2>
            <p className="text-sm text-brand-text-secondary dark:text-slate-400">Select a course below to manage its modules, submodules and content blocks</p>
          </div>
          <div className="flex gap-2">
            <Badge color="purple"><Layers className="h-3 w-3" /> {totals.modules} modules</Badge>
            <Badge color="teal"><FileStack className="h-3 w-3" /> {totals.submodules} submodules</Badge>
            <Badge color="orange"><BookOpen className="h-3 w-3" /> {totals.contents} content items</Badge>
          </div>
        </motion.div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar value={search} onChange={setSearch} placeholder="Search courses..." className="flex-1" />
          <FilterDropdown
            label="Category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[{ value: 'all', label: 'All Categories' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Layers} title="No courses found" description="Create a course first, then come back here to build its curriculum." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((course, idx) => {
              const stats = countCourseStats(course);
              const color = getCategoryColor(course.categoryId);
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  whileHover={{ y: -3 }}
                  onClick={() => navigate(`/catalog/courses/${course.id}`)}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card hover:shadow-card-hover transition-all"
                >
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img src={course.thumbnail} alt="" className="h-full w-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <PlayCircle className="absolute bottom-3 left-3 h-7 w-7 text-white/90 drop-shadow" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white" style={{ backgroundColor: color }}>
                        {getCategoryName(course.categoryId)}
                      </span>
                      <CourseStatusBadge status={course.status} />
                    </div>
                    <h3 className="font-bold text-brand-text-primary dark:text-slate-100 truncate">{course.title}</h3>
                    <p className="mt-1 text-xs text-brand-text-secondary dark:text-slate-400 line-clamp-2 min-h-[2rem]">{course.shortDescription}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-brand-border dark:border-slate-800 pt-3">
                      <div className="flex items-center gap-3 text-xs text-brand-text-secondary dark:text-slate-400">
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{course.duration}</span>
                        <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" />{stats.moduleCount} modules</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs font-semibold text-accent-teal-dark">
                        Manage <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
