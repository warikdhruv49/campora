import Logo from '../layout/Logo.jsx';

export function LogoSpinner({ label = 'Loading Campora…' }) {
  return (
    <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
      <div className="animate-pulse">
        <Logo size="large" />
      </div>
      <div className="w-28 h-0.5 bg-base-700 rounded-full overflow-hidden">
        <div className="h-full w-1/2 bg-gradient-to-r from-brand to-brand-blue animate-[shimmer_1.2s_linear_infinite] rounded-full" />
      </div>
      {label && <p className="text-xs text-txt-muted">{label}</p>}
    </div>
  );
}
