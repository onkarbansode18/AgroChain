import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('agrochain_token');
    const savedUser = sessionStorage.getItem('agrochain_user');
    if (token && savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const loginUser = (token, userData) => {
    sessionStorage.setItem('agrochain_token', token);
    sessionStorage.setItem('agrochain_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem('agrochain_token');
    sessionStorage.removeItem('agrochain_user');
    setUser(null);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, loginUser, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}
