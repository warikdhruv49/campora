import { Link } from 'react-router-dom';
import { CalendarClock, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/format.js';
import { formatDate } from '../../utils/date.js';

export default function UpcomingPayments({ payments }) {
  if (!payments?.length) return null;

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock size={15} className="text-brand-blue" />
          <h3 className="label-xs">Upcoming Payments</h3>
        </div>
        <Link to="/recurring" className="text-2xs text-txt-muted hover:text-gain transition-colors inline-flex items-center gap-1">
          All rules <ArrowRight size={11} />
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {payments.slice(0, 5).map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <div className="min-w-0">
                <p className="text-xs font-medium text-txt-primary truncate">{p.merchant}</p>
                <p className="text-2xs text-txt-muted">
                  {formatDate(p.nextDate)} · {p.dueInDays === 0 ? 'today' : `in ${p.dueInDays}d`}
                </p>
              </div>
            </div>
            <p className={`num text-xs font-medium shrink-0 ${p.type === 'INCOME' ? 'text-gain' : 'text-txt-primary'}`}>
              {p.type === 'INCOME' ? '+' : '-'}
              {formatCurrency(p.amount, { decimals: 0 })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
