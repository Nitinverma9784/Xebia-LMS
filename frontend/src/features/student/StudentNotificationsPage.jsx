import { motion } from 'framer-motion';
import { BellRing, CheckCheck, Trash2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import { notifications } from '@/services/studentMockData';

export default function StudentNotificationsPage() {
  return (
    <div className="min-h-screen bg-brand-surface/60 p-6 lg:p-8">
      <PageHeader title="Notifications" subtitle="Stay updated with course, assignment, quiz, and system updates." />
      <div className="mt-6 flex items-center justify-between rounded-3xl border border-brand-border/70 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-sm font-semibold text-brand-text-primary"><BellRing className="h-4 w-4 text-brand-primary" /> {notifications.length} notifications</div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">Mark All Read</Button>
          <Button size="sm" variant="outline">Clear</Button>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {notifications.map((notification) => (
          <motion.div key={notification.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-3xl border border-brand-border/70 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${!notification.read ? 'ring-1 ring-brand-primary/10' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-brand-text-primary">{notification.title}</p>
                <p className="mt-1 text-sm text-brand-text-secondary">{notification.message}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand-surface px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-text-secondary">{notification.type}</span>
                <button className="rounded-full p-2 text-brand-text-secondary hover:bg-brand-surface"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
