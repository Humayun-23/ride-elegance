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
  setAuthToken: (accessToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cachedUser = localStorage.getItem("user_data");
      return cachedUser ? JSON.parse(cachedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem("auth_token"));
  const [isLoading, setIsLoading] = useState(() => {
    const hasToken = !!localStorage.getItem("auth_token");
    const hasCachedUser = !!localStorage.getItem("user_data");
    return hasToken && !hasCachedUser;
  });

  useEffect(() => {
    const initAuth = async () => {
      const currentToken = localStorage.getItem("auth_token");
      if (!currentToken) {
        setIsLoading(false);
        return;
      }
      try {
        const payload = JSON.parse(atob(currentToken.split(".")[1]));
        const userId = payload.sub || payload.user_id || payload.id;
        if (userId) {
          const res = await api.get(`/users/${userId}`, {
            headers: { Authorization: `Bearer ${currentToken}` }
          });
          setUser(res.data);
          localStorage.setItem("user_data", JSON.stringify(res.data));
          setToken(currentToken);
        }
      } catch {
        logout();
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);
    const res = await api.post("/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const accessToken = res.data.access_token;
    localStorage.setItem("auth_token", accessToken);
    
    const payload = JSON.parse(atob(accessToken.split(".")[1]));
    const userId = payload.sub || payload.user_id || payload.id;
    const userRes = await api.get(`/users/${userId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    setUser(userRes.data);
    localStorage.setItem("user_data", JSON.stringify(userRes.data));
    setToken(accessToken);
  };

  const adminLogin = async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);
    const res = await api.post("/admin/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const accessToken = res.data.access_token;
    localStorage.setItem("auth_token", accessToken);
    localStorage.setItem("is_admin", "true");
    
    const payload = JSON.parse(atob(accessToken.split(".")[1]));
    const userId = payload.sub || payload.user_id || payload.id;
    const userRes = await api.get(`/users/${userId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    setUser(userRes.data);
    localStorage.setItem("user_data", JSON.stringify(userRes.data));
    setToken(accessToken);
  };

  const setAuthToken = useCallback(async (accessToken: string) => {
    localStorage.setItem("auth_token", accessToken);
    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const userId = payload.sub || payload.user_id || payload.id;
      const userRes = await api.get(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setUser(userRes.data);
      localStorage.setItem("user_data", JSON.stringify(userRes.data));
      setToken(accessToken);
    } catch {
      logout();
    }
  }, []);

  const register = async (data: { firstname: string; lastname: string; email: string; password: string; phone_number: string; user_type: "customer" | "shop_owner" }) => {
    await api.post("/users/", data);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("is_admin");
    localStorage.removeItem("user_data");
    setToken(null);
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary font-medium">Loading...</div>
      </div>
    );
  }

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
