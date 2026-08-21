import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export default function Modal({ open, onClose, title, subtitle, children, size = 'md' }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" />
      <div
        className={cn(
          'relative w-full panel animate-scaleIn max-h-[92vh] flex flex-col',
          'rounded-t-2xl sm:rounded-xl',
          sizes[size]
        )}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-stroke shrink-0">
          <div>
            <h2 className="text-base font-semibold text-txt-primary">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-txt-secondary">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 -m-1 rounded-md text-txt-muted hover:text-txt-primary hover:bg-base-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
