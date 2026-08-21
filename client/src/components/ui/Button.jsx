import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const variants = {
  primary:
    'bg-gain text-base-950 font-semibold hover:bg-[#00e6a2] active:bg-[#00bd80] shadow-glow',
  danger: 'bg-loss text-white font-semibold hover:bg-[#ff707a] active:bg-[#e54855]',
  outline: 'border border-stroke-strong text-txt-primary hover:bg-base-700 hover:border-txt-muted',
  ghost: 'text-txt-secondary hover:text-txt-primary hover:bg-base-700',
  subtle: 'bg-base-700 text-txt-primary hover:bg-stroke-strong border border-stroke',
};

const sizes = {
  sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
  md: 'h-10 px-4 text-sm rounded-lg gap-2',
  lg: 'h-11 px-5 text-sm rounded-lg gap-2',
};

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap transition-all duration-150 select-none',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
});

export default Button;
