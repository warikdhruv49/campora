import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import MobileNav from './MobileNav.jsx';
import OnboardingModal from '../onboarding/OnboardingModal.jsx';
import { useState } from 'react';
import { UIProvider } from '../../context/UIContext.jsx';
import { cn } from '../../utils/cn.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';

export default function AppLayout() {
  usePageMeta({
    title: 'Dashboard · CAMPORA — Student Personal Finance Tracker',
    noindex: true,
  });
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('campora_sidebar') === 'collapsed');
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      localStorage.setItem('campora_sidebar', prev ? 'expanded' : 'collapsed');
      return !prev;
    });
  };

  return (
    <UIProvider>
      <div className="min-h-screen bg-base-900">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <div className={cn('transition-[padding] duration-200', collapsed ? 'lg:pl-[72px]' : 'lg:pl-60')}>
          <Topbar onOpenMobileNav={() => setMobileOpen(true)} />
          <main className="p-4 lg:p-6 pb-24 lg:pb-8 max-w-[1600px] mx-auto">
            <Outlet />
          </main>
        </div>
        <MobileNav />
        <OnboardingModal />
      </div>
    </UIProvider>
  );
}
