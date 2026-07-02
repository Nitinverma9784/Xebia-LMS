import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, LayoutGrid, List, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import { courses } from '@/services/studentMockData';

export default function StudentCoursesPage() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');
  const [status, setStatus] = useState('All');

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) || course.category.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'All' || course.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  return (
    <div className="min-h-screen bg-brand-surface/60 p-6 lg:p-8">
      <PageHeader title="My Courses" subtitle="Browse, resume, and manage all your enrolled learning paths." />
      <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-brand-border/70 bg-white p-4 shadow-card lg:flex-row lg:items-center lg:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-secondary" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses" className="w-full rounded-full border border-brand-border bg-brand-surface px-4 py-2 pl-10 text-sm" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-full border border-brand-border bg-brand-surface px-3 py-2 text-sm">
            <Filter className="h-4 w-4" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-transparent text-sm outline-none">
              <option>All</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </label>
          <div className="flex rounded-full border border-brand-border bg-brand-surface p-1">
            <button onClick={() => setView('grid')} className={`rounded-full p-2 ${view === 'grid' ? 'bg-brand-primary text-white' : 'text-brand-text-secondary'}`}><LayoutGrid className="h-4 w-4" /></button>
            <button onClick={() => setView('list')} className={`rounded-full p-2 ${view === 'list' ? 'bg-brand-primary text-white' : 'text-brand-text-secondary'}`}><List className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      <div className={`mt-6 grid gap-6 ${view === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
        {filteredCourses.map((course) => (
          <motion.article key={course.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-3xl border border-brand-border/70 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
            <img src={course.thumbnail} alt={course.title} className="h-40 w-full object-cover" />
            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-brand-primary">{course.category}</p>
                <span className="rounded-full bg-brand-surface px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-text-secondary">{course.status}</span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-brand-text-primary dark:text-slate-100">{course.title}</h3>
              <p className="mt-2 text-sm text-brand-text-secondary">{course.description}</p>
              <div className="mt-3 space-y-2 text-sm text-brand-text-secondary">
                <div className="flex items-center justify-between"><span>Trainer</span><span className="font-semibold text-brand-text-primary">{course.trainer}</span></div>
                <div className="flex items-center justify-between"><span>Duration</span><span className="font-semibold text-brand-text-primary">{course.duration}</span></div>
                <div className="flex items-center justify-between"><span>Lessons</span><span className="font-semibold text-brand-text-primary">{course.lessonsCompleted}</span></div>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs font-semibold text-brand-text-secondary">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-brand-border/70">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-primary to-accent-teal" style={{ width: `${course.progress}%` }} />
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs text-brand-text-secondary">Last accessed {course.lastAccessed}</span>
                <Button size="sm">Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
