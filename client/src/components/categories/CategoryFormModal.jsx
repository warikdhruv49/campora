import { useEffect, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { Input, Select } from '../ui/Input.jsx';
import { useToast } from '../ui/Toast.jsx';
import { categoryService } from '../../services/index.js';
import { apiError } from '../../services/apiClient.js';
import { CATEGORY_COLORS, TRANSACTION_TYPE_LABELS } from '../../config/constants.js';
import { cn } from '../../utils/cn.js';

export default function CategoryFormModal({ open, editing, onClose, onSaved }) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ name: '', type: 'EXPENSE', color: CATEGORY_COLORS[0] });

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (editing) {
      setForm({ name: editing.name, type: editing.type, color: editing.color });
    } else {
      setForm({ name: '', type: 'EXPENSE', color: CATEGORY_COLORS[0] });
    }
  }, [open, editing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrors({ name: 'Category name is required' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = { name: form.name.trim(), type: form.type, color: form.color };
      if (editing) {
        await categoryService.update(editing.id, payload);
        toast.success('Category updated');
      } else {
        await categoryService.create(payload);
        toast.success('Category created');
      }
      onSaved();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Category' : 'New Category'} size="sm">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Name"
          name="name"
          placeholder="e.g. Groceries"
          value={form.name}
          onChange={(e) => {
            setForm((f) => ({ ...f, name: e.target.value }));
            setErrors({});
          }}
          error={errors.name}
          autoFocus
        />
        <Select
          label="Applies to"
          value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          disabled={!!editing}
        >
          {Object.entries(TRANSACTION_TYPE_LABELS)
            .filter(([v]) => v !== 'TRANSFER')
            .map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
        </Select>
        <div>
          <span className="label-xs block mb-1.5">Color</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setForm((f) => ({ ...f, color }))}
                aria-label={`Choose color ${color}`}
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
        <div className="flex justify-end gap-2.5 pt-2 border-t border-stroke">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {editing ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
