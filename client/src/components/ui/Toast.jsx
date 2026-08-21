import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const ToastContext = createContext(null);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'success') => {
      const id = nextId++;
      setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
      setTimeout(() => dismiss(id), 3800);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      success: (msg) => push(msg, 'success'),
      error: (msg) => push(msg, 'error'),
      info: (msg) => push(msg, 'info'),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm shadow-panel animate-slideUp',
              toast.type === 'success' && 'bg-base-800 border-gain/30 text-txt-primary',
              toast.type === 'error' && 'bg-base-800 border-loss/40 text-txt-primary',
              toast.type === 'info' && 'bg-base-800 border-stroke-strong text-txt-primary'
            )}
          >
            {toast.type === 'success' && <CheckCircle2 size={16} className="text-gain shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertTriangle size={16} className="text-loss shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info size={16} className="text-brand-blue shrink-0 mt-0.5" />}
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button onClick={() => dismiss(toast.id)} className="text-txt-muted hover:text-txt-primary transition-colors" aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
