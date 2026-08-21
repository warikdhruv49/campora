import { cn } from '../../utils/cn.js';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-14 px-6', className)}>
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-base-750 border border-stroke flex items-center justify-center text-txt-muted mb-4">
          <Icon size={22} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-sm font-semibold text-txt-primary">{title}</h3>
      {description && <p className="mt-1.5 text-xs text-txt-secondary max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
