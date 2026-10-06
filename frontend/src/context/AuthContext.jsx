import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state by verifying existing token
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const testToken = urlParams.get('auth_token');
        if (testToken) {
          localStorage.setItem('hackmatch_token', testToken);
        }
      } catch (e) {}

      const token = localStorage.getItem('hackmatch_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axiosInstance.get('/auth/me');
        if (res.data?.success) {
          setUser(res.data.user);
        } else {
          localStorage.removeItem('hackmatch_token');
          setUser(null);
        }
      } catch (err) {
        console.warn('[AuthContext] Session expired or server unavailable:', err.message);
        localStorage.removeItem('hackmatch_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      if (res.data?.success) {
        localStorage.setItem('hackmatch_token', res.data.token);
        setUser(res.data.user);
        return res.data.user;
      } else {
        throw new Error(res.data?.message || 'Login failed');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      throw new Error(message);
    }
  };

  const signup = async (userData) => {
    try {
      const res = await axiosInstance.post('/auth/signup', userData);
      if (res.data?.success) {
        localStorage.setItem('hackmatch_token', res.data.token);
        setUser(res.data.user);
        return res.data.user;
      } else {
        throw new Error(res.data?.message || 'Signup failed');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Signup failed';
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('hackmatch_token');
    setUser(null);
  };

  const updateUser = async (updatedFields) => {
    if (!user) return;
    const userId = user._id || user.id;
    const res = await axiosInstance.put(`/users/${userId}`, updatedFields);
    if (res.data?.success) {
      setUser(res.data.user);
      return res.data.user;
    }
  };

  const refreshUser = async () => {
    try {
      const res = await axiosInstance.get('/auth/me');
      if (res.data?.success) {
        setUser(res.data.user);
        return res.data.user;
      }
    } catch (err) {
      console.warn('Failed to refresh user:', err.message);
    }
  };

  // Helper flags
  const college = user?.collegeId || null;
  const collegeName = college?.name || '';
  const isSuperAdmin = user?.role === 'superAdmin';
  const isCollegeAdmin = user?.role === 'collegeAdmin';
  const isAdmin = isSuperAdmin || isCollegeAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        college,
        collegeName,
        role: user?.role || 'student',
        isSuperAdmin,
        isCollegeAdmin,
        isAdmin,
        loading,
        login,
        signup,
        logout,
        updateUser,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

