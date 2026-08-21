import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Tags,
  Target,
  PiggyBank,
  CalendarClock,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import Logo from './Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { cn } from '../../utils/cn.js';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/accounts', label: 'Accounts', icon: Wallet },
  { to: '/budgets', label: 'Budgets', icon: Target },
  { to: '/goals', label: 'Goals', icon: PiggyBank },
  { to: '/recurring', label: 'Recurring', icon: CalendarClock },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();

  const content = (isMobile) => (
    <div className="flex flex-col h-full">
      <div className={cn('flex items-center h-16 border-b border-stroke shrink-0', collapsed && !isMobile ? 'justify-center px-2' : 'px-5')}>
        <Logo collapsed={collapsed && !isMobile} />
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => isMobile && onCloseMobile()}
            title={collapsed && !isMobile ? label : undefined}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                collapsed && !isMobile && 'justify-center px-0',
                isActive
                  ? 'bg-gain-dim text-gain'
                  : 'text-txt-secondary hover:text-txt-primary hover:bg-base-750'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-gain" />}
                <Icon size={18} strokeWidth={1.8} className="shrink-0" />
                {(!collapsed || isMobile) && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={cn('border-t border-stroke p-3 space-y-1 shrink-0', collapsed && !isMobile && 'flex flex-col items-center')}>
        <div className={cn('flex items-center gap-3 rounded-lg px-2 py-2', collapsed && !isMobile && 'px-0')}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand to-brand-blue flex items-center justify-center text-base-950 font-bold text-sm shrink-0">
            {user?.name?.slice(0, 2).toUpperCase() || 'U'}
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-txt-primary truncate">{user?.name}</p>
              <p className="text-2xs text-txt-muted truncate">{user?.email}</p>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          title="Sign out"
          className={cn(
            'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-txt-secondary hover:text-loss hover:bg-loss-dim transition-colors',
            collapsed && !isMobile && 'justify-center px-0'
          )}
        >
          <LogOut size={18} strokeWidth={1.8} />
          {(!collapsed || isMobile) && <span>Sign out</span>}
        </button>

        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            className={cn(
              'w-full hidden lg:flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-txt-muted hover:text-txt-primary hover:bg-base-750 transition-colors',
              collapsed && 'justify-center px-0'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 bg-base-850 border-r border-stroke transition-[width] duration-200',
          collapsed ? 'w-[72px]' : 'w-60'
        )}
      >
        {content(false)}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onCloseMobile} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-base-850 border-r border-stroke animate-slideUp">
            {content(true)}
          </aside>
        </div>
      )}
    </>
  );
}
