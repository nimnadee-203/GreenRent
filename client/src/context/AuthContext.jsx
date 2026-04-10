import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Automatically attach the stored JWT as a Bearer token on every Axios request.
// This is the cross-origin fix for Render deployments where cookies are blocked.
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [backendUser, setBackendUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchBackendUser = async (retryCount = 0) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/data`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setBackendUser(response.data.userData);
      }
    } catch (error) {
      // If 401 and we haven't retried yet, try once more after a short delay
      // This helps with race conditions on localhost cookie setting
      if (error.response?.status === 401 && retryCount < 1) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return fetchBackendUser(retryCount + 1);
      }

      // Silence 401 errors in console (standard for guests)
      if (error.response?.status !== 401) {
        console.error("Failed to fetch backend user data", error);
      }
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

    localStorage.removeItem("token");

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
