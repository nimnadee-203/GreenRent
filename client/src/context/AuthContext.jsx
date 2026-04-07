import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [backendUser, setBackendUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchBackendUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/data`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setBackendUser(response.data.userData);
      }
    } catch (error) {
      console.error("Failed to fetch backend user data", error);
      setBackendUser(null);
    }
  };

  useEffect(() => {
    const bootstrapBackendSession = async () => {
      await fetchBackendUser();
      setLoading(false);
    };

    if (!auth) {
      bootstrapBackendSession();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      // Always check backend cookie session (supports backend-only login).
      await fetchBackendUser();
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      // Continue to clear local auth state even if backend logout fails.
    }

    if (auth) {
      await signOut(auth);
    }
    setBackendUser(null);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    backendUser,
    fetchBackendUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
