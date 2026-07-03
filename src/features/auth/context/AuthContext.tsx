import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { LoadingState } from "@/components/common/LoadingState";
import { getUserById, loginUser, registerUser, googleLogin as googleLoginApi } from "@/features/auth/services/authService";

interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone_number?: string;
  user_type?: string;
  [key: string]: any;
}

const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    return JSON.parse(atob(padded));
  } catch (e) {
    return null;
  }
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  googleLogin: (credential: string, user_type?: string) => Promise<User>;
  register: (data: { firstname: string; lastname: string; email: string; password: string; phone_number?: string; user_type: string }) => Promise<void>;
  setAuthToken: (accessToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("auth_token"));
  const [isLoading, setIsLoading] = useState(() => {
    return !!localStorage.getItem("auth_token");
  });

  useEffect(() => {
    const initAuth = async () => {
      const currentToken = localStorage.getItem("auth_token");
      if (!currentToken) {
        setIsLoading(false);
        return;
      }
      try {
        const payload = parseJwt(currentToken);
        const userId = payload.sub || payload.user_id || payload.id;
        if (userId) {
          const res = await getUserById(userId, {
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
    const res = await loginUser(formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const accessToken = res.data.access_token;
    localStorage.setItem("auth_token", accessToken);
    
    const payload = parseJwt(accessToken);
    const userId = payload.sub || payload.user_id || payload.id;
    const userRes = await getUserById(userId, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    setUser(userRes.data);
    localStorage.setItem("user_data", JSON.stringify(userRes.data));
    setToken(accessToken);
    return userRes.data;
  };

  const googleLogin = async (credential: string, user_type?: string) => {
    const res = await googleLoginApi(credential, user_type);
    const accessToken = res.data.access_token;
    localStorage.setItem("auth_token", accessToken);
    
    const payload = parseJwt(accessToken);
    const userId = payload.sub || payload.user_id || payload.id;
    const userRes = await getUserById(userId, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    setUser(userRes.data);
    localStorage.setItem("user_data", JSON.stringify(userRes.data));
    setToken(accessToken);
    return userRes.data;
  };

  const setAuthToken = useCallback(async (accessToken: string) => {
    localStorage.setItem("auth_token", accessToken);
    try {
      const payload = parseJwt(accessToken);
      const userId = payload.sub || payload.user_id || payload.id;
      const userRes = await getUserById(userId, {
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
    await registerUser(data);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setToken(null);
    setUser(null);
  };

  if (isLoading) {
    const isRentalOS = typeof window !== 'undefined' && window.location.pathname.startsWith('/rentalos');
    return <LoadingState type={isRentalOS ? 'rentalos' : 'default'} />;
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, googleLogin, register, setAuthToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
