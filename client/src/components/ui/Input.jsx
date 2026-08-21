import { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

export const Input = forwardRef(function Input({ label, error, hint, className, id, ...props }, ref) {
  const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label-xs block mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        className={cn('input-base', error && 'border-loss/60 focus:border-loss focus:ring-loss/30', className)}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-2xs text-loss">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-2xs text-txt-muted">{hint}</p>
      ) : null}
    </div>
  );
});

export const Select = forwardRef(function Select(
  { label, error, className, children, id, ...props },
  ref
) {
  const selectId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="label-xs block mb-1.5">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        aria-invalid={!!error}
        className={cn(
          'input-base appearance-none bg-no-repeat pr-8',
          "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%235c6878%22 stroke-width=%222.5%22%3E%3Cpath d=%22m6 9 6 6 6-6%22/%3E%3C/svg%3E')]",
          'bg-[right_0.65rem_center]',
          error && 'border-loss/60',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1.5 text-2xs text-loss">{error}</p>}
    </div>
  );
});

export function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1.5 text-2xs text-loss">{children}</p>;
}
