import React, { createContext, useContext, useMemo, useState } from 'react';
import { normalizeRole } from '../utils/roles';
import { getGuestSessionId, clearGuestSessionId } from '../utils/guestSession';
import { migrateGuestCart } from '../utils/cartApi';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api-zephyr-techno.maktechgroup.tech';

const getTokenFromResponse = (payload = {}) =>
  payload.token || payload.accessToken || payload.jwt || payload.data?.token || payload.data?.accessToken || null;

const getUserFromResponse = (payload = {}) => payload.user || payload.data?.user || null;

const getRoleFromPayload = (payload = {}) => {
  const user = getUserFromResponse(payload);
  return normalizeRole(user?.role || payload.role || payload.data?.role);
};

const getMessageFromPayload = (payload = {}) =>
  payload.message || payload.error || payload.details || payload.data?.message || 'Login failed';

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const storedAuth = localStorage.getItem('auth');
    if (!storedAuth) {
      return {
        user: null,
        token: null,
        role: null,
      };
    }

    try {
      const parsed = JSON.parse(storedAuth);
      return {
        user: parsed.user || null,
        token: parsed.token || null,
        role: parsed.role || null,
      };
    } catch {
      return {
        user: null,
        token: null,
        role: null,
      };
    }
  });

  const login = async ({ email, password }) => {
    const guestSessionId = getGuestSessionId();

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    let payload = {};
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }

    if (!response.ok) {
      throw new Error(getMessageFromPayload(payload));
    }

    const token = getTokenFromResponse(payload);
    const user = getUserFromResponse(payload);
    const role = getRoleFromPayload(payload);

    const authData = { user, token, role };

    setAuth(authData);
    localStorage.setItem('auth', JSON.stringify(authData));

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('accessToken', token);
    }

    // Migrate guest cart → user cart via dedicated endpoint, then clear session
    if (guestSessionId && token) {
      await migrateGuestCart(token);
    } else if (guestSessionId) {
      clearGuestSessionId();
    }

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }

    return authData;
  };

  const register = async ({ firstName, lastName, email, phone, password }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firstName, lastName, email, phone, password }),
    });

    let payload = {};
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }

    if (!response.ok) {
      throw new Error(getMessageFromPayload(payload));
    }

    return payload;
  };

  const verifyEmail = async ({ email, otp }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    let payload = {};
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }

    if (!response.ok) {
      throw new Error(getMessageFromPayload(payload));
    }

    return payload;
  };

  const forgotPassword = async ({ email }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    let payload = {};
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }

    if (!response.ok) {
      throw new Error(getMessageFromPayload(payload));
    }

    return payload;
  };

  const resendOtp = async ({ email, type }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, type }),
    });

    let payload = {};
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }

    if (!response.ok) {
      throw new Error(getMessageFromPayload(payload));
    }

    return payload;
  };

  const verifyResetOtp = async ({ email, otp }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-reset-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    let payload = {};
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }

    if (!response.ok) {
      throw new Error(getMessageFromPayload(payload));
    }

    return payload;
  };

  const resetPassword = async ({ email, newPassword }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, newPassword }),
    });

    let payload = {};
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }

    if (!response.ok) {
      throw new Error(getMessageFromPayload(payload));
    }

    return payload;
  };

  const logout = () => {
    setAuth({ user: null, token: null, role: null });
    localStorage.removeItem('auth');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  };

  const updateUser = (nextUser) => {
    setAuth((current) => {
      const updatedUser = typeof nextUser === 'function' ? nextUser(current.user) : nextUser;
      const nextAuth = {
        ...current,
        user: updatedUser,
      };

      localStorage.setItem('auth', JSON.stringify(nextAuth));
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return nextAuth;
    });
  };

  const value = useMemo(
    () => ({
      user: auth.user,
      token: auth.token,
      role: auth.role,
      isAuthenticated: Boolean(auth.token || auth.user),
      login,
      register,
      verifyEmail,
      forgotPassword,
      resendOtp,
      verifyResetOtp,
      resetPassword,
      updateUser,
      logout,
    }),
    [auth.user, auth.token, auth.role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
