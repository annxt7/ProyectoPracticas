import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('tribe_user');
    const token = localStorage.getItem('tribe_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('tribe_token', token);
    localStorage.setItem('tribe_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('tribe_token');
    localStorage.removeItem('tribe_user');
    setUser(null);
  };

const updateUser = (newData) => {
  const updatedUser = {
    ...user,
    ...newData,
  };
  setUser(updatedUser);
  localStorage.setItem("tribe_user", JSON.stringify(updatedUser));
};

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);