import { createContext } from "react";

export interface User {
  pk: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginUser: (email: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  registerUser: (email: string, password1: string, password2: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

