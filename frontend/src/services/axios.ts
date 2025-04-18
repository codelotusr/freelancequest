import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

// Automatically include CSRF token (optional for safe methods)
api.interceptors.request.use((config) => {
  const csrfToken = getCookie("csrftoken");
  if (
    csrfToken &&
    ["post", "put", "patch", "delete"].includes(config.method || "")
  ) {
    config.headers["X-CSRFToken"] = csrfToken;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post(
          "http://localhost:8000/api/auth/token/refresh/",
          {},
          { withCredentials: true },
        );
        return api(originalRequest);
      } catch {
        console.warn("Refresh token expired. Redirecting to login...");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

// CSRF cookie reader
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export default api;
