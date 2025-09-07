"use client"

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, MeResponse } from '@/services/authService';

interface AuthContextType {
  user: MeResponse | null;
  loading: boolean;
  isAdmin: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<MeResponse | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isAdmin = user?.role === 'admin';

  const refreshUser = async () => {
    try {
      const userData = await authService.me();
      setUser(userData);
      return userData;
    } catch (error) {
      setUser(null);
      return null;
    }
  };

  const login = async (token: string) => {
    localStorage.setItem('token', token);
    const userData = await refreshUser();
    if (userData) {
      localStorage.setItem('user', JSON.stringify({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        token
      }));
    }
  };

  const logout = async () => {
    await authService.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
