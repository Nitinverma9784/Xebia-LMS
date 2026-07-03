'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, LayoutGrid, List, ArrowRight, BookOpen, Clock, Award, PlayCircle } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import { useCatalog } from '@/hooks/useCatalog';
import { Link } from 'react-router-dom';

export default function StudentCoursesPage() {
  const { courses, categories } = useCatalog();
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter only active/published courses created by Admin
  const publishedCourses = useMemo(() => {
    return (courses || []).filter(c => c.status === 'published' || c.status === 'active' || !c.status);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return publishedCourses.filter((course) => {
      const catName = course.category?.name || course.category || '';
      const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) || catName.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || catName.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [publishedCourses, search, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] p-6 lg:p-8 text-slate-800 dark:text-[#F8FAFC]">
      <PageHeader
        title="My Courses & Learning Paths"
        subtitle="Explore real-time enterprise training courses and skill programs published by your organization."
      />

      {/* Filter and View Control Bar */}
      <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search live courses or topics..."
            className="w-full rounded-full border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#111827] px-4 py-2 pl-10 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none focus:border-[#7C3AED]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#111827] px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-[#CBD5E1]">
            <Filter className="h-3.5 w-3.5 text-purple-600" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs font-bold outline-none cursor-pointer"
            >
              <option value="All">All Categories ({categories?.length || 0})</option>
              {categories?.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </label>

          <div className="flex rounded-full border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#111827] p-1">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`rounded-full p-2 cursor-pointer transition-colors ${view === 'grid' ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-slate-400'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`rounded-full p-2 cursor-pointer transition-colors ${view === 'list' ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-slate-400'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Courses List / Grid Display */}
      {filteredCourses.length === 0 ? (
        <div className="mt-12 text-center p-12 rounded-3xl border border-dashed border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] max-w-md mx-auto">
          <BookOpen className="h-10 w-10 text-purple-500 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No Courses Available</h3>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1">
            There are currently no published courses matching your filter criteria. When an Admin publishes a new course, it will automatically appear here.
          </p>
        </div>
      ) : (
        <div className={`mt-6 grid gap-6 ${view === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredCourses.map((course) => {
            const categoryName = typeof course.category === 'object' ? course.category?.name : (course.category || 'General');
            const totalModules = course.modules?.length || 0;
            return (
              <motion.article
                key={course.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] shadow-sm hover:shadow-xl hover:border-purple-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
                      alt={course.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-white/90 backdrop-blur-md text-purple-900 shadow-sm">
                      {categoryName}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="text-base font-black text-slate-900 dark:text-[#F8FAFC] group-hover:text-purple-600 transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#CBD5E1] line-clamp-2 leading-relaxed">
                      {course.description || 'No course overview provided yet.'}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-semibold text-slate-500 dark:text-[#CBD5E1] border-t border-slate-100 dark:border-[#334155]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-purple-500" />
                        <span>{course.duration || '2 hours'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-purple-500" />
                        <span>{totalModules} Modules</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    to={`/student/courses/${course.id}`}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-md transition-all hover:opacity-90 cursor-pointer"
                    style={{ backgroundColor: '#7C3AED' }}
                  >
                    <PlayCircle className="h-4 w-4" /> Start Learning Path <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}
