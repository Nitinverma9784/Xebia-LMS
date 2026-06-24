'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm overflow-x-auto scrollbar-thin">
      <Link
        href="/catalog/categories"
        className="flex shrink-0 items-center gap-1 text-brand-text-secondary hover:text-brand-primary transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Categories</span>
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex shrink-0 items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-brand-border" />
          {item.href && i < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-brand-text-secondary hover:text-brand-primary transition-colors truncate max-w-[160px] sm:max-w-none"
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn(
              'truncate max-w-[200px] sm:max-w-none',
              i === items.length - 1 ? 'font-medium text-brand-text-primary' : 'text-brand-text-secondary'
            )}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
