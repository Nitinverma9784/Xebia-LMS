'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils';

const tints = {
  teal: 'bg-accent-teal/10 text-accent-teal-dark',
  orange: 'bg-accent-orange/10 text-accent-orange',
  purple: 'bg-accent-purple/10 text-accent-purple',
  pink: 'bg-accent-pink/10 text-accent-pink',
  plum: 'bg-brand-primary/10 text-brand-primary',
};

export default function StatCard({ icon: Icon, label, value, color = 'teal', index = 0, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        'flex items-center gap-3 rounded-2xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card',
        className
      )}
    >
      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', tints[color] || tints.teal)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold leading-tight text-brand-text-primary dark:text-slate-100">{value}</p>
        <p className="text-xs text-brand-text-secondary dark:text-slate-400 truncate">{label}</p>
      </div>
    </motion.div>
  );
}
