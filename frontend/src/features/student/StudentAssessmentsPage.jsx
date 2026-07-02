import { motion } from 'framer-motion';
import { PlayCircle, FileCheck2, RotateCcw, Trophy } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import { assessments } from '@/services/studentMockData';

export default function StudentAssessmentsPage() {
  return (
    <div className="min-h-screen bg-brand-surface/60 p-6 lg:p-8">
      <PageHeader title="Assessments" subtitle="Start, resume, or review your quizzes from here." />
      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {assessments.map((assessment) => (
          <motion.div key={assessment.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-brand-border/70 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-brand-surface p-3"><Trophy className="h-5 w-5 text-brand-primary" /></div>
              <span className="rounded-full bg-brand-surface px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-text-secondary">{assessment.status}</span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-brand-text-primary dark:text-slate-100">{assessment.name}</h3>
            <p className="mt-2 text-sm text-brand-text-secondary">{assessment.course}</p>
            <div className="mt-4 grid gap-2 text-sm text-brand-text-secondary">
              <div className="flex items-center justify-between"><span>Time Limit</span><span className="font-semibold text-brand-text-primary">{assessment.timeLimit}</span></div>
              <div className="flex items-center justify-between"><span>Questions</span><span className="font-semibold text-brand-text-primary">{assessment.questions}</span></div>
              <div className="flex items-center justify-between"><span>Passing Marks</span><span className="font-semibold text-brand-text-primary">{assessment.passingMarks}</span></div>
              <div className="flex items-center justify-between"><span>Attempts</span><span className="font-semibold text-brand-text-primary">{assessment.attemptsRemaining}</span></div>
            </div>
            <div className="mt-5 flex gap-2">
              <Button size="sm"><PlayCircle className="mr-2 h-4 w-4" />{assessment.status === 'Completed' ? 'View Result' : assessment.status === 'Resume' ? 'Resume' : 'Start Quiz'}</Button>
              <Button size="sm" variant="outline"><FileCheck2 className="mr-2 h-4 w-4" />Review</Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
