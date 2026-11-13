/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import client from '../api/client';

export type AuthUser = {
  type: 'user' | 'customer';
  id: number;
  username: string;
  role?: string;
};

interface AuthContextValue {
  user: AuthUser | null;
  login: (type: 'user' | 'customer', id: number) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser);

  const login = useCallback(async (type: 'user' | 'customer', id: number): Promise<AuthUser> => {
    const res = await client.post('/auth/login', { type, id });
    const data = res.data as AuthUser;
    const authUser: AuthUser = {
      type,
      id: data.id ?? id,
      username: data.username,
      role: data.role,
    };
    localStorage.setItem('auth_user', JSON.stringify(authUser));
    setUser(authUser);
    return authUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
