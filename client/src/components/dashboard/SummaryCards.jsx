import { memo } from 'react';
import { Landmark, ArrowDownToLine, ArrowUpFromLine, Waves, PiggyBank, Banknote, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SkeletonCard } from '../ui/Skeleton.jsx';
import { formatCurrency, formatPercent, trendOf } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

const TREND_ICONS = { up: TrendingUp, down: TrendingDown, flat: Minus };

function StatCard({ icon: Icon, label, value, sub, changePct, invertTrend = false, currency, loading }) {
  if (loading) return <SkeletonCard lines={3} />;

  let trend = trendOf(changePct);
  if (invertTrend && trend !== 'flat') trend = trend === 'up' ? 'down' : 'up';
  const TrendIcon = TREND_ICONS[trend];
  const positive = trend === 'up';
  const negative = trend === 'down';

  return (
    <div className="panel p-4 group hover:border-stroke-strong transition-colors duration-150">
      <div className="flex items-center justify-between">
        <p className="label-xs">{label}</p>
        <div className="w-7 h-7 rounded-lg bg-base-750 border border-stroke flex items-center justify-center text-txt-muted group-hover:text-txt-secondary transition-colors">
          <Icon size={14} strokeWidth={1.8} />
        </div>
      </div>
      <p className="num text-xl font-bold text-txt-primary mt-2.5 tracking-tight">
        {value}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-2xs text-txt-muted truncate">{sub}</span>
        {changePct !== null && changePct !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 num text-2xs font-semibold shrink-0',
              positive && 'text-gain',
              negative && 'text-loss',
              !positive && !negative && 'text-txt-muted'
            )}
          >
            <TrendIcon size={11} />
            {formatPercent(changePct)}
          </span>
        )}
      </div>
    </div>
  );
}

function SummaryCards({ summary, loading, currency }) {
  const c = { currency };
  const cards = [
    {
      icon: Landmark,
      label: 'Total Assets',
      value: formatCurrency(summary?.totalAssets ?? 0, c),
      sub: `${summary?.accountCount ?? 0} active accounts`,
      changePct: null,
    },
    {
      icon: ArrowDownToLine,
      label: 'Monthly Income',
      value: formatCurrency(summary?.monthlyIncome ?? 0, c),
      sub: `Prev ${formatCurrency(summary?.prevMonthIncome ?? 0, c)}`,
      changePct: summary?.incomeChangePct,
    },
    {
      icon: ArrowUpFromLine,
      label: 'Monthly Expenses',
      value: formatCurrency(summary?.monthlyExpenses ?? 0, c),
      sub: `Prev ${formatCurrency(summary?.prevMonthExpenses ?? 0, c)}`,
      changePct: summary?.expenseChangePct,
      invertTrend: true,
    },
    {
      icon: Waves,
      label: 'Cash Flow',
      value: formatCurrency(summary?.cashFlow ?? 0, { ...c, signed: true }),
      sub: 'Income − expenses this month',
      changePct: null,
    },
    {
      icon: PiggyBank,
      label: 'Savings Rate',
      value: `${(summary?.savingsRate ?? 0).toFixed(1)}%`,
      sub: 'Of monthly income saved',
      changePct: null,
    },
    {
      icon: Banknote,
      label: 'Available Cash',
      value: formatCurrency(summary?.availableCash ?? 0, c),
      sub: 'Checking · savings · cash · wallets',
      changePct: null,
    },
  ];

  return (
    <section aria-label="Financial summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} loading={loading} />
      ))}
    </section>
  );
}

export default memo(SummaryCards);
