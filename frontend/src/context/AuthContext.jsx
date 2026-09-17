import React, { createContext, useState, useEffect } from 'react';
import { getCurrentAuthUser, setCurrentAuthUser, getUsers, saveUser } from '../services/storageService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authUser = getCurrentAuthUser();
    if (authUser) {
      setUser(authUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const users = getUsers();
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!foundUser) {
      throw new Error('Invalid email or password');
    }

    setCurrentAuthUser(foundUser);
    setUser(foundUser);
    return foundUser;
  };

  const signup = async (userData) => {
    const users = getUsers();
    const existing = users.find(
      (u) => u.email.toLowerCase() === userData.email.toLowerCase()
    );

    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const newUser = {
      id: `u_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      bio: userData.bio || '',
      skills: userData.skills || [],
      experienceLevel: userData.experienceLevel || 'Intermediate',
      githubUrl: userData.githubUrl || '',
      linkedinUrl: userData.linkedinUrl || '',
      portfolioUrl: userData.portfolioUrl || '',
      avatarUrl: userData.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80`,
      createdAt: new Date().toISOString()
    };

    saveUser(newUser);
    setCurrentAuthUser(newUser);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setCurrentAuthUser(null);
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    if (!user) return;
    const updated = saveUser({ ...user, ...updatedFields });
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateUser,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
