import { Search, X } from 'lucide-react';
import { Select, Input } from '../ui/Input.jsx';
import { TRANSACTION_TYPE_LABELS, STATUS_LABELS, ACCOUNT_TYPE_LABELS } from '../../config/constants.js';

export default function TransactionFilters({
  filters,
  onChange,
  accounts,
  categories,
  resultCount,
}) {
  const set = (field) => (e) => onChange({ ...filters, [field]: e.target.value, page: 1 });
  const hasActive =
    filters.search || filters.type || filters.status || filters.accountId || filters.categoryId ||
    filters.from || filters.to || filters.minAmount || filters.maxAmount;

  return (
    <div className="panel p-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={set('search')}
            placeholder="Search merchant, description, reference…"
            aria-label="Search transactions"
            className="input-base !pl-9 !py-2 h-9"
          />
        </div>

        <Select value={filters.type} onChange={set('type')} aria-label="Filter by type" className="!w-auto !py-2 h-9 min-w-[110px]">
          <option value="">All Types</option>
          {Object.entries(TRANSACTION_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </Select>

        <Select value={filters.status} onChange={set('status')} aria-label="Filter by status" className="!w-auto !py-2 h-9 min-w-[120px]">
          <option value="">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </Select>

        <Select value={filters.accountId} onChange={set('accountId')} aria-label="Filter by account" className="!w-auto !py-2 h-9 min-w-[130px]">
          <option value="">All Accounts</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </Select>

        <Select value={filters.categoryId} onChange={set('categoryId')} aria-label="Filter by category" className="!w-auto !py-2 h-9 min-w-[130px]">
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>

        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            value={filters.from}
            onChange={set('from')}
            aria-label="From date"
            className="!py-2 h-9 w-[140px]"
          />
          <span className="text-txt-muted text-xs">→</span>
          <Input
            type="date"
            value={filters.to}
            onChange={set('to')}
            aria-label="To date"
            className="!py-2 h-9 w-[140px]"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            min="0"
            value={filters.minAmount}
            onChange={set('minAmount')}
            aria-label="Minimum amount"
            placeholder="Min ₹"
            className="!py-2 h-9 w-[90px]"
          />
          <span className="text-txt-muted text-xs">–</span>
          <Input
            type="number"
            min="0"
            value={filters.maxAmount}
            onChange={set('maxAmount')}
            aria-label="Maximum amount"
            placeholder="Max ₹"
            className="!py-2 h-9 w-[90px]"
          />
        </div>

        {hasActive && (
          <button
            onClick={() =>
              onChange({ search: '', type: '', status: '', accountId: '', categoryId: '', from: '', to: '', minAmount: '', maxAmount: '', page: 1 })
            }
            className="inline-flex items-center gap-1 text-2xs font-medium text-loss hover:underline px-2 py-1.5"
          >
            <X size={12} /> Clear
          </button>
        )}

        <span className="ml-auto num text-2xs text-txt-muted whitespace-nowrap">
          {resultCount != null ? `${resultCount.toLocaleString('en-IN')} results` : ''}
        </span>
      </div>
    </div>
  );
}
