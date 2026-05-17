import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone_number?: string;
  user_type?: string;
  is_admin?: boolean;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (data: { firstname: string; lastname: string; email: string; password: string; phone_number?: string; user_type: string }) => Promise<void>;
  setAuthToken: (accessToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("auth_token"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
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
    const res = await api.login({ username: email, password });
    localStorage.setItem("auth_token", res.access_token);
    setToken(res.access_token);
  };

  const adminLogin = async (email: string, password: string) => {
    const res = await api.adminLogin({ username: email, password });
    localStorage.setItem("auth_token", res.access_token);
    localStorage.setItem("is_admin", "true");
    setToken(res.access_token);
  };

  const setAuthToken = useCallback((accessToken: string) => {
    localStorage.setItem("auth_token", accessToken);
    setToken(accessToken);
  }, []);

  const register = async (data: { firstname: string; lastname: string; email: string; password: string; phone_number: string; user_type: "customer" | "shop_owner" }) => {
    await api.register(data);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("is_admin");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, adminLogin, register, setAuthToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
