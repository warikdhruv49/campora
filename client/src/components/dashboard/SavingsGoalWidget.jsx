import { Link } from 'react-router-dom';
import { PiggyBank, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/format.js';

export default function SavingsGoalWidget({ goal }) {
  if (!goal) return null;

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PiggyBank size={15} style={{ color: goal.color }} />
          <h3 className="label-xs">Savings Goal</h3>
        </div>
        <Link to="/goals" className="text-2xs text-txt-muted hover:text-gain transition-colors inline-flex items-center gap-1">
          Goals <ArrowRight size={11} />
        </Link>
      </div>

      <p className="mt-4 text-sm font-medium text-txt-primary truncate">{goal.name}</p>

      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="num text-xl font-semibold text-txt-primary">{formatCurrency(goal.savedAmount, { decimals: 0 })}</p>
        <p className="text-2xs text-txt-muted num">of {formatCurrency(goal.targetAmount, { decimals: 0 })}</p>
      </div>

      <div className="mt-3 h-2 rounded-full bg-base-700 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.max(goal.pct, 2)}%`, backgroundColor: goal.color }}
        />
      </div>

      <p className="mt-2.5 text-2xs text-txt-secondary num">{goal.pct}% funded</p>
    </div>
  );
}
