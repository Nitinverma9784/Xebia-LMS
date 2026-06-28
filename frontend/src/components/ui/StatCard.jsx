'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils';

const tints = {
  teal: 'bg-emerald-50 text-emerald-600',
  orange: 'bg-orange-50 text-orange-600',
  purple: 'bg-purple-50 text-brand-primary',
  pink: 'bg-pink-50 text-pink-600',
  plum: 'bg-purple-50 text-brand-primary',
};

export default function StatCard({ icon: Icon, label, value, color = 'teal', index = 0, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        'flex items-center gap-4 rounded-2xl border border-brand-border bg-white p-5 shadow-card',
        className
      )}
    >
      <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-full', tints[color] || tints.teal)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-tight text-slate-900">{value}</p>
        <p className="text-sm text-brand-text-secondary truncate">{label}</p>
      </div>
    </motion.div>
  );
}
