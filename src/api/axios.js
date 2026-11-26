import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||"https://api.taxoratax.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let refreshing = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url.includes("/accounts/login/")
    ) {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        original._retry = true;
        if (!refreshing) {
          refreshing = true;
          try {
            const { data } = await axios.post(`${API_BASE_URL}/accounts/token/refresh/`, {
              refresh,
            });
            localStorage.setItem("access_token", data.access);
          } catch {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          } finally {
            refreshing = false;
          }
        }
        const token = localStorage.getItem("access_token");
        if (token) {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }
      } else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;