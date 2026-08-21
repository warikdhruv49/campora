import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Wallet, Settings } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const ITEMS = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Trades', icon: ArrowLeftRight },
  { to: '/accounts', label: 'Wallets', icon: Wallet },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function MobileNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-base-850/95 backdrop-blur border-t border-stroke flex"
      aria-label="Mobile navigation"
    >
      {ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors',
              isActive ? 'text-gain' : 'text-txt-muted hover:text-txt-secondary'
            )
          }
        >
          <Icon size={19} strokeWidth={1.8} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
