import React from 'react';
import { cn } from '@/utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:bg-slate-50 disabled:text-slate-500 resize-y min-h-[90px]',
            error
              ? 'border-rose-400 text-rose-900 focus:ring-rose-400 focus:border-rose-400'
              : 'border-slate-300',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
