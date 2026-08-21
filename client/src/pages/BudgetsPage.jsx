import { useCallback, useEffect, useState } from 'react';
import { Target, Trash2, Pencil, Plus, AlertTriangle, Wallet } from 'lucide-react';
import { budgetService, categoryService } from '../services/index.js';
import { useUI } from '../context/UIContext.jsx';
import { formatCurrency } from '../utils/format.js';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Input } from '../components/ui/Input.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import CategoryIcon from '../components/common/CategoryIcon.jsx';
import { SkeletonCard } from '../components/ui/Skeleton.jsx';
import { apiError } from '../services/apiClient.js';

function BudgetFormModal({ open, onClose, budget, categories, existingCategoryIds = [], onSaved }) {
  const isEdit = !!budget;
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(budget ? String(budget.amount) : '');
      setCategoryId(budget?.category?.id || '');
      setError('');
    }
  }, [open, budget]);

  const available = categories.filter(
    (c) => c.type === 'EXPENSE' && !existingCategoryIds.includes(c.id)
  );

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await budgetService.update(budget.id, Number(amount));
      } else {
        await budgetService.upsertCategory({ categoryId, amount: Number(amount) });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Budget' : 'Set Category Budget'}
      subtitle="Monthly spending limit for one category"
      size="sm"
    >
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-loss/40 bg-loss-dim px-3.5 py-2.5 text-xs text-loss" role="alert">
            {error}
          </div>
        )}
        {!isEdit && (
          <label className="block">
            <span className="label-xs mb-1.5 block">Expense category</span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="input-base w-full"
            >
              <option value="">Select a category…</option>
              {available.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <Input
          label="Monthly limit (₹)"
          type="number"
          min="1"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 3000"
        />
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={loading}>
            {isEdit ? 'Save changes' : 'Set budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function BudgetsPage() {
  const { refreshKey } = useUI();
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [overallOpen, setOverallOpen] = useState(false);
  const [overallValue, setOverallValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [savingOverall, setSavingOverall] = useState(false);

  const load = useCallback(async () => {
    try {
      const [overview, cats] = await Promise.all([
        budgetService.overview(),
        categoryService.list().catch(() => []),
      ]);
      setData(overview);
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const saveOverall = async (e) => {
    e.preventDefault();
    setSavingOverall(true);
    try {
      await budgetService.setOverall(Number(overallValue));
      setOverallOpen(false);
      await load();
    } finally {
      setSavingOverall(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fadeIn">
        <PageHeader title="Budgets" subtitle="Plan your monthly spending before it happens" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    );
  }

  const overall = data.overall;

  return (
    <div className="space-y-4 lg:space-y-5 animate-fadeIn">
      <PageHeader
        title="Budgets"
        subtitle="Plan your monthly spending before it happens"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setOverallValue(overall.budget ? String(overall.budget) : ''); setOverallOpen(true); }}>
              <Wallet size={14} /> Overall budget
            </Button>
            <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus size={14} /> Category budget
            </Button>
          </div>
        }
      />

      <div className="panel p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-xs">Overall monthly budget</p>
            <p className="num text-2xl font-semibold text-txt-primary mt-1.5">{formatCurrency(overall.budget, { decimals: 0 })}</p>
          </div>
          <div className="flex gap-6">
            <div>
              <p className="label-xs">Spent</p>
              <p className={`num text-sm font-semibold mt-1.5 ${overall.overspent ? 'text-loss' : 'text-txt-primary'}`}>
                {formatCurrency(overall.spent, { decimals: 0 })}
              </p>
            </div>
            <div>
              <p className="label-xs">Remaining</p>
              <p className="num text-sm font-semibold mt-1.5 text-gain">{formatCurrency(overall.remaining, { decimals: 0 })}</p>
            </div>
            <div>
              <p className="label-xs">Safe / day</p>
              <p className="num text-sm font-semibold mt-1.5 text-txt-primary">
                {overall.dailyLimit !== null ? formatCurrency(overall.dailyLimit, { decimals: 0 }) : '—'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 h-2.5 rounded-full bg-base-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${overall.overspent ? 'bg-loss' : overall.pct >= 75 ? 'bg-[#f5a623]' : 'bg-gain'}`}
            style={{ width: `${Math.max(Math.min(100, overall.pct), 2)}%` }}
          />
        </div>
        {overall.overspent && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-loss">
            <AlertTriangle size={13} /> You have overspent your monthly budget by{' '}
            {formatCurrency(overall.spent - overall.budget, { decimals: 0 })}.
          </p>
        )}
      </div>

      {data.categories.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No category budgets yet"
          description="Set limits for Food, Transport or Entertainment to keep your month on track."
          action={<Button size="sm" onClick={() => setFormOpen(true)}>Set your first budget</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.categories.map((b) => (
            <div key={b.id} className="panel p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <CategoryIcon icon={b.category?.icon} color={b.category?.color} size={17} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-txt-primary truncate">{b.category?.name}</p>
                    <p className="num text-2xs text-txt-muted">
                      {formatCurrency(b.spent, { decimals: 0 })} of {formatCurrency(b.amount, { decimals: 0 })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setEditing(b)}
                    className="p-1.5 rounded-md text-txt-muted hover:text-txt-primary hover:bg-base-700 transition-colors"
                    aria-label={`Edit ${b.category?.name} budget`}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(b)}
                    className="p-1.5 rounded-md text-txt-muted hover:text-loss hover:bg-base-700 transition-colors"
                    aria-label={`Remove ${b.category?.name} budget`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="mt-4 h-2 rounded-full bg-base-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${b.overspent ? 'bg-loss' : b.warning ? 'bg-[#f5a623]' : 'bg-gain'}`}
                  style={{ width: `${Math.max(b.pct, 2)}%` }}
                />
              </div>

              <div className="mt-2.5 flex items-center justify-between text-2xs">
                <span className={b.overspent ? 'text-loss font-medium' : b.warning ? 'text-[#f5a623]' : 'text-txt-muted'}>
                  {b.overspent ? `Over by ${formatCurrency(Math.abs(b.remaining), { decimals: 0 })}` : `${formatCurrency(b.remaining, { decimals: 0 })} left`}
                </span>
                <span className="text-txt-muted num">{b.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <BudgetFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        budget={null}
        categories={categories}
        existingCategoryIds={data.categories.map((b) => b.categoryId)}
        onSaved={load}
      />
      <BudgetFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        budget={editing}
        categories={categories}
        onSaved={load}
      />

      <Modal open={overallOpen} onClose={() => setOverallOpen(false)} title="Overall Monthly Budget" size="sm">
        <form onSubmit={saveOverall} className="space-y-4">
          <Input
            label="Total monthly spend limit (₹)"
            type="number"
            min="0"
            step="0.01"
            required
            value={overallValue}
            onChange={(e) => setOverallValue(e.target.value)}
            placeholder="e.g. 15000"
          />
          <p className="text-2xs text-txt-muted">Set to 0 to remove the overall limit.</p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOverallOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={savingOverall}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => {
          await budgetService.remove(confirmDelete.id);
          setConfirmDelete(null);
          load();
        }}
        title="Remove budget?"
        message={`Remove the budget for ${confirmDelete?.category?.name}? Your transactions are not affected.`}
        confirmLabel="Remove"
      />
    </div>
  );
}
