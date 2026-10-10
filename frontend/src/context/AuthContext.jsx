import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { authApi } from '../api/auth.api';

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('token')));

  const saveSession = useCallback(({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // Re-check the stored session with the server on first load
  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    authApi
      .me()
      .then(({ user }) => {
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login: async (data) => saveSession(await authApi.login(data)),
      verifyOtp: async (email, otp) => saveSession(await authApi.verifyOtp(email, otp)),
      logout,
    }),
    [user, loading, saveSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
