import { motion } from 'framer-motion';
import { Trophy, Medal, Sparkles } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { leaderboard } from '@/services/studentMockData';

export default function StudentLeaderboardPage() {
  return (
    <div className="min-h-screen bg-brand-surface/60 p-6 lg:p-8">
      <PageHeader title="Leaderboard" subtitle="See your ranking among peers and celebrate your learning milestones." />
      <div className="mt-6 overflow-hidden rounded-3xl border border-brand-border/70 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-brand-border/70 bg-brand-surface/80 p-4">
          <div className="flex items-center gap-3 text-brand-primary"><Trophy className="h-5 w-5" /><h3 className="text-lg font-bold text-brand-text-primary dark:text-slate-100">Top learners this month</h3></div>
        </div>
        <div className="divide-y divide-brand-border/70">
          {leaderboard.map((entry, index) => (
            <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-surface text-sm font-bold text-brand-primary">#{index + 1}</div>
                <div>
                  <p className="font-semibold text-brand-text-primary">{entry.name}</p>
                  <p className="text-sm text-brand-text-secondary">{entry.hours} learning hours</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-brand-text-primary">{entry.score}% score</p>
                <p className="text-sm text-brand-text-secondary">{entry.badges} badges</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
