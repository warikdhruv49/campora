import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, Plus, Trash2, Pencil, Play, Power } from 'lucide-react';
import { recurringService, accountService, categoryService } from '../services/index.js';
import { formatCurrency } from '../utils/format.js';
import { formatDate } from '../utils/date.js';
import { FREQUENCY_LABELS } from '../config/constants.js';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Input } from '../components/ui/Input.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import CategoryIcon from '../components/common/CategoryIcon.jsx';
import { SkeletonCard } from '../components/ui/Skeleton.jsx';
import { apiError } from '../services/apiClient.js';
import { cn } from '../utils/cn.js';

function RecurringFormModal({ open, onClose, rule, accounts, categories, onSaved }) {
  const isEdit = !!rule;
  const [form, setForm] = useState({
    type: 'EXPENSE',
    amount: '',
    accountId: '',
    categoryId: '',
    merchant: '',
    frequency: 'MONTHLY',
    customDays: '',
    nextDate: '',
    autoCreate: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      type: rule?.type || 'EXPENSE',
      amount: rule ? String(rule.amount) : '',
      accountId: rule?.accountId || accounts[0]?.id || '',
      categoryId: rule?.categoryId || '',
      merchant: rule?.merchant || '',
      frequency: rule?.frequency || 'MONTHLY',
      customDays: rule?.customDays ? String(rule.customDays) : '',
      nextDate: rule?.nextDate ? new Date(rule.nextDate).toISOString().slice(0, 10) : '',
      autoCreate: rule?.autoCreate ?? true,
    });
    setError('');
  }, [open, rule, accounts]);

  const relevantCategories = categories.filter((c) => c.type === form.type);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        type: form.type,
        amount: Number(form.amount),
        accountId: form.accountId,
        categoryId: form.categoryId || null,
        merchant: form.merchant || null,
        frequency: form.frequency,
        ...(form.frequency === 'CUSTOM' ? { customDays: Number(form.customDays) } : { customDays: null }),
        nextDate: new Date(form.nextDate).toISOString(),
        autoCreate: form.autoCreate,
      };
      if (isEdit) await recurringService.update(rule.id, payload);
      else await recurringService.create(payload);
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
      title={isEdit ? 'Edit Recurring Rule' : 'New Recurring Payment'}
      subtitle="Campora can log these automatically on schedule"
      size="md"
    >
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-loss/40 bg-loss-dim px-3.5 py-2.5 text-xs text-loss" role="alert">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="label-xs mb-1.5 block">Type</span>
            <div className="flex rounded-lg border border-stroke overflow-hidden">
              {['EXPENSE', 'INCOME'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t, categoryId: '' }))}
                  className={cn(
                    'flex-1 py-2 text-xs font-medium transition-colors',
                    form.type === t
                      ? t === 'INCOME'
                        ? 'bg-gain-dim text-gain'
                        : 'bg-loss-dim text-loss'
                      : 'text-txt-muted hover:text-txt-secondary'
                  )}
                >
                  {t === 'INCOME' ? 'Income' : 'Expense'}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Amount (₹)"
            type="number"
            min="1"
            step="0.01"
            required
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            placeholder="e.g. 499"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="label-xs mb-1.5 block">Account</span>
            <select
              value={form.accountId}
              onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}
              required
              className="input-base w-full"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label-xs mb-1.5 block">Category</span>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="input-base w-full"
            >
              <option value="">None</option>
              {relevantCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <Input
          label="Name / merchant"
          maxLength={80}
          value={form.merchant}
          onChange={(e) => setForm((f) => ({ ...f, merchant: e.target.value }))}
          placeholder="e.g. Spotify Premium"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="block">
            <span className="label-xs mb-1.5 block">Frequency</span>
            <select
              value={form.frequency}
              onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
              className="input-base w-full"
            >
              {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {form.frequency === 'CUSTOM' && (
            <Input
              label="Every N days"
              type="number"
              min="1"
              max="365"
              required
              value={form.customDays}
              onChange={(e) => setForm((f) => ({ ...f, customDays: e.target.value }))}
              placeholder="e.g. 28"
            />
          )}
          <Input
            label="Next date"
            type="date"
            required
            value={form.nextDate}
            onChange={(e) => setForm((f) => ({ ...f, nextDate: e.target.value }))}
          />
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.autoCreate}
            onChange={(e) => setForm((f) => ({ ...f, autoCreate: e.target.checked }))}
            className="accent-[#00d492] w-4 h-4"
          />
          <span className="text-xs text-txt-secondary">Automatically create the transaction when due</span>
        </label>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={loading}>
            {isEdit ? 'Save changes' : 'Create rule'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function RecurringPage() {
  const [rules, setRules] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const [r, a, c] = await Promise.all([
        recurringService.list(),
        accountService.list(),
        categoryService.list().catch(() => []),
      ]);
      setRules(r);
      setAccounts(a);
      setCategories(c);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (rule) => {
    setBusyId(rule.id);
    try {
      await recurringService.update(rule.id, { isActive: !rule.isActive });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const runNow = async (rule) => {
    setBusyId(rule.id);
    try {
      await recurringService.runNow(rule.id);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fadeIn">
        <PageHeader title="Recurring Payments" subtitle="Subscriptions and bills that repeat" />
        <div className="space-y-3">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    );
  }

  const active = rules?.filter((r) => r.isActive) || [];
  const paused = rules?.filter((r) => !r.isActive) || [];
  const monthlyTotal = active
    .filter((r) => r.type === 'EXPENSE')
    .reduce((s, r) => s + r.amount * (r.frequency === 'YEARLY' ? 1 / 12 : r.frequency === 'WEEKLY' ? 4.33 : 1), 0);

  const RuleRow = ({ rule }) => (
    <div className={cn('panel px-4 py-3.5 flex items-center gap-3', !rule.isActive && 'opacity-55')}>
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-base-700"
        style={{ color: rule.category?.color || '#8b95a5' }}
      >
        <CategoryIcon icon={rule.category?.icon} color={rule.category?.color || '#8b95a5'} size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-txt-primary truncate">
          {rule.merchant || rule.category?.name || 'Recurring payment'}
        </p>
        <p className="text-2xs text-txt-muted truncate">
          {FREQUENCY_LABELS[rule.frequency]}
          {rule.frequency === 'CUSTOM' && rule.customDays ? ` · every ${rule.customDays}d` : ''} ·{' '}
          {rule.account.name} · next {formatDate(rule.nextDate)}
        </p>
      </div>

      <span
        className={cn('num text-sm font-semibold shrink-0', rule.type === 'INCOME' ? 'text-gain' : 'text-txt-primary')}
      >
        {rule.type === 'INCOME' ? '+' : '-'}
        {formatCurrency(rule.amount)}
      </span>

      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => runNow(rule)}
          disabled={busyId === rule.id}
          title="Log a payment now"
          className="p-2 rounded-md text-txt-muted hover:text-gain hover:bg-base-700 transition-colors disabled:opacity-40"
        >
          <Play size={14} />
        </button>
        <button
          onClick={() => toggleActive(rule)}
          disabled={busyId === rule.id}
          title={rule.isActive ? 'Pause rule' : 'Resume rule'}
          className="p-2 rounded-md text-txt-muted hover:text-txt-primary hover:bg-base-700 transition-colors disabled:opacity-40"
        >
          <Power size={14} className={rule.isActive ? 'text-gain' : ''} />
        </button>
        <button
          onClick={() => setEditing(rule)}
          title="Edit rule"
          className="p-2 rounded-md text-txt-muted hover:text-txt-primary hover:bg-base-700 transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => setConfirmDelete(rule)}
          title="Delete rule"
          className="p-2 rounded-md text-txt-muted hover:text-loss hover:bg-base-700 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 lg:space-y-5 animate-fadeIn">
      <PageHeader
        title="Recurring Payments"
        subtitle="Subscriptions and bills that repeat"
        action={
          <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus size={14} /> New rule
          </Button>
        }
      />

      {active.length > 0 && (
        <div className="panel p-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-xs">Estimated monthly recurring spend</p>
            <p className="num text-2xl font-semibold text-txt-primary mt-1.5">{formatCurrency(monthlyTotal)}</p>
          </div>
          <p className="text-2xs text-txt-secondary">
            {active.length} active rule{active.length === 1 ? '' : 's'}
            {paused.length > 0 && ` · ${paused.length} paused`}
          </p>
        </div>
      )}

      {!rules?.length ? (
        <EmptyState
          icon={CalendarClock}
          title="No recurring payments yet"
          description="Add your Netflix, Spotify or Wi-Fi bill once — Campora keeps track of it every cycle."
          action={<Button size="sm" onClick={() => setFormOpen(true)}>Add your first rule</Button>}
        />
      ) : (
        <div className="space-y-3">
          {[...active, ...paused].map((rule) => (
            <RuleRow key={rule.id} rule={rule} />
          ))}
        </div>
      )}

      <RecurringFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        rule={null}
        accounts={accounts}
        categories={categories}
        onSaved={load}
      />
      <RecurringFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        rule={editing}
        accounts={accounts}
        categories={categories}
        onSaved={load}
      />
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => {
          await recurringService.remove(confirmDelete.id);
          setConfirmDelete(null);
          load();
        }}
        title="Delete recurring rule?"
        message={`Stop tracking "${confirmDelete?.merchant || 'this payment'}"? Past transactions are kept.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
