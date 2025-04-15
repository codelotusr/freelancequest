import React, { useEffect, useState } from "react";
import { AuthContext, User } from "./authContext";
import { getCurrentUser, login, logout, register } from "../services/authApi";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await getCurrentUser();
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (email: string, password: string) => {
    await login({ email, password });
    await fetchUser();
  };

  const logoutUser = async () => {
    await logout();
    setUser(null);
  };

  const registerUser = async (email: string, password1: string, password2: string) => {
    await register({ email, password1, password2 });
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        loginUser,
        logoutUser,
        registerUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

