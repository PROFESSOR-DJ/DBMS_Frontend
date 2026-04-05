// AuthContext provides authentication state, session persistence, and auth actions.
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../api/authApi';
import {
  clearAuthSession,
  getAuthToken,
  getAuthUser,
  getUserEmail,
  migrateLegacyAuthStorage,
  setAuthSession,
  updateStoredAuthUser,
} from '../utils/auth';

const AuthContext = createContext({});
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
const ACTIVITY_EVENTS = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const logoutTimerRef = useRef(null);

  const clearLogoutTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  const logout = useCallback((options = {}) => {
    const { reason = 'manual', showToast = true } = options;
    clearLogoutTimer();
    clearAuthSession();
    setUser(null);

    if (showToast) {
      if (reason === 'inactive') {
        toast.error('Logged out due to inactivity');
      } else if (reason === 'expired') {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.success('Logged out successfully');
      }
    }

    if (reason === 'inactive' || reason === 'expired') {
      window.location.href = '/login';
    }
  }, [clearLogoutTimer]);

  const resetInactivityTimer = useCallback(() => {
    if (!getAuthToken()) return;

    clearLogoutTimer();
    logoutTimerRef.current = window.setTimeout(() => {
      logout({ reason: 'inactive' });
    }, INACTIVITY_TIMEOUT_MS);
  }, [clearLogoutTimer, logout]);

  useEffect(() => {
    migrateLegacyAuthStorage();

    const token = getAuthToken();
    if (token) {
      setUser(getAuthUser() || { email: getUserEmail() });
    }

    setLoading(false);
    return () => clearLogoutTimer();
  }, [clearLogoutTimer]);

  useEffect(() => {
    if (!user) {
      clearLogoutTimer();
      return undefined;
    }

    resetInactivityTimer();
    const handleActivity = () => resetInactivityTimer();

    ACTIVITY_EVENTS.forEach(eventName =>
      window.addEventListener(eventName, handleActivity, { passive: true }),
    );

    return () => {
      ACTIVITY_EVENTS.forEach(eventName =>
        window.removeEventListener(eventName, handleActivity),
      );
      clearLogoutTimer();
    };
  }, [clearLogoutTimer, resetInactivityTimer, user]);

  const login = async (email, password) => {
    try {
      const data = await authApi.login(email, password);
      const nextUser = {
        user_id: data.user?.user_id,
        name: data.user?.name || '',
        email: data.user?.email || email,
        role: data.user?.role || 'researcher',
      };
      setAuthSession({ token: data.token, email: nextUser.email, user: nextUser });
      setUser(nextUser);
      resetInactivityTimer();
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return {
        success: false,
        error: error.message,
      };
    }
  };

  const register = async (userData) => {
    try {
      await authApi.register(userData);
      toast.success('Registration successful! Please login.');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return {
        success: false,
        error: error.message,
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: (nextUser) => {
          setUser(nextUser);
          updateStoredAuthUser(nextUser);
        },
        login,
        register,
        logout,
        loading,
        inactivityTimeoutMs: INACTIVITY_TIMEOUT_MS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
