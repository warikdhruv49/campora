import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { formatCurrency } from '../../utils/format.js';
import { formatDateTime } from '../../utils/date.js';
import { STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '../../config/constants.js';

export default function TransactionDetailModal({ transaction: t, onClose, onEdit }) {
  if (!t) return null;
  const color = t.type === 'INCOME' ? '#00d492' : t.type === 'EXPENSE' ? '#ff5b66' : '#4d8dff';

  const rows = [
    ['Type', TRANSACTION_TYPE_LABELS[t.type]],
    ['Date', formatDateTime(t.transactionDate)],
    ['Account', t.account?.name],
    ...(t.type === 'TRANSFER' && t.transferAccount ? [['To Account', t.transferAccount.name]] : []),
    ['Category', t.category?.name || '—'],
    ['Merchant', t.merchant || '—'],
    ['Description', t.description || '—'],
    ['Reference', t.reference || '—'],
    ['Status', STATUS_LABELS[t.status]],
    ['Recorded', formatDateTime(t.createdAt)],
  ];

  return (
    <Modal open={!!t} onClose={onClose} title="Transaction Detail" size="sm">
      <div className="text-center py-3 border-b border-stroke mb-4">
        <Badge color={color} dot>
          {TRANSACTION_TYPE_LABELS[t.type]}
        </Badge>
        <p className={`num text-2xl font-bold mt-2 ${t.type === 'INCOME' ? 'text-gain' : t.type === 'EXPENSE' ? 'text-loss' : 'text-txt-primary'}`}>
          {t.type === 'INCOME' ? '+' : t.type === 'EXPENSE' ? '−' : ''}
          {formatCurrency(t.amount, { currency: t.currency })}
        </p>
        <p className="text-xs text-txt-secondary mt-1">{t.merchant || t.description || 'Transaction'}</p>
      </div>
      <dl className="space-y-2.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 text-xs">
            <dt className="text-txt-muted shrink-0">{label}</dt>
            <dd className="text-txt-primary text-right truncate">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 flex justify-end gap-2.5">
        <Button variant="outline" size="sm" onClick={() => onEdit(t)}>
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
