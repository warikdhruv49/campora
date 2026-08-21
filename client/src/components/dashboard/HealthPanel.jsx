import { ShieldCheck } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton.jsx';

function HealthRow({ label, value, tone = 'neutral', hint }) {  const tones = {
    positive: 'text-gain',
    negative: 'text-loss',
    neutral: 'text-txt-primary',
  };
  return (
    <div className="flex items-center justify-between py-2 border-b border-stroke/50 last:border-0">
      <div>
        <p className="text-xs text-txt-secondary">{label}</p>
        {hint && <p className="text-2xs text-txt-muted mt-0.5">{hint}</p>}
      </div>
      <span className={`num text-xs font-semibold ${tones[tone]}`}>{value}</span>
    </div>
  );
}

export default function HealthPanel({ health, loading, currency, format }) {
  if (loading) {
    return (
      <div className="space-y-2.5">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  if (!health) {
    return (
      <p className="py-8 text-center text-xs text-txt-muted">
        Financial health insights appear after a few months of activity.
      </p>
    );
  }

  const savingsRate = health.savingsRate ?? 0;
  const rateTone = savingsRate >= 20 ? 'positive' : savingsRate >= 0 ? 'neutral' : 'negative';

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="label-xs">Savings Rate</span>
            <span className={`num text-sm font-bold ${rateTone === 'positive' ? 'text-gain' : rateTone === 'negative' ? 'text-loss' : 'text-txt-primary'}`}>
              {savingsRate.toFixed(1)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-base-700 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.max(0, Math.min(100, savingsRate))}%`,
                backgroundColor: rateTone === 'positive' ? '#00d492' : rateTone === 'negative' ? '#ff5b66' : '#f5a623',
              }}
            />
          </div>
        </div>
      </div>

      <HealthRow
        icon={ShieldCheck}
        label="Emergency Runway"
        value={health.runwayMonths != null ? `${health.runwayMonths.toFixed(1)} months` : '—'}
        hint={`${format(health.emergencyCash)} liquid`}
        tone={health.runwayMonths >= 3 ? 'positive' : health.runwayMonths >= 1 ? 'neutral' : 'negative'}
      />
      <HealthRow label="Avg Monthly Income" value={format(health.avgMonthlyIncome)} />
      <HealthRow label="Avg Monthly Spending" value={format(health.avgMonthlySpending)} />
      <HealthRow
        label="Largest Expense Category"
        value={health.largestExpenseCategory ? format(health.largestExpenseCategory.amount) : '—'}
        hint={health.largestExpenseCategory?.name}
      />
      <HealthRow
        label="Best Saving Month"
        value={(() => {
          const best = [...(health.monthlyHistory || [])].sort((a, b) => b.savings - a.savings)[0];
          return best ? format(best.savings) : '—';
        })()}
        tone="positive"
      />
    </div>
  );
}
