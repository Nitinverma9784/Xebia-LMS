import { cn } from '@/utils';

// Solid, colored pill badges — matches the reference design's status chips
const colors = {
  teal: 'bg-accent-teal text-white',
  orange: 'bg-accent-orange text-white',
  purple: 'bg-accent-purple text-white',
  pink: 'bg-accent-pink text-white',
  plum: 'bg-brand-primary text-white',
  slate: 'bg-slate-400 text-white',
  gray: 'bg-gray-200 text-gray-700',
  amber: 'bg-amber-500 text-white',
  red: 'bg-red-500 text-white',
  green: 'bg-accent-teal text-white',
  blue: 'bg-blue-500 text-white',
  // soft / outline variants, for places that want a quieter chip
  'soft-teal': 'bg-accent-teal/10 text-accent-teal-dark border border-accent-teal/20',
  'soft-orange': 'bg-accent-orange/10 text-accent-orange border border-accent-orange/20',
  'soft-purple': 'bg-accent-purple/10 text-accent-purple border border-accent-purple/20',
  'soft-pink': 'bg-accent-pink/10 text-accent-pink border border-accent-pink/20',
};

export default function Badge({ children, color = 'gray', className, dot }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
        colors[color] || colors.gray,
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
}

export function CourseStatusBadge({ status }) {
  const map = {
    draft: { label: 'Draft', color: 'orange' },
    in_review: { label: 'In Review', color: 'amber' },
    published: { label: 'Published', color: 'plum' },
    archived: { label: 'Archived', color: 'slate' },
    active: { label: 'Active', color: 'teal' },
    inactive: { label: 'Inactive', color: 'gray' },
    completed: { label: 'Completed', color: 'teal' },
  };
  const cfg = map[status] || map.draft;
  return <Badge color={cfg.color}>{cfg.label}</Badge>;
}
