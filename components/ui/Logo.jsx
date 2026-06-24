'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils';

export default function Logo({ className, iconOnly = false }) {
  return (
    <div className={cn('flex items-center gap-3 select-none', className)}>
      <motion.div
        whileHover={{ scale: 1.08, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary shadow-md border border-white/10 overflow-hidden cursor-pointer"
      >
        {/* Animated backdrop glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_60%)]" />
        
        {/* Sleek geometric connection symbol */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
        >
          <motion.path
            d="M8 8 L24 24 M24 8 L8 24"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <circle cx="16" cy="16" r="3" fill="#01AC9F" />
          <circle cx="8" cy="8" r="2" fill="white" />
          <circle cx="24" cy="24" r="2" fill="white" />
          <circle cx="24" cy="8" r="2" fill="white" />
          <circle cx="8" cy="24" r="2" fill="white" />
        </svg>
      </motion.div>

      {!iconOnly && (
        <div className="flex flex-col">
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-lg font-extrabold tracking-tight text-brand-text-primary dark:text-slate-50 transition-colors"
          >
            Xebia<span className="text-brand-success">LMS</span>
          </motion.span>
          <span className="text-[10px] uppercase tracking-widest font-semibold text-brand-text-secondary dark:text-slate-400 -mt-1 transition-colors">
            Enterprise Admin
          </span>
        </div>
      )}
    </div>
  );
}
