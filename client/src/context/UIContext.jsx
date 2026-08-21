import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import TransactionFormModal from '../components/transactions/TransactionFormModal.jsx';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const openQuickAdd = useCallback(() => setQuickAddOpen(true), []);
  const closeQuickAdd = useCallback(() => setQuickAddOpen(false), []);
  const notifyDataChanged = useCallback(() => setRefreshKey((k) => k + 1), []);

  const value = useMemo(
    () => ({ openQuickAdd, notifyDataChanged, refreshKey }),
    [openQuickAdd, notifyDataChanged, refreshKey]
  );

  return (
    <UIContext.Provider value={value}>
      {children}
      <TransactionFormModal
        open={quickAddOpen}
        onClose={closeQuickAdd}
        onSaved={notifyDataChanged}
      />
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}
