import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Plus, Pencil, Trash2, Power, History } from 'lucide-react';
import { accountService } from '../services/index.js';
import { apiError } from '../services/apiClient.js';
import { useToast } from '../components/ui/Toast.jsx';
import Button from '../components/ui/Button.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import AccountFormModal from '../components/accounts/AccountFormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { SkeletonCard } from '../components/ui/Skeleton.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { formatCurrency } from '../utils/format.js';
import { ACCOUNT_TYPE_LABELS } from '../config/constants.js';
import { cn } from '../utils/cn.js';

export default function AccountsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const { refreshKey } = useUI();
  const currency = user?.currency || 'INR';
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    accountService
      .list()
      .then(setAccounts)
      .catch((err) => toast.error(apiError(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(load, [load]);

  useEffect(() => {
    if (refreshKey > 0) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const totalNetWorth = accounts.reduce(
    (sum, a) => sum + (a.type === 'CREDIT_CARD' ? -a.balance : a.balance),
    0
  );

  const handleDelete = async (account) => {
    try {
      await accountService.remove(account.id);
      toast.success(`Deleted “${account.name}” and its transactions`);
      load();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const toggleActive = async (account) => {
    try {
      await accountService.update(account.id, { isActive: !account.isActive });
      toast.success(account.isActive ? 'Account deactivated' : 'Account activated');
      load();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-txt-primary tracking-tight">Accounts & Wallets</h1>
          <p className="text-xs text-txt-secondary mt-0.5">
            Combined net worth:{' '}
            <span className={cn('num font-semibold', totalNetWorth >= 0 ? 'text-gain' : 'text-loss')}>
              {formatCurrency(totalNetWorth, { currency })}
            </span>
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={15} /> Add Account
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} lines={3} />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={Wallet}
            title="No accounts yet"
            description="Your net worth timeline will appear here once you add your first account and transactions."
            action={
              <Button
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus size={15} /> Add your first account
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const share =
              totalNetWorth > 0 && account.balance >= 0 && account.type !== 'CREDIT_CARD'
                ? (account.balance / totalNetWorth) * 100
                : 0;
            return (
              <article
                key={account.id}
                className={cn('panel p-5 group hover:border-stroke-strong transition-all duration-150 hover:-translate-y-0.5', !account.isActive && 'opacity-60')}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${account.color}1a`, border: `1px solid ${account.color}40` }}
                    >
                      <Wallet size={17} style={{ color: account.color }} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-txt-primary truncate">{account.name}</h2>
                      <p className="text-2xs text-txt-muted truncate">{account.institution || 'No institution'}</p>
                    </div>
                  </div>
                  <Badge color={account.color}>{ACCOUNT_TYPE_LABELS[account.type]}</Badge>
                </div>

                <p className={cn('num text-2xl font-bold mt-4 tracking-tight', account.type === 'CREDIT_CARD' ? 'text-loss' : 'text-txt-primary')}>
                  {formatCurrency(account.balance, { currency: account.currency })}
                </p>

                <div className="mt-3 flex items-center justify-between text-2xs text-txt-muted">
                  <span>{share > 0 ? `${share.toFixed(1)}% of net worth` : `${account.transactionCount} transactions`}</span>
                  <span>Since {new Date(account.createdAt).getFullYear()}</span>
                </div>
                <div className="mt-1.5 h-1 rounded-full bg-base-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, share)}%`, backgroundColor: account.color }}
                  />
                </div>

                <div className="mt-4 pt-3 border-t border-stroke flex items-center justify-between">
                  <span className={cn('text-2xs font-medium', account.isActive ? 'text-gain' : 'text-txt-muted')}>
                    ● {account.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/transactions?accountId=${account.id}`}
                      title="View transactions"
                      aria-label="View account transactions"
                      className="p-1.5 rounded-md text-txt-muted hover:text-brand-blue hover:bg-brand-blue/10 transition-colors"
                    >
                      <History size={13} />
                    </Link>
                    <button
                      onClick={() => toggleActive(account)}
                      title={account.isActive ? 'Deactivate' : 'Activate'}
                      aria-label={account.isActive ? 'Deactivate account' : 'Activate account'}
                      className="p-1.5 rounded-md text-txt-muted hover:text-brand-blue hover:bg-brand-blue/10 transition-colors"
                    >
                      <Power size={13} />
                    </button>
                    <button
                      onClick={() => {
                        setEditing(account);
                        setFormOpen(true);
                      }}
                      title="Edit"
                      aria-label="Edit account"
                      className="p-1.5 rounded-md text-txt-muted hover:text-txt-primary hover:bg-base-700 transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeleting(account)}
                      title="Delete"
                      aria-label="Delete account"
                      className="p-1.5 rounded-md text-txt-muted hover:text-loss hover:bg-loss-dim transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <AccountFormModal
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
        title="Delete account"
        message={`Deleting “${deleting?.name}” will also permanently delete all ${deleting?.transactionCount ?? 0} associated transactions. This cannot be undone.`}
      />
    </div>
  );
}
