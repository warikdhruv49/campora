import { cn } from '../../utils/cn.js';

export function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />;
}

export function SkeletonCard({ lines = 3, className }) {
  return (
    <div className={cn('panel p-5 space-y-3', className)}>
      <Skeleton className="h-2.5 w-24" />
      <Skeleton className="h-7 w-36" />
      {Array.from({ length: lines - 2 }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full max-w-[200px]" />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 8, cols = 6 }) {
  return (
    <div className="space-y-px">
      <div className="flex gap-4 px-4 py-3 border-b border-stroke">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-2.5 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-3.5 border-b border-stroke/50">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-3.5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 320 }) {
  return (
    <div className="w-full flex items-end gap-1.5 px-1" style={{ height }}>
      {[38, 52, 44, 61, 55, 70, 64, 78, 72, 85, 80, 92, 88, 100].map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm bg-gradient-to-t from-base-750 to-base-700 animate-pulse"
          style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}
