import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  is_admin?: boolean;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("auth_token"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Decode JWT to get user id (basic decode)
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.sub || payload.user_id || payload.id;
        if (userId) {
          api.getUser(userId).then(setUser).catch(() => {
            logout();
          });
        }
      } catch {
        logout();
      }
    }
    setIsLoading(false);
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem("auth_token", res.access_token);
    setToken(res.access_token);
  };

  const adminLogin = async (email: string, password: string) => {
    const res = await api.adminLogin({ email, password });
    localStorage.setItem("auth_token", res.access_token);
    localStorage.setItem("is_admin", "true");
    setToken(res.access_token);
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    await api.register(data);
    await login(data.email, data.password);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("is_admin");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, adminLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
