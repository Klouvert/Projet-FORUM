import { createContext, useContext, useState, type ReactNode } from 'react';
import api from '../api/axios';

interface AuthUser {
  userId: string;
  displayName: string;
  email: string;
  isAdmin: boolean;
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

type ApiAuthResponse = { token: string; userId: string; displayName: string; email: string; isAdmin: boolean };

const saveSession = (data: ApiAuthResponse): AuthUser => {
  const u: AuthUser = { userId: data.userId, displayName: data.displayName, email: data.email, isAdmin: data.isAdmin };
  localStorage.setItem('token', data.token);
  localStorage.setItem('auth_user', JSON.stringify(u));
  return u;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(loadUser);

  const login = async (email: string, password: string) => {
    const r = await api.post<ApiAuthResponse>('/auth/login', { email, password });
    setUser(saveSession(r.data));
  };

  const register = async (username: string, email: string, password: string, displayName: string) => {
    const r = await api.post<ApiAuthResponse>('/auth/register', { username, email, password, displayName });
    setUser(saveSession(r.data));
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
