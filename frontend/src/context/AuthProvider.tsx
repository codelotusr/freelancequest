import React, { useEffect, useState } from "react";
import { AuthContext, User } from "./authContext";
import { getCurrentUser, login, logout, register, refreshToken } from "../services/authApi";


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await getCurrentUser();
      const freshUser = {
        ...res.data,
        gamification_profile: { ...res.data.gamification_profile },
      };
      setUser(freshUser);

    } catch (err: any) {
      const status = err.response?.status;

      if (status === 401) {
        try {
          await refreshToken();
          const res = await getCurrentUser();
          const refreshedUser = {
            ...res.data,
            gamification_profile: { ...res.data.gamification_profile },
          };
          setUser(refreshedUser);
        } catch (refreshErr) {
          console.error("Token refresh failed", refreshErr);
          await logout();
          setUser(null);
          window.location.href = "/login";
        }
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (email: string, password: string) => {
    await login({ email, password });
    await fetchUser();
  };

  const logoutUser = async () => {
    try {
      await logout();
      localStorage.removeItem("refresh");
      localStorage.removeItem("access");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const registerUser = async (email: string, password1: string, password2: string) => {
    await register({ email, password1, password2 });
  };

  useEffect(() => {
    const hasRefreshCookie = () => {
      return document.cookie.includes("refresh=");
    };

    if (hasRefreshCookie()) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const isOnboardingRequired = !!user && (!user.role || !user.first_name || !user.last_name);
  const refreshUser = fetchUser;

  return (
    <AuthContext.Provider
      value={{
        user: user ? { ...user } : null,
        isAuthenticated: !!user,
        loading,
        loginUser,
        logoutUser,
        registerUser,
        isOnboardingRequired,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

