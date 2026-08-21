import { useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft, Eye, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { SkeletonTable } from '../ui/Skeleton.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import TransactionDetailModal from './TransactionDetailModal.jsx';
import { formatCurrency } from '../../utils/format.js';
import { formatDateTime } from '../../utils/date.js';
import { STATUS_LABELS } from '../../config/constants.js';
import { cn } from '../../utils/cn.js';

const TYPE_META = {
  INCOME: { icon: ArrowDownToLine, cls: 'text-gain', chip: 'bg-gain-dim border-gain/30 text-gain', sign: '+' },
  EXPENSE: { icon: ArrowUpFromLine, cls: 'text-loss', chip: 'bg-loss-dim border-loss/30 text-loss', sign: '−' },
  TRANSFER: { icon: ArrowRightLeft, cls: 'text-brand-blue', chip: 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue', sign: '' },
};

export default function TransactionTable({ transactions, loading, currency, onEdit, onDelete, onAdd }) {
  const [detail, setDetail] = useState(null);
  const [deleting, setDeleting] = useState(null);

  if (loading) return <SkeletonTable rows={10} cols={7} />;

  if (!transactions?.length) {
    return (
      <EmptyState
        icon={ArrowRightLeft}
        title="No transactions found"
        description="Nothing matches the current filters. Record a new transaction or adjust your filters."
        action={
          <button onClick={onAdd} className="text-xs font-medium text-gain hover:underline">
            + Add transaction
          </button>
        }
      />
    );
  }

  const statusTone = (status) =>
    status === 'COMPLETED' ? '#00d492' : status === 'PENDING' ? '#f5a623' : '#5c6878';

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stroke label-xs">
              <th className="px-4 py-3 font-semibold">Date / Time</th>
              <th className="px-3 py-3 font-semibold">Type</th>
              <th className="px-3 py-3 font-semibold">Merchant</th>
              <th className="px-3 py-3 font-semibold">Category</th>
              <th className="px-3 py-3 font-semibold">Account</th>
              <th className="px-3 py-3 font-semibold text-right">Amount</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold">Ref</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => {
              const meta = TYPE_META[txn.type];
              const Icon = meta.icon;
              return (
                <tr
                  key={txn.id}
                  onClick={() => setDetail(txn)}
                  className="group border-b border-stroke/50 hover:bg-base-750/60 cursor-pointer transition-colors animate-fadeIn"
                >
                  <td className="px-4 py-2.5 num text-xs text-txt-secondary whitespace-nowrap">
                    {formatDateTime(txn.transactionDate)}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn('inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-2xs font-semibold', meta.chip)}>
                      <Icon size={11} />
                      {txn.type}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 max-w-[180px]">
                    <p className="text-xs font-medium text-txt-primary truncate">{txn.merchant || txn.description || '—'}</p>
                    {txn.description && txn.merchant && (
                      <p className="text-2xs text-txt-muted truncate">{txn.description}</p>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {txn.category ? (
                      <Badge color={txn.category.color} dot>
                        {txn.category.name}
                      </Badge>
                    ) : txn.type === 'TRANSFER' && txn.transferAccount ? (
                      <span className="text-2xs text-txt-secondary num">
                        → {txn.transferAccount.name}
                      </span>
                    ) : (
                      <span className="text-2xs text-txt-muted">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 max-w-[140px]">
                    <span className="flex items-center gap-1.5 text-xs text-txt-secondary truncate">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: txn.account.color }} />
                      <span className="truncate">{txn.account.name}</span>
                    </span>
                  </td>
                  <td className={cn('px-3 py-2.5 text-right num text-xs font-semibold whitespace-nowrap', meta.cls)}>
                    {meta.sign}
                    {formatCurrency(txn.amount, { currency: txn.currency })}
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge color={statusTone(txn.status)} dot>
                      {STATUS_LABELS[txn.status]}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 num text-2xs text-txt-muted whitespace-nowrap">{txn.reference || '—'}</td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <IconBtn label="View" onClick={() => setDetail(txn)}><Eye size={13} /></IconBtn>
                      <IconBtn label="Edit" onClick={() => onEdit(txn)}><Pencil size={13} /></IconBtn>
                      <IconBtn label="Delete" danger onClick={() => setDeleting(txn)}><Trash2 size={13} /></IconBtn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="md:hidden divide-y divide-stroke/60">
        {transactions.map((txn) => {
          const meta = TYPE_META[txn.type];
          const Icon = meta.icon;
          return (
            <li key={txn.id} className="py-3 px-1" onClick={() => setDetail(txn)}>
              <div className="flex items-center gap-3">
                <span className={cn('w-8 h-8 rounded-lg border flex items-center justify-center shrink-0', meta.chip)}>
                  <Icon size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-txt-primary truncate">{txn.merchant || txn.description || txn.type}</p>
                  <p className="text-2xs text-txt-muted truncate">
                    {formatDateTime(txn.transactionDate)} · {txn.category?.name || txn.account.name}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={cn('num text-sm font-semibold', meta.cls)}>
                    {meta.sign}
                    {formatCurrency(txn.amount, { currency: txn.currency })}
                  </p>
                  <p className="text-2xs text-txt-muted">{STATUS_LABELS[txn.status]}</p>
                </div>
                <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                  <IconBtn label="Edit" onClick={() => onEdit(txn)}><Pencil size={12} /></IconBtn>
                  <IconBtn label="Delete" danger onClick={() => setDeleting(txn)}><Trash2 size={12} /></IconBtn>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <TransactionDetailModal transaction={detail} onClose={() => setDetail(null)} onEdit={(t) => { setDetail(null); onEdit(t); }} />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => onDelete(deleting)}
        title="Delete transaction"
        message={`This will permanently remove the ${deleting?.type?.toLowerCase() || ''} of ${formatCurrency(deleting?.amount || 0)} and reverse its balance effect. This cannot be undone.`}
      />
    </>
  );
}

function IconBtn({ children, label, danger, ...props }) {
  return (
    <button
      {...props}
      title={label}
      aria-label={label}
      className={cn(
        'p-1.5 rounded-md text-txt-muted transition-colors',
        danger ? 'hover:text-loss hover:bg-loss-dim' : 'hover:text-txt-primary hover:bg-base-700'
      )}
    >
      {children}
    </button>
  );
}
