import { useEffect, useState } from 'react';
import { Menu, Plus } from 'lucide-react';
import GlobalSearch from './GlobalSearch.jsx';
import Button from '../ui/Button.jsx';
import { useUI } from '../../context/UIContext.jsx';

export default function Topbar({ onOpenMobileNav }) {
  const { openQuickAdd } = useUI();
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-base-900/85 backdrop-blur border-b border-stroke flex items-center gap-3 px-4 lg:px-6">
      <button
        onClick={onOpenMobileNav}
        className="lg:hidden p-2 -m-1 rounded-lg text-txt-secondary hover:text-txt-primary hover:bg-base-750 transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1 min-w-0 flex justify-center sm:justify-start">
        <GlobalSearch />
      </div>

      <div className="hidden md:flex items-center gap-4 shrink-0">
        <div className="text-right leading-tight">
          <p className="num text-xs text-txt-primary">
            {clock.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-2xs text-txt-muted">
            {clock.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
          </p>
        </div>
      </div>

      <Button size="sm" onClick={openQuickAdd} className="shrink-0">
        <Plus size={15} />
        <span className="hidden sm:inline">New Transaction</span>
        <span className="sm:hidden">Add</span>
      </Button>
    </header>
  );
}
