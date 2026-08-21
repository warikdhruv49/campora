import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeftRight, Wallet, Tags, CornerDownLeft, X } from 'lucide-react';
import { searchService } from '../../services/dashboard.service.js';
import { useDebounce, useClickOutside } from '../../hooks/index.js';
import { formatCurrency } from '../../utils/format.js';
import { formatDateTime } from '../../utils/date.js';
import { ACCOUNT_TYPE_LABELS } from '../../config/constants.js';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debounced = useDebounce(query, 300);

  const containerRef = useClickOutside(useCallback(() => setOpen(false), []));

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!debounced.trim()) {
      setResults(null);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    searchService
      .search(debounced.trim())
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .catch(() => {
        if (!cancelled) setResults({ transactions: [], accounts: [], categories: [] });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const go = (path) => {
    setOpen(false);
    setQuery('');
    navigate(path);
  };

  const hasResults =
    results && (results.transactions.length || results.accounts.length || results.categories.length);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
            if (e.key === 'Enter' && results?.transactions?.length) {
              go(`/transactions?search=${encodeURIComponent(query.trim())}`);
            }
          }}
          placeholder="Search transactions, accounts, categories…"
          aria-label="Global search"
          className="w-full h-9 bg-base-850 border border-stroke rounded-lg pl-9 pr-14 text-sm text-txt-primary placeholder:text-txt-muted focus:border-brand/60 outline-none transition-colors"
        />
        <kbd className="hidden sm:block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-txt-muted bg-base-750 border border-stroke rounded px-1.5 py-0.5">
          Ctrl K
        </kbd>
        {query && (
          <button
            onClick={() => setQuery('')}
            className="sm:hidden absolute right-2.5 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-primary"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 panel overflow-hidden animate-slideUp z-50 max-h-[70vh] overflow-y-auto">
          {loading && !results && <p className="px-4 py-3 text-xs text-txt-muted">Searching…</p>}
          {results && !hasResults && (
            <p className="px-4 py-4 text-xs text-txt-muted text-center">No matches found for “{query}”</p>
          )}
          {results && hasResults && (
            <>
              {results.transactions.length > 0 && (
                <SearchGroup icon={<ArrowLeftRight size={13} />} title="Transactions">
                  {results.transactions.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => go('/transactions')}
                      className="w-full flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-base-750 transition-colors text-left"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-txt-primary truncate">{t.merchant || t.description || t.type}</p>
                        <p className="text-2xs text-txt-muted">{formatDateTime(t.transactionDate)}</p>
                      </div>
                      <span className={`num text-xs shrink-0 ${t.type === 'INCOME' ? 'text-gain' : 'text-loss'}`}>
                        {formatCurrency(t.amount, { currency: t.currency, signed: true })}
                      </span>
                    </button>
                  ))}
                </SearchGroup>
              )}
              {results.accounts.length > 0 && (
                <SearchGroup icon={<Wallet size={13} />} title="Accounts">
                  {results.accounts.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => go('/accounts')}
                      className="w-full flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-base-750 transition-colors text-left"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-txt-primary truncate">{a.name}</p>
                        <p className="text-2xs text-txt-muted">{ACCOUNT_TYPE_LABELS[a.type]}</p>
                      </div>
                      <span className="num text-xs text-txt-secondary">{formatCurrency(a.balance, { currency: a.currency })}</span>
                    </button>
                  ))}
                </SearchGroup>
              )}
              {results.categories.length > 0 && (
                <SearchGroup icon={<Tags size={13} />} title="Categories">
                  {results.categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => go('/categories')}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-base-750 transition-colors text-left"
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-xs font-medium text-txt-primary">{c.name}</span>
                    </button>
                  ))}
                </SearchGroup>
              )}
              <div className="flex items-center gap-1.5 px-4 py-2 border-t border-stroke text-2xs text-txt-muted">
                <CornerDownLeft size={11} /> Press Enter to open full transaction search
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SearchGroup({ icon, title, children }) {
  return (
    <div className="py-1">
      <div className="flex items-center gap-1.5 px-4 pt-2 pb-1 label-xs">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}
