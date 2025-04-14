import axios from "axios";

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

// Optional: handle 401s or refresh logic
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: Optionally handle logout or token refresh
      console.warn("Unauthorized! You may want to redirect or show a message.");
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
