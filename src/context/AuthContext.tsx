// Prototype-only local authentication. Replace with server-side authentication for production.
import React, { createContext, useContext, useState, useEffect } from 'react';
import { localAuthService, LocalSession } from '../services/localAuthService';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: string | null }>;
  signUp: (fullName: string, email: string, pass: string) => Promise<{ error: string | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore session from localStorage on startup
    const stored = localAuthService.getStoredSession();
    if (stored) {
      setUser({
        id: stored.userId,
        fullName: stored.fullName,
        email: stored.email,
      });
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, pass: string): Promise<{ error: string | null }> => {
    const res = await localAuthService.signIn(email, pass);
    if (res.error) {
      return { error: res.error };
    }
    if (res.session) {
      setUser({
        id: res.session.userId,
        fullName: res.session.fullName,
        email: res.session.email,
      });
    }
    return { error: null };
  };

  const signUp = async (fullName: string, email: string, pass: string): Promise<{ error: string | null }> => {
    const res = await localAuthService.signUp(fullName, email, pass);
    if (res.error) {
      return { error: res.error };
    }
    return { error: null };
  };

  const signOut = (): void => {
    localAuthService.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
