import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/auth.service.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('campora_token');
    if (!token) {
      setInitializing(false);
      return;
    }
    authService
      .me()
      .then(setUser)
      .catch(() => localStorage.removeItem('campora_token'))
      .finally(() => setInitializing(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const { user: loggedIn, token } = await authService.login(credentials);
    localStorage.setItem('campora_token', token);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const register = useCallback(async (payload) => {
    const { user: created, token } = await authService.register(payload);
    localStorage.setItem('campora_token', token);
    setUser(created);
    return created;
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    const { user: loggedIn, token } = await authService.google(credential);
    localStorage.setItem('campora_token', token);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('campora_token');
    setUser(null);
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = useMemo(
    () => ({ user, initializing, login, register, loginWithGoogle, logout, updateUser }),
    [user, initializing, login, register, loginWithGoogle, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
