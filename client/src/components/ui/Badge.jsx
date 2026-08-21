import { cn } from '../../utils/cn.js';

export function Badge({ color, children, className, dot = false }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-2xs font-medium border',
        !color && 'bg-base-700 border-stroke text-txt-secondary',
        className
      )}
      style={
        color
          ? { backgroundColor: `${color}1a`, borderColor: `${color}40`, color }
          : undefined
      }
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color || 'currentColor' }} />}
      {children}
    </span>
  );
}

export function TrendBadge({ trend, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-2xs font-semibold num',
        trend === 'up' && 'bg-gain-dim text-gain',
        trend === 'down' && 'bg-loss-dim text-loss',
        trend === 'flat' && 'bg-base-700 text-txt-muted'
      )}
    >
      {children}
    </span>
  );
}
