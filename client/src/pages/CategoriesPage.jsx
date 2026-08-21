import { useCallback, useEffect, useState } from 'react';
import { Tags, Plus, Pencil, Trash2 } from 'lucide-react';
import { categoryService } from '../services/index.js';
import { apiError } from '../services/apiClient.js';
import { useToast } from '../components/ui/Toast.jsx';
import Button from '../components/ui/Button.jsx';
import CategoryFormModal from '../components/categories/CategoryFormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';

export default function CategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    categoryService
      .list()
      .then(setCategories)
      .catch((err) => toast.error(apiError(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(load, [load]);

  const income = categories.filter((c) => c.type === 'INCOME');
  const expense = categories.filter((c) => c.type === 'EXPENSE');

  const handleDelete = async (category) => {
    try {
      await categoryService.remove(category.id);
      toast.success(`Deleted “${category.name}”`);
      load();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-txt-primary tracking-tight">Categories</h1>
          <p className="text-xs text-txt-secondary mt-0.5">Organize your income and spending.</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={15} /> New Category
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="panel p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              {[...Array(6)].map((_, j) => (
                <Skeleton key={j} className="h-9 w-full" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CategorySection
            title="Income"
            accent="#00d492"
            items={income}
            onEdit={(c) => {
              setEditing(c);
              setFormOpen(true);
            }}
            onDelete={setDeleting}
            onAdd={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          />
          <CategorySection
            title="Expense"
            accent="#ff5b66"
            items={expense}
            onEdit={(c) => {
              setEditing(c);
              setFormOpen(true);
            }}
            onDelete={setDeleting}
            onAdd={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          />
        </div>
      )}

      <CategoryFormModal
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          load();
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => handleDelete(deleting)}
        title="Delete category"
        message={`Delete “${deleting?.name}”? Existing transactions will become uncategorized.`}
      />
    </div>
  );
}

function CategorySection({ title, accent, items, onEdit, onDelete, onAdd }) {
  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: accent }}>
          <Tags size={15} />
          {title} Categories
          <span className="num text-2xs text-txt-muted font-normal">({items.length})</span>
        </h2>
        <button onClick={onAdd} className="text-2xs font-medium text-gain hover:underline">
          + Add
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={Tags} title={`No ${title.toLowerCase()} categories`} description="Create one to classify your transactions." className="!py-8" />
      ) : (
        <ul className="space-y-1.5">
          {items.map((category) => (
            <li
              key={category.id}
              className="group flex items-center gap-3 rounded-lg border border-stroke bg-base-850 px-3 py-2.5 hover:border-stroke-strong transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: category.color }} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-txt-primary truncate">{category.name}</p>
                <p className="text-2xs text-txt-muted">{category.transactionCount} transactions</p>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(category)}
                  aria-label={`Edit ${category.name}`}
                  className="p-1.5 rounded-md text-txt-muted hover:text-txt-primary hover:bg-base-700 transition-colors"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => onDelete(category)}
                  aria-label={`Delete ${category.name}`}
                  className="p-1.5 rounded-md text-txt-muted hover:text-loss hover:bg-loss-dim transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
