import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps {
  variant?: 'brand' | 'emerald' | 'amber' | 'rose' | 'slate';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'brand',
  size = 'md',
  children,
  className,
}) => {
  const variants = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};
