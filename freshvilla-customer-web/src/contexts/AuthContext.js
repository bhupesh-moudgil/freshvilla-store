import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load admin from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const adminData = localStorage.getItem('admin_user');
    
    if (token && adminData) {
      try {
        setAdmin(JSON.parse(adminData));
      } catch (e) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }
    setLoading(false);
  }, []);

  // Sign in function
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      
      if (response.data.success) {
        const { token, admin: adminData } = response.data.data;
        
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(adminData));
        setAdmin(adminData);
        
        return { success: true, admin: adminData };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Sign out function
  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAdmin(null);
    setError(null);
  };

  // Check if authenticated
  const isAuthenticated = () => {
    return !!admin && !!localStorage.getItem('admin_token');
  };

  const value = {
    admin,
    currentUser: admin, // For backward compatibility
    login,
    logout,
    loading,
    error,
    isAuthenticated,
    isAdmin: !!admin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
