import { cn } from '@/utils';

const variants = {
  primary: 'bg-brand-primary text-white hover:bg-brand-primary-dark shadow-sm',
  secondary: 'bg-brand-secondary text-white hover:opacity-90',
  cta: 'bg-brand-cta text-white hover:opacity-90',
  outline: 'border border-brand-border bg-white text-brand-text-primary hover:bg-brand-surface',
  ghost: 'text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text-primary',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
  icon: 'h-9 w-9 p-0',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  loading,
  disabled,
  ...props
}) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
