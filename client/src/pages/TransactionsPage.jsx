import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { transactionService, accountService, categoryService } from '../services/index.js';
import { apiError } from '../services/apiClient.js';
import { useToast } from '../components/ui/Toast.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useDebounce } from '../hooks/index.js';
import TransactionTable from '../components/transactions/TransactionTable.jsx';
import TransactionFormModal from '../components/transactions/TransactionFormModal.jsx';
import TransactionFilters from '../components/transactions/TransactionFilters.jsx';
import Button from '../components/ui/Button.jsx';

const DEFAULT_FILTERS = {
  search: '',
  type: '',
  status: '',
  accountId: '',
  categoryId: '',
  from: '',
  to: '',
  minAmount: '',
  maxAmount: '',
  sortBy: 'transactionDate',
  sortOrder: 'desc',
  page: 1,
};

export default function TransactionsPage() {
  const toast = useToast();
  const { refreshKey } = useUI();
  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const accountId = params.get('accountId') || '';
    return accountId ? { ...DEFAULT_FILTERS, accountId } : DEFAULT_FILTERS;
  });
  const [data, setData] = useState({ items: [], meta: null });
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 350);

  const queryParams = useMemo(() => {
    const { search, ...rest } = filters;
    const cleaned = { ...rest };
    for (const key of ['type', 'status', 'accountId', 'categoryId', 'from', 'to', 'minAmount', 'maxAmount']) {
      if (!cleaned[key]) delete cleaned[key];
    }
    return { ...cleaned, search: debouncedSearch || undefined, page: filters.page };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearch,
    filters.type,
    filters.status,
    filters.accountId,
    filters.categoryId,
    filters.from,
    filters.to,
    filters.minAmount,
    filters.maxAmount,
    filters.sortBy,
    filters.sortOrder,
    filters.page,
  ]);

  useEffect(() => {
    Promise.all([accountService.list(), categoryService.list()])
      .then(([accs, cats]) => {
        setAccounts(accs);
        setCategories(cats);
      })
      .catch((err) => toast.error(apiError(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    transactionService
      .list(queryParams)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) toast.error(apiError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  useEffect(load, [load]);

  useEffect(() => {
    if (refreshKey > 0) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const toggleSort = (column) => {
    setFilters((f) => ({
      ...f,
      sortBy: column,
      sortOrder: f.sortBy === column && f.sortOrder === 'desc' ? 'asc' : 'desc',
      page: 1,
    }));
  };

  const handleDelete = async (txn) => {
    try {
      await transactionService.remove(txn.id);
      toast.success('Transaction deleted');
      load();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (txn) => {
    setEditing(txn);
    setFormOpen(true);
  };

  const meta = data.meta;

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-txt-primary tracking-tight">Transaction Order Book</h1>
          <p className="text-xs text-txt-secondary mt-0.5">
            Every credit, debit and transfer — searchable and sortable.
          </p>
        </div>
        <Button onClick={openNew} size="sm">
          + New Entry
        </Button>
      </div>

      <TransactionFilters
        filters={filters}
        onChange={setFilters}
        accounts={accounts}
        categories={categories}
        resultCount={meta?.total}
      />

      <div className="panel overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-stroke bg-base-850/60">
          <span className="label-xs">Market Activity</span>
          <button
            onClick={() => toggleSort('amount')}
            className="inline-flex items-center gap-1 text-2xs text-txt-muted hover:text-txt-secondary transition-colors"
          >
            <ArrowUpDown size={11} />
            Sort by {filters.sortBy === 'amount' ? `amount ${filters.sortOrder === 'desc' ? '↓' : '↑'}` : 'date'}
          </button>
        </div>

        <TransactionTable
          transactions={data.items}
          loading={loading}
          currency={accounts[0]?.currency}
          onEdit={openEdit}
          onDelete={handleDelete}
          onAdd={openNew}
        />

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-stroke">
            <p className="num text-2xs text-txt-muted">
              Page {meta.page} of {meta.totalPages} · {meta.total.toLocaleString('en-IN')} records
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={!meta.hasPrevPage}
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!meta.hasNextPage}
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <TransactionFormModal open={formOpen} onClose={() => setFormOpen(false)} editing={editing} onSaved={load} />
    </div>
  );
}
