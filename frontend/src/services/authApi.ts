import api from "./axios";

export const register = (data: {
  email: string;
  password1: string;
  password2: string;
}) => api.post("/auth/registration/", data);

export const login = (data: { email: string; password: string }) =>
  api.post("/auth/login/", data);

export const logout = () => api.post("/auth/logout/");

export const getCurrentUser = () => api.get("/auth/user/");

export const refreshToken = () => api.post("/auth/token/refresh/");

export const updateUserProfile = (formData: FormData) =>
  api.patch("/auth/user/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
