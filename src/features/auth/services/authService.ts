import { api } from "@/lib/api";

// Auth & Users Base
export const loginUser = (formData: URLSearchParams | any, config?: any) => {
  return api.post("/login", formData, config);
};

export const login = (data: URLSearchParams) => {
  return api.post("/auth/login", data);
};

export const googleLogin = (credential: string, user_type?: string) => {
  return api.post("/google", { credential, user_type });
};

export const registerUser = (data: any) => {
  return api.post("/users/", data);
};

export const getUserById = (userId: string | number, config?: any) => {
  return api.get(`/users/${userId}`, config);
};

export const updateUser = (userId: string | number, data: any) => {
  return api.put(`/users/${userId}`, data);
};

// Email Verification
export const verifyEmail = (payload: { token: string }) => {
  return api.post("/users/verify-email", payload);
};

export const resendVerificationEmail = (payload: { email: string }) => {
  return api.post("/users/verify-email/resend", payload);
};

// Password Reset
export const requestPasswordReset = (payload: { email: string }) => {
  return api.post("/password-reset/request", payload);
};

export const confirmPasswordReset = (payload: { token: string; new_password: string }) => {
  return api.post("/password-reset/confirm", payload);
};
