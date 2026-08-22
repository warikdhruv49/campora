import { AlertCircle, Check } from 'lucide-react';
import Logo from '../layout/Logo.jsx';

function BgLayers() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,160,176,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(148,160,176,0.035) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%, black 30%, transparent 100%)',
        }}
      />
      <div className="absolute -top-40 left-[8%] w-[520px] h-[340px] bg-brand/[0.05] blur-[130px] rounded-full" />
      <div className="absolute -bottom-32 right-[6%] w-[460px] h-[300px] bg-gain/[0.04] blur-[120px] rounded-full" />
    </div>
  );
}

export function AuthCard({ children }) {
  return <div className="panel rounded-2xl p-7 shadow-panel sm:p-9">{children}</div>;
}

export function AuthAlert({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="flex items-start gap-2 rounded-lg border border-loss/25 bg-loss-dim/50 px-3 py-2.5">
      <AlertCircle size={13} className="mt-0.5 shrink-0 text-loss" />
      <p className="text-xs leading-relaxed text-loss">{children}</p>
    </div>
  );
}

export function AuthSteps({ title, steps }) {
  return (
    <section>
      <p className="label-xs">{title}</p>
      <ol className="mt-4 space-y-3">
        {steps.map((step, i) => (
          <li key={step} className="flex items-baseline gap-3">
            <span className="num shrink-0 text-2xs font-semibold text-gain">{String(i + 1).padStart(2, '0')}</span>
            <span className="text-xs leading-relaxed text-txt-secondary">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function AuthPoints({ title, points, icons }) {
  return (
    <section>
      <p className="label-xs">{title}</p>
      <ul className="mt-4 space-y-3.5">
        {points.map((point, i) => {
          const Icon = icons?.[i] || Check;
          return (
            <li key={point} className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-brand/10 border border-stroke flex items-center justify-center shrink-0">
                <Icon size={13} className="text-gain" />
              </span>
              <span className="text-xs font-medium text-txt-primary">{point}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function AuthPageLayout({ headline, supporting, aside, children }) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-base-900">
      <BgLayers />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1240px] flex-col px-5 py-10 sm:px-8">
        <div className="grid flex-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-x-16 xl:grid-cols-[minmax(0,1fr)_480px] xl:gap-x-24">
          <div className="order-1 flex flex-col items-start animate-fadeIn lg:col-start-1 lg:row-start-1">
            <Logo size="large" />
            <h1 className="mt-9 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-txt-primary sm:text-5xl xl:text-[54px]">
              {headline}
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-txt-secondary sm:text-base">{supporting}</p>
          </div>

          <div className="order-2 mt-10 w-full max-w-[460px] justify-self-center lg:col-start-2 lg:row-span-2 lg:mt-0 lg:justify-self-end animate-slideUp">
            {children}
          </div>

          <div className="order-3 mt-12 max-w-lg space-y-8 lg:col-start-1 lg:row-start-2 lg:mt-14 animate-fadeIn">{aside}</div>
        </div>

        <p className="mt-10 pb-1 text-center text-2xs text-txt-muted">
          Charts powered by{' '}
          <a
            href="https://www.tradingview.com/lightweight-charts/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-stroke underline-offset-2 transition-colors hover:text-txt-secondary"
          >
            TradingView Lightweight Charts
          </a>
        </p>
      </div>
    </div>
  );
}
