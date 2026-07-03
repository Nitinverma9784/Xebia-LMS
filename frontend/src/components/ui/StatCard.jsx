'use client';

import { motion } from 'framer-motion';

const ICON_COLORS = {
  purple: { bg: 'var(--brand-primary-10)', text: 'var(--brand-primary)' },
  teal:   { bg: 'var(--brand-success-10)', text: 'var(--brand-success)' },
  orange: { bg: 'var(--brand-cta-10)', text: 'var(--brand-cta)' },
  plum:   { bg: 'var(--accent-purple-10)', text: 'var(--accent-purple)' },
  pink:   { bg: 'var(--accent-pink-10)', text: 'var(--accent-pink)' },
};

export default function StatCard({ icon: Icon, label, value, color = 'teal', index = 0, className }) {
  const scheme = ICON_COLORS[color] || ICON_COLORS.teal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className={`flex items-center gap-4.5 rounded-[20px] border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] p-5 lg:p-6 shadow-sm hover:shadow-md transition-all duration-300 min-h-[96px] ${className || ''}`}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
        style={{ backgroundColor: scheme.bg }}
      >
        <Icon className="h-5 w-5 lg:h-6 lg:w-6" style={{ color: scheme.text }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-2xl lg:text-3xl font-extrabold leading-none text-slate-900 dark:text-[#F8FAFC]">{value}</p>
        <p className="text-xs font-semibold text-slate-500 dark:text-[#CBD5E1] truncate mt-1">{label}</p>
      </div>
    </motion.div>
  );
}
