import { cn } from '@/utils';

const colors = {
  green: 'bg-brand-success/10 text-brand-success border-brand-success/20',
  gray: 'bg-brand-muted text-brand-muted-fg border-brand-border',
  amber: 'bg-brand-warning/10 text-brand-warning border-brand-warning/20',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
  purple: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
  red: 'bg-red-50 text-red-700 border-red-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function Badge({ children, color = 'gray', className, dot }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        colors[color] || colors.gray,
        className
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', color === 'green' ? 'bg-emerald-500' : 'bg-current opacity-60')} />}
      {children}
    </span>
  );
}

export function CourseStatusBadge({ status }) {
  const map = {
    draft: { label: 'Draft', color: 'gray' },
    in_review: { label: 'In Review', color: 'amber' },
    published: { label: 'Published', color: 'green' },
    archived: { label: 'Archived', color: 'slate' },
    active: { label: 'Active', color: 'green' },
    inactive: { label: 'Inactive', color: 'gray' },
  };
  const cfg = map[status] || map.draft;
  return <Badge color={cfg.color} dot>{cfg.label}</Badge>;
}
