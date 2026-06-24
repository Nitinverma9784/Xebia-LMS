'use client';

import { motion } from 'framer-motion';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryAction,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-border bg-white px-6 py-16 text-center"
    >
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10">
          <Icon className="h-8 w-8 text-brand-primary" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-brand-text-primary">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-brand-text-secondary">{description}</p>
      )}
      <div className="mt-6 flex gap-3">
        {actionLabel && onAction && (
          <Button onClick={onAction}>{actionLabel}</Button>
        )}
        {secondaryAction}
      </div>
    </motion.div>
  );
}
