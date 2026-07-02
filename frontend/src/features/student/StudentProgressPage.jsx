import { motion } from 'framer-motion';
import { TrendingUp, Clock3, Trophy, BarChart3, Target } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

export default function StudentProgressPage() {
  return (
    <div className="min-h-screen bg-brand-surface/60 p-6 lg:p-8">
      <PageHeader title="Progress Tracker" subtitle="Monitor your learning hours, course completion, and assessment performance." />
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-brand-border/70 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3"><TrendingUp className="h-5 w-5 text-brand-primary" /><h3 className="text-xl font-bold text-brand-text-primary dark:text-slate-100">Course Completion</h3></div>
          <div className="mt-6 space-y-4">
            {['React for Enterprise Teams', 'Python for Data Engineering', 'Cloud Foundations'].map((item, idx) => (
              <div key={item}>
                <div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold text-brand-text-primary">{item}</span><span className="text-brand-text-secondary">{[72, 46, 100][idx]}%</span></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-brand-border/70"><div className="h-full rounded-full bg-gradient-to-r from-brand-primary to-accent-teal" style={{ width: `${[72, 46, 100][idx]}%` }} /></div>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-brand-border/70 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-brand-primary" /><h3 className="text-xl font-bold text-brand-text-primary dark:text-slate-100">Weekly Learning</h3></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-brand-surface/80 p-4"><p className="text-sm text-brand-text-secondary">Average Score</p><p className="mt-2 text-2xl font-bold text-brand-text-primary">88%</p></div>
            <div className="rounded-2xl bg-brand-surface/80 p-4"><p className="text-sm text-brand-text-secondary">Learning Hours</p><p className="mt-2 text-2xl font-bold text-brand-text-primary">12.4h</p></div>
            <div className="rounded-2xl bg-brand-surface/80 p-4"><p className="text-sm text-brand-text-secondary">Overall Progress</p><p className="mt-2 text-2xl font-bold text-brand-text-primary">74%</p></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
