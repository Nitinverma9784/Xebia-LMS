import { motion } from 'framer-motion';
import { Bell, Globe, Moon, Shield, LogOut } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';

export default function StudentSettingsPage() {
  return (
    <div className="min-h-screen bg-brand-surface/60 p-6 lg:p-8">
      <PageHeader title="Settings" subtitle="Control your experience and privacy preferences." />
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-brand-border/70 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xl font-bold text-brand-text-primary dark:text-slate-100">Preferences</h3>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-brand-surface/80 p-4"><div className="flex items-center gap-3"><Bell className="h-4 w-4 text-brand-primary" /><span className="text-sm font-semibold">Notifications</span></div><input type="checkbox" defaultChecked className="h-4 w-4" /></div>
            <div className="flex items-center justify-between rounded-2xl bg-brand-surface/80 p-4"><div className="flex items-center gap-3"><Globe className="h-4 w-4 text-brand-primary" /><span className="text-sm font-semibold">Language</span></div><span className="text-sm text-brand-text-secondary">English</span></div>
            <div className="flex items-center justify-between rounded-2xl bg-brand-surface/80 p-4"><div className="flex items-center gap-3"><Moon className="h-4 w-4 text-brand-primary" /><span className="text-sm font-semibold">Dark Theme</span></div><input type="checkbox" className="h-4 w-4" /></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-brand-border/70 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xl font-bold text-brand-text-primary dark:text-slate-100">Security</h3>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-brand-surface/80 p-4"><div className="flex items-center gap-3"><Shield className="h-4 w-4 text-brand-primary" /><span className="text-sm font-semibold">Privacy</span></div><Button size="sm" variant="outline">Update</Button></div>
            <div className="flex items-center justify-between rounded-2xl bg-brand-surface/80 p-4"><div className="flex items-center gap-3"><Lock className="h-4 w-4 text-brand-primary" /><span className="text-sm font-semibold">Password</span></div><Button size="sm" variant="outline">Change</Button></div>
            <div className="flex items-center justify-between rounded-2xl bg-brand-surface/80 p-4"><div className="flex items-center gap-3"><LogOut className="h-4 w-4 text-brand-primary" /><span className="text-sm font-semibold">Logout</span></div><Button size="sm" variant="danger">Logout</Button></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
