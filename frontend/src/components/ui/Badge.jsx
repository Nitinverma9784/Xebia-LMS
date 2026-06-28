import { cn } from '@/utils';

const colors = {
  teal: 'bg-accent-teal text-white',
  orange: 'bg-accent-orange text-white',
  purple: 'bg-brand-primary text-white',
  plum: 'bg-brand-primary text-white',
  slate: 'bg-slate-400 text-white',
  gray: 'bg-slate-100 text-slate-600',
  amber: 'bg-amber-500 text-white',
  red: 'bg-red-500 text-white',
  green: 'bg-accent-teal text-white',
  blue: 'bg-blue-500 text-white',
  'soft-teal': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'soft-orange': 'bg-orange-50 text-orange-700 border border-orange-200',
  'soft-purple': 'bg-purple-50 text-purple-700 border border-purple-200',
  'soft-gray': 'bg-slate-100 text-slate-600 border border-slate-200',
  'soft-plum': 'bg-purple-50 text-brand-primary border border-purple-200',
};

export default function Badge({ children, color = 'gray', className, dot }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
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
    draft: { label: 'Draft', color: 'soft-gray' },
    in_review: { label: 'In Review', color: 'soft-orange' },
    published: { label: 'Published', color: 'soft-plum' },
    archived: { label: 'Archived', color: 'soft-gray' },
    active: { label: 'Active', color: 'soft-teal' },
    inactive: { label: 'Inactive', color: 'soft-gray' },
    completed: { label: 'Completed', color: 'soft-teal' },
  };
  const cfg = map[status] || map.draft;
  return <Badge color={cfg.color}>{cfg.label}</Badge>;
}

export function LevelBadge({ level }) {
  const map = {
    Beginner: 'soft-teal',
    Intermediate: 'soft-purple',
    Advanced: 'soft-orange',
    Expert: 'soft-gray',
    'Beginner to Advanced': 'soft-purple',
  };
  return <Badge color={map[level] || 'soft-gray'}>{level}</Badge>;
}

export function CategoryBadge({ name, color = '#84117C' }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ backgroundColor: `${color}14`, color, borderColor: `${color}33` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {name}
    </span>
  );
}
