import api from "./axios";

export const loginUser = (credentials) => api.post("/accounts/login/", credentials);

export const registerUser = (userData) => api.post("/accounts/register/", userData);

export const sendOtp = (email, otp) => api.post("/accounts/send-otp/", { email, otp });

export const logoutUser = () => api.post("/accounts/logout/");

export const refreshToken = (refresh) => api.post("/accounts/token/refresh/", { refresh });

export const getProfile = () => api.get("/accounts/profile/").then((r) => r.data);

export const updateProfile = (data) => api.patch("/accounts/profile/", data).then((r) => r.data);

export const changeUserPassword = (data) =>
  api.post("/accounts/security/change_password/", data).then((r) => r.data);

export const fetchSessions = () => api.get("/accounts/security/sessions/").then((r) => r.data);

export const revokeSession = (id) => api.post(`/accounts/security/revoke_session/${id}/`);

export const revokeAllSessions = () => api.post("/accounts/security/revoke_all/");

export const fetchLoginActivity = () =>
  api.get("/accounts/security/login_activity/").then((r) => r.data);

export const saveSession = ({ access, refresh, user }) => {
  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
  if (user) {
    const first = (user.first_name || "").trim();
    const last = (user.last_name || "").trim();
    let name = (typeof user.name === "string" ? user.name : "").trim();
    if (!name && (first || last)) {
      const parts = first === last ? [first] : [first, last].filter(Boolean);
      name = parts.join(" ");
    }
    localStorage.setItem("user", JSON.stringify({ ...user, name }));
  }
};

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};

export const getRole = (user) => {
  if (user?.is_superuser) return "superadmin";
  if (user?.is_staff) return "admin";
  return "user";
};