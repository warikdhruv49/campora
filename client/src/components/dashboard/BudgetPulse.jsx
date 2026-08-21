import { Link } from 'react-router-dom';
import { Target, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/format.js';

export default function BudgetPulse({ budget }) {
  const overall = budget?.overall;
  if (!overall || !overall.budget) return null;

  const pct = Math.min(100, overall.pct);
  const barColor = overall.overspent ? 'bg-loss' : pct >= 75 ? 'bg-[#f5a623]' : 'bg-gain';

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={15} className="text-gain" />
          <h3 className="label-xs">Monthly Budget</h3>
        </div>
        <Link to="/budgets" className="text-2xs text-txt-muted hover:text-gain transition-colors inline-flex items-center gap-1">
          Manage <ArrowRight size={11} />
        </Link>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="num text-xl font-semibold text-txt-primary">{formatCurrency(overall.remaining, { decimals: 0 })}</p>
          <p className="text-2xs text-txt-muted mt-0.5">
            {overall.overspent ? 'over budget' : 'left this month'}
          </p>
        </div>
        <p className="text-2xs text-txt-secondary num text-right">
          {formatCurrency(overall.spent, { decimals: 0 })} / {formatCurrency(overall.budget, { decimals: 0 })}
        </p>
      </div>

      <div className="mt-3 h-2 rounded-full bg-base-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-2xs">
        <span className={overall.overspent ? 'text-loss' : 'text-txt-muted'}>
          {overall.daysLeft} day{overall.daysLeft === 1 ? '' : 's'} left
        </span>
        {overall.dailyLimit !== null && !overall.overspent && (
          <span className="text-txt-secondary num">
            ~{formatCurrency(overall.dailyLimit, { decimals: 0 })}/day safe to spend
          </span>
        )}
      </div>
    </div>
  );
}
