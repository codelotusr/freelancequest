import { createContext } from "react";

export interface User {
  pk: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string | null;
  profile_picture: File | null;
  // freelancer
  bio?: string;
  skills?: string[];
  portfolio_links?: string[];
  // client
  organization?: string;
  business_description?: string;
  website?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginUser: (email: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  registerUser: (
    email: string,
    password1: string,
    password2: string,
  ) => Promise<void>;
  isOnboardingRequired: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
