import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sharesphere_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('sharesphere_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify token with /auth/me on initial load
    async function checkAuth() {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.data) {
            setUser(res.data.data);
            localStorage.setItem('sharesphere_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.warn('Session verification failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success && res.data.data) {
      const { user: authUser, token: authToken } = res.data.data;
      setUser(authUser);
      setToken(authToken);
      localStorage.setItem('sharesphere_token', authToken);
      localStorage.setItem('sharesphere_user', JSON.stringify(authUser));
      return authUser;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success && res.data.data) {
      const { user: authUser, token: authToken } = res.data.data;
      setUser(authUser);
      setToken(authToken);
      localStorage.setItem('sharesphere_token', authToken);
      localStorage.setItem('sharesphere_user', JSON.stringify(authUser));
      return authUser;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore logout api errors
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('sharesphere_token');
      localStorage.removeItem('sharesphere_user');
    }
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('sharesphere_user', JSON.stringify(newUser));
  };

  const isStudent = user?.role === 'student';
  const isOwner = user?.role === 'owner';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateUser,
      isStudent,
      isOwner,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
