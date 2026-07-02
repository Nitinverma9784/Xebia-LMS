import { motion } from 'framer-motion';
import { MessageCircleMore, Search, ThumbsUp, BadgeCheck } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import { discussions } from '@/services/studentMockData';

export default function StudentDiscussionPage() {
  return (
    <div className="min-h-screen bg-brand-surface/60 p-6 lg:p-8">
      <PageHeader title="Discussion Forum" subtitle="Ask questions, share insights, and get guidance from peers and instructors." />
      <div className="mt-6 flex items-center gap-3 rounded-3xl border border-brand-border/70 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <Search className="h-4 w-4 text-brand-text-secondary" />
        <input placeholder="Search discussions" className="w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="mt-6 space-y-4">
        {discussions.map((discussion) => (
          <motion.div key={discussion.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-brand-border/70 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2"><MessageCircleMore className="h-4 w-4 text-brand-primary" /><p className="font-semibold text-brand-text-primary">{discussion.user}</p></div>
                <p className="mt-2 text-sm text-brand-text-secondary">{discussion.message}</p>
              </div>
              {discussion.helpful && <span className="flex items-center gap-1 rounded-full bg-accent-teal/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-teal"><BadgeCheck className="h-3.5 w-3.5" />Helpful</span>}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-brand-text-secondary">
              <span>{discussion.time}</span>
              <Button variant="outline" size="sm"><ThumbsUp className="mr-2 h-4 w-4" />Like</Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
