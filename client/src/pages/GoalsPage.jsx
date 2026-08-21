import { useCallback, useEffect, useState } from 'react';
import { PiggyBank, Plus, Trash2, Pencil, ArrowUpCircle, Archive, PartyPopper } from 'lucide-react';
import { goalService } from '../services/goal.service.js';
import { formatCurrency, formatPercent } from '../utils/format.js';
import { formatDate } from '../utils/date.js';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Input } from '../components/ui/Input.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { SkeletonCard } from '../components/ui/Skeleton.jsx';
import { apiError } from '../services/apiClient.js';
import { cn } from '../utils/cn.js';

const GOAL_COLORS = ['#00d492', '#4d8dff', '#a06bfa', '#f5a623', '#ff8a4c', '#22d3ee'];

function GoalFormModal({ open, onClose, goal, onSaved }) {
  const isEdit = !!goal;
  const [form, setForm] = useState({ name: '', targetAmount: '', targetDate: '', color: GOAL_COLORS[0] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        name: goal?.name || '',
        targetAmount: goal ? String(goal.targetAmount) : '',
        targetDate: goal?.targetDate ? String(goal.targetDate).slice(0, 10) : '',
        color: goal?.color || GOAL_COLORS[0],
      });
      setError('');
    }
  }, [open, goal]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        targetAmount: Number(form.targetAmount),
        ...(form.targetDate ? { targetDate: new Date(form.targetDate).toISOString() } : { targetDate: null }),
        color: form.color,
      };
      if (isEdit) await goalService.update(goal.id, payload);
      else await goalService.create(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Goal' : 'New Savings Goal'} size="sm">
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-loss/40 bg-loss-dim px-3.5 py-2.5 text-xs text-loss" role="alert">
            {error}
          </div>
        )}
        <Input
          label="Goal name"
          required
          maxLength={60}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. New Laptop"
        />
        <Input
          label="Target amount (₹)"
          type="number"
          min="1"
          step="0.01"
          required
          value={form.targetAmount}
          onChange={(e) => setForm((f) => ({ ...f, targetAmount: e.target.value }))}
          placeholder="e.g. 60000"
        />
        <Input
          label="Target date (optional)"
          type="date"
          value={form.targetDate}
          onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))}
        />
        <div>
          <span className="label-xs mb-1.5 block">Color</span>
          <div className="flex gap-2">
            {GOAL_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm((f) => ({ ...f, color: c }))}
                aria-label={`Choose color ${c}`}
                className={cn(
                  'w-7 h-7 rounded-full transition-transform',
                  form.color === c ? 'ring-2 ring-offset-2 ring-offset-base-850 scale-110' : 'opacity-70'
                )}
                style={{ backgroundColor: c, ...(form.color === c ? { boxShadow: `0 0 0 2px ${c}` } : {}) }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={loading}>
            {isEdit ? 'Save changes' : 'Create goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function MoveMoneyModal({ open, onClose, goal, mode, onSaved }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount('');
      setError('');
    }
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'add') await goalService.contribute(goal.id, Number(amount));
      else await goalService.withdraw(goal.id, Number(amount));
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
      title={mode === 'add' ? `Add to ${goal?.name}` : `Withdraw from ${goal?.name}`}
      size="sm"
    >
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-loss/40 bg-loss-dim px-3.5 py-2.5 text-xs text-loss" role="alert">
            {error}
          </div>
        )}
        <p className="text-xs text-txt-secondary num">
          Currently saved: {formatCurrency(goal?.savedAmount ?? 0)}
        </p>
        <Input
          label="Amount (₹)"
          type="number"
          min="0.01"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 500"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={loading}>
            {mode === 'add' ? 'Add money' : 'Withdraw'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [money, setMoney] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      setGoals(await goalService.list());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-4 animate-fadeIn">
        <PageHeader title="Savings Goals" subtitle="Save for the things that matter to you" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-5 animate-fadeIn">
      <PageHeader
        title="Savings Goals"
        subtitle="Save for the things that matter to you"
        action={
          <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus size={14} /> New goal
          </Button>
        }
      />

      {!goals?.length ? (
        <EmptyState
          icon={PiggyBank}
          title="No savings goals yet"
          description="Create a goal for that laptop, trip or emergency fund — and watch it fill up."
          action={<Button size="sm" onClick={() => setFormOpen(true)}>Create your first goal</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map((g) => (
            <div key={g.id} className="panel p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-txt-primary truncate">{g.name}</p>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setEditing(g)}
                    className="p-1.5 rounded-md text-txt-muted hover:text-txt-primary hover:bg-base-700 transition-colors"
                    aria-label={`Edit ${g.name}`}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(g)}
                    className="p-1.5 rounded-md text-txt-muted hover:text-loss hover:bg-base-700 transition-colors"
                    aria-label={`Delete ${g.name}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {g.completed && (
                <p className="mt-1 inline-flex items-center gap-1 text-2xs text-gain font-medium">
                  <PartyPopper size={12} /> Goal reached!
                </p>
              )}

              <div className="mt-3 flex items-end justify-between gap-2">
                <p className="num text-xl font-semibold text-txt-primary">{formatCurrency(g.savedAmount, { decimals: 0 })}</p>
                <p className="text-2xs text-txt-muted num">of {formatCurrency(g.targetAmount, { decimals: 0 })}</p>
              </div>

              <div className="mt-3 h-2 rounded-full bg-base-700 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(g.pct, 2)}%`, backgroundColor: g.color }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-2xs text-txt-muted">
                <span className="num">{formatPercent(g.pct, { signed: false })}</span>
                {g.targetDate && <span>by {formatDate(g.targetDate)}</span>}
              </div>

              <div className="mt-4 pt-3 border-t border-stroke/60 flex gap-2">
                <Button variant="subtle" size="sm" className="flex-1" onClick={() => setMoney({ goal: g, mode: 'add' })}>
                  <ArrowUpCircle size={13} /> Add
                </Button>
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => setMoney({ goal: g, mode: 'withdraw' })}>
                  Withdraw
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <GoalFormModal open={formOpen} onClose={() => setFormOpen(false)} goal={null} onSaved={load} />
      <GoalFormModal open={!!editing} onClose={() => setEditing(null)} goal={editing} onSaved={load} />
      <MoveMoneyModal
        open={!!money}
        onClose={() => setMoney(null)}
        goal={money?.goal}
        mode={money?.mode || 'add'}
        onSaved={load}
      />
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => {
          await goalService.remove(confirmDelete.id);
          setConfirmDelete(null);
          load();
        }}
        title="Delete goal?"
        message={`Delete "${confirmDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
      />

      {goals?.some((g) => g.isArchived) && (
        <p className="flex items-center gap-1.5 text-2xs text-txt-muted">
          <Archive size={11} /> Archived goals are hidden.
        </p>
      )}
    </div>
  );
}
