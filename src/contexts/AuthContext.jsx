import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';
import { clearAuthStorage, getStoredToken, getStoredUser, parseJwtPayload, setAuthStorage } from '../utils/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState(getStoredUser());
  const [isChecking, setIsChecking] = useState(true);

  const logout = useCallback(() => {
    setToken('');
    setUser(null);
    clearAuthStorage();
  }, []);

  const login = useCallback((authResponse) => {
    const nextToken = authResponse?.token || '';
    const payload = parseJwtPayload(nextToken);
    const nextUser = {
      id: authResponse?.userId || payload?.userId || null,
      email: authResponse?.email || payload?.sub || '',
      username: authResponse?.username || '',
      role: authResponse?.role || payload?.role || 'READER',
    };

    setToken(nextToken);
    setUser(nextUser);
    setAuthStorage({ token: nextToken, user: nextUser });
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      const latest = await authService.getUserById(user.id);
      const merged = { ...user, ...latest };
      setUser(merged);
      setAuthStorage({ token, user: merged });
    } catch (_error) {
      // Keeping session active even if profile refresh fails.
    }
  }, [token, user]);

  useEffect(() => {
    const checkSession = async () => {
      if (!token) {
        setIsChecking(false);
        return;
      }
      try {
        await authService.validate(token);
      } catch (_error) {
        logout();
      } finally {
        setIsChecking(false);
      }
    };
    checkSession();
  }, [token, logout]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isChecking,
      login,
      logout,
      refreshProfile,
    }),
    [isChecking, login, logout, refreshProfile, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


