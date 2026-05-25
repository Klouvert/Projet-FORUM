import { createContext, useContext, useState, type ReactNode } from 'react';
import api from '../api/axios';

interface AuthUser {
  userId: string;
  displayName: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const loadUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(loadUser);

  const login = async (email: string, password: string) => {
    const r = await api.post<{ token: string; userId: string; displayName: string; email: string }>(
      '/auth/login',
      { email, password }
    );
    const u: AuthUser = { userId: r.data.userId, displayName: r.data.displayName, email: r.data.email };
    localStorage.setItem('token', r.data.token);
    localStorage.setItem('auth_user', JSON.stringify(u));
    setUser(u);
  };

  const register = async (username: string, email: string, password: string, displayName: string) => {
    const r = await api.post<{ token: string; userId: string; displayName: string; email: string }>(
      '/auth/register',
      { username, email, password, displayName }
    );
    const u: AuthUser = { userId: r.data.userId, displayName: r.data.displayName, email: r.data.email };
    localStorage.setItem('token', r.data.token);
    localStorage.setItem('auth_user', JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
