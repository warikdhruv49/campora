import { TrendingUp, TrendingDown } from 'lucide-react';
import FinancialChart from '../charts/FinancialChart.jsx';
import { ChartSkeleton } from '../ui/Skeleton.jsx';
import { CHART_RANGES } from '../../config/constants.js';
import { formatCurrency, formatPercent, trendOf } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

export default function NetWorthHero({ summary, timeline, range, onRangeChange, loading, currency }) {
  const trend = trendOf(summary?.netWorthChangePct);
  const chartColor = trend === 'down' ? '#ff5b66' : '#00d492';

  return (
    <section className="panel overflow-hidden" aria-label="Net worth overview">
      <div className="p-5 lg:p-6 flex flex-col lg:flex-row lg:items-start gap-6">
        <div className="lg:w-80 shrink-0">
          <p className="label-xs">Total Net Worth</p>
          {loading ? (
            <div className="mt-3 space-y-3">
              <div className="skeleton h-10 w-64" />
              <div className="skeleton h-4 w-40" />
            </div>
          ) : (
            <>
              <p className="num text-3xl lg:text-4xl font-bold text-txt-primary mt-2 tracking-tight">
                {formatCurrency(summary?.netWorth ?? 0, { currency })}
              </p>
              <div className="mt-2.5 flex items-center gap-2.5">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md px-2 py-1 num text-xs font-semibold',
                    trend === 'up' && 'bg-gain-dim text-gain',
                    trend === 'down' && 'bg-loss-dim text-loss',
                    trend === 'flat' && 'bg-base-700 text-txt-muted'
                  )}
                >
                  {trend === 'up' && <TrendingUp size={13} />}
                  {trend === 'down' && <TrendingDown size={13} />}
                  {formatCurrency(summary?.netWorthChange ?? 0, { currency, signed: true })}
                </span>
                <span
                  className={cn(
                    'num text-sm font-semibold',
                    trend === 'up' && 'text-gain',
                    trend === 'down' && 'text-loss',
                    trend === 'flat' && 'text-txt-muted'
                  )}
                >
                  {formatPercent(summary?.netWorthChangePct ?? 0)}
                </span>
                <span className="text-2xs text-txt-muted">30d</span>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 max-w-[260px]">
                <div>
                  <dt className="label-xs">Assets</dt>
                  <dd className="num text-sm font-semibold text-gain mt-0.5">
                    {formatCurrency(summary?.totalAssets ?? 0, { currency })}
                  </dd>
                </div>
                <div>
                  <dt className="label-xs">Liabilities</dt>
                  <dd className="num text-sm font-semibold text-loss mt-0.5">
                    {formatCurrency(summary?.totalLiabilities ?? 0, { currency })}
                  </dd>
                </div>
              </dl>
            </>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="label-xs">Net Worth · Over Time</p>
            <div className="flex items-center gap-0.5 bg-base-850 border border-stroke rounded-lg p-0.5" role="tablist" aria-label="Chart time range">
              {CHART_RANGES.map((r) => (
                <button
                  key={r}
                  role="tab"
                  aria-selected={range === r}
                  onClick={() => onRangeChange(r)}
                  className={cn(
                    'px-2 py-1 rounded-md text-2xs font-semibold transition-colors',
                    range === r ? 'bg-base-700 text-txt-primary' : 'text-txt-muted hover:text-txt-secondary'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <ChartSkeleton height={300} />
          ) : timeline?.length ? (
            <FinancialChart
              data={timeline}
              color={chartColor}
              height={300}
              valueFormatter={(v) => formatCurrency(v, { currency, decimals: 0 })}
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-xs text-txt-muted">
              Your net worth timeline will appear here once you add accounts and transactions.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
