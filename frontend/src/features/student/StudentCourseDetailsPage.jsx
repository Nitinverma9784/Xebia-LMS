import { motion } from 'framer-motion';
import { PlayCircle, FileText, Presentation, NotebookText, Paperclip, ChevronLeft, ChevronRight, CheckCircle2, Bookmark, MessageSquareText } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import { courses, discussions } from '@/services/studentMockData';

export default function StudentCourseDetailsPage() {
  const course = courses[0];
  return (
    <div className="min-h-screen bg-brand-surface/60 p-6 lg:p-8">
      <PageHeader title={course.title} subtitle={course.description} />
      <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <motion.aside initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="rounded-3xl border border-brand-border/70 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <img src={course.thumbnail} alt={course.title} className="h-16 w-24 rounded-xl object-cover" />
            <div>
              <p className="text-sm font-semibold text-brand-primary">{course.category}</p>
              <h3 className="text-lg font-bold text-brand-text-primary dark:text-slate-100">{course.title}</h3>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {['Module 1: Foundations', 'Module 2: Advanced Patterns', 'Module 3: Real-world Integration'].map((item, idx) => (
              <div key={item} className="rounded-2xl border border-brand-border/70 bg-brand-surface/70 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-brand-text-primary">{item}</span>
                  {idx === 0 ? <CheckCircle2 className="h-4 w-4 text-accent-teal" /> : <PlayCircle className="h-4 w-4 text-brand-text-secondary" />}
                </div>
                <p className="mt-1 text-xs text-brand-text-secondary">Lesson {idx + 1} · 12 min</p>
              </div>
            ))}
          </div>
        </motion.aside>

        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="rounded-3xl border border-brand-border/70 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-brand-primary">Current Lesson</p>
                <h3 className="mt-1 text-xl font-bold text-brand-text-primary dark:text-slate-100">Scalable React State Management</h3>
              </div>
              <div className="rounded-full bg-brand-surface px-3 py-1 text-sm font-semibold text-brand-text-secondary">72% complete</div>
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-brand-border/70">
              <img src={course.thumbnail} alt="Course player" className="h-64 w-full object-cover" />
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-brand-border/70 bg-brand-surface/70 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-brand-text-primary"><FileText className="h-4 w-4" /> PDF Viewer</div><p className="mt-2 text-sm text-brand-text-secondary">Module notes and reference docs</p></div>
              <div className="rounded-2xl border border-brand-border/70 bg-brand-surface/70 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-brand-text-primary"><Presentation className="h-4 w-4" /> PPT Viewer</div><p className="mt-2 text-sm text-brand-text-secondary">Slides from the instructor</p></div>
              <div className="rounded-2xl border border-brand-border/70 bg-brand-surface/70 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-brand-text-primary"><Paperclip className="h-4 w-4" /> Attachments</div><p className="mt-2 text-sm text-brand-text-secondary">Resources and sample files</p></div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button size="sm"><ChevronLeft className="mr-2 h-4 w-4" />Previous Lesson</Button>
              <Button size="sm" variant="outline"><Bookmark className="mr-2 h-4 w-4" />Bookmark</Button>
              <Button size="sm" variant="outline"><NotebookText className="mr-2 h-4 w-4" />Add Notes</Button>
              <Button size="sm">Next Lesson<ChevronRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>

          <div className="rounded-3xl border border-brand-border/70 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-brand-text-primary dark:text-slate-100">Discussion</h3>
              <Button variant="outline" size="sm">Ask Question</Button>
            </div>
            <div className="mt-5 space-y-3">
              {discussions.map((discussion) => (
                <div key={discussion.id} className="rounded-2xl border border-brand-border/70 bg-brand-surface/70 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-brand-text-primary">{discussion.user}</p>
                    <span className="text-xs text-brand-text-secondary">{discussion.time}</span>
                  </div>
                  <p className="mt-2 text-sm text-brand-text-secondary">{discussion.message}</p>
                  <div className="mt-3 flex items-center gap-3 text-sm text-brand-text-secondary">
                    <span className="flex items-center gap-1"><MessageSquareText className="h-4 w-4" /> {discussion.likes} replies</span>
                    {discussion.helpful && <span className="font-semibold text-accent-teal">Helpful answer</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
