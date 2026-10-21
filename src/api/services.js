import api from "./axios";

// ── Clients ──────────────────────────────────────────────────────────
export const fetchClients = (params = {}) =>
  api.get("/gst-app/clients/", { params }).then((r) => r.data);

export const fetchClientStats = () =>
  api.get("/gst-app/clients/stats/").then((r) => r.data);

export const createClient = (data) => api.post("/gst-app/clients/", data);

export const updateClient = (id, data) => api.patch(`/gst-app/clients/${id}/`, data);

export const deleteClient = (id) => api.delete(`/gst-app/clients/${id}/`);

export const verifyGstin = (gstin) => api.get(`/gst-app/gst/search/${gstin}/`);

// ── Reminders ────────────────────────────────────────────────────────
export const fetchReminders = () =>
  api.get("/gst-app/reminders/").then((r) => r.data);

export const createReminder = (data) => api.post("/gst-app/reminders/", data);

export const updateReminder = (id, data) => api.patch(`/gst-app/reminders/${id}/`, data);

export const deleteReminder = (id) => api.delete(`/gst-app/reminders/${id}/`);

// ── Notifications ────────────────────────────────────────────────────
export const fetchNotifications = () =>
  api.get("/gst-app/notifications/").then((r) => r.data);

export const markNotificationsRead = (ids) =>
  api.post("/gst-app/notifications/mark-read/", { ids });

export const markAllNotificationsRead = () =>
  api.post("/gst-app/notifications/mark-all-read/");

// ── Notification Preferences (Settings) ─────────────────────────────
export const fetchNotificationPreferences = () =>
  api.get("/accounts/notification-preferences/").then((r) => r.data);

export const updateNotificationPreferences = (data) =>
  api.patch("/accounts/notification-preferences/", data).then((r) => r.data);

// ── Billing (Settings) ──────────────────────────────────────────────
export const fetchPlans = () => api.get("/billing/plans/").then((r) => r.data);

export const fetchMySubscription = () =>
  api.get("/billing/subscription/me/").then((r) => r.data);

export const selectPlan = (planId) =>
  api.post("/billing/subscription/select/", { plan_id: planId }).then((r) => r.data);

export const fetchPayments = () =>
  api.get("/billing/payments/").then((r) => r.data);

// ── News ─────────────────────────────────────────────────────────────
export const fetchNews = (params = {}) =>
  api.get("/gst-app/news/", { params }).then((r) => r.data);

// ── Dashboard links & portals ────────────────────────────────────────
export const fetchDashboardLinks = (kind) =>
  api.get("/gst-app/dashboard-links/", { params: { kind } }).then((r) => r.data);

// ── Returns (GSTR grid persistence) ──────────────────────────────────
export const fetchReturnSections = (params) =>
  api.get("/gst-app/returns/", { params }).then((r) => r.data);

export const saveReturnSections = (data) =>
  api.post("/gst-app/returns/save/", data);

export const fetchReturnSummary = () =>
  api.get("/gst-app/returns/summary/").then((r) => r.data);

// ── Documents ────────────────────────────────────────────────────────
export const fetchDocuments = () =>
  api.get("/gst-app/documents/").then((r) => r.data);

export const uploadDocument = (formData) =>
  api.post("/gst-app/documents/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ── Live GST (Vanaya) ────────────────────────────────────────────────
export const gstSendOtp = (params) => api.post("/gst-app/gst/send-otp/", params);

export const gstAuthenticate = (params) => api.post("/gst-app/gst/authenticate/", params);

export const gstSearch = (gstin) => api.get(`/gst-app/gst/search/${gstin}/`);

export const gstReturns = (params) => api.get("/gst-app/gst/returns/", { params });

export const gstPref = (params) => api.get("/gst-app/gst/pref/", { params });

export const gstFiled = (params) => api.get("/gst-app/gst/filed/", { params });

export const gstFilingStatus = (params) =>
  api.get("/gst-app/gst/filing-status/", { params }).then((r) => r.data);

export const gstFilingSync = (data) =>
  api.post("/gst-app/gst/filing-sync/", data).then((r) => r.data);

export const gstRetSave = (data) => api.post("/gst-app/gst/ret-save/", data);

export const gstRetSection = (params) =>
  api.get("/gst-app/gst/ret-section/", { params });

export const gstTdsTcs = (params) => api.get("/gst-app/gst/tds-tcs/", { params });

export const gstReportSummary = (params) =>
  api.get("/gst-app/gst/report-summary/", { params });

export const gstProfile = (params) => api.post("/gst-app/gst/profile/", params);

export const gstLogout = (params) => api.post("/gst-app/gst/logout/", params);

export const gstCredentials = () => api.get("/gst-app/gst/credentials/");

export const gstLedger = (params) => api.get("/gst-app/gst/ledger/", { params });

export const gstPayment = (params) => api.get("/gst-app/gst/payment/", { params });

export const gstFo = (params) => api.get("/gst-app/gst/fo/", { params });

// ── Dashboards ───────────────────────────────────────────────────────
export const fetchUserDashboard = () =>
  api.get("/gst-app/dashboard/user/").then((r) => r.data);

export const fetchAdminDashboard = () =>
  api.get("/gst-app/dashboard/admin/").then((r) => r.data);

export const fetchSuperDashboard = () =>
  api.get("/gst-app/dashboard/super/").then((r) => r.data);

// ── Firms / API logs (admin only) ────────────────────────────────────
export const fetchFirms = () => api.get("/gst-app/firms/").then((r) => r.data);

export const fetchApiLogs = (params = {}) =>
  api.get("/gst-app/api-logs/", { params }).then((r) => r.data);