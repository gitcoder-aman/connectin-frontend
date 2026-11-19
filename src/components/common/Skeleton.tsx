import React from 'react';
import { cn } from '@/utils/cn';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn('bg-slate-200/70 rounded animate-shimmer', className)}
    />
  );
};

export const PostCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-4">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-11 h-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="h-48 w-full rounded-lg mb-4" />
      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
  );
};

export const PersonCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col items-center text-center">
      <Skeleton className="w-16 h-16 rounded-full mb-3" />
      <Skeleton className="h-4 w-28 mb-1.5" />
      <Skeleton className="h-3 w-36 mb-4" />
      <Skeleton className="h-8 w-full rounded-full" />
    </div>
  );
};
