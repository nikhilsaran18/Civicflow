import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService, DEMO_USER } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => void;
  loginWithDemo: () => void;
  register: (name: string, email: string, lang?: 'en' | 'ta' | 'hi') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());

  const login = (email: string, pass: string) => {
    const loggedIn = authService.login(email, pass);
    setUser(loggedIn);
  };

  const loginWithDemo = () => {
    const demo = authService.loginWithDemo();
    setUser(demo);
  };

  const register = (name: string, email: string, lang: 'en' | 'ta' | 'hi' = 'en') => {
    const newUser = authService.register(name, email, lang);
    setUser(newUser);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginWithDemo, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
