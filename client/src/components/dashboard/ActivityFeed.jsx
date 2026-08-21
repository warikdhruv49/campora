import { ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton.jsx';
import { formatCurrency } from '../../utils/format.js';
import { formatDateTime } from '../../utils/date.js';
import { cn } from '../../utils/cn.js';

const TYPE_META = {
  INCOME: { icon: ArrowDownToLine, className: 'text-gain bg-gain-dim border-gain/30', sign: '+' },
  EXPENSE: { icon: ArrowUpFromLine, className: 'text-loss bg-loss-dim border-loss/30', sign: '−' },
  TRANSFER: { icon: ArrowRightLeft, className: 'text-brand-blue bg-brand-blue/10 border-brand-blue/30', sign: '' },
};

export default function ActivityFeed({ transactions, loading, currency }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2.5 w-20" />
            </div>
            <Skeleton className="h-3.5 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!transactions?.length) {
    return (
      <p className="py-8 text-center text-xs text-txt-muted">
        Recent activity will appear here once you record your first transaction.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-stroke/60 -my-1">
      {transactions.map((txn) => {
        const meta = TYPE_META[txn.type];
        const Icon = meta.icon;
        return (
          <li key={txn.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <span className={cn('w-8 h-8 rounded-lg border flex items-center justify-center shrink-0', meta.className)}>
              <Icon size={14} strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-txt-primary uppercase tracking-wide truncate">
                {txn.merchant || txn.category?.name || txn.description || txn.type}
              </p>
              <p className="text-2xs text-txt-muted truncate">
                {txn.account.name}
                {txn.type === 'TRANSFER' && txn.transferAccount ? ` → ${txn.transferAccount.name}` : ''} ·{' '}
                {formatDateTime(txn.transactionDate)}
              </p>
            </div>
            <span
              className={cn(
                'num text-xs font-semibold shrink-0',
                txn.type === 'INCOME' && 'text-gain',
                txn.type === 'EXPENSE' && 'text-loss',
                txn.type === 'TRANSFER' && 'text-txt-secondary'
              )}
            >
              {meta.sign}
              {formatCurrency(txn.amount, { currency: txn.currency || currency })}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
