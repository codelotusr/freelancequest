import api from "./axios";

export const register = (data: {
  email: string;
  password1: string;
  password2: string;
}) => api.post("/auth/registration/", data);

export const login = (data: { email: string; password: string }) =>
  api.post("/auth/login/", data);

export const logout = () => api.post("/auth/logout/");

export const getCurrentUser = () => api.get("/auth/me/");
