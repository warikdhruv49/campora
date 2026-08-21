import { useEffect, useMemo, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { Input, Select } from '../ui/Input.jsx';
import { useToast } from '../ui/Toast.jsx';
import { accountService, categoryService, transactionService } from '../../services/index.js';
import { apiError } from '../../services/apiClient.js';
import { TRANSACTION_TYPE_LABELS, STATUS_LABELS } from '../../config/constants.js';
import { toDateInputValue, toTimeInputValue } from '../../utils/date.js';
import { cn } from '../../utils/cn.js';

const TYPES = ['INCOME', 'EXPENSE', 'TRANSFER'];

export default function TransactionFormModal({ open, onClose, onSaved, editing }) {
  const toast = useToast();
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    if (!open) return;
    setLoadingData(true);
    Promise.all([accountService.list(), categoryService.list()])
      .then(([accs, cats]) => {
        setAccounts(accs.filter((a) => a.isActive));
        setCategories(cats);
      })
      .catch((err) => toast.error(apiError(err)))
      .finally(() => setLoadingData(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (editing) {
      const d = new Date(editing.transactionDate);
      setForm({
        type: editing.type,
        amount: String(editing.amount),
        accountId: editing.accountId || '',
        transferAccountId: editing.transferAccountId || '',
        categoryId: editing.categoryId || '',
        merchant: editing.merchant || '',
        description: editing.description || '',
        reference: editing.reference || '',
        status: editing.status,
        date: toDateInputValue(d),
        time: toTimeInputValue(d),
      });
    } else {
      const now = new Date();
      setForm({
        ...emptyForm(),
        date: toDateInputValue(now),
        time: toTimeInputValue(now),
      });
    }
  }, [open, editing]);

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.type === form.type),
    [categories, form.type]
  );

  const set = (field) => (e) => {
    const value = e.target.value;
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === 'type') next.categoryId = '';
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    const amount = Number(form.amount);
    if (!form.amount || Number.isNaN(amount) || amount <= 0) errs.amount = 'Enter a valid positive amount';
    if (!form.accountId) errs.accountId = 'Select an account';
    if (form.type === 'TRANSFER') {
      if (!form.transferAccountId) errs.transferAccountId = 'Select destination account';
      else if (form.transferAccountId === form.accountId) errs.transferAccountId = 'Must differ from source';
    } else if (!form.categoryId) {
      errs.categoryId = 'Select a category';
    }
    if (!form.date) errs.date = 'Date is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        type: form.type,
        amount: Number(Number(form.amount).toFixed(2)),
        accountId: form.accountId,
        transferAccountId: form.type === 'TRANSFER' ? form.transferAccountId : null,
        categoryId: form.type !== 'TRANSFER' ? form.categoryId : null,
        merchant: form.merchant.trim() || null,
        description: form.description.trim() || null,
        reference: form.reference.trim() || null,
        status: form.status,
        transactionDate: new Date(`${form.date}T${form.time || '00:00'}`).toISOString(),
      };
      if (editing) {
        await transactionService.update(editing.id, payload);
        toast.success('Transaction updated');
      } else {
        await transactionService.create(payload);
        toast.success('Transaction recorded');
      }
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Transaction' : 'New Transaction'}
      subtitle={editing ? 'Update the details below' : 'Record an entry in seconds'}
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <span className="label-xs block mb-1.5">Type</span>
          <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Transaction type">
            {TYPES.map((type) => (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={form.type === type}
                onClick={() => setForm((f) => ({ ...f, type, categoryId: '' }))}
                className={cn(
                  'h-9 rounded-lg border text-xs font-semibold transition-all',
                  form.type === type
                    ? type === 'INCOME'
                      ? 'border-gain/60 bg-gain-dim text-gain'
                      : type === 'EXPENSE'
                        ? 'border-loss/60 bg-loss-dim text-loss'
                        : 'border-brand-blue/60 bg-brand-blue/10 text-brand-blue'
                    : 'border-stroke bg-base-850 text-txt-muted hover:text-txt-secondary hover:border-stroke-strong'
                )}
              >
                {TRANSACTION_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={`Amount (${form.type === 'INCOME' ? 'credit' : form.type === 'EXPENSE' ? 'debit' : 'transfer'})`}
            name="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            autoFocus
            className="num !text-base font-semibold"
            value={form.amount}
            onChange={set('amount')}
            error={errors.amount}
          />
          <Select label="Status" name="status" value={form.status} onChange={set('status')}>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label={form.type === 'TRANSFER' ? 'From Account' : 'Account'} name="accountId" value={form.accountId} onChange={set('accountId')} error={errors.accountId}>
            <option value="">Select account…</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · {a.balance.toFixed(2)}
              </option>
            ))}
          </Select>

          {form.type === 'TRANSFER' ? (
            <Select
              label="To Account"
              name="transferAccountId"
              value={form.transferAccountId}
              onChange={set('transferAccountId')}
              error={errors.transferAccountId}
            >
              <option value="">Select destination…</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          ) : (
            <Select label="Category" name="categoryId" value={form.categoryId} onChange={set('categoryId')} error={errors.categoryId}>
              <option value="">Select category…</option>
              {visibleCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Merchant / Source" name="merchant" placeholder="e.g. Swiggy, Acme Corp" value={form.merchant} onChange={set('merchant')} />
          <Input label="Reference #" name="reference" placeholder="Optional" value={form.reference} onChange={set('reference')} className="num" />
        </div>

        <Input
          label="Description"
          name="description"
          placeholder="Optional note"
          value={form.description}
          onChange={set('description')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Date" name="date" type="date" value={form.date} onChange={set('date')} error={errors.date} />
          <Input label="Time" name="time" type="time" value={form.time} onChange={set('time')} />
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-stroke">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {editing ? 'Save Changes' : 'Record Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function emptyForm() {
  return {
    type: 'EXPENSE',
    amount: '',
    accountId: '',
    transferAccountId: '',
    categoryId: '',
    merchant: '',
    description: '',
    reference: '',
    status: 'COMPLETED',
    date: '',
    time: '',
  };
}
