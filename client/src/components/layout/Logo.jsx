import { cn } from '../../utils/cn.js';

export default function Logo({ collapsed = false, size = 'default' }) {
  return (
    <div className="flex items-center gap-2.5 select-none" title="CAMPORA">
      <svg
        viewBox="0 0 64 64"
        className={cn('shrink-0', size === 'large' ? 'w-10 h-10' : 'w-8 h-8')}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="campora-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00d492" />
            <stop offset="100%" stopColor="#4d8dff" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="#10151c" />
        <rect width="63" height="63" x="0.5" y="0.5" rx="13.5" fill="none" stroke="url(#campora-g)" strokeWidth="2.5" />
        <path
          d="M42 24.5c-2.2-3-5.8-4.9-10-4.9-6.8 0-12.3 5.5-12.3 12.4S23.2 44.4 30 44.4c4.2 0 7.8-1.9 10-4.9"
          fill="none"
          stroke="url(#campora-g)"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
      {!collapsed && (
        <div className="leading-none">
          <span className={cn('font-extrabold tracking-[0.22em] text-txt-primary', size === 'large' ? 'text-xl' : 'text-sm')}>
            CAMPORA
          </span>
          <span className="block mt-1 text-[9px] tracking-[0.3em] text-txt-muted font-medium">FINANCE OS</span>
        </div>
      )}
    </div>
  );
}
