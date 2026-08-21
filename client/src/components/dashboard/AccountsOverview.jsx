import { Wallet } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { Skeleton } from '../ui/Skeleton.jsx';
import { ACCOUNT_TYPE_LABELS } from '../../config/constants.js';
import { formatCurrency } from '../../utils/format.js';

export default function AccountsOverview({ accounts, loading, currency, onAddAccount }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="panel p-4 space-y-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-1.5 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!accounts?.length) {
    return (
      <EmptyState
        icon={Wallet}
        title="No accounts yet"
        description="Add your first account to start tracking your net worth."
        action={
          <button onClick={onAddAccount} className="text-xs font-medium text-gain hover:underline">
            + Add account
          </button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {accounts.map((account) => (
        <div
          key={account.id}
          className="panel p-4 group hover:border-stroke-strong transition-all duration-150 hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${account.color}1a`, border: `1px solid ${account.color}40` }}
              >
                <Wallet size={14} style={{ color: account.color }} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-txt-primary truncate">{account.name}</p>
                <p className="text-2xs text-txt-muted truncate">{account.institution || ACCOUNT_TYPE_LABELS[account.type]}</p>
              </div>
            </div>
            {!account.isActive && <Badge className="!text-txt-muted">Off</Badge>}
          </div>

          <p
            className={`num text-lg font-bold mt-3 ${account.type === 'CREDIT_CARD' ? 'text-loss' : 'text-txt-primary'}`}
          >
            {formatCurrency(account.balance, { currency: account.currency })}
          </p>

          <div className="mt-3">
            <div className="flex justify-between text-2xs text-txt-muted mb-1">
              <span>{account.sharePct > 0 ? `${account.sharePct.toFixed(1)}% of assets` : '—'}</span>
              <span>{ACCOUNT_TYPE_LABELS[account.type]}</span>
            </div>
            <div className="h-1 rounded-full bg-base-700 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, account.sharePct || 0)}%`, backgroundColor: account.color }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
