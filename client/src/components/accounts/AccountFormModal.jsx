import { useEffect, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { Input, Select } from '../ui/Input.jsx';
import { useToast } from '../ui/Toast.jsx';
import { accountService } from '../../services/index.js';
import { apiError } from '../../services/apiClient.js';
import { ACCOUNT_TYPE_LABELS, CATEGORY_COLORS, CURRENCIES } from '../../config/constants.js';
import { cn } from '../../utils/cn.js';

export default function AccountFormModal({ open, editing, onClose, onSaved }) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (editing) {
      setForm({
        name: editing.name,
        type: editing.type,
        institution: editing.institution || '',
        balance: String(editing.balance),
        currency: editing.currency || 'INR',
        color: editing.color || '#00d492',
        isActive: editing.isActive,
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, editing]);

  const set = (field) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Account name is required';
    const balance = Number(form.balance);
    if (form.balance === '' || Number.isNaN(balance)) errs.balance = 'Enter a valid balance';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        institution: form.institution.trim() || null,
        balance: Number(balance.toFixed(2)),
        currency: form.currency,
        color: form.color,
        isActive: form.isActive,
      };
      if (editing) {
        await accountService.update(editing.id, payload);
        toast.success('Account updated');
      } else {
        await accountService.create(payload);
        toast.success('Account created');
      }
      onSaved();
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
      title={editing ? 'Edit Account' : 'New Account'}
      subtitle={editing ? 'Update account details' : 'Add a wallet to start tracking'}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Account name" name="name" placeholder="e.g. HDFC Salary" value={form.name} onChange={set('name')} error={errors.name} autoFocus />
          <Select label="Type" name="type" value={form.type} onChange={set('type')}>
            {Object.entries(ACCOUNT_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Institution" name="institution" placeholder="Optional — e.g. ICICI Bank" value={form.institution} onChange={set('institution')} />
          <Input
            label={form.type === 'CREDIT_CARD' ? 'Outstanding amount' : 'Current balance'}
            name="balance"
            type="number"
            step="0.01"
            className="num"
            value={form.balance}
            onChange={set('balance')}
            error={errors.balance}
          />
        </div>

        <div>
          <span className="label-xs block mb-1.5">Accent</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setForm((f) => ({ ...f, color }))}
                aria-label={`Choose accent ${color}`}
                aria-pressed={form.color === color}
                className={cn(
                  'w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110',
                  form.color === color ? 'border-txt-primary scale-110' : 'border-transparent'
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            className="w-4 h-4 rounded accent-[#00d492]"
          />
          <span className="text-xs text-txt-secondary">Account is active and included in totals</span>
        </label>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-stroke">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {editing ? 'Save Changes' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function emptyForm() {
  return {
    name: '',
    type: 'CHECKING',
    institution: '',
    balance: '',
    currency: 'INR',
    color: '#00d492',
    isActive: true,
  };
}
