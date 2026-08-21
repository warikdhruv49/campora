import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, HeartPulse, Wallet, ArrowRight } from 'lucide-react';
import { dashboardService } from '../services/dashboard.service.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { REFRESH_EVENT } from '../config/constants.js';
import { formatCurrency } from '../utils/format.js';
import NetWorthHero from '../components/dashboard/NetWorthHero.jsx';
import SummaryCards from '../components/dashboard/SummaryCards.jsx';
import AccountsOverview from '../components/dashboard/AccountsOverview.jsx';
import ActivityFeed from '../components/dashboard/ActivityFeed.jsx';
import HealthPanel from '../components/dashboard/HealthPanel.jsx';
import BudgetPulse from '../components/dashboard/BudgetPulse.jsx';
import UpcomingPayments from '../components/dashboard/UpcomingPayments.jsx';
import SavingsGoalWidget from '../components/dashboard/SavingsGoalWidget.jsx';
import { SkeletonTable } from '../components/ui/Skeleton.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Button from '../components/ui/Button.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { refreshKey, openQuickAdd } = useUI();
  const [range, setRange] = useState('1M');
  const [data, setData] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currency = user?.currency || 'INR';

  const load = useCallback(
    async (currentRange) => {
      try {
        setError('');
        const [dash, healthData] = await Promise.all([
          dashboardService.get(currentRange),
          dashboardService.health().catch(() => null),
        ]);
        setData(dash);
        setHealth(healthData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    load(range);
  }, [range, load]);

  useEffect(() => {
    if (refreshKey > 0) load(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  useEffect(() => {
    const handler = () => load(range);
    window.addEventListener(REFRESH_EVENT, handler);
    return () => window.removeEventListener(REFRESH_EVENT, handler);
  }, [load, range]);

  const fmt = (v) => formatCurrency(v, { currency });

  return (
    <div className="space-y-4 lg:space-y-5 animate-fadeIn">
      <NetWorthHero
        summary={data?.summary}
        timeline={data?.timeline}
        range={range}
        onRangeChange={setRange}
        loading={loading}
        currency={currency}
      />

      <SummaryCards summary={data?.summary} loading={loading} currency={currency} />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
        <BudgetPulse budget={data?.budget} />
        <UpcomingPayments payments={data?.upcomingPayments} />
        <SavingsGoalWidget goal={data?.savingsGoal} />
      </div>

      <section aria-label="Accounts">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-txt-primary flex items-center gap-2">
            <Wallet size={15} className="text-txt-muted" />
            Accounts
          </h2>
          <Link to="/accounts" className="text-xs text-gain hover:underline inline-flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <AccountsOverview
          accounts={data?.accounts}
          loading={loading}
          currency={currency}
          onAddAccount={() => navigate('/accounts')}
        />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-5">
        <section className="xl:col-span-2 panel p-5" aria-label="Recent transactions">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-txt-primary">Recent Transactions</h2>
            <Link to="/transactions" className="text-xs text-gain hover:underline inline-flex items-center gap-1">
              Order book <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <SkeletonTable rows={6} cols={4} />
          ) : data?.recentTransactions?.length ? (
            <ul className="divide-y divide-stroke/60">
              {data.recentTransactions.map((txn) => (
                <li key={txn.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-txt-primary truncate">
                      {txn.merchant || txn.description || txn.type}
                    </p>
                    <p className="text-2xs text-txt-muted truncate">
                      {txn.category?.name || '—'} · {txn.account.name}
                    </p>
                  </div>
                  <span
                    className={`num text-xs font-semibold shrink-0 ${
                      txn.type === 'INCOME' ? 'text-gain' : txn.type === 'EXPENSE' ? 'text-loss' : 'text-txt-secondary'
                    }`}
                  >
                    {txn.type === 'INCOME' ? '+' : txn.type === 'EXPENSE' ? '−' : ''}
                    {formatCurrency(txn.amount, { currency: txn.currency })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Activity}
              title="No transactions yet"
              description="Record your first transaction to see activity here."
              action={<Button size="sm" onClick={openQuickAdd}>Add transaction</Button>}
            />
          )}
        </section>

        <section className="panel p-5" aria-label="Financial health">
          <h2 className="text-sm font-semibold text-txt-primary flex items-center gap-2 mb-4">
            <HeartPulse size={15} className="text-txt-muted" />
            Financial Health
          </h2>
          <HealthPanel health={health} loading={loading} currency={currency} format={fmt} />
          <p className="mt-4 text-2xs text-txt-muted leading-relaxed">
            Simple indicators based on your own data — not financial advice.
          </p>
        </section>
      </div>

      {error && (
        <div className="rounded-lg border border-loss/40 bg-loss-dim px-4 py-3 text-sm text-loss flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={() => load(range)}>
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
