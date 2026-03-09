import React, { createContext, useContext, useState, useCallback } from 'react';
import { tokenStorage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => tokenStorage.getUser());
  const login = useCallback((userData, accessToken, refreshToken) => {
    tokenStorage.save(accessToken, refreshToken);
    tokenStorage.saveUser(userData);
    setUser(userData);
  }, []);
  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);
  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;