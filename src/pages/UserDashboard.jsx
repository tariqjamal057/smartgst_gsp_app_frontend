import React, { useState, useEffect, useRef, useCallback } from "react";

import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import GSTDashboardAllPanels from "./GSTDashboardAllPanels";
import { HiOutlineBell } from "react-icons/hi";
import { ExternalLink } from 'lucide-react';
import { FiBell } from "react-icons/fi";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { SlArrowLeftCircle, SlArrowRight } from "react-icons/sl";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";


import NewsAndUpdates from './NewsAndUpdates';
import useNotificationSocket from "../hooks/useNotificationSocket";

import { fetchClients, gstFilingStatus, fetchNotificationPreferences, updateNotificationPreferences, fetchPlans, fetchMySubscription, selectPlan, fetchPayments, fetchNotifications, markNotificationsRead, markAllNotificationsRead, fetchDashboardLinks } from "../api/services";
import AddClientModal from "../components/AddClientModal";

let dashboardLinksPromise = null;
function loadDashboardLinksOnce() {
  if (!dashboardLinksPromise) {
    dashboardLinksPromise = Promise.all([
      fetchDashboardLinks("link").then((d) => (d.results || d).slice()).catch(() => []),
      fetchDashboardLinks("portal").then((d) => (d.results || d).slice()).catch(() => []),
    ]).then(([links, portals]) => ({ links, portals }));
  }
  return dashboardLinksPromise;
}
import { getProfile, updateProfile, saveSession, getStoredUser, clearSession, getRole, changeUserPassword, fetchSessions, revokeSession, revokeAllSessions, fetchLoginActivity } from "../api/auth";



import {
  HiLockClosed,
  HiCreditCard,
  HiUserGroup,
  HiNewspaper,
  HiDocumentText,
  HiFolder,
  HiChartBar,
  HiMenu,
  HiArrowLeft,
  HiX,
  HiHome,
  HiMail,
  HiPhone,
  HiSearch,
  HiChevronDown,
  HiShare,
  HiPrinter,
  HiBell,
  HiCog,
  HiMoon,
  HiSun,
  HiLogout,
  HiPlus,
  HiDocumentAdd,
  HiUpload,
  HiDownload,
  HiTrash,
  HiPencil,
  HiCheckCircle,
  HiUser,
  HiCalendar,
  HiRefresh,
} from "react-icons/hi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import * as XLSX from "xlsx"; 

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
} from "chart.js";
import { Line, Pie, Bar } from "react-chartjs-2";




ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
);



// ═══════════════════════════════════════════
// DotMatrix — Premium SaaS dot grid separator
// ═══════════════════════════════════════════

const DotMatrix = ({ cols = 3, rows = 4, color = "#94a3b8", opacity = 0.45, size = 3.5, gap = 4 }) => {
  const dots = Array.from({ length: cols * rows });
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${size}px)`,
        gap: `${gap}px`,
        opacity,
        flexShrink: 0,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {dots.map((_, i) => (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: color,
          }}
        />
      ))}
    </div>
  );
};



function UserDashboard() {


  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [showContactModal, setShowContactModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({ open: false, message: "", onConfirm: null });
  const userDropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    if (showUserDropdown) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserDropdown]);
  // [FIX] GSTR-3B "Jump to" dropdown - close only on outside click/scroll-safe, never on mouseleave
  useEffect(() => {
    const handleGstr3bJumpOutsideClick = (e) => {
      const dd = document.getElementById("gstr3b-jump-dropdown");
      const trigger = document.getElementById("gstr3b-jump-trigger");
      if (!dd || dd.style.display !== "block") return;
      if (dd.contains(e.target) || (trigger && trigger.contains(e.target))) return;
      dd.style.display = "none";
    };
    document.addEventListener("mousedown", handleGstr3bJumpOutsideClick);
    return () => document.removeEventListener("mousedown", handleGstr3bJumpOutsideClick);
  }, []);
  // [FIX] GSTR-1 / GSTR-1A "Jump to" dropdown - close only on outside click, never on mouseleave
  useEffect(() => {
    const handleGstr1JumpOutsideClick = (e) => {
      const dd = document.getElementById("gstr1-jump-dropdown");
      const trigger = document.getElementById("gstr1-jump-trigger");
      if (!dd || dd.style.display !== "block") return;
      if (dd.contains(e.target) || (trigger && trigger.contains(e.target))) return;
      dd.style.display = "none";
    };
    document.addEventListener("mousedown", handleGstr1JumpOutsideClick);
    return () => document.removeEventListener("mousedown", handleGstr1JumpOutsideClick);
  }, []);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showGSTReturnPeriodSelection, setShowGSTReturnPeriodSelection] = useState(false);
  const [showReturnsSummary, setShowReturnsSummary] = useState(false);
  const [selectedFY, setSelectedFY] = useState("2025-26");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState("Quarter 4 (Jan - Mar)");
  const [selectedPeriod, setSelectedPeriod] = useState("January");
  const [step, setStep] = useState('selection');           // 'selection' | 'summary' | 'detail'
  const [selectedForm, setSelectedForm] = useState(null);  // "GSTR1", "GSTR2B", "GSTR2A" etc
  const [maximizedView, setMaximizedView] = useState(null); // null | 'returns' | 'clients' | 'news' | etc.

  const openMaximized = (view) => setMaximizedView(view);
  const closeMaximized = () => setMaximizedView(null);
  
  const navigate = useNavigate();
    useEffect(() => {
      
      const token = localStorage.getItem("access_token");
      if (!token) {
         navigate("/");
      }
    }, [navigate]);
      

  

  const location = useLocation();

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);



 const [user, setUser] = useState(() => {
  const savedUser = localStorage.getItem("user");
  return savedUser
    ? JSON.parse(savedUser)
    : { name: "Guest", role: "User", company: "" };
     
});

useEffect(() => {
  getProfile()
    .then((data) => {
      if (!data) return;
      const first = (data.first_name || "").trim();
      const last = (data.last_name || "").trim();
      const name = (data.name || "").trim() || (first === last && first ? first : [first, last].filter(Boolean).join(" "));
      const fresh = { ...user, ...data, name };
      setUser(fresh);
      saveSession({ access: localStorage.getItem("access_token") || "", refresh: localStorage.getItem("refresh_token") || "", user: fresh });
    })
    .catch(() => {});
}, []);

// ---- Notifications (header badge + /user/notifications page) ---------------
const [notificationsList, setNotificationsList] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);
const [notifPulse, setNotifPulse] = useState(false);
const notifPollRef = useRef(false);

const normalizeNotifications = (data) => {
  if (Array.isArray(data)) return data;
  return (data && Array.isArray(data.results)) ? data.results : [];
};

useEffect(() => {
  let cancelled = false;
  const load = () => {
    fetchNotifications()
      .then((data) => {
        if (cancelled) return;
        const items = normalizeNotifications(data).slice(0, 100);
        setNotificationsList(items);
        setUnreadCount(items.filter((n) => !n.is_read).length);
      })
      .catch(() => {});
  };

  if (!notifPollRef.current) {
    notifPollRef.current = true;
    load();
  }
  const onFocus = () => load();
  window.addEventListener("focus", onFocus);
  return () => {
    cancelled = true;
    window.removeEventListener("focus", onFocus);
  };
}, []);

useNotificationSocket({
  onMessage: (msg) => {
    if (!msg || msg.type !== "notification.new" || !msg.notification) return;
    const n = msg.notification;
    setNotificationsList((prev) => [
      n,
      ...prev.filter((existing) => existing.id !== n.id),
    ]);
    if (!n.is_read) {
      setUnreadCount((c) => c + 1);
      setNotifPulse(true);
      setTimeout(() => setNotifPulse(false), 2200);
    }
  },
});

const handleMarkNotificationRead = (id) => {
  setNotificationsList((prev) =>
    prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
  );
  setUnreadCount((c) => Math.max(0, c - 1));
  markNotificationsRead([id]).catch(() => {});
};

const handleMarkAllRead = () => {
  setNotificationsList((prev) => prev.map((n) => ({ ...n, is_read: true })));
  setUnreadCount(0);
  markAllNotificationsRead().catch(() => {});
};


  const [editProfileForm, setEditProfileForm] = useState({ ...user });

  const handleEditProfileChange = (e) => {
    setEditProfileForm({ ...editProfileForm, [e.target.name]: e.target.value });
  };

  const saveEditedProfile = () => {
    setUser(editProfileForm);
    localStorage.setItem("user", JSON.stringify(editProfileForm));  
    toast.success("Profile updated successfully!");
    setShowEditProfileModal(false);
    setShowUserDropdown(false);
  };

const menuItems = [
  { text: "Dashboard", link: "/user", icon: HiHome },
  { text: "My Clients", link: "/user/clients", icon: HiUserGroup },
  
  
  { text: "News & Updates", link: "/user/news-updates", icon: HiNewspaper },
  { text: "Notifications", link: "/user/notifications", icon: HiBell },
  { text: "Settings", link: "/user/settings", icon: HiCog }, // agar hai to
];


// ==============================================
// GST Return Period Selection Component
// ==============================================
// ==============================================
// GST Return Period Selection Component (unchanged)
// ==============================================
// ==============================================
// GST Return Period Selection Component
// ==============================================
const GSTReturnPeriodSelection = ({
  selectedFY, setSelectedFY,
  selectedQuarter, setSelectedQuarter,
  selectedPeriod, setSelectedPeriod,
  onSearch
}) => (
  <div
    style={{
      padding: "24px 5%",
      background: "linear-gradient(180deg,#f5f3ff,#ffffff)",
      minHeight: "100vh",
      fontFamily: "system-ui, sans-serif"
    }}
  >
    <div
      style={{
        maxWidth: "820px",
        margin: "0 auto",
        background: "#ffffff",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
        border: "1px solid #e5e7eb"
      }}
    >
      {/* ───── Header ───── */}
      <div
        style={{
          background: "linear-gradient(135deg,#f3f0ff,#f8fafc)",
          padding: "14px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e5e7eb"
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "#0f172a"
          }}
        >
          File GST Returns
        </h1>
        <span
          style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "#334155",
            background: "#ede9fe",
            padding: "4px 10px",
            borderRadius: "999px"
          }}
        >
          GSTIN: 09ACNPU2195H1ZY
        </span>
      </div>

      {/* ───── Form Area (Updated with Reverse Year + Month Scroller) ───── */}
      <div style={{ padding: "22px 28px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginBottom: "26px"
          }}
        >
          
          {/* YEAR SELECTOR - Reverse Order */}
          <div>
            <label style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: 600,
              color: "#1e293b",
              fontSize: "0.85rem"
            }}>
              Financial Year
            </label>
            <select
              value={selectedFY}
              onChange={e => setSelectedFY(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                fontSize: "0.9rem",
                outline: "none",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)"
              }}
            >
              {[
                "2025-26", "2024-25", "2023-24", "2022-23", "2021-22",
                "2020-21", "2019-20", "2018-19", "2017-18"
              ].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* QUARTER SELECTOR */}
          <div>
            <label style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: 600,
              color: "#1e293b",
              fontSize: "0.85rem"
            }}>
              Quarter <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              value={selectedQuarter}
              onChange={e => setSelectedQuarter(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                fontSize: "0.9rem",
                outline: "none"
              }}
            >
              <option>Quarter 4 (Jan - Mar)</option>
              <option>Quarter 3 (Oct - Dec)</option>
              <option>Quarter 2 (Jul - Sep)</option>
              <option>Quarter 1 (Apr - Jun)</option>
            </select>
          </div>

          {/* MONTH HORIZONTAL SCROLLER */}
          <div>
            <label style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: 600,
              color: "#1e293b",
              fontSize: "0.85rem"
            }}>
              Month <span style={{ color: "#ef4444" }}>*</span>
            </label>
            
            <div style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              padding: "6px 2px",
              scrollbarWidth: "thin",
              scrollbarColor: "#c4b5fd #f1f5f9",
              maxHeight: "54px",
              alignItems: "center"
            }}>
              {[
                "January","February","March","April","May","June",
                "July","August","September","October","November","December"
              ].map((month) => (
                <button
                  key={month}
                  onClick={() => setSelectedPeriod(month)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: selectedPeriod === month ? "2px solid #4f46e5" : "1px solid #e2e8f0",
                    background: selectedPeriod === month ? "#f3f0ff" : "#ffffff",
                    color: selectedPeriod === month ? "#4f46e5" : "#475569",
                    fontWeight: selectedPeriod === month ? "700" : "600",
                    fontSize: "0.83rem",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    flexShrink: 0,
                    minWidth: "92px",
                    boxShadow: selectedPeriod === month ? "0 3px 10px rgba(79,70,229,0.25)" : "none"
                  }}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div
          style={{
            background: "#f3f0ff",
            borderLeft: "4px solid #3b82f6",
            padding: "10px 14px",
            borderRadius: "10px",
            fontSize: "0.8rem",
            color: "#334155",
            marginBottom: "22px",
            maxWidth: "520px",
            marginInline: "auto"
          }}
        >
          You have selected to file the return on monthly frequency.  
          GSTR-1 and GSTR-3B are required for each month of the quarter.
        </div>

        {/* Search Button */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={onSearch}
            style={{
              background: "linear-gradient(135deg,#4f46e5,#3730a3)",
              color: "white",
              padding: "12px 56px",
              fontSize: "1rem",
              fontWeight: 700,
              border: "none",
              borderRadius: "999px",
              cursor: "pointer",
              boxShadow: "0 12px 30px rgba(79,70,229,0.45)",
              transition: "all 0.2s ease"
            }}
            onMouseOver={e => {
              e.currentTarget.style.boxShadow = "0 18px 40px rgba(79,70,229,0.6)";
            }}
            onMouseOut={e => {
              e.currentTarget.style.boxShadow = "0 12px 30px rgba(79,70,229,0.45)";
            }}
          >
            SEARCH RETURNS
          </button>
        </div>
      </div>
    </div>
  </div>
);
// ==============================================
// Returns Summary Screen (unchanged)
// ==============================================
const ReturnsSummaryScreen = ({ fy, quarter, period, onBack, onViewForm }) => {
  const pastMonths = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const isPastPeriod = fy !== '2025-26' || pastMonths.includes(period);

  return (
    <div
      style={{
        padding: "20px 5% 32px",
        background: "linear-gradient(135deg, #f9fafb 0%, #f1f5f9 100%)",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={onBack}
              style={{
                background: "white",
                border: "1px solid #cbd5e1",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1.1rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
              }}
            >
              ←
            </button>
            <h1
              style={{
                margin: 0,
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "#0f172a"
              }}
            >
              Returns Dashboard
            </h1>
          </div>
          <div
            style={{
              background: "#f3f0ff",
              padding: "8px 16px",
              borderRadius: "9999px",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#3730a3",
              border: "1px solid #bfdbfe",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
            }}
          >
            FY {fy} · {quarter}
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderLeft: "4px solid #3b82f6",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            fontSize: "0.95rem",
            color: "#3730a3",
            fontWeight: 500
          }}
        >
          Monthly filing enabled. GSTR-1 & GSTR-3B required every month.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px"
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              minHeight: "240px"
            }}
          >
            <div
              style={{
                padding: "14px 20px",
                background: "linear-gradient(90deg, #eff6ff, #dbeafe)",
                color: "#3730a3",
                fontSize: "1.05rem",
                fontWeight: 700,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px"
              }}
            >
              <span>GSTR-1 · Outward Supplies</span>
              <span
                style={{
                  background: "#ecfdf5",
                  color: "#065f46",
                  padding: "5px 12px",
                  borderRadius: "9999px",
                  fontSize: "0.8rem",
                  fontWeight: 600
                }}
              >
                Filed
              </span>
            </div>
            <div
              style={{
                padding: "16px 20px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#475569",
                  lineHeight: "1.45",
                  margin: 0
                }}
              >
                Summary of outward taxable supplies reported for the selected period.
              </p>
              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button
                  onClick={() => onViewForm("GSTR1")}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    cursor: "pointer"
                  }}
                >
                  View
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    background: "linear-gradient(90deg, #6D4AFF, #4f46e5)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    cursor: "pointer"
                  }}
                >
                  Download
                </button>
              </div>
            </div>
          </div>

          {!isPastPeriod && (
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                minHeight: "240px"
              }}
            >
              <div
                style={{
                  padding: "14px 20px",
                  background: "linear-gradient(90deg, #fffbeb, #fef3c7)",
                  color: "#92400e",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px"
                }}
              >
                <span>Amendments</span>
                <span
                  style={{
                    background: "#fefce8",
                    color: "#854d0e",
                    padding: "5px 12px",
                    borderRadius: "9999px",
                    fontSize: "0.8rem",
                    fontWeight: 600
                  }}
                >
                  Open
                </span>
              </div>
              <div
                style={{
                  padding: "16px 20px",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#475569",
                    lineHeight: "1.45",
                    margin: 0
                  }}
                >
                  Update invoices, debit notes, or credit notes for the current tax period.
                </p>
                <button
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    marginTop: "20px",
                    background: "linear-gradient(90deg, #f59e0b, #d97706)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "0.92rem",
                    cursor: "pointer"
                  }}
                >
                  Prepare Online
                </button>
              </div>
            </div>
          )}

          <div
            style={{
              background: "white",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              minHeight: "240px"
            }}
          >
            <div
              style={{
                padding: "14px 20px",
                background: "linear-gradient(90deg, #f0fdfa, #ccfbf1)",
                color: "#0f766e",
                fontSize: "1.05rem",
                fontWeight: 700,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px"
              }}
            >
              <span>Auto-Drafted ITC</span>
              <span
                style={{
                  background: "#f0fdfa",
                  color: "#0f766e",
                  padding: "5px 12px",
                  borderRadius: "9999px",
                  fontSize: "0.8rem",
                  fontWeight: 600
                }}
              >
                Available
              </span>
            </div>
            <div
              style={{
                padding: "16px 20px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#475569",
                  lineHeight: "1.45",
                  margin: 0
                }}
              >
                ITC statement auto-generated based on supplier filings.
              </p>
              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button
                  onClick={() => onViewForm("AutoDraftedITC")}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    cursor: "pointer"
                  }}
                >
                  View
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    background: "linear-gradient(90deg, #6D4AFF, #4f46e5)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    cursor: "pointer"
                  }}
                >
                  Download
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 6px 24px rgba(153,27,27,0.18)",
              border: "1px solid #fecaca",
              display: "flex",
              flexDirection: "column",
              minHeight: "240px"
            }}
          >
            <div
              style={{
                padding: "14px 20px",
                background: "linear-gradient(90deg, #fef2f2, #fee2e2)",
                color: "#991b1b",
                fontSize: "1.05rem",
                fontWeight: 700,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px"
              }}
            >
              <span>GSTR-3B · Monthly Return</span>
              <span
                style={{
                  background: "#fef2f2",
                  color: "#991b1b",
                  padding: "5px 12px",
                  borderRadius: "9999px",
                  fontSize: "0.8rem",
                  fontWeight: 600
                }}
              >
                Pending
              </span>
            </div>
            <div
              style={{
                padding: "16px 20px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div
                  style={{
                    background: "#fefce8",
                    color: "#854d0e",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    textAlign: "center",
                    marginBottom: "16px"
                  }}
                >
                  Due date: 20 {period} 2026
                </div>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#475569",
                    lineHeight: "1.45",
                    margin: 0
                  }}
                >
                  Summary of monthly return including liability, ITC and payment details.
                </p>
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    background: "linear-gradient(90deg, #6D4AFF, #4f46e5)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    cursor: "pointer"
                  }}
                >
                  Prepare Online
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    cursor: "pointer"
                  }}
                >
                  Prepare Offline
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==============================================
// Detailed GST View - Premium Compact UI + Dynamic Form
// ==============================================
const DetailedGSTView = ({ formType, fy, period, onBack }) => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [records, setRecords] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);

  // ECO Supplies state
  const [ecoFormRows, setEcoFormRows] = useState([
    { sl: 1, ecoGstin: "", supplyType: "B2B", pos: "09-Uttar Pradesh", taxableValue: "", igst: "", cgst: "", sgst: "", cess: "" }
  ]);
  // Documents Issued state
  const [docFormRows, setDocFormRows] = useState([
    { sl: 1, docType: "Invoices for outward supply", serialFrom: "", serialTo: "", totalIssued: "", cancelled: "", netIssued: "" }
  ]);


  

  const [form, setForm] = useState({
    deemedExports: false,
    sezWithPayment: false,
    sezWithoutPayment: false,
    reverseCharge: false,
    intraStateIGST: false,
    differentialTax: false,
    gstin: "",
    recipientName: "",
    nameInMaster: "",
    invoiceNo: "",
    invoiceDate: "",
    totalValue: "",
    pos: "09-Uttar Pradesh",
    supplyType: "Intra-State",
    source: "",
    irn: "",
    irnDate: ""
  });

  const [items, setItems] = useState([
    { rate: 0, taxableValue: "", central: 0, state: 0, cess: 0 },
    { rate: 0.1, taxableValue: "", central: 0, state: 0, cess: 0 },
    { rate: 0.25, taxableValue: "", central: 0, state: 0, cess: 0 },
    { rate: 1, taxableValue: "", central: 0, state: 0, cess: 0 },
    { rate: 1.5, taxableValue: "", central: 0, state: 0, cess: 0 },
    { rate: 3, taxableValue: "", central: 0, state: 0, cess: 0 },
    { rate: 5, taxableValue: "", central: 0, state: 0, cess: 0 },
    { rate: 6, taxableValue: "", central: 0, state: 0, cess: 0 },
    { rate: 7.5, taxableValue: "", central: 0, state: 0, cess: 0 },
    { rate: 12, taxableValue: "", central: 0, state: 0, cess: 0 },
    { rate: 18, taxableValue: "", central: 0, state: 0, cess: 0 },
    { rate: 28, taxableValue: "", central: 0, state: 0, cess: 0 },
    { rate: 40, taxableValue: "", central: 0, state: 0, cess: 0 }
  ]);

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === "taxableValue" && value !== "") {
      const rate = newItems[index].rate / 100;
      const half = (Number(value) * rate) / 2;
      newItems[index].central = half.toFixed(2);
      newItems[index].state = half.toFixed(2);
      newItems[index].cess = 0;
    }
    setItems(newItems);
  };

  const saveRecord = () => {
    if (!form.gstin || !form.recipientName || !form.invoiceNo || !form.invoiceDate || !form.totalValue) {
      alert("Please fill all mandatory fields");
      return;
    }

    const filledItems = items.filter(i => i.taxableValue !== "");

    const newRecord = { ...form, items: filledItems, timestamp: new Date().toISOString() };

    const title = selectedSection.title;
    setRecords(prev => ({
      ...prev,
      [title]: [...(prev[title] || []), newRecord]
    }));

    setShowAddForm(false);
    setForm({
      deemedExports: false,
      sezWithPayment: false,
      sezWithoutPayment: false,
      reverseCharge: false,
      intraStateIGST: false,
      differentialTax: false,
      gstin: "",
      recipientName: "",
      nameInMaster: "",
      invoiceNo: "",
      invoiceDate: "",
      totalValue: "",
      pos: "09-Uttar Pradesh",
      supplyType: "Intra-State",
      source: "",
      irn: "",
      irnDate: ""
    });
    setItems(items.map(i => ({ ...i, taxableValue: "", central: 0, state: 0, cess: 0 })));

    alert("Record saved!");
  };

  // Main sections (non-amendment)
  const baseSections = [
      "1 - 4A, 4B, 6B, 6C - B2B, SEZ, DE Invoices",
      "2 - B2C (Large) Invoices",
      "3 - Exports Invoices",
      "4 - B2C (Others)",
      "5 - 8B, 8C, 8D - Nil Rated Supplies",
      "6 - 9B  Credit / Debit Notes (Registered)",
      "7 - 9B  Credit / Debit Notes (Unregistered)",
      "8 - 11A(1), 11A(2) - Tax Liability (Advances Received)",
      "9 - 11B Adjustment of Advances",
      "12 - HSN-wise summary of outward supplies",
      "13 - Documents Issued",
      "15 - Supplies U/s 9(5)",
      "18 - ECO B2B",
      "19 - ECO URP B2B",
      "20 - ECO B2C",
      "21 - ECO URP B2C",
    ];

  // Amendment sections (shown separately below)
  const amendmentSections = [
      "14 - Supplies made through ECO",
      "16 - B2B Amendment",
      "17 - Export Amendment",
      "22 - ECO Amendment B2B",
      "23 - ECO Amendment B2C ",
      "24 - ECO Amendment URP B2B",
      "25 - B2BA",
      "26 - B2CLA",
      "27 - CDNRA",
      "28 - CDNURA",
      "29 - ECO URP2C Amendment",
      "30 - Amended Tax Liability",
      "31 - B2C (Small) Amendment",
      "32 - Advance Received Amendment",
      "33 - Advance Adjustment Amendment",
      "34 - Supply through ECO Amendment"
    ];

  const sections = baseSections.map(title => ({
    title,
    count: records[title]?.length || 
           (fy === "2025-26" && ["January","February","March"].includes(period) ? 0 : 
           (title.startsWith("4A") || title.startsWith("12") || title.startsWith("13") ? 1 : 0))
  }));

  const amendmentSectionsData = amendmentSections.map(title => ({
    title,
    count: records[title]?.length || 0
  }));

  const isZeroRecord = selectedSection && sections.find(s => s.title === selectedSection.title)?.count === 0;

  return (
    <div style={{
      padding: "20px 5% 40px",
      background: "#f9fafb",
      minHeight: "100vh",
      fontFamily: "system-ui, sans-serif"
    }}>
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>

        {/* Back button - smaller & premium */}
        <button
          onClick={onBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            background: "white",
            border: "1px solid #d1d5db",
            borderRadius: "10px",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: "pointer",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            transition: "all 0.18s ease"
          }}
          onMouseOver={e => {
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(109,74,255,0.15)";
            e.currentTarget.style.borderColor = "#6D4AFF";
          }}
          onMouseOut={e => {
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
            e.currentTarget.style.borderColor = "#d1d5db";
          }}
        >
          ← Back
        </button>

        {/* Main Info Card - compact */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "20px 24px",
          marginBottom: "24px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
            <h1 style={{ margin: 0, fontSize: "1.55rem", fontWeight: 700, color: "#3730a3" }}>
              {formType}
            </h1>
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={{
                padding: "8px 14px",
                background: "#f3f0ff",
                color: "#3730a3",
                border: "1px solid #bfdbfe",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer"
              }}>
                Advisory
              </button>
              <button style={{
                padding: "8px 14px",
                background: "#3730a3",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer"
              }}>
                Help
              </button>
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "10px",
            fontSize: "0.9rem"
          }}>
            <div><strong>GSTIN:</strong> 09ACNPU2195H1ZY</div>
            <div><strong>Legal:</strong> Mohd Umair</div>
            <div><strong>Trade:</strong> U.A.F ENTERPRISE'S</div>
            <div><strong>FY:</strong> {fy}</div>
            <div><strong>Period:</strong> {period}</div>
            <div>
              <strong>Status:</strong> 
              <span style={{
                marginLeft: "8px",
                padding: "4px 10px",
                background: "#ecfdf5",
                color: "#059669",
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "0.85rem"
              }}>
                Filed
              </span>
            </div>
          </div>
        </div>

        {/* Nil filing - smaller */}
        <div style={{
          background: "white",
          borderRadius: "10px",
          padding: "12px 18px",
          marginBottom: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          border: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <input type="checkbox" style={{ width: "16px", height: "16px", accentColor: "#6D4AFF" }} />
          <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1e293b" }}>
            File Nil {formType}
          </span>
        </div>

        {/* Compact Cards Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "16px"
        }}>
          {sections.map((item, idx) => (
            <div
              key={item.title}
              onClick={() => {
                setSelectedSection(item);
                setShowAddForm(false);
              }}
              style={{
                background: "white",
                borderRadius: "12px",
                border: item.count > 0 ? "1px solid #86efac" : "1px solid #e5e7eb",
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.06)";
              }}
            >
              <div style={{
                background: item.count > 0 
                  ? "linear-gradient(135deg, #ecfdf5, #f0fdf4)" 
                  : "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                padding: "12px 14px",
                fontSize: "0.85rem",
                fontWeight: 600,
                minHeight: "54px",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <div style={{
                  width: "26px",
                  height: "26px",
                  minWidth: "26px",
                  borderRadius: "6px",
                  background: "linear-gradient(135deg, #1f2a70, #3b4cc0)",
                  color: "white",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  alignSelf: "center"
                }}>
                  {idx + 1}
                </div>
                <span style={{ color: "#1e293b", lineHeight: 1.35 }}>
                  {item.title.replace(/^\d+\s*[-–]\s*/, "")}
                </span>
              </div>
              <div style={{ padding: "16px", textAlign: "center" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  lineHeight: "48px",
                  borderRadius: "8px",
                  margin: "0 auto",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  background: item.count > 0 ? "#dcfce7" : "#f1f5f9",
                  color: item.count > 0 ? "#15803d" : "#64748b",
                  boxShadow: item.count > 0 ? "0 2px 8px rgba(34,197,94,0.25)" : "none"
                }}>
                  {item.count}
                </div>
              </div>
            </div>
          ))}
        </div>

        
        {/* ───── Amendments Section ───── */}
        {/* [FIX #4] Amendment Navbar — white background, 3D effect */}
        <div style={{
          marginTop: "32px",
          background: "white",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          overflow: "hidden"
        }}>
          <div style={{
            background: "#ffffff",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            borderBottom: "1px solid #e2e8f0",
            boxShadow: "0 4px 15px rgba(0,0,0,0.10), inset 0 1px 0 #fff, inset 0 -1px 0 rgba(0,0,0,0.04)"
          }}>
            <span style={{ fontSize: "1.2rem" }}>✏️</span>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#3730a3" }}>
              Amendments
            </h3>
            
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "12px",
            padding: "16px"
          }}>
            {amendmentSectionsData.map((item, idx) => (
              <div
                key={item.title}
                onClick={() => {
                  setSelectedSection(item);
                  setShowAddForm(false);
                }}
                style={{
                  background: "#ffffff",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  transition: "all 0.18s ease",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(31,42,112,0.12)";
                  e.currentTarget.style.borderColor = "#c4b5fd";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }}
              >
                <div style={{
                  width: "24px",
                  height: "24px",
                  minWidth: "24px",
                  borderRadius: "6px",
                  background: "linear-gradient(135deg, #1f2a70, #3b4cc0)",
                  color: "white",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  alignSelf: "center"
                }}>
                  {idx + 1}
                </div>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", lineHeight: 1.3, flex: 1 }}>
                  {item.title.replace(/^\d+\s*[-–]\s*/, "")}
                </span>
                <div style={{
                  minWidth: "36px",
                  height: "36px",
                  lineHeight: "36px",
                  borderRadius: "6px",
                  textAlign: "center",
                  fontSize: "1rem",
                  fontWeight: 700,
                  background: item.count > 0 ? "#ede9fe" : "#f1f5f9",
                  color: item.count > 0 ? "#3730a3" : "#94a3b8",
                  flexShrink: 0
                }}>
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ───── Compact Modal ───── */}
        {selectedSection && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px"
            }}
            onClick={() => {
              setSelectedSection(null);
              setShowAddForm(false);
            }}
          >
            <div
              style={{
                background: "white",
                width: "100%",
                maxWidth: "100%",
                maxHeight: "90vh",
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow: "0 20px 70px rgba(0,0,0,0.25)"
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header - smaller */}
              <div style={{
                padding: "14px 24px",
                background: "linear-gradient(135deg, #f8fafc, #eef2ff)",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#0f172a" }}>
                  {selectedSection.title}
                </h2>
                <button
                  onClick={() => {
                    setSelectedSection(null);
                    setShowAddForm(false);
                  }}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    background: "white",
                    fontSize: "1.3rem",
                    cursor: "pointer"
                  }}
                >
                  ×
                </button>
              </div>

              {/* ═══ ECO SUPPLIES TABLE (Section 14 / 15 / 18 / 19 / 20 / 21) ═══ */}
              {selectedSection && (
                selectedSection.title.includes("ECO") || selectedSection.title.includes("Supplies U/s 9(5)") || selectedSection.title.includes("Supplies made through ECO")
              ) ? (
                <div style={{ padding: "24px 28px", maxHeight: "calc(90vh - 80px)", overflowY: "auto" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem", fontWeight: 700, color: "#1e293b" }}>
                    Supplies Made Through E-Commerce Operator
                  </h3>
                  <div style={{ overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: "10px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1100px" }}>
                      <thead>
                        <tr style={{ background: "linear-gradient(135deg,#1f2a70,#3b4cc0)" }}>
                          <th style={{ padding: "12px 10px", color: "#fff", textAlign: "center", width: "50px", fontWeight: 700, fontSize: "0.82rem" }}>Sr.</th>
                          <th style={{ padding: "12px 10px", color: "#fff", textAlign: "left", fontWeight: 700, fontSize: "0.82rem" }}>ECO GSTIN</th>
                          <th style={{ padding: "12px 10px", color: "#fff", textAlign: "left", fontWeight: 700, fontSize: "0.82rem" }}>Supply Type</th>
                          <th style={{ padding: "12px 10px", color: "#fff", textAlign: "left", fontWeight: 700, fontSize: "0.82rem" }}>Place of Supply</th>
                          <th style={{ padding: "12px 10px", color: "#fff", textAlign: "center", fontWeight: 700, fontSize: "0.82rem" }}>Taxable Value (₹)</th>
                          <th style={{ padding: "12px 10px", color: "#fff", textAlign: "center", fontWeight: 700, fontSize: "0.82rem" }}>IGST (₹)</th>
                          <th style={{ padding: "12px 10px", color: "#fff", textAlign: "center", fontWeight: 700, fontSize: "0.82rem" }}>CGST (₹)</th>
                          <th style={{ padding: "12px 10px", color: "#fff", textAlign: "center", fontWeight: 700, fontSize: "0.82rem" }}>SGST (₹)</th>
                          <th style={{ padding: "12px 10px", color: "#fff", textAlign: "center", fontWeight: 700, fontSize: "0.82rem" }}>Cess (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ecoFormRows.map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fafafa" : "#fff" }}>
                            <td style={{ padding: "10px 8px", textAlign: "center", verticalAlign: "middle" }}>
                              <div style={{ width: "30px", height: "30px", borderRadius: "6px", background: "linear-gradient(135deg,#1f2a70,#3b4cc0)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontWeight: 700, fontSize: "0.82rem", border: "2px solid #3b4cc0" }}>
                                {idx + 1}
                              </div>
                            </td>
                            <td style={{ padding: "8px 10px" }}>
                              <input value={row.ecoGstin} onChange={e => { const r=[...ecoFormRows]; r[idx].ecoGstin=e.target.value; setEcoFormRows(r); }} placeholder="ECO GSTIN" style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", textAlign: "center", boxSizing: "border-box" }} />
                            </td>
                            <td style={{ padding: "8px 10px" }}>
                              <select value={row.supplyType} onChange={e => { const r=[...ecoFormRows]; r[idx].supplyType=e.target.value; setEcoFormRows(r); }} style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", textAlign: "center", boxSizing: "border-box" }}>
                                <option>B2B</option>
                                <option>B2C</option>
                                <option>URP B2B</option>
                                <option>URP B2C</option>
                              </select>
                            </td>
                            <td style={{ padding: "8px 10px" }}>
                              <select value={row.pos} onChange={e => { const r=[...ecoFormRows]; r[idx].pos=e.target.value; setEcoFormRows(r); }} style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", textAlign: "center", boxSizing: "border-box" }}>
                                <option>09-Uttar Pradesh</option>
                                <option>07-Delhi</option>
                                <option>27-Maharashtra</option>
                                <option>29-Karnataka</option>
                              </select>
                            </td>
                            {["taxableValue","igst","cgst","sgst","cess"].map(f => (
                              <td key={f} style={{ padding: "8px 10px" }}>
                                <input type="number" value={row[f]} onChange={e => { const r=[...ecoFormRows]; r[idx][f]=e.target.value; setEcoFormRows(r); }} placeholder="0.00" style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", textAlign: "center", boxSizing: "border-box" }} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: "flex", gap: "12px", marginTop: "16px", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <button onClick={() => setEcoFormRows([...ecoFormRows, { sl: ecoFormRows.length+1, ecoGstin: "", supplyType: "B2B", pos: "09-Uttar Pradesh", taxableValue: "", igst: "", cgst: "", sgst: "", cess: "" }])} style={{ padding: "9px 20px", background: "#ede9fe", color: "#3730a3", border: "1px solid #c4b5fd", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.88rem" }}>+ Add Row</button>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button onClick={() => setSelectedSection(null)} style={{ padding: "9px 28px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>BACK</button>
                      <button onClick={() => { alert("ECO Supplies saved!"); setSelectedSection(null); }} style={{ padding: "9px 32px", background: "linear-gradient(90deg,#4f46e5,#6D4AFF)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>SAVE</button>
                    </div>
                  </div>
                </div>

              /* ═══ DOCUMENTS ISSUED TABLE (Section 13) ═══ */
              ) : selectedSection && selectedSection.title.includes("Documents Issued") ? (
                <div style={{ padding: "24px 28px", maxHeight: "calc(90vh - 80px)", overflowY: "auto" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem", fontWeight: 700, color: "#1e293b" }}>
                    Table 13 — Documents Issued
                  </h3>
                  <div style={{ overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: "10px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
                      <thead>
                        <tr style={{ background: "linear-gradient(135deg,#1f2a70,#3b4cc0)" }}>
                          <th style={{ padding: "12px 10px", color: "#fff", textAlign: "center", width: "50px", fontWeight: 700, fontSize: "0.82rem" }}>Sr.</th>
                          <th style={{ padding: "12px 10px", color: "#fff", textAlign: "left", fontWeight: 700, fontSize: "0.82rem" }}>Nature of Document</th>
                          <th style={{ padding: "12px 10px", color: "#fff", textAlign: "center", fontWeight: 700, fontSize: "0.82rem" }}>Sr. No. From</th>
                          <th style={{ padding: "12px 10px", color: "#fff", textAlign: "center", fontWeight: 700, fontSize: "0.82rem" }}>Sr. No. To</th>
                          <th style={{ padding: "12px 10px", color: "#fff", textAlign: "center", fontWeight: 700, fontSize: "0.82rem" }}>Total Issued</th>
                          <th style={{ padding: "12px 10px", color: "#fff", textAlign: "center", fontWeight: 700, fontSize: "0.82rem" }}>Cancelled</th>
                          <th style={{ padding: "12px 10px", color: "#fff", textAlign: "center", fontWeight: 700, fontSize: "0.82rem" }}>Net Issued</th>
                        </tr>
                      </thead>
                      <tbody>
                        {docFormRows.map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fafafa" : "#fff" }}>
                            <td style={{ padding: "10px 8px", textAlign: "center", verticalAlign: "middle" }}>
                              <div style={{ width: "30px", height: "30px", borderRadius: "6px", background: "linear-gradient(135deg,#1f2a70,#3b4cc0)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontWeight: 700, fontSize: "0.82rem", border: "2px solid #3b4cc0" }}>
                                {idx + 1}
                              </div>
                            </td>
                            <td style={{ padding: "8px 10px" }}>
                              <select value={row.docType} onChange={e => { const r=[...docFormRows]; r[idx].docType=e.target.value; setDocFormRows(r); }} style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", textAlign: "center", boxSizing: "border-box" }}>
                                <option>Invoices for outward supply</option>
                                <option>Invoices for inward supply from unregistered</option>
                                <option>Revised Invoice</option>
                                <option>Debit Note</option>
                                <option>Credit Note</option>
                                <option>Receipt Voucher</option>
                                <option>Payment Voucher</option>
                                <option>Refund Voucher</option>
                                <option>Delivery Challan for job work</option>
                                <option>Delivery Challan for supply on approval</option>
                                <option>Delivery Challan in case of liquid gas</option>
                                <option>Delivery Challan in cases other than above</option>
                                <option>Bill of supply</option>
                              </select>
                            </td>
                            {["serialFrom","serialTo","totalIssued","cancelled"].map(f => (
                              <td key={f} style={{ padding: "8px 10px" }}>
                                <input value={row[f]} onChange={e => {
                                  const r=[...docFormRows];
                                  r[idx][f]=e.target.value;
                                  const issued = Number(r[idx].totalIssued)||0;
                                  const can = Number(r[idx].cancelled)||0;
                                  r[idx].netIssued = issued - can > 0 ? issued - can : 0;
                                  setDocFormRows(r);
                                }} placeholder={f==="serialFrom"?"From":f==="serialTo"?"To":f==="totalIssued"?"Total":"0"} style={{ width: "100%", padding: "9px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", textAlign: "center", boxSizing: "border-box" }} />
                              </td>
                            ))}
                            <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, color: "#15803d", fontSize: "0.95rem" }}>
                              {row.netIssued || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: "flex", gap: "12px", marginTop: "16px", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <button onClick={() => setDocFormRows([...docFormRows, { sl: docFormRows.length+1, docType: "Invoices for outward supply", serialFrom: "", serialTo: "", totalIssued: "", cancelled: "", netIssued: "" }])} style={{ padding: "9px 20px", background: "#ede9fe", color: "#3730a3", border: "1px solid #c4b5fd", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.88rem" }}>+ Add Row</button>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button onClick={() => setSelectedSection(null)} style={{ padding: "9px 28px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>BACK</button>
                      <button onClick={() => { alert("Documents Issued saved!"); setSelectedSection(null); }} style={{ padding: "9px 32px", background: "linear-gradient(90deg,#4f46e5,#6D4AFF)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>SAVE</button>
                    </div>
                  </div>
                </div>

              ) : isZeroRecord && !showAddForm ? (
                /* No Data - compact premium */
                <div style={{ padding: "60px 40px", textAlign: "center" }}>
                  <div style={{
                    fontSize: "1.45rem",
                    fontWeight: 700,
                    color: "#1e293b",
                    marginBottom: "12px"
                  }}>
                    No Data Available
                  </div>
                  <p style={{
                    color: "#64748b",
                    fontSize: "1rem",
                    marginBottom: "40px",
                    maxWidth: "480px",
                    margin: "0 auto"
                  }}>
                    There are no records for this section in the selected period.
                  </p>

                  <div style={{
                    display: "flex",
                    gap: "14px",
                    justifyContent: "center",
                    flexWrap: "wrap"
                  }}>
                    <button
                      onClick={() => setSelectedSection(null)}
                      style={{
                        padding: "10px 28px",
                        background: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "10px",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                      }}
                    >
                      BACK
                    </button>

                    <button
                      onClick={() => setShowAddForm(true)}
                      style={{
                        padding: "10px 28px",
                        background: "linear-gradient(90deg, #6D4AFF, #4f46e5)",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(109,74,255,0.3)"
                      }}
                    >
                      ADD RECORD
                    </button>

                    <button
                      style={{
                        padding: "10px 28px",
                        background: "#334155",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                      }}
                    >
                      IMPORT EWB
                    </button>
                  </div>
                </div>
              ) : isZeroRecord && showAddForm ? (
                /* Premium Form - compact */
                <div style={{ padding: "28px 32px", maxHeight: "calc(90vh - 80px)", overflowY: "auto" }}>
                  {/* Checkboxes */}
                  <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "16px 28px",
                    marginBottom: "28px"
                  }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.93rem" }}>
                      <input type="checkbox" checked={form.deemedExports} onChange={e => setForm({...form, deemedExports: e.target.checked})} style={{ width: "16px", height: "16px" }} />
                      Deemed Exports
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.93rem" }}>
                      <input type="checkbox" checked={form.sezWithPayment} onChange={e => setForm({...form, sezWithPayment: e.target.checked})} style={{ width: "16px", height: "16px" }} />
                      SEZ with payment
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.93rem" }}>
                      <input type="checkbox" checked={form.sezWithoutPayment} onChange={e => setForm({...form, sezWithoutPayment: e.target.checked})} style={{ width: "16px", height: "16px" }} />
                      SEZ without payment
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.93rem" }}>
                      <input type="checkbox" checked={form.reverseCharge} onChange={e => setForm({...form, reverseCharge: e.target.checked})} style={{ width: "16px", height: "16px" }} />
                      Reverse Charge
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.93rem" }}>
                      <input type="checkbox" checked={form.intraStateIGST} onChange={e => setForm({...form, intraStateIGST: e.target.checked})} style={{ width: "16px", height: "16px" }} />
                      Intra-State IGST
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.93rem" }}>
                      <input type="checkbox" checked={form.differentialTax} onChange={e => setForm({...form, differentialTax: e.target.checked})} style={{ width: "16px", height: "16px" }} />
                      Differential %
                    </label>
                  </div>

                  {/* Fields */}
                  <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "0.93rem" }}>GSTIN/UIN *</label>
                      <input value={form.gstin} onChange={e => setForm({...form, gstin: e.target.value})} style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #3b82f6", background: "#f0f9ff" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "0.93rem" }}>Recipient Name *</label>
                      <input value={form.recipientName} onChange={e => setForm({...form, recipientName: e.target.value})} style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "0.93rem" }}>Name in Master</label>
                      <input value={form.nameInMaster} onChange={e => setForm({...form, nameInMaster: e.target.value})} style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "0.93rem" }}>Invoice No. *</label>
                      <input value={form.invoiceNo} onChange={e => setForm({...form, invoiceNo: e.target.value})} style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "0.93rem" }}>Invoice Date *</label>
                      <input type="date" value={form.invoiceDate} onChange={e => setForm({...form, invoiceDate: e.target.value})} style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "0.93rem" }}>Total Value (₹) *</label>
                      <input type="number" value={form.totalValue} onChange={e => setForm({...form, totalValue: e.target.value})} style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                    </div>
                  </div>

                  {/* POS + Supply Type */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", margin: "24px 0" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "0.93rem" }}>POS *</label>
                      <select value={form.pos} onChange={e => setForm({...form, pos: e.target.value})} style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                        <option>09-Uttar Pradesh</option>
                        <option>07-Delhi</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "0.93rem" }}>Supply Type</label>
                      <select value={form.supplyType} onChange={e => setForm({...form, supplyType: e.target.value})} style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                        <option>Intra-State</option>
                        <option>Inter-State</option>
                      </select>
                    </div>
                  </div>

                  {/* IRN */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "32px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "0.93rem" }}>Source</label>
                      <input value={form.source} onChange={e => setForm({...form, source: e.target.value})} style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "0.93rem" }}>IRN</label>
                      <input value={form.irn} onChange={e => setForm({...form, irn: e.target.value})} style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "0.93rem" }}>IRN Date</label>
                      <input type="date" value={form.irnDate} onChange={e => setForm({...form, irnDate: e.target.value})} style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                    </div>
                  </div>

                  {/* Item Table - FIXED CENTERED CIRCULAR DIV */}
                  <div style={{ marginBottom: "32px" }}>
                    <h3 style={{ margin: "0 0 16px", fontSize: "1.15rem", fontWeight: 700 }}>Item Details</h3>
                    <div style={{ overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: "10px" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc" }}>
                            <th style={{ padding: "12px 8px", textAlign: "center", width: "70px" }}>Sr.</th>
                            <th style={{ padding: "12px 8px", textAlign: "left" }}>Rate (%)</th>
                            <th style={{ padding: "12px 8px", textAlign: "right" }}>Taxable Value *</th>
                            <th style={{ padding: "12px 8px", textAlign: "center" }}>CGST *</th>
                            <th style={{ padding: "12px 8px", textAlign: "center" }}>SGST *</th>
                            <th style={{ padding: "12px 8px", textAlign: "center" }}>Cess</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                             <td
  style={{
    padding: "16px 8px",
    textAlign: "center",
    verticalAlign: "middle"
  }}
>
  <div
  style={{
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    background: "linear-gradient(135deg,#1f2a70,#3b4cc0)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
    position: "static",
    border: "2px solid #3b4cc0",
    borderTop: "2px solid #1f2a70",
    borderRight: "2px solid #3b4cc0",
    borderBottom: "2px solid #1f2a70",
    borderLeft: "2px solid #3b4cc0",
    fontWeight: 700,
    fontSize: "0.85rem"
  }}
>
  {idx + 1}
</div>
</td>
                              <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: 600 }}>{item.rate}%</td>
                            <td
  style={{
    padding: "18px 8px",
    verticalAlign: "middle",
    textAlign: "center"
  }}
>
  <input
    type="number"
    value={item.taxableValue}
    onChange={e => updateItem(idx, "taxableValue", e.target.value)}
    style={{
      width: "90%",
      height: "40px",
      padding: "0 12px",
      margin: "8px auto",
      display: "block",
      borderRadius: "6px",
      border: "1px solid #cbd5e1",
      textAlign: "center",
      fontSize: "0.92rem",
      boxSizing: "border-box",
      outline: "none"
    }}
    onFocus={(e) => {
      e.target.style.border = "1px solid #2563eb";
      e.target.style.boxShadow =
        "0 0 0 3px rgba(37,99,235,0.15)";
    }}
    onBlur={(e) => {
      e.target.style.border = "1px solid #cbd5e1";
      e.target.style.boxShadow = "none";
    }}
  />
</td>
                              <td style={{ padding: "12px 8px", textAlign: "center", verticalAlign: "middle", fontWeight: 600, color: "#15803d" }}>
                                {item.central || '-'}
                              </td>
                              <td style={{ padding: "12px 8px", textAlign: "center", verticalAlign: "middle", fontWeight: 600, color: "#15803d" }}>
                                {item.state || '-'}
                              </td>
                              <td style={{ padding: "12px 8px", textAlign: "center", verticalAlign: "middle" }}>
                                {item.cess || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px" }}>
                    <button
                      onClick={() => setShowAddForm(false)}
                      style={{
                        padding: "10px 32px",
                        background: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "10px",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      BACK
                    </button>
                    <button
                      onClick={saveRecord}
                      style={{
                        padding: "10px 40px",
                        background: "linear-gradient(90deg, #4f46e5, #6D4AFF)",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontWeight: 600,
                        boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                        cursor: "pointer"
                      }}
                    >
                      SAVE
                    </button>
                  </div>
                </div>
              ) : (
                /* Has Data - compact table */
                <div style={{ padding: "24px" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: "1.15rem", fontWeight: 700 }}>Record Details</h3>
                  <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
                    <div style={{
                      background: "#f8fafc",
                      padding: "10px 16px",
                      fontWeight: 600,
                      display: "grid",
                      gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 0.7fr",
                      gap: "12px",
                      fontSize: "0.85rem"
                    }}>
                      <div>Recipient</div>
                      <div>Name</div>
                      <div>Type</div>
                      <div>Items</div>
                      <div>Pending</div>
                      <div>Action</div>
                    </div>
                    {(records[selectedSection?.title] || []).map((rec, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "10px 16px",
                          display: "grid",
                          gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 0.7fr",
                          gap: "12px",
                          alignItems: "center",
                          fontSize: "0.9rem",
                          borderTop: "1px solid #f1f5f9"
                        }}
                      >
                        <div>{rec.gstin}</div>
                        <div>{rec.recipientName}</div>
                        <div>Regular</div>
                        <div style={{ fontWeight: 600, color: "#15803d" }}>{rec.items.length}</div>
                        <div style={{ fontWeight: 600, color: "#dc2626" }}>0</div>
                        <button style={{
                          background: "#10b981",
                          color: "white",
                          border: "none",
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          cursor: "pointer"
                        }}>+</button>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: "24px", textAlign: "right" }}>
                    <button
                      onClick={() => setSelectedSection(null)}
                      style={{
                        padding: "10px 28px",
                        background: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "10px",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      BACK
                    </button>
                    <button
                      onClick={() => setShowAddForm(true)}
                      style={{
                        padding: "10px 28px",
                        background: "linear-gradient(90deg, #6D4AFF, #4f46e5)",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontWeight: 600,
                        marginLeft: "12px",
                        cursor: "pointer"
                      }}
                    >
                      ADD RECORD
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// ==============================================
// Main App Wrapper
// ==============================================
const YourReturnsComponent = () => {
  const [step, setStep] = useState('selection');
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedFY, setSelectedFY] = useState("2025-26");
  const [selectedQuarter, setSelectedQuarter] = useState("Quarter 4 (Jan - Mar)");
  const [selectedPeriod, setSelectedPeriod] = useState("January");

  if (step === 'detail') {
    return (
      <DetailedGSTView
        formType={selectedForm}
        fy={selectedFY}
        period={selectedPeriod}
        onBack={() => setStep('summary')}
      />
    );
  }

  if (step === 'summary') {
    return (
      <ReturnsSummaryScreen
        fy={selectedFY}
        quarter={selectedQuarter}
        period={selectedPeriod}
        onBack={() => setStep('selection')}
        onViewForm={form => {
          setSelectedForm(form);
          setStep('detail');
        }}
      />
    );
  }

  return (
    <GSTReturnPeriodSelection
      selectedFY={selectedFY}
      setSelectedFY={setSelectedFY}
      selectedQuarter={selectedQuarter}
      setSelectedQuarter={setSelectedQuarter}
      selectedPeriod={selectedPeriod}
      setSelectedPeriod={setSelectedPeriod}
      onSearch={() => setStep('summary')}
    />
  );
};




  // Dummy data for GST Returns - sample clients with filing status
  const gstFilingData = [
    { sl: 1, name: "MODERN MASTER PUBLICATION", mobile: "8439393333", filingType: "Monthly", gstin: "09QACPS3544H1Z4", dateOfFiling: "2025-11-20"  },
    { sl: 2, name: "M/s BHARAT KHADI UDYOG", mobile: "8279909897", filingType: "Monthly", gstin: "09AYCPA3837B1ZX", dateOfFiling: ""  },
    { sl: 3, name: "N S TRADERS", mobile: "9811984956", filingType: "Monthly", gstin: "09BKBPS9165E1ZS", dateOfFiling: "2025-11-18" },
    { sl: 4, name: "NEERAJ AGENCIES", mobile: "6395749804", filingType: "Monthly", gstin: "09BRXPR8342B1Z6", dateOfFiling: "", },
    { sl: 5, name: "WOOD CRAFT FURNITURE", mobile: "9897024060", filingType: "Monthly", gstin: "09DILPS7916D1ZR", dateOfFiling: "2025-11-21" },
    { sl: 6, name: "SHIFA HANDLOOM", mobile: "9870766390", filingType: "Monthly", gstin: "09COYPM9918R1ZA", dateOfFiling: ""   },
    { sl: 7, name: "I R TEXTILES", mobile: "8979344241", filingType: "Monthly", gstin: "09ABBPI9410Q1Z9", dateOfFiling: "2025-11-19" },
    { sl: 8, name: "META TRADING COMPANY", mobile: "8126645576", filingType: "Monthly", gstin: "09DQWPA8816B1ZL", dateOfFiling: ""  },
    // Add more dummy data to make it longer
  ];
  const [selectedReturnType, setSelectedReturnType] = useState("GSTR1");
  const [selectedMonth, setSelectedMonth] = useState("Nov-2025");
  const [filingList, setFilingList] = useState(gstFilingData);
  const [filterView, setFilterView] = useState("all");
  const handleGo = () => {
    // Simulate fetching data for selected month and return type
    toast.success(`Data loaded for ${selectedReturnType} - ${selectedMonth}`);
    // Here you can filter or load new data based on month/type
  };
  const handleGetLatest = () => {
    toast.success("Latest data fetched from GSTN!");
  };
  const handleDownloadPDF = () => {
    toast.success("PDF downloaded!");
    // Actual download logic can be added here
  };
  const filteredFilingList = filingList.filter(item => {
    if (filterView === "filed") return item.status === "Filed";
    if (filterView === "not_filed") return item.status === "Not Filed";
    return true;
  });
  const filedCount = filingList.filter(item => item.status === "Filed").length;
  const notFiledCount = filingList.filter(item => item.status === "Not Filed").length;
  const pendingVouchersData = [
    { id: 1, clientName: "Client A", company: "ABC Corp", gstin: "27AAACC1001Z1", pan: "ABCDE1234F", mobile: "9876543210", voucherName: "Voucher #001", pendingSince: "2025-12-20" },
    { id: 2, clientName: "Client B", company: "XYZ Ltd", gstin: "27AAACC1002Z2", pan: "ABCDE1235G", mobile: "9876543211", voucherName: "Voucher #002", pendingSince: "2025-12-22" },
    { id: 3, clientName: "Client C", company: "Global Traders", gstin: "27AAACC1003Z3", pan: "ABCDE1236H", mobile: "9876543212", voucherName: "Voucher #003", pendingSince: "2025-12-23" },
    { id: 4, clientName: "Client D", company: "Tech Solutions", gstin: "27AAACC1004Z4", pan: "ABCDE1237I", mobile: "9876543213", voucherName: "Voucher #004", pendingSince: "2025-12-24" },
    { id: 5, clientName: "Client E", company: "Retail King", gstin: "27AAACC1005Z5", pan: "ABCDE1238J", mobile: "9876543214", voucherName: "Voucher #005", pendingSince: "2025-12-25" },
    { id: 6, clientName: "Client F", company: "Company 6", gstin: "27AAACC1006Z6", pan: "ABCDE1239K", mobile: "9876543215", voucherName: "Voucher #006", pendingSince: "2025-12-26" },
    { id: 7, clientName: "Client G", company: "Company 7", gstin: "27AAACC1007Z7", pan: "ABCDE1240L", mobile: "9876543216", voucherName: "Voucher #007", pendingSince: "2025-12-27" },
  ];
  const returnsDueData = [
    { id: 1, clientName: "Client A", company: "ABC Corp", gstin: "27AAACC1001Z1", returnType: "GSTR-3B", dueDate: "2025-12-28" },
    { id: 2, clientName: "Client B", company: "XYZ Ltd", gstin: "27AAACC1002Z2", returnType: "GSTR-1", dueDate: "2025-12-27" },
    { id: 3, clientName: "Client C", company: "Global Traders", gstin: "27AAACC1003Z3", returnType: "GSTR-7", dueDate: "2025-12-29" },
    { id: 4, clientName: "Client D", company: "Tech Solutions", gstin: "27AAACC1004Z4", returnType: "GSTR-3B", dueDate: "2025-12-26" },
    { id: 5, clientName: "Client E", company: "Retail King", gstin: "27AAACC1005Z5", returnType: "GSTR-1", dueDate: "2025-12-25" },
    { id: 6, clientName: "Client F", company: "Company 6", gstin: "27AAACC1006Z6", returnType: "GSTR-7", dueDate: "2025-12-30" },
    { id: 7, clientName: "Client G", company: "Company 7", gstin: "27AAACC1007Z7", returnType: "GSTR-3B", dueDate: "2025-12-31" },
  ];
  const clientsNeedingAttentionData = [
    { id: 1, company: "ABC Corp", issue: "Missing documents for Q4" },
    { id: 2, company: "XYZ Ltd", issue: "Overdue payment" },
    { id: 3, company: "Global Traders", issue: "GST reconciliation pending" },
    { id: 4, company: "Tech Solutions", issue: "Audit query unresolved" },
    { id: 5, company: "Retail King", issue: "ITC claim discrepancy" },
    { id: 6, company: "Company 6", issue: "Return filing delay" },
    { id: 7, company: "Company 7", issue: "Tax notice received" },
    { id: 8, company: "Company 8", issue: "Vendor verification pending" },
    { id: 9, company: "Company 9", issue: "Invoice mismatch" },
    { id: 10, company: "Company 10", issue: "Compliance check required" },
    { id: 11, company: "Company 11", issue: "Bank reconciliation pending" },
    { id: 12, company: "Company 12", issue: "Expense report overdue" },
  ];
  const itcAvailableData = [
    { id: 1, clientName: "Client A", company: "ABC Corp", gstin: "27AAACC1001Z1", pan: "ABCDE1234F", mobile: "9876543210", amount: "₹1.2 Cr" },
    { id: 2, clientName: "Client B", company: "XYZ Ltd", gstin: "27AAACC1002Z2", pan: "ABCDE1235G", mobile: "9876543211", amount: "₹0.8 Cr" },
    { id: 3, clientName: "Client C", company: "Global Traders", gstin: "27AAACC1003Z3", pan: "ABCDE1236H", mobile: "9876543212", amount: "₹0.9 Cr" },
    { id: 4, clientName: "Client D", company: "Tech Solutions", gstin: "27AAACC1004Z4", pan: "ABCDE1237I", mobile: "9876543213", amount: "₹0.5 Cr" },
    { id: 5, clientName: "Client E", company: "Retail King", gstin: "27AAACC1005Z5", pan: "ABCDE1238J", mobile: "9876543214", amount: "₹0.4 Cr" },
    { id: 6, clientName: "Client F", company: "Company 6", gstin: "27AAACC1006Z6", pan: "ABCDE1239K", mobile: "9876543215", amount: "₹0.6 Cr" },
    { id: 7, clientName: "Client G", company: "Company 7", gstin: "27AAACC1007Z7", pan: "ABCDE1240L", mobile: "9876543216", amount: "₹0.7 Cr" },
  ];
  const defaultClients = []; // Static demo data removed — real clients load from backend/localStorage

  const [allClients, setAllClients] = useState(() => {
    try {
      const saved = localStorage.getItem("gst_all_clients");
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultClients;
  });

  // Persist allClients to localStorage whenever it changes
  useEffect(() => {
    try { localStorage.setItem("gst_all_clients", JSON.stringify(allClients)); } catch {}
  }, [allClients]);

  // Load clients from the Django backend (live). Falls back to local data.
  useEffect(() => {
    let cancelled = false;
    fetchClients()
      .then((res) => {
        if (cancelled) return;
        const live = (res.results || res).map((c) => ({
          ...c,
          id: c.id,
          name: c.name || c.trade_name || "",
          company: c.name || "",
          gstin: (c.gstin || "").trim().toUpperCase(),
          mobile: c.mobile || "",
          email: c.email || "",
          state: c.state || "",
          address: c.address || "",
          registrationType: "Regular",
          status: "active",
        }));
        if (live.length) setAllClients(live);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Current subscription plan (used to enforce client/user limits)
  const [mySubscription, setMySubscription] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetchMySubscription()
      .then((s) => { if (!cancelled) setMySubscription(s); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const planClientsLimit = (() => {
    const raw = mySubscription?.plan?.clients;
    if (!raw) return null;
    const t = String(raw).trim().toLowerCase();
    if (["unlimited", "-", "n/a"].includes(t)) return Infinity;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : Infinity;
  })();
  // ── Session-based client persistence (clears on browser refresh) ──
  const SESSION_KEY = "taxmate_session_clients";
  const saveClientsToSession = (clients) => {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(clients)); } catch {}
  };

  // ── Shared Add Client modal (dashboard page + clients page; form logic lives in AddClientModal) ──
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  const openAddClientModal = () => {
    setShowAddClientModal(true);
  };

  const closeAddClientModal = () => {
    setShowAddClientModal(false);
  };

  const clientLimitError = () => {
    if (planClientsLimit === null) return null;
    const used = allClients.filter(c => c.status === "active").length;
    if (used >= planClientsLimit) {
      return `Client limit reached (${used}/${planClientsLimit}). Upgrade your plan to add more clients.`;
    }
    return null;
  };
 
const addClient = useCallback((newClient) => {
  setAllClients((prev) => {
    const newId = prev.length > 0 ? Math.max(...prev.map(c => c.id)) + 1 : 1;
    const clientToAdd = {
      ...newClient,
      id: newId,
      name: newClient.name || newClient.tradeName || newClient.legalName || "",
      company: newClient.company || newClient.tradeName || newClient.legalName || "",
      registrationType: newClient.taxpayerType || newClient.registrationType || "Regular",
      state: newClient.state || "Maharashtra",
      email: newClient.email || `client${newId}@example.com`,
      status: "active",
    };
    const updated = [...prev, clientToAdd];
    // Session-based persistence (clears on browser refresh)
    try { sessionStorage.setItem("taxmate_session_clients", JSON.stringify(updated)); } catch {}
    return updated;
  });
}, []);
  const handleClientSelect = () => {
  if (!popupShownOnce) {
    setShowReturnsPopup(true);
    setPopupShownOnce(true);
  }
};
  const activeClients = allClients.filter(c => c.status === "active");
  const [showActiveClientsModal, setShowActiveClientsModal] = useState(false);
  const [showPendingVouchersModal, setShowPendingVouchersModal] = useState(false);
  const [showReturnsDueModal, setShowReturnsDueModal] = useState(false);
  const [showITCAvailableModal, setShowITCAvailableModal] = useState(false);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [showUploadBillModal, setShowUploadBillModal] = useState(false);
  const [showCreateVoucherModal, setShowCreateVoucherModal] = useState(false);
  const [showSendReminderModal, setShowSendReminderModal] = useState(false);
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
  const [showReturnsPopup, setShowReturnsPopup] = useState(false);
  const [popupShownOnce, setPopupShownOnce] = useState(false);
 
  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  };
  const modalCardStyle = {
    background: "#ffffff",
    borderRadius: "12px",
    width: "750px",
    maxWidth: "95%",
    maxHeight: "85vh",
    padding: "30px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };
  const ContactModal = () => (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
      onClick={() => setShowContactModal(false)}
    >
      <div
        style={{ background: "#fff", width: "480px", borderRadius: "22px", overflow: "hidden", boxShadow: "0 28px 80px rgba(0,0,0,0.22)", animation: "scaleIn 0.2s ease" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
       <div style={{
  background: "#f8fafc",
  padding: "14px 20px 14px",
  position: "relative",
  borderBottom: "1px solid #e2e8f0",
  boxShadow: `
    0 10px 24px rgba(148,163,184,0.16),
    0 2px 6px rgba(0,0,0,0.04),
    inset 0 1px 0 rgba(255,255,255,0.9)
  `
}}>

  <button
    onClick={() => setShowContactModal(false)}
    style={{
      position: "absolute",
      top: "12px",
      right: "12px",
      background: "#ffffff",
      border: "1px solid #dbeafe",
      borderRadius: "8px",
      color: "#4f46e5",
      width: "28px",
      height: "28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      fontSize: "0.9rem",
      boxShadow: "0 3px 8px rgba(148,163,184,0.12)"
    }}
  >
    ✕
  </button>

  <div style={{
    display: "flex",
    alignItems: "center",
    gap: "12px"
  }}>

    {/* ICON */}
    <div style={{
      width: "60px",
      height: "40px",
      borderRadius: "12px",
      background: "linear-gradient(135deg,#4f46e5,#3730a3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.35rem",
      color: "#ffffff",
      border: "1px solid rgba(255,255,255,0.7)",
      boxShadow: `
        0 8px 18px rgba(79,70,229,0.28),
        inset 0 1px 0 rgba(255,255,255,0.25)
      `
    }}>
      🎧
    </div>

    {/* TEXT */}
    <div>
      <h3 style={{
        margin: 0,
        color: "#3730a3",
        fontSize: "1.08rem",
        fontWeight: 800
      }}>
        Contact Support
      </h3>

      <p style={{
        margin: "3px 0 0",
        color: "#4f46e5",
        fontSize: "0.79rem",
        fontWeight: 500
      }}>
        We're here to help · Mon–Sat 9AM–7PM
      </p>
    </div>

  </div>
</div>
        {/* Body */}
<div style={{ padding: "22px 24px 24px", background: "#f8fafc" }}>

  <p style={{
    margin: "0 0 18px",
    color: "#334155",
    fontSize: "0.86rem",
    lineHeight: 1.6,
    fontWeight: 500
  }}>
    Reach out to our support team through any of the channels below.
  </p>

  <div style={{
    marginTop: "-8px",
    marginBottom: "18px",
    color: "#0f172a",
    fontSize: "0.8rem",
    fontWeight: 700
  }}>
    ⚡ We usually respond very soon.
  </div>

  {/* Email Card */}
  <a
    href="mailto:support@relyonsoft.com"
    style={{
      textDecoration: "none",
      display: "block",
      marginBottom: "14px"
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px 20px",
        background: "linear-gradient(145deg,#ffffff,#eef4ff)",
        borderRadius: "16px",
        border: "1px solid #dbeafe",
        cursor: "pointer",
        transition: "all 0.2s ease",

        /* 3D EFFECT */
        boxShadow: `
          0 12px 28px rgba(79,70,229,0.14),
          0 4px 10px rgba(0,0,0,0.05),
          inset 0 1px 0 rgba(255,255,255,1)
        `
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow =
          "0 16px 35px rgba(79,70,229,0.20)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow =
          "0 12px 28px rgba(79,70,229,0.14)";
      }}
    >

      <div style={{
        width: "46px",
        height: "46px",
        borderRadius: "14px",
        background: "linear-gradient(145deg,#4f46e5,#6D4AFF)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,

        boxShadow: `
          0 8px 18px rgba(79,70,229,0.32),
          inset 0 1px 0 rgba(255,255,255,0.25)
        `
      }}>
        <HiMail style={{ color: "#fff", fontSize: "1.28rem" }} />
      </div>

      <div>
        <div style={{
          fontWeight: 800,
          fontSize: "0.9rem",
          color: "#3730a3",
          marginBottom: "3px"
        }}>
          Email Support
        </div>

        <div style={{
          color: "#4f46e5",
          fontSize: "0.92rem",
          fontWeight: 700
        }}>
          support@relyonsoft.com
        </div>
      </div>

      <div style={{
        marginLeft: "auto",
        color: "#818cf8",
        fontSize: "1.15rem",
        fontWeight: 700
      }}>
        →
      </div>

    </div>
  </a>

  {/* Phone Cards */}
  {["080-69002100", "080-23002100"].map((num, i) => (

    <a
      key={i}
      href={`tel:${num.replace(/-/g, "")}`}
      style={{
        textDecoration: "none",
        display: "block",
        marginBottom: "13px"
      }}
    >

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "15px 20px",
          background: "linear-gradient(145deg,#ffffff,#f0fdf4)",
          borderRadius: "16px",
          border: "1px solid #d1fae5",
          cursor: "pointer",
          transition: "all 0.2s ease",

          /* 3D */
          boxShadow: `
            0 12px 26px rgba(22,163,74,0.12),
            0 4px 10px rgba(0,0,0,0.05),
            inset 0 1px 0 rgba(255,255,255,1)
          `
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow =
            "0 16px 34px rgba(22,163,74,0.18)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow =
            "0 12px 26px rgba(22,163,74,0.12)";
        }}
      >

        <div style={{
          width: "46px",
          height: "46px",
          borderRadius: "14px",
          background: "linear-gradient(145deg,#16a34a,#22c55e)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,

          boxShadow: `
            0 8px 18px rgba(22,163,74,0.30),
            inset 0 1px 0 rgba(255,255,255,0.22)
          `
        }}>
          <HiPhone style={{ color: "#fff", fontSize: "1.25rem" }} />
        </div>

        <div>
          <div style={{
            fontWeight: 800,
            fontSize: "0.89rem",
            color: "#14532d",
            marginBottom: "3px"
          }}>
            {i === 0 ? "Primary Line" : "Alternate Line"}
          </div>

          <div style={{
            color: "#16a34a",
            fontSize: "0.92rem",
            fontWeight: 700,
            fontFamily: "monospace",
            letterSpacing: "0.04em"
          }}>
            {num}
          </div>
        </div>

        <div style={{
          marginLeft: "auto",
          color: "#4ade80",
          fontSize: "1.15rem",
          fontWeight: 700
        }}>
          →
        </div>

      </div>

    </a>

  ))}

  {/* Bottom Note */}
  <div style={{
    marginTop: "18px",
    padding: "14px 16px",
    background: "linear-gradient(145deg,#ffffff,#f1f5f9)",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    fontSize: "0.78rem",
    color: "#475569",
    textAlign: "center",
    fontWeight: 600,

    /* 3D */
    boxShadow: `
      0 10px 24px rgba(148,163,184,0.12),
      inset 0 1px 0 rgba(255,255,255,1)
    `
  }}>
    💡 For urgent issues, calling is recommended.
    Our team is available Mon–Sat 9AM–7PM IST.
  </div>

</div>
      </div>
    </div>
  );

  // ── Confirmation Modal ──────────────────────────────────────
  const ConfirmModal = () => {
    const [isLoading, setIsLoading] = React.useState(false);
    if (!confirmModal.open) return null;
    const actionColor = confirmModal.message?.toLowerCase().includes("delete") ? "#ef4444"
      : confirmModal.message?.toLowerCase().includes("inactivate") || confirmModal.message?.toLowerCase().includes("deactivate") ? "#f59e0b"
      : "#16a34a";
    const handleConfirm = () => {
      setIsLoading(true);
      setTimeout(() => {
        if (confirmModal.onConfirm) confirmModal.onConfirm();
        setConfirmModal({ open: false, message: "", onConfirm: null });
        setIsLoading(false);
      }, 900);
    };
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
        <div style={{ background: "#fff", borderRadius: "16px", width: "360px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
          {/* Compact nav - light sky blue */}
          <div style={{ background: "#f0f6ff", padding: "12px 18px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 8px rgba(56,189,248,0.15)", borderBottom: "1px solid #ddeeff" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: actionColor + "18", border: `1.5px solid ${actionColor}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
              {confirmModal.message?.toLowerCase().includes("delete") ? "🗑️" : confirmModal.message?.toLowerCase().includes("inactivate") || confirmModal.message?.toLowerCase().includes("deactivate") ? "⚠️" : "✅"}
            </div>
            <div>
              <div style={{ color: "#0f172a", fontWeight: 700, fontSize: "0.9rem" }}>Confirm Action</div>
              <div style={{ color: "#64748b", fontSize: "0.7rem" }}>This action will take effect immediately</div>
            </div>
          </div>
          <div style={{ padding: "18px 20px 16px" }}>
            <p style={{ margin: "0 0 18px", color: "#334155", fontSize: "0.88rem", lineHeight: 1.6 }}>{confirmModal.message}</p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              <button onClick={() => setConfirmModal({ open: false, message: "", onConfirm: null })}
                disabled={isLoading}
                style={{ width: "120px", padding: "10px 0", borderRadius: "9px", border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontWeight: 600, fontSize: "0.84rem", cursor: "pointer" }}
                onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = "#e2e8f0"; }}
                onMouseLeave={e => e.currentTarget.style.background = "#f8fafc"}
              >Cancel</button>
              <button onClick={handleConfirm}
                disabled={isLoading}
                style={{ width: "120px", padding: "10px 0", borderRadius: "9px", border: "none", background: isLoading ? "#94a3b8" : actionColor, color: "#fff", fontWeight: 700, fontSize: "0.84rem", cursor: isLoading ? "not-allowed" : "pointer", boxShadow: `0 3px 12px ${actionColor}40`, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                onMouseEnter={e => { if (!isLoading) e.currentTarget.style.opacity = "0.9"; }}
                
              >
                {isLoading ? (
                  <>
                    <span style={{ width: "13px", height: "13px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                    Processing...
                  </>
                ) : "OK, Confirm"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EditProfileModal = () => {
    const nameParts = [editProfileForm.first_name, editProfileForm.last_name]
      .map((s) => (s || "").trim())
      .filter(Boolean);
    if (nameParts.length === 2 && nameParts[1] === nameParts[0]) nameParts.pop();
    const initialName = editProfileForm.name || nameParts.join(" ");
    const [localForm, setLocalForm] = React.useState({
      ...editProfileForm,
      name: initialName,
      dob: editProfileForm.dob || editProfileForm.date_of_birth || "",
    });
    const handleLocalChange = (e) => {
      const { name, value } = e.target;
      setLocalForm(prev => ({ ...prev, [name]: value }));
    };
    const handleSave = async () => {
      const first = (localForm.name || "").split(" ")[0] || "";
      const nameParts = ((localForm.name || "").split(" ").slice(1)).filter(Boolean);
      const last = nameParts.join(" ") || localForm.last_name || "";
      const payload = {
        first_name: first,
        last_name: last,
        email: localForm.email || "",
        gender: localForm.gender || "",
        date_of_birth: localForm.dob || null,
        mobile: localForm.mobile || "",
        company: localForm.company || "",
      };
      try {
        let updated = await updateProfile(payload);
        const stored = getStoredUser();
        const fresh = { ...(stored || {}), ...updated, name: updated.name || localForm.name };
        setUser(fresh);
        saveSession({ user: fresh });
        setEditProfileForm(fresh);
        setLocalForm({ ...fresh, dob: fresh.dob || fresh.date_of_birth || "" });
        toast.success("Profile updated!");
        setShowEditProfileModal(false);
      } catch {
        toast.error("Failed to update profile. Please try again.");
      }
    };
    const inputSt = {
      width: "100%", padding: "9px 12px", borderRadius: "9px",
      border: "1.5px solid #e2e8f0", fontSize: "0.875rem",
      background: "#f8fafc", outline: "none",
      fontFamily: "inherit", color: "#0f172a",
      boxSizing: "border-box", marginBottom: 0,
      transition: "border-color 0.2s, box-shadow 0.2s",
    };
    const labelSt = {
      display: "block", marginBottom: "4px",
      fontWeight: 600, fontSize: "0.72rem",
      color: "#64748b", letterSpacing: "0.04em", textTransform: "uppercase",
    };
    return (
      <div
        style={{
          position: "fixed", inset: 0,
          background: "rgba(15,23,42,0.48)",
          backdropFilter: "blur(5px)",
          display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 9999,
        }}
        onClick={() => setShowEditProfileModal(false)}
      >
        <div
          style={{
            background: "#fff", width: "420px", borderRadius: "18px",
            overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div style={{
            background: "linear-gradient(145deg,#ffffff,#eef2f7)",
            padding: "14px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #dbe2ea",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "12px",
                background: "linear-gradient(145deg,#4f46e5,#3730a3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#ffffff", fontWeight: 800, fontSize: "0.95rem",
              }}>
                {(localForm.name || user.name || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ color: "#0f172a", fontWeight: 800, fontSize: "0.9rem", marginBottom: "2px" }}>
                  Edit Profile
                </div>
                <div style={{ color: "#64748b", fontSize: "0.72rem", fontWeight: 500 }}>
                  Update your account info
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowEditProfileModal(false)}
              style={{
                background: "linear-gradient(145deg,#ffffff,#eef2f7)",
                border: "1px solid #dbe2ea", color: "#475569",
                borderRadius: "9px", width: "30px", height: "30px",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: "0.82rem", flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(145deg,#f8fafc,#e2e8f0)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(145deg,#ffffff,#eef2f7)"; }}
            >✕</button>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: "18px", overflowY: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={labelSt}>Full Name</label>
                <input name="name" value={localForm.name || ""} onChange={handleLocalChange} style={inputSt} placeholder="Your name"
                  onFocus={e => { e.target.style.borderColor = "#4f46e5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
              </div>
              <div>
                <label style={labelSt}>Date of Birth</label>
                <input name="dob" type="date" value={localForm.dob || ""} onChange={handleLocalChange} style={inputSt}
                  onFocus={e => { e.target.style.borderColor = "#4f46e5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
              </div>
              <div>
                <label style={labelSt}>Gender</label>
                <select name="gender" value={localForm.gender || ""} onChange={handleLocalChange} style={{ ...inputSt, cursor: "pointer" }}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div>
                <label style={labelSt}>Mobile</label>
                <input name="mobile" value={localForm.mobile || ""} onChange={handleLocalChange} style={inputSt} placeholder="+91 XXXXX XXXXX"
                  onFocus={e => { e.target.style.borderColor = "#4f46e5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
              </div>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={labelSt}>Company</label>
              <input name="company" value={localForm.company || ""} onChange={handleLocalChange} style={inputSt} placeholder="Company name"
                onFocus={e => { e.target.style.borderColor = "#4f46e5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelSt}>Email Address</label>
              <input name="email" type="email" value={localForm.email || ""} onChange={handleLocalChange} style={inputSt} placeholder="email@domain.com"
                onFocus={e => { e.target.style.borderColor = "#4f46e5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "4px" }}>
              <button
                onClick={() => setShowEditProfileModal(false)}
                style={{
                  width: "95px", padding: "8px 10px", borderRadius: "9px",
                  border: "1.5px solid #dbe2ea",
                  background: "linear-gradient(145deg,#ffffff,#eef2f7)",
                  color: "#475569", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(145deg,#f8fafc,#e2e8f0)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(145deg,#ffffff,#eef2f7)"; }}
              >Cancel</button>
              <button
                onClick={handleSave}
                style={{
                  width: "95px", padding: "8px 10px", borderRadius: "9px",
                  border: "none",
                  background: "linear-gradient(135deg,#4f46e5,#3730a3)",
                  color: "#ffffff", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                  boxShadow: "0 6px 16px rgba(79,70,229,0.32)",
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 18px rgba(79,70,229,0.42)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 6px 16px rgba(79,70,229,0.32)"; }}
              >Save</button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const ActiveClientsModal = () => (
    <div style={modalOverlayStyle} onClick={() => setShowActiveClientsModal(false)}>
      <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, color: "#4f46e5" }}>Active Clients ({activeClients.length})</h3>
          <button onClick={() => setShowActiveClientsModal(false)} style={{ background: "none", border: "none", fontSize: "1.8rem", cursor: "pointer" }}>
            <HiX />
          </button>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f3f0ff" }}>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>Name</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>GSTIN</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>PAN</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>Mobile</th>
              </tr>
            </thead>
            <tbody>
              {activeClients.map((client) => (
                <tr key={client.id} style={{ borderBottom: "1px solid #eef2ff" }}>
                  <td style={{ padding: "14px" }}>{client.name}</td>
                  <td style={{ padding: "14px" }}>{client.gstin}</td>
                  <td style={{ padding: "14px" }}>{client.pan}</td>
                  <td style={{ padding: "14px" }}>{client.mobile}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );


  const ClientGSTDashboardModal = ({ client, onClose, initialSection }) => {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("Manually");
  const [activeAnnualSubTab, setActiveAnnualSubTab] = useState("GSTR-9");
  const [importStep, setImportStep] = useState("list"); // "list" | "upload"
  const [selectedImportType, setSelectedImportType] = useState(null);
  // Auto-navigate to the right dashboard sub-tab based on initialSection
  const [activeDashboardTab, setActiveDashboardTab] = useState(
    initialSection === "notices" ? "notices" :
    initialSection === "liability" ? "liability" :
    "returns-status"
  );

  // ─── Scroll-to-section ────────────────────────────────────────────────
  // GSTDashboardAllPanels handles the scroll internally via its own useEffect
  // using panel-notices / panel-liability IDs. No duplicate scroll needed here.
  const scrollContainerRef = useRef(null);
  // ─────────────────────────────────────────────────────────────────────
  const [showCreditLedger, setShowCreditLedger] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImportSheets, setSelectedImportSheets] = useState([]);
const [selectedImportFile, setSelectedImportFile] = useState(null);


const handleImportFileChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setSelectedImportFile(file);
};

const handleImportUpload = () => {
  if (!selectedOptions.length) {
    alert("Please select at least one section");
    return;
  }

  if (!selectedImportFile) {
    alert("Please upload a file");
    return;
  }

  processExcelUpload(selectedImportFile, selectedOptions);
};
  
  
  const [dynamicClient, setDynamicClient] = useState({
    gstin: client?.gstin || "09ABMCS5888A1ZU",
    company: client?.company || "SALVIA GRAFIX PRIVATE LIMITED",
    registrationDate: "10-Feb-2020",
    status: "Active",
  });
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectAllImport, setSelectAllImport] = useState(false);
  const [skipValidation, setSkipValidation] = useState(false);
  const [formData, setFormData] = useState({
    name: "SALVIA GRAFIX PRIVATE LIMITED",
    address: "Shop No. 13, First Floor, Royal Plaza, Haj...",
    place: "Meerut",
    pin: "250002",
    state: "Uttar Pradesh",
    mobile: "+91 7500411329",
    email: "adv.raj7777@gmail.com",
    phone: "",
    tradeName: "SALVIA GRAFIX PRIVATE LIMITED",
    businessType: "Proprietorship",
    status: "Select",
    gstin: "09ABMCS5888A1ZU",
    regDate: "06-02-2024",
    tan: "",
    pan: "ABMCS5888A",
    cin: "",
    fileNo: "",
    responsiblePerson: "VIKRAM SINGH",
    designation: "",
    alternateMobile: "+91",
    gstUserId: "silva.grafix",
    taxPayerType: "Normal",
    uploadType: "GST",
    lutNumber: "",
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleUpdate = () => {
    setDynamicClient({
      gstin: formData.gstin,
      company: formData.name,
      registrationDate: formData.regDate,
      status: "Active",
    });
    toast.success("Client details updated successfully! Changes are now visible in the header card.");
  };
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const menuItems = [
    "Dashboard",
    "Client Detail",
    "gstr-1",
    "gstr-1A",
    "gstr 3b",
    "itc-04",
    "tds/tcs",
    "reports",
    "download center",
  ];
  const dashboardTabs = [
    { id: "returns-status", label: "Returns Status" },
    { id: "summary", label: "Ledger Summary" },
    // { id: "elb", label: "ELB" },
    { id: "turnover", label: "Turnover" },
    { id: "liability", label: "Liability Ledger" },
    { id: "payment", label: "Demand" },
  ];

  const outstandingDemands = [
    {
      sr: 1,
      date: "08/08/2023",
      demandId: "ZD090823059933V",
      integrated: 0,
      central: 138155,
      state: 138155,
      cess: 0,
    },
    {
      sr: 2,
      date: "11/02/2025",
      demandId: "ZD090225135860F",
      integrated: 21130,
      central: 42956,
      state: 42956,
      cess: 0,
    },
    {
      sr: 3,
      date: "30/12/2025",
      demandId: "ZD091225534888T",
      integrated: 0,
      central: 634156,
      state: 634156,
      cess: 0,
    },
    {
      sr: 4,
      date: "15/01/2026",
      demandId: "ZD090126784512K",
      integrated: 45000,
      central: 78000,
      state: 78000,
      cess: 1200,
    },
    {
      sr: 5,
      date: "22/03/2026",
      demandId: "ZD090326912345L",
      integrated: 12850,
      central: 0,
      state: 0,
      cess: 0,
    },
  ];
  const downloadClientTemplate = () => {
    const notes = [
      ["Note"],
      ["1.If mandatory fields are not entered, then the record will not be imported"],
      ["2.File Name which already exist will not be imported."],
      ["3.Enter valid GSTIN"],
      ["4.Default B2B and Credit Debit Note will enable in Option settings."],
      ["5.To Enter Date Of Registration enter in DDMMYYYY format (02/Jan/2017)"],
      ["6.If no branches, a parent file will be created"],
      [""],
    ];
    const headers = [[
      "File Name *",
      "Assessee Name *",
      "GSTIN *",
      "Mobile *",
      "Status *",
      "Business Type",
      "Address",
      "Responsible Person",
      "TAN",
      "Designation",
      "Trade Name",
      "Place",
      "State *",
      "PIN",
      "File No",
      "Email",
      "Date of Registration (dd/mm/yyyy) *",
      "PAN",
      "User ID *",
      "Password",
      "Financial Year (yyyy-yyyy) *",
      "SEZ",
      "Tax Payer Type",
      "Return Type (If tax payer type is normal)",
      "Branch Name",
      "Branch address"
    ]];
    const data = [...notes, ...headers];
    const ws = XLSX.utils.aoa_to_sheet(data);
    for (let i = 0; i < 7; i++) {
      const cell = ws[XLSX.utils.encode_cell({ r: i, c: 0 })];
      if (cell) {
        cell.s = {
          font: { color: { rgb: "FF0000" }, bold: true },
          alignment: { wrapText: true },
        };
      }
    }
    const headerRow = 8;
    for (let c = 0; c < headers[0].length; c++) {
      const addr = XLSX.utils.encode_cell({ r: headerRow, c });
      if (ws[addr]) {
        ws[addr].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4F81BD" } },
          alignment: { horizontal: "center" },
        };
      }
    }
    ws["!cols"] = headers[0].map(() => ({ wch: 28 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Client Master");
    XLSX.writeFile(wb, "Client_Master_Template.xlsx");
    toast.success("Client Master Template Downloaded!");
  };


  const ImportOptionsList = () => {
    const options = [
      { title: "Bulk New File Creation for GST", hasTemplate: true },
      { title: "GST Bulk New File creation using GSTN", hasTemplate: true },
      { title: "Bulk New File and Deductor Creation for TDS", hasTemplate: true },
      { title: "Bulk Client and Assessee creation from ITR Json - ZIP Only", hasTemplate: false },
      { title: "Bulk New File Creation for Income Tax ( Excel )", hasTemplate: true },
      { title: "Transfer Income Tax Data From Previous Year", hasTemplate: false, singleButton: true },
    ];
    return (
      <div style={{ padding: "padding: 20px", background: "#f8fafc" }}>
        <div style={{ background: "#ffffff", borderRadius: "12px", padding: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          {options.map((opt, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px",
                marginBottom: idx < options.length - 1 ? "20px" : "0",
                background: "#f9fafb",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#1e293b" }}>{opt.title}</div>
              <div style={{ display: "flex", gap: "12px" }}>
                {opt.singleButton ? (
                  <button style={{ background: "#2dd4bf", color: "white", padding: "10px 28px", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
                    TRANSFER
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setSelectedImportType(opt.title);
                        setImportStep("upload");
                      }}
                      style={{ background: "#2dd4bf", color: "white", padding: "10px 28px", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                    >
                      IMPORT
                    </button>
                    {opt.hasTemplate && (
                      <button
                        onClick={downloadClientTemplate}
                        style={{ background: "#3730a3", color: "white", padding: "10px 28px", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                      >
                        TEMPLATE
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  const FileUploadScreen = () => {
    return (
      <div style={{ padding: "20px", background: "#f8fafc" }}>
        <div style={{ background: "#ffffff", borderRadius: "12px", padding: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <h2 style={{ margin: "0 0 32px 0", fontSize: "1.6rem", fontWeight: "700", color: "#1e293b" }}>Import Template</h2>
          <div style={{ marginBottom: "32px", color: "#475569", fontSize: "1rem" }}>Step 1 : Upload File</div>
          <div style={{ border: "2px dashed #cbd5e1", borderRadius: "12px", padding: "80px 40px", textAlign: "center", background: "#f8fafc", marginBottom: "32px" }}>
            <p style={{ color: "#14b8a6", fontSize: "1.2rem", margin: "0 0 20px 0" }}>Browse or Drag and Drop File here</p>
            <div style={{ fontSize: "2.5rem", color: "#94a3b8" }}>↓</div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
            <button style={{ background: "#3730a3", color: "white", padding: "12px 40px", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>↻ UPLOAD</button>
            <button style={{ background: "#f59e0b", color: "white", padding: "12px 40px", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "1rem", cursor: "pointer" }}>CLEAR</button>
          </div>
        </div>
      </div>
    );
  };
  // ==============================================
  // GSTR Layout Component (with tabs: Manually, Import, Summary)
  // ==============================================

  // LocalStorage keys
  // const STORAGE_KEYS = {
  //   b2b: "gstr_b2bRows",
  //   b2cLarge: "gstr_b2cLargeRows",
  //   b2cOthers: "gstr_b2cOthersRows",
  //   nilExempt: "gstr_nilExemptRows",
  //   creditDebitRegistered: "gstr_creditDebitRegisteredRows",
  //   creditDebitUnregistered: "gstr_creditDebitUnregisteredRows",
  //   advanceLiability: "gstr_advanceLiabilityRows",
  //   advanceAdjustment: "gstr_advanceAdjustmentRows",
  //   hsn: "gstr_hsnRows",
  //   documents: "gstr_documentsRows",
  //   eco: "gstr_ecoRows",
  //   summaryTotals: "gstr_summaryTotals",
  //   outward: "gstr3b_outwardSupplies",
  //   eco: "gstr3b_ecoSupplies",
  //   interstate: "gstr3b_interstateSupplies",
  //   itc: "gstr3b_itcDetails",
  //   exempt: "gstr3b_exemptNonGst",
  //   interestLateFee: "gstr3b_interestLateFee"
  // };

const STORAGE_KEYS = {
  b2b: "gstr_b2bRows",
  b2cLarge: "gstr_b2cLargeRows",
  b2cOthers: "gstr_b2cOthersRows",
  nilExempt: "gstr_nilExemptRows",
  creditDebitRegistered: "gstr_creditDebitRegisteredRows",
  creditDebitUnregistered: "gstr_creditDebitUnregisteredRows",
  advanceLiability: "gstr_advanceLiabilityRows",
  advanceAdjustment: "gstr_advanceAdjustmentRows",
  hsn: "gstr_hsnRows",
  documents: "gstr_documentsRows",
  ecoRows: "gstr_ecoRows",
  summaryTotals: "gstr_summaryTotals",
  outward: "gstr3b_outwardSupplies",
  ecoSupplies: "gstr3b_ecoSupplies",
  interstateUnregistered: "gstr3b_interstateUnregistered",
interstateComposition: "gstr3b_interstateComposition",
interstateUin: "gstr3b_interstateUin",
  itc: "gstr3b_itcDetails",
  exempt: "gstr3b_exemptNonGst",
 interestLateFee: "gstr3b_interestLateFee",
gstr3bSavedSummary: "gstr3b_saved_summary"
};
  // Full State list for POS dropdown
  const stateList = [
    { name: "ANDAMAN AND NICOBAR ISLANDS", code: "35", stateCode: "AN" },
    { name: "ANDHRA PRADESH (NEW)", code: "37", stateCode: "AD" },
    { name: "ARUNACHAL PRADESH", code: "12", stateCode: "AR" },
    { name: "ASSAM", code: "18", stateCode: "AS" },
    { name: "BIHAR", code: "10", stateCode: "BH" },
    { name: "CHANDIGARH", code: "04", stateCode: "CH" },
    { name: "CHHATTISGARH", code: "22", stateCode: "CT" },
    { name: "DADRA AND NAGAR HAVELI AND DAMAN AND DIU", code: "26", stateCode: "DN" },
    { name: "DELHI", code: "07", stateCode: "DL" },
    { name: "GOA", code: "30", stateCode: "GA" },
    { name: "GUJARAT", code: "24", stateCode: "GJ" },
    { name: "HARYANA", code: "06", stateCode: "HR" },
    { name: "HIMACHAL PRADESH", code: "02", stateCode: "HP" },
    { name: "JAMMU AND KASHMIR", code: "01", stateCode: "JK" },
    { name: "JHARKHAND", code: "20", stateCode: "JH" },
    { name: "KARNATAKA", code: "29", stateCode: "KA" },
    { name: "KERALA", code: "32", stateCode: "KL" },
    { name: "LAKSHADWEEP", code: "31", stateCode: "LD" },
    { name: "MADHYA PRADESH", code: "23", stateCode: "MP" },
    { name: "MAHARASHTRA", code: "27", stateCode: "MH" },
    { name: "MANIPUR", code: "14", stateCode: "MN" },
    { name: "MEGHALAYA", code: "17", stateCode: "ME" },
    { name: "MIZORAM", code: "15", stateCode: "MI" },
    { name: "NAGALAND", code: "13", stateCode: "NL" },
    { name: "ODISHA", code: "21", stateCode: "OR" },
    { name: "PUDUCHERRY", code: "34", stateCode: "PY" },
    { name: "PUNJAB", code: "03", stateCode: "PB" },
    { name: "RAJASTHAN", code: "08", stateCode: "RJ" },
    { name: "SIKKIM", code: "11", stateCode: "SK" },
    { name: "TAMIL NADU", code: "33", stateCode: "TN" },
    { name: "TELANGASA", code: "36", stateCode: "TS" },
    { name: "TRIPURA", code: "16", stateCode: "TR" },
    { name: "UTTAR PRADESH", code: "09", stateCode: "UP" },
    { name: "UTTARAKHAND", code: "05", stateCode: "UT" },
    { name: "WEST BENGAL", code: "19", stateCode: "WB" }
  ];
  // Supply Type options for Credit/Debit Notes
  const supplyTypeOptions = [
    "Regular B2B",
    "SEZ Supply WPAY",
    "SEZ Supply WOPAY",
    "Deemed Export",
    "Intra-State Supply Attracting IGST"
  ];

  const RateOptions = ["0%", "0.10%", "0.25%", "1%", "1.50%", "3%", "5%", "6%"];

  const appTaxRate = ["0%, 65%"];
  // Note Type options (Debit / Credit)
  const noteTypeOptions = ["Debit", "Credit"];

  const TypeofDocumenstOptions = ["OE","E"];


  const rcmOptions = ["Y", "N"];

  const ucqOptions = [
  "TGM - TEN GROSS",
  "THD - THOUSANDS",
  "TON - TONNES",
  "TUB - TUBES",
  "UGS - US GALLONS",
  "UNT - UNITS",
  "YDS - YARDS",
  "OTH - OTHERS"
];
  // Nature of Supply options for ECO
  const natureOptions = [
    "1 - Liable to Collect Tax u/s 52(TCS)",
    "2 - Liable to Pay Tax u/s 9(5)"
  ];
  // Nature of Documents options for Documents Issued
  const documentNatureOptions = [
    "1 - Invoice for Outward Supply",
    "2 - Invoices for Inward Supply from Unregistered Person",
    "3 - Revised Invoice",
    "4 - Debit Note",
    "5 - Credit Note",
    "6 - Receipt Voucher",
    "7 - Payment Voucher",
    "8 - Refund Voucher",
    "9 - Delivery Challan for Job Work",
    "10 - Delivery Challan for Supply on Approval",
    "11 - Delivery Challan in case of Liquid Gas",
    "12 - Delivery Challan in cases other than by way of Supply (Excluding at S no 9 to 11)"
  ];
  // UR Type options for Credit/Debit Notes (Unregistered)
  const urTypeOptions = [
    "1 - B2C (Large)",
    "2 - Export WPAY",
    "3 - Export WOPAY"
  ];
  // GSTR-3B ke 6 options
  const gstr3bSections = [
    "tax on outward supplies & reverse charge inward",
    "Supplies notified u/s 9(5) of the CGST Act 2017",
    "Inter State Supplies",
    "Eligible ITC",
    "Exempt , Nil Rated and Non - Gst Supplies",
    "Intrest and Late fee For Previous Tax Period",
    "Payment of tax "

  ];

  /* ── Premium Year/Month Picker sub-component ── */
  const PremiumYMPicker = ({ years, selectedYear, setSelectedYear, selectedMonth, setSelectedMonth, setSelectedItcTable, setSelectedTdsTcsSection, isDownloadCenter }) => {
    const [fyOpen, setFyOpen] = useState(false);
    const [mOpen, setMOpen]   = useState(false);
    const fyRef = useRef(null);
    const mRef  = useRef(null);
    const monthList = ["April","May","June","July","August","September","October","November","December","January","February","March"];
    useEffect(() => {
      const handler = (e) => {
        if (fyRef.current && !fyRef.current.contains(e.target)) setFyOpen(false);
        if (mRef.current  && !mRef.current.contains(e.target))  setMOpen(false);
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);
    const pill = { display:"flex", alignItems:"center", gap:"10px", padding:"10px 16px", borderRadius:"12px", cursor:"pointer", border:"1.5px solid #c7d2fe", background:"linear-gradient(145deg,#f8f9ff,#f0f4ff)", boxShadow:"0 4px 14px rgba(79,70,229,0.10), 0 1px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)", transition:"all 0.18s ease", userSelect:"none", minWidth:"175px", justifyContent:"space-between", position:"relative" };
    const dropdown = { position:"absolute", top:"calc(100% + 8px)", right:0, zIndex:999, background:"white", borderRadius:"16px", border:"1.5px solid #e0e7ff", boxShadow:"0 20px 60px rgba(79,70,229,0.18), 0 4px 16px rgba(0,0,0,0.08)", padding:"12px", minWidth:"210px", animation:"premPickerIn 0.16s ease", maxHeight:"260px", overflowY:"auto" };
    return (
      <div style={{ display:"flex", gap:"12px", alignItems:"center", flexWrap:"wrap" }}>
        <style>{`@keyframes premPickerIn{from{opacity:0;transform:translateY(-6px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}.prem-fy-opt:hover{background:#dbeafe!important;color:#1d4ed8!important}.prem-mo-opt:hover{background:#eef2ff!important;color:#4338ca!important}.prem-pill:hover{border-color:#a5b4fc!important;background:#eef2ff!important}`}</style>
        {/* FY pill — hidden for Download Center */}
        {!isDownloadCenter && <div ref={fyRef} style={{ position:"relative" }}>
          <div className="prem-pill" style={pill} onClick={() => { setFyOpen(o=>!o); setMOpen(false); }}>
            <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <div>
                <div style={{ fontSize:"0.65rem", color:"#6366f1", fontWeight:700, letterSpacing:"0.06em", lineHeight:1, textTransform:"uppercase" }}>Financial Year</div>
                <div style={{ fontSize:"0.92rem", fontWeight:900, color:"#1e1b4b", lineHeight:1.3 }}>{selectedYear}</div>
              </div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" style={{ transition:"transform 0.18s", transform:fyOpen?"rotate(180deg)":"rotate(0deg)" }}><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          {fyOpen && (
            <div style={dropdown}>
              <div style={{ fontSize:"0.68rem", fontWeight:800, color:"#6366f1", letterSpacing:"0.08em", textTransform:"uppercase", padding:"4px 8px 8px", borderBottom:"1px solid #e0e7ff", marginBottom:"6px" }}>Select Financial Year</div>
              {years.map(y => (
                <div key={y} className="prem-fy-opt" onClick={() => { setSelectedYear(y); setSelectedItcTable("Table 4"); setSelectedTdsTcsSection("Download"); setFyOpen(false); }}
                  style={{ padding:"9px 12px", borderRadius:"8px", cursor:"pointer", fontSize:"0.85rem", fontWeight:y===selectedYear?800:500, color:y===selectedYear?"#4338ca":"#374151", background:y===selectedYear?"#eef2ff":"transparent", transition:"all 0.12s", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  {y}
                  {y===selectedYear && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4338ca" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
              ))}
            </div>
          )}
        </div>}
        {/* Month pill */}
        {!isDownloadCenter && (
          <div ref={mRef} style={{ position:"relative" }}>
            <div className="prem-pill" style={pill} onClick={() => { setMOpen(o=>!o); setFyOpen(false); }}>
              <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <div>
                  <div style={{ fontSize:"0.65rem", color:"#6366f1", fontWeight:700, letterSpacing:"0.06em", lineHeight:1, textTransform:"uppercase" }}>Month</div>
                  <div style={{ fontSize:"0.92rem", fontWeight:900, color:selectedMonth?"#1e1b4b":"#9ca3af", lineHeight:1.3 }}>{selectedMonth||"Select Month"}</div>
                </div>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" style={{ transition:"transform 0.18s", transform:mOpen?"rotate(180deg)":"rotate(0deg)" }}><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            {mOpen && (
              <div style={{ ...dropdown, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"4px", minWidth:"230px" }}>
                <div style={{ gridColumn:"1/-1", fontSize:"0.68rem", fontWeight:800, color:"#6366f1", letterSpacing:"0.08em", textTransform:"uppercase", padding:"4px 4px 8px", borderBottom:"1px solid #e0e7ff", marginBottom:"4px" }}>Select Month</div>
                {monthList.map(m => (
                  <div key={m} className="prem-mo-opt" onClick={() => { setSelectedMonth(m); setSelectedItcTable("Table 4"); setSelectedTdsTcsSection("Download"); setMOpen(false); }}
                    style={{ padding:"7px 6px", borderRadius:"8px", cursor:"pointer", fontSize:"0.78rem", fontWeight:m===selectedMonth?800:500, color:m===selectedMonth?"#4338ca":"#374151", background:m===selectedMonth?"#eef2ff":"transparent", textAlign:"center", transition:"all 0.12s" }}>
                    {m.slice(0,3)}
                  </div>
                ))}
                {selectedMonth && (
                  <div onClick={() => { setSelectedMonth(""); setMOpen(false); }}
                    style={{ gridColumn:"1/-1", marginTop:"6px", padding:"7px", borderRadius:"8px", cursor:"pointer", fontSize:"0.75rem", fontWeight:600, color:"#ef4444", background:"#fff1f2", textAlign:"center", borderTop:"1px solid #fecaca" }}>
                    ✕ Clear Month
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const GSTRLayout = ({ title = "GST Returns" }) => {
    const [activeSubTab, setActiveSubTab] = useState("Manually");
    const [selectedYear, setSelectedYear] = useState("2025-26");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [selectedItcTable, setSelectedItcTable] = useState("Table 4");
       const [selectedTdsTcsSection, setSelectedTdsTcsSection] = useState("Download");
        const [hoveredTdsTcsSection, setHoveredTdsTcsSection] = useState("");
        const [reportFromDate, setReportFromDate] = useState("");
const [reportToDate, setReportToDate] = useState("");
const [activeReportTab, setActiveReportTab] = useState("Summary");
const [reportYear, setReportYear] = useState(new Date().getFullYear());
const [reportFromMonth, setReportFromMonth] = useState(new Date().toLocaleString("default", { month: "long" }));
const [reportToMonth, setReportToMonth] = useState(new Date().toLocaleString("default", { month: "long" }));





  

    const [tdsTcsDownloadRows, setTdsTcsDownloadRows] = useState([
      { id: 1, selected: false, taxationType: "TDS", gstin: "09AACCF6368D1CV", taxPeriod: "April-2025", tradeName: "MEESHO LTD", taxableValue: 1250.30, igst: 225.05, cgst: "-", sgst: "-", status: "Not Accept" },
      { id: 2, selected: false, taxationType: "TDS", gstin: "09AACCF6368D1CV", taxPeriod: "April-2025", tradeName: "MEESHO LTD", taxableValue: 1250.30, igst: 225.05, cgst: "-", sgst: "-", status: "Not Accept" },
      { id: 3, selected: false, taxationType: "TCS", gstin: "09AACCF6368D1CV", taxPeriod: "April-2025", tradeName: "MEESHO LTD", taxableValue: 1250.30, igst: 225.05, cgst: "-", sgst: "-", status: "Not Accept" },
      { id: 4, selected: false, taxationType: "TDS", gstin: "09AACCF6368D1CV", taxPeriod: "April-2025", tradeName: "MEESHO LTD", taxableValue: 1250.30, igst: 225.05, cgst: "-", sgst: "-", status: "Not Accept" },
      { id: 5, selected: false, taxationType: "TCS", gstin: "09AACCF6368D1CV", taxPeriod: "April-2025", tradeName: "MEESHO LTD", taxableValue: 1250.30, igst: 225.05, cgst: "-", sgst: "-", status: "Not Accept" },
      { id: 6, selected: false, taxationType: "TCS", gstin: "09AACCF6368D1CV", taxPeriod: "April-2025", tradeName: "MEESHO LTD", taxableValue: 1250.30, igst: 225.05, cgst: "-", sgst: "-", status: "Not Accept" }
    ]);

    const [tdsTcsUploadRows, setTdsTcsUploadRows] = useState([
      { id: 1, selected: false, taxationType: "TDS", gstin: "09AACCF6368D1CV", taxPeriod: "April-2025", tradeName: "MEESHO LTD", taxableValue: 1250.30, igst: 225.05, cgst: "-", sgst: "-", status: "Accepted" },
      { id: 2, selected: false, taxationType: "TDS", gstin: "09AACCF6368D1CV", taxPeriod: "April-2025", tradeName: "MEESHO LTD", taxableValue: 1250.30, igst: 225.05, cgst: "-", sgst: "-", status: "Accepted" },
      { id: 3, selected: false, taxationType: "TCS", gstin: "09AACCF6368D1CV", taxPeriod: "April-2025", tradeName: "MEESHO LTD", taxableValue: 1250.30, igst: 225.05, cgst: "-", sgst: "-", status: "Accepted" },
      { id: 4, selected: false, taxationType: "TDS", gstin: "09AACCF6368D1CV", taxPeriod: "April-2025", tradeName: "MEESHO LTD", taxableValue: 1250.30, igst: 225.05, cgst: "-", sgst: "-", status: "Accepted" },
      { id: 5, selected: false, taxationType: "TCS", gstin: "09AACCF6368D1CV", taxPeriod: "April-2025", tradeName: "MEESHO LTD", taxableValue: 1250.30, igst: 225.05, cgst: "-", sgst: "-", status: "Accepted" },
      { id: 6, selected: false, taxationType: "TCS", gstin: "09AACCF6368D1CV", taxPeriod: "April-2025", tradeName: "MEESHO LTD", taxableValue: 1250.30, igst: 225.05, cgst: "-", sgst: "-", status: "Rejected" }
    ]);

    const [tdsTcsFilingRows] = useState([
      { sl: 1, category: "TDS", status: "Accepted", records: 3, taxableValue: 3750.90, igst: 675.15, cgst: "-", sgst: "-" },
      { sl: 2, category: "TCS", status: "Accepted", records: 3, taxableValue: 3750.90, igst: 675.15, cgst: "-", sgst: "-" }
    ]);


    const [downloadCenterYear, setDownloadCenterYear] = useState("");
const [downloadCenterMonthDropdownOpen, setDownloadCenterMonthDropdownOpen] = useState(false);
const [selectedDownloadMonths, setSelectedDownloadMonths] = useState([]);
const [downloadCenterSelectAll, setDownloadCenterSelectAll] = useState(false);
const [selectedDownloadOptions, setSelectedDownloadOptions] = useState([]); 

const downloadCenterYears = [
  "2017-18",
  "2018-19",
  "2019-20",
  "2020-21",
  "2021-22",
  "2022-23",
  "2023-24",
  "2024-25",
  "2025-26"
];

const downloadCenterMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const downloadCenterOptions = [
  "GSTR-1",
  "GSTR-1A",
  "GSTR-2A",
  "GSTR-2B",
  "GSTR-3B",
  "TDS/TCS",
  "Electronic Cash/Credit Ledger",
 
];
    const EXCEL_IMPORT_OPTIONS = [
  "b2b,sez,de",
  "b2ba",
  "b2cl",
  "b2cla",
  "b2cs",
  "b2csa",
  "cdnr",
  "cdnra",
  "cdnur",
  "cdnura",
  "exp",
  "expa",
  "at",
  "ata",
  "atadj",
  "atadja",
  "exemp",
  "hsn(b2b)",
  "hsn(b2c)",
  "docs",
  "eco",
  "ecoa",
  "ecob2b",
  "ecourp2b",
  "ecob2c",
  "ecourp2c",
  "ecoab2b",
  "ecoab2c",
  "ecoaurp2b",
  "ecoaurp2c"
];

const [importOptions, setImportOptions] = useState(EXCEL_IMPORT_OPTIONS);
    // 7. Payment of Tax - Cash Ledger
const [cashLedger, setCashLedger] = useState([
  { desc: "Tax", igst: "", cgst: "", sgst: "", cess: "" },
  { desc: "Interest", igst: "", cgst: "", sgst: "", cess: "" },
  { desc: "Late Fees", igst: "", cgst: "", sgst: "", cess: "" }
]);

// 7. Payment of Tax - Credit Ledger
const [creditLedger, setCreditLedger] = useState([
  { igst: "", cgst: "", sgst: "", cess: "" }
]);

const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[\s_\-./()]+/g, "")
    .trim();

const EXCLUDED_IMPORT_SHEETS = ["helpinstruction", "master"];

const getWorkbookImportOptions = (workbook) => {
  return workbook.SheetNames
    .filter((name) => !EXCLUDED_IMPORT_SHEETS.includes(normalizeText(name)))
    .map((name) => String(name).trim());
};

const getImportStorageConfig = (sheetName) => {
  const key = normalizeText(sheetName);

  const configMap = {
    b2bsezde: { stateKey: "b2bRows", setter: setB2bRows, storageKey: STORAGE_KEYS.b2b, summaryKey: "b2b" },
    b2ba: { stateKey: "b2baRows", setter: setB2baRows, storageKey: STORAGE_KEYS.b2bAmendment, summaryKey: "b2b" },
    b2cl: { stateKey: "b2cLargeRows", setter: setB2cLargeRows, storageKey: STORAGE_KEYS.b2cLarge, summaryKey: "b2cLarge" },
    b2cla: { stateKey: "b2claRows", setter: setB2claRows, storageKey: STORAGE_KEYS.b2cla, summaryKey: "b2cLarge" },
    b2cs: { stateKey: "b2cOthersRows", setter: setB2cOthersRows, storageKey: STORAGE_KEYS.b2cOthers, summaryKey: "b2cOthers" },
    b2csa: { stateKey: "b2cOthersRows", setter: setB2cOthersRows, storageKey: STORAGE_KEYS.b2cOthers, summaryKey: "b2cOthers" },
    cdnr: { stateKey: "creditDebitRegisteredRows", setter: setCreditDebitRegisteredRows, storageKey: STORAGE_KEYS.creditDebitRegistered, summaryKey: "b2b" },
    cdnra: { stateKey: "cdnraRows", setter: setCdnraRows, storageKey: STORAGE_KEYS.cdnra, summaryKey: "b2b" },
    cdnur: { stateKey: "creditDebitUnregisteredRows", setter: setCreditDebitUnregisteredRows, storageKey: STORAGE_KEYS.creditDebitUnregistered, summaryKey: "b2cLarge" },
    cdnura: { stateKey: "cdnuraRows", setter: setCdnuraRows, storageKey: STORAGE_KEYS.cdnura, summaryKey: "b2cLarge" },
    exp: { stateKey: "b2cOthersRows", setter: setB2cOthersRows, storageKey: STORAGE_KEYS.b2cOthers, summaryKey: "b2cOthers" },
    expa: { stateKey: "exportAmendmentRows", setter: setExportAmendmentRows, storageKey: STORAGE_KEYS.exportAmendment, summaryKey: "b2cOthers" },
    at: { stateKey: "advanceLiabilityRows", setter: setAdvanceLiabilityRows, storageKey: STORAGE_KEYS.advanceLiability, summaryKey: null },
    ata: { stateKey: "amendedTaxLiabilityRows", setter: setAmendedTaxLiabilityRows, storageKey: "amendedTaxLiability", summaryKey: null },
    atadj: { stateKey: "advanceAdjustmentRows", setter: setAdvanceAdjustmentRows, storageKey: STORAGE_KEYS.advanceAdjustment, summaryKey: null },
    atadja: { stateKey: "advanceAdjustmentRows", setter: setAdvanceAdjustmentRows, storageKey: STORAGE_KEYS.advanceAdjustment, summaryKey: null },
    exemp: { stateKey: "nilExemptRows", setter: setNilExemptRows, storageKey: STORAGE_KEYS.nilExempt, summaryKey: null },
    hsnb2b: { stateKey: "hsnRows", setter: setHsnRows, storageKey: STORAGE_KEYS.hsn, summaryKey: "hsn" },
    hsnb2c: { stateKey: "hsnRows", setter: setHsnRows, storageKey: STORAGE_KEYS.hsn, summaryKey: "hsn" },
    docs: { stateKey: "documentsRows", setter: setDocumentsRows, storageKey: STORAGE_KEYS.documents, summaryKey: null },
    eco: { stateKey: "ecoRows", setter: setEcoRows, storageKey: STORAGE_KEYS.ecoRows, summaryKey: null },
    ecoa: { stateKey: "ecoRows", setter: setEcoRows, storageKey: STORAGE_KEYS.ecoRows, summaryKey: null },
    ecob2b: { stateKey: "ecoB2bRows", setter: setEcoB2bRows, storageKey: STORAGE_KEYS.ecoB2b, summaryKey: null },
    ecourp2b: { stateKey: "ecoUrpB2bRows", setter: setEcoUrpB2bRows, storageKey: STORAGE_KEYS.ecoUrpB2b, summaryKey: null },
    ecob2c: { stateKey: "ecoB2cRows", setter: setEcoB2cRows, storageKey: STORAGE_KEYS.ecoB2c, summaryKey: null },
    ecourp2c: { stateKey: "ecoUrpB2cRows", setter: setEcoUrpB2cRows, storageKey: STORAGE_KEYS.ecoUrpB2c, summaryKey: null },
    ecoab2b: { stateKey: "ecoAmendmentB2bRows", setter: setEcoAmendmentB2bRows, storageKey: STORAGE_KEYS.ecoAmendmentB2b, summaryKey: null },
    ecoab2c: { stateKey: "ecoAmendmentB2cRows", setter: setEcoAmendmentB2cRows, storageKey: STORAGE_KEYS.ecoAmendmentB2c, summaryKey: null },
    ecoaurp2b: { stateKey: "ecoAmendmentUrpB2bRows", setter: setEcoAmendmentUrpB2bRows, storageKey: STORAGE_KEYS.ecoAmendmentUrpB2b, summaryKey: null },
    ecoaurp2c: { stateKey: "ecoUrp2cAmendmentRows", setter: setEcoUrp2cAmendmentRows, storageKey: STORAGE_KEYS.ecoUrp2cAmendment, summaryKey: null }
  };

  return configMap[key] || null;
};

const getHeaderRowIndex = (sheetData) => {
  for (let i = 0; i < Math.min(sheetData.length, 12); i++) {
    const row = (sheetData[i] || []).map(cell => normalizeText(cell));
    const rowText = row.join("|");

    if (
      rowText.includes("taxablevalue") ||
      rowText.includes("integratedtaxamount") ||
      rowText.includes("integratedtax") ||
      rowText.includes("centraltaxamount") ||
      rowText.includes("stateuttaxamount") ||
      rowText.includes("invoicevalue") ||
      rowText.includes("gstin") ||
      rowText.includes("invoicenumber")
    ) {
      return i;
    }
  }
  return 3;
};

const sheetToObjects = (worksheet) => {
  const raw = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

  if (!raw || !raw.length) return [];

  let headerRowIndex = 0;

  for (let i = 0; i < Math.min(raw.length, 15); i++) {
    const rowText = (raw[i] || []).join(" ").toLowerCase();

    if (
      rowText.includes("taxable") ||
      rowText.includes("invoice") ||
      rowText.includes("gstin")
    ) {
      headerRowIndex = i;
      break;
    }
  }

  const headers = (raw[headerRowIndex] || []).map((h) => String(h || "").trim());

  return raw.slice(headerRowIndex + 1).map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i];
    });
    return obj;
  });
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  const cleaned = String(value).replace(/,/g, "").trim();
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
};

const getValueByPossibleHeaders = (row, possibleHeaders) => {
  const entries = Object.entries(row || {});
  for (const [key, value] of entries) {
    const normalizedKey = normalizeText(key);
    if (possibleHeaders.some((h) => normalizedKey === normalizeText(h))) {
      return value;
    }
  }
  return "";
};

const getSheetSummaryTotals = (worksheet) => {
  const raw = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

  if (!raw || raw.length < 3) {
    return {
      taxable: 0,
      igst: 0,
      cgst: 0,
      sgst: 0,
      cess: 0,
      total: 0
    };
  }

  const normalize = (value = "") =>
    String(value).toLowerCase().replace(/[\s_\-./()]+/g, "").trim();

  const headerRowIndex = 1;
  const valueRowIndex = 2;

  const headers = raw[headerRowIndex] || [];
  const values = raw[valueRowIndex] || [];

  const findValue = (possibleHeaders) => {
    for (let i = 0; i < headers.length; i++) {
      const currentHeader = normalize(headers[i]);
      const matched = possibleHeaders.some((h) => currentHeader === normalize(h));
      if (matched) {
        const value = values[i];
        const cleaned = String(value ?? "").replace(/,/g, "").trim();
        const num = Number(cleaned);
        return Number.isFinite(num) ? num : 0;
      }
    }
    return 0;
  };

  const taxable = findValue([
    "Total Taxable Value",
    "Total Taxable  Value",
    "Total Advance Received",
    "Total Advance Adjusted",
    "Total Net Value of Supplies",
    "Total Nil Rated Supplies",
    "Total Exempted Supplies",
    "Total Non-GST Supplies"
  ]);

  const igst = findValue([
    "Total Integrated Tax",
    "Integrated Tax Amount"
  ]);

  const cgst = findValue([
    "Total Central Tax",
    "Central Tax Amount",
    "Total Central Tax "
  ]);

  const sgst = findValue([
    "Total State/UT Tax",
    "State/UT Tax Amount",
    "Total State/UT Tax "
  ]);

  const cess = findValue([
    "Total Cess",
    "Cess Amount",
    "Total Cancelled"
  ]);

  return {
    taxable: taxable || 0,
    igst: igst || 0,
    cgst: cgst || 0,
    sgst: sgst || 0,
    cess: cess || 0,
    total: (taxable || 0) + (igst || 0) + (cgst || 0) + (sgst || 0) + (cess || 0)
  };
};

const calculateSummaryFromRows = (rows) => {
  let taxable = 0;
  let igst = 0;
  let cgst = 0;
  let sgst = 0;
  let cess = 0;

  if (!rows || !rows.length) {
    return {
      taxable: 0,
      igst: 0,
      cgst: 0,
      sgst: 0,
      cess: 0,
      total: 0
    };
  }

  // 🔥 IMPORTANT: sirf first valid row use karenge (summary row)
  const row = rows[0];

  const getVal = (keys) => {
    for (let key of Object.keys(row)) {
      const cleanKey = key.toLowerCase().replace(/\s+/g, "");
      for (let k of keys) {
        if (cleanKey.includes(k)) {
          return Number(row[key]) || 0;
        }
      }
    }
    return 0;
  };

  taxable = getVal(["totaltaxablevalue", "taxablevalue"]);
  igst = getVal(["totalintegratedtax", "igst"]);
  cgst = getVal(["totalcentraltax", "cgst"]);
  sgst = getVal(["totalstate", "sgst", "utgst"]);
  cess = getVal(["totalcess", "cess"]);

  return {
    taxable,
    igst,
    cgst,
    sgst,
    cess,
    total: taxable + igst + cgst + sgst + cess
  };
};
const applyImportedSummaryByKey = (summaryKey, totals) => {
  if (!summaryKey) return;

  setSummaryTotals((prev) => ({
  ...prev,
    [summaryKey]: {
      taxable: totals.taxable || 0,
      igst: totals.igst || 0,
      cgst: totals.cgst || 0,
      sgst: totals.sgst || 0,
      cess: totals.cess || 0,
      total: totals.total || 0
    }
  }));
};

const syncImportedRowsToState = (sheetName, rows, worksheet) => {
  const config = getImportStorageConfig(sheetName);
  if (!config || typeof config.setter !== "function") return;

  const safeRows = Array.isArray(rows) ? rows : [];
  config.setter(safeRows);

  if (config.storageKey && typeof config.storageKey === "string") {
    try {
      localStorage.setItem(config.storageKey, JSON.stringify(safeRows));
    } catch (error) {
      console.warn(`Could not save ${sheetName} to localStorage:`, error);
    }
  }

  const totals = worksheet
    ? getSheetSummaryTotals(worksheet)
    : {
        taxable: 0,
        igst: 0,
        cgst: 0,
        sgst: 0,
        cess: 0,
        total: 0
      };

  applyImportedSummaryByKey(config.summaryKey, totals);
};
    const handleSelectAllImport = () => {
  if (selectAllImport) {
    setSelectedOptions([]);
  } else {
    setSelectedOptions(importOptions);
  }
  setSelectAllImport(!selectAllImport);
};
    const handleOptionToggle = (option) => {
      if (selectedOptions.includes(option)) {
        setSelectedOptions(selectedOptions.filter(o => o !== option));
      } else {
        setSelectedOptions([...selectedOptions, option]);
      }
    };

    const [itc04Table4Rows, setItc04Table4Rows] = useState(() => {
  return [{
    sl: 1,
    gstinJobWorker: "",
    state: "",
    jobWorkerType: "",
    challanNumber: "",
    challanDate: "",
    goodsType: "",
    description: "",
    uqc: "",
    quantity: "",
    taxableValue: "",
    rate: "",
    igst: "",
    cgst: "",
    sgst: "",
    cess: ""
  }];
});

const [itc04Table5ARows, setItc04Table5ARows] = useState(() => {
  return [{
    sl: 1,
    gstinJobWorker: "",
    state: "",
    jobWorkerType: "",
    challanNumber: "",
    challanDate: "",
    goodsType: "",
    description: "",
    uqc: "",
    quantity: "",
    taxableValue: "",
    rate: "",
    igst: "",
    cgst: "",
    sgst: "",
    cess: ""
  }];
});

const [itc04Table5BRows, setItc04Table5BRows] = useState(() => {
  return [{
    sl: 1,
    gstinJobWorker: "",
    state: "",
    jobWorkerType: "",
    challanNumber: "",
    challanDate: "",
    goodsType: "",
    description: "",
    uqc: "",
    quantity: "",
    taxableValue: "",
    rate: "",
    igst: "",
    cgst: "",
    sgst: "",
    cess: ""
  }];
});

const [itc04Table5CRows, setItc04Table5CRows] = useState(() => {
  return [{
    sl: 1,
    gstinJobWorker: "",
    state: "",
    jobWorkerType: "",
    challanNumber: "",
    challanDate: "",
    goodsType: "",
    description: "",
    uqc: "",
    quantity: "",
    taxableValue: "",
    rate: "",
    igst: "",
    cgst: "",
    sgst: "",
    cess: ""
  }];
});


    const toggleTdsTcsRow = (setter, id) => {
      setter(prev => prev.map(row => row.id === id ? { ...row, selected: !row.selected } : row));
    };

    const handleTdsTcsAllAccept = () => {
      setTdsTcsDownloadRows(prev =>
        prev.map(row => row.selected ? { ...row, status: "Accepted" } : row)
      );
    };

    const handleTdsTcsReject = () => {
      setTdsTcsDownloadRows(prev =>
        prev.map(row => row.selected ? { ...row, status: "Rejected" } : row)
      );
    };

    const handleTdsTcsDelete = () => {
      setTdsTcsDownloadRows(prev => prev.filter(row => !row.selected));
    };

    const handleTdsTcsDownload = () => {
      toast.success("TDS/TCS records downloaded successfully!");
    };

    const handleTdsTcsUploadPortal = () => {
      toast.success("TDS/TCS upload initiated on portal!");
    };

    const handleTdsTcsSubmit = () => {
      toast.success("TDS/TCS file submitted successfully!");
    };
    // Row states with localStorage persistence
    const [b2bRows, setB2bRows] = useState(() => {
      const saved = localStorage.getItem(STORAGE_KEYS.b2b);
      return saved ? JSON.parse(saved) : [{ sl: 1, gstin: "", recipientName: "", invNo: "", invDate: "", invValue: 0, pos: "", rcm: "N", applicableTaxRate: "", invType: "", ecoGstin: "", gstRate: 0, taxableValue: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 }];
    });
    const [b2cLargeRows, setB2cLargeRows] = useState(() => {
      const saved = localStorage.getItem(STORAGE_KEYS.b2cLarge);
      return saved ? JSON.parse(saved) : [{ sl: 1, invNo: "", invDate: "", invValue: 0, pos: "State", applicableTaxRate: "0%/65%", gstRate: 0, taxableValue: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 }];
    });
    const [b2cOthersRows, setB2cOthersRows] = useState(() => {
      const saved = localStorage.getItem(STORAGE_KEYS.b2cOthers);
      return saved ? JSON.parse(saved) : [{   sl: 1,
          exportType: "",
          invoiceNumber: "",
          invoiceDate: "",
          invoiceValue: "",
          portCode: "",
          shippingBillNumber: "",
          shippingBillDate: "",
          rate: "",
          taxableValue: "",
          cgst: "",
          igst: "",
          sgst: "",
          cessAmount: "", }];
    });
    const [nilExemptRows, setNilExemptRows] = useState(() => {
      const saved = localStorage.getItem(STORAGE_KEYS.nilExempt);
      return saved ? JSON.parse(saved) : [{ sl: 1, description: "", nilRated: 0, exempted: 0, nonGst: 0 }];
    });
    const [creditDebitRegisteredRows, setCreditDebitRegisteredRows] = useState(() => {
      const saved = localStorage.getItem(STORAGE_KEYS.creditDebitRegistered);
      return saved ? JSON.parse(saved) : [{ sl: 1, gstin: "", recipientName: "", noteNo: "", noteDate: "", noteType: "Debit", pos: "", rcm: "N", noteSupplyType: "Regular B2B", noteValue: 0, diffRatePercent: "", rate: 0, taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, total: 0 }];
    });
    const [creditDebitUnregisteredRows, setCreditDebitUnregisteredRows] = useState(() => {
      const saved = localStorage.getItem(STORAGE_KEYS.creditDebitUnregistered);
      return saved ? JSON.parse(saved) : [{ sl: 1, urType: "1 - B2C (Large)", noteNo: "", noteDate: "", noteType: "Debit", pos: "", rcm: "N", noteSupplyType: "Regular B2B", noteValue: 0, diffRatePercent: "", rate: 0, taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, total: 0 }];
    });
    const [advanceLiabilityRows, setAdvanceLiabilityRows] = useState(() => {
      const saved = localStorage.getItem(STORAGE_KEYS.advanceLiability);
      return saved ? JSON.parse(saved) : [{ sl: 1, pos: "", diffRatePercent: "", rate: 0, grossAdvance: 0, taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, total: 0 }];
    });
    const [advanceAdjustmentRows, setAdvanceAdjustmentRows] = useState(() => {
      const saved = localStorage.getItem(STORAGE_KEYS.advanceAdjustment);
      return saved ? JSON.parse(saved) : [{ sl: 1, pos: "", diffRatePercent: "", rate: 0, grossAdvance: 0, taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, total: 0 }];
    });
    const [hsnRows, setHsnRows] = useState(() => {
      const saved = localStorage.getItem(STORAGE_KEYS.hsn);
      return saved ? JSON.parse(saved) : [{ sl: 1, hsn: "", description: "", uqc: "", totalQty: 0, totalValue: 0, rate: 0, taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 }];
    });
    const [documentsRows, setDocumentsRows] = useState(() => {
      const saved = localStorage.getItem(STORAGE_KEYS.documents);
      return saved ? JSON.parse(saved) : [{ sl: 1, nature: "1 - Invoice for Outward Supply", srFrom: "", srTo: "", totalNumber: 0, cancelled: 0 }];
    });
   const [ecoRows, setEcoRows] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEYS.ecoRows);
  return saved ? JSON.parse(saved) : [
    { sl: 1, nature: "1 - Liable to Collect Tax u/s 52(TCS)", gstinEco: "", nameEco: "", netValue: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, total: 0 }
  ];
});
    const [b2bAmendmentRows, setB2bAmendmentRows] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEYS.b2bAmendment);
  return saved ? JSON.parse(saved) : [
    {
      sl: 1,
      gstin: "",
      invoiceNo: "",
      invoiceDate: "",
      invoiceValue: 0,
      pos: "",
      rate: 0,
      taxableValue: 0,
      igst: 0,
      cgst: 0,
      sgst: 0,
      cess: 0
    }
  ];
});
const [exportAmendmentRows, setExportAmendmentRows] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEYS.exportAmendment);
  return saved ? JSON.parse(saved) : [
    {
      sl: 1,
      exportType: "",
      invoiceNo: "",
      invoiceDate: "",
      invoiceValue: 0,
      portCode: "",
      shippingBillNo: "",
      shippingBillDate: "",
      rate: 0,
      taxableValue: 0,
      igst: 0,
      cess: 0
    }
  ];
});
const [ecoB2bRows, setEcoB2bRows] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEYS.ecoB2b);
  return saved ? JSON.parse(saved) : [
    {
      sl: 1,
      gstin: "",
      invoiceNo: "",
      invoiceDate: "",
      invoiceValue: 0,
      pos: "",
      rate: 0,
      taxableValue: 0,
      igst: 0,
      cgst: 0,
      sgst: 0,
      cess: 0
    }
  ];
});
const [ecoUrpB2bRows, setEcoUrpB2bRows] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEYS.ecoUrpB2b);
  return saved ? JSON.parse(saved) : [
    {
      sl: 1,
      supplierGstin: "",
      pos: "",
      rate: 0,
      taxableValue: 0,
      igst: 0,
      cgst: 0,
      sgst: 0,
      cess: 0
    }
  ];
});
const [ecoB2cRows, setEcoB2cRows] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEYS.ecoB2c);
  return saved ? JSON.parse(saved) : [
    {
      sl: 1,
      pos: "",
      rate: 0,
      taxableValue: 0,
      igst: 0,
      cgst: 0,
      sgst: 0,
      cess: 0
    }
  ];
});
const [ecoUrpB2cRows, setEcoUrpB2cRows] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEYS.ecoUrpB2c);
  return saved ? JSON.parse(saved) : [
    {
      sl: 1,
      pos: "",
      rate: 0,
      taxableValue: 0,
      igst: 0,
      cgst: 0,
      sgst: 0,
      cess: 0
    }
  ];
});
const [ecoAmendmentB2bRows, setEcoAmendmentB2bRows] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEYS.ecoAmendmentB2b);
  return saved ? JSON.parse(saved) : [
    {
      sl: 1,
      gstin: "",
      invoiceNo: "",
      invoiceDate: "",
      invoiceValue: 0,
      pos: "",
      rate: 0,
      taxableValue: 0,
      igst: 0,
      cgst: 0,
      sgst: 0,
      cess: 0
    }
  ];
});

const [ecoAmendmentB2cRows, setEcoAmendmentB2cRows] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEYS.ecoAmendmentB2c);
  return saved ? JSON.parse(saved) : [
    {
      sl: 1,
      supplierGstin: "",
      supplierName: "",
      pos: "",
      rate: 0,
      taxableValue: 0,
      igst: 0,
      cgst: 0,
      sgst: 0,
      cess: 0
    }
  ];
});

const [ecoAmendmentUrpB2bRows, setEcoAmendmentUrpB2bRows] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEYS.ecoAmendmentUrpB2b);
  return saved ? JSON.parse(saved) : [
    {
      sl: 1,
      supplierGstin: "",
      pos: "",
      rate: 0,
      taxableValue: 0,
      igst: 0,
      cgst: 0,
      sgst: 0,
      cess: 0
    }
  ];

  });


const [b2baRows, setB2baRows] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEYS.b2ba);

  return saved
    ? JSON.parse(saved)
    : [
        {
          sl: 1,
          gstin: "",
          receiverName: "",
          origInvNum: "",
          origInvDate: "",
          revInvNum: "",
          revInvDate: "",
          invoiceValue: 0,
          pos: "",
          rcm: "",
          applicableTaxRate: "",
          invoiceType: "",
          ecomGstin: "",
          rate: 0,
          taxableValue: 0,
          igst: 0,
          cgst: 0,
          sgst: 0,
          cess: 0
        }
      ];
});

const [b2claRows, setB2claRows] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEYS.b2cla);

  return saved ? JSON.parse(saved) : [
    {
      sl: 1,
      origInvNo: "",
      origInvDate: "",
      origPos: "",
      revInvNo: "",
      revInvDate: "",
      invoiceValueB2CLA: "",
      applicableTaxRateB2CLA: "",
      rateB2CLA: "",
      taxableValueB2CLA: "",
      cgst: 0,
      igst: 0,
      sgst: 0,
      cessAmount: 0,
      ecoGstin: ""
    }
  ];
});

const [cdnraRows, setCdnraRows] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEYS.cdnra);

  return saved
    ? JSON.parse(saved)
    : [
        {
          sl: 1,
          gstin: "",
          receiverName: "",

          origNoteNo: "",
          origNoteDate: "",

          revNoteNo: "",
          revNoteDate: "",

          noteType: "",
          pos: "",

          rcm: "",

          noteSupplyType: "",

          noteValue: "",

          applicableTaxRate: "",

          rate: "",

          taxableValue: "",

          cgst: "",
          igst: "",
          sgst: "",

          cessAmount: "",
        },
      ];
});
      

const [cdnuraRows, setCdnuraRows] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEYS.cdnura);

  return saved
    ? JSON.parse(saved)
    : [
        {
          sl: 1,

          urType: "",

          origNoteNo: "",
          origNoteDate: "",

          revNoteNo: "",
          revNoteDate: "",

          noteType: "",

          pos: "",

          noteValue: "",

          applicableTaxRate: "",

          rate: "",

          taxableValue: "",

          cgst: "",
          igst: "",
          sgst: "",

          cessAmount: "",
        },
      ];
});


const [ecoUrp2cAmendmentRows, setEcoUrp2cAmendmentRows] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEYS.ecoUrp2cAmendment);

  return saved
    ? JSON.parse(saved)
    : [
        {
          sl: 1,

          financialYear: "",
          originalMonth: "",

          pos: "",

          rate: "",

          taxableValue: "",

          cessAmount: "",
        },
      ];
});

const [amendedTaxLiabilityRows, setAmendedTaxLiabilityRows] = useState(() => {
  const saved = localStorage.getItem("amendedTaxLiability");
  return saved ? JSON.parse(saved) : [{
    sl: 1,
    financialYear: "",
    originalMonth: "",
    originalPlaceOfSupply: "",
    applicableTaxRate: "",
    rate: 0,
    grossAdvanceReceived: 0,
    igst: 0,
    cgst: 0,
    sgst: 0,
    cessAmount: 0
  }];
});

const [b2csaRows, setB2csaRows] = useState(() => {
  const saved = localStorage.getItem("b2csaRows");
  return saved ? JSON.parse(saved) : [{ sl: 1, financialYear: "", originalMonth: "", pos: "", type: "E/OF", applicableTaxRate: "", rate: 0, taxableValue: 0, cess: 0, ecoGstin: "" }];
});

const [advanceReceivedAmendmentRows, setAdvanceReceivedAmendmentRows] = useState(() => {
  const saved = localStorage.getItem("advanceReceivedAmendmentRows");
  return saved ? JSON.parse(saved) : [{ sl: 1, financialYear: "", originalMonth: "", pos: "", applicableTaxRate: "", rate: 0, grossAdvance: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 }];
});

const [advanceAdjustmentAmendmentRows, setAdvanceAdjustmentAmendmentRows] = useState(() => {
  const saved = localStorage.getItem("advanceAdjustmentAmendmentRows");
  return saved ? JSON.parse(saved) : [{ sl: 1, financialYear: "", originalMonth: "", pos: "", applicableTaxRate: "", rate: 0, grossAdvance: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 }];
});

const [ecoSupplyAmendmentRows, setEcoSupplyAmendmentRows] = useState(() => {
  const saved = localStorage.getItem("ecoSupplyAmendmentRows");
  return saved ? JSON.parse(saved) : [{ sl: 1, nature: "", financialYear: "", originalMonth: "", origEcoGstin: "", revisedEcoGstin: "", ecoName: "", netValue: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 }];
});
    
  const [summaryTotals, setSummaryTotals] = useState(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.summaryTotals);
    return saved ? JSON.parse(saved) : {
      b2b: { taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, total: 0 },
      b2cLarge: { taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, total: 0 },
      b2cOthers: { taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, total: 0 },
      hsn: { taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, total: 0 }
    };
  } catch {
    return {
      b2b: { taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, total: 0 },
      b2cLarge: { taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, total: 0 },
      b2cOthers: { taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, total: 0 },
      hsn: { taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, total: 0 }
    };
  }
});
    const defaultOutwardSupplies = [
  {
    nature: "(a) Total Taxable Supplies (Other than Zero Rated, Nil Rated and Exempted supplies)",
    taxable: "",
    igst: "",
    cgst: "",
    sgst: "",
    cess: ""
  },
  {
    nature: "(b) Total Taxable Supplies (Zero Rated)",
    taxable: "",
    igst: "",
    cgst: "Hide",
    sgst: "Hide",
    cess: ""
  },
  {
    nature: "(c) Total Exempt Supplies (Nil Rated and Exempted)",
    taxable: "",
    igst: "Hide",
    cgst: "Hide",
    sgst: "Hide",
    cess: "Hide"
  },
  {
    nature: "(d) Inward Supplies (Liable to Reverse Charge)",
    taxable: "",
    igst: "",
    cgst: "",
    sgst: "",
    cess: ""
  },
  {
    nature: "(e) Non-GST Outward Supplies)",
    taxable: "",
    igst: "Hide",
    cgst: "Hide",
    sgst: "Hide",
    cess: "Hide"
  }
];

const handleImportFile = async () => {
  if (!uploadedFile) {
    alert("Please select a file first.");
    return;
  }

  if (!selectedOptions.length) {
    alert("Please select at least one import section.");
    return;
  }

  try {
    setIsUploading(true);

    const buffer = await uploadedFile.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });

    const workbookSections = getWorkbookImportOptions(workbook);
    setImportOptions(workbookSections);

    const isSelectAll = selectedOptions.length === workbookSections.length;

    const sheetsToProcess = isSelectAll ? workbookSections : selectedOptions;

    // selected section ke liye pehle zero set kar do,
    // taaki empty sheet bhi summary me dikhe
    sheetsToProcess.forEach((option) => {
      const config = getImportStorageConfig(option);
      if (config?.summaryKey) {
        applyImportedSummaryByKey(config.summaryKey, {
          taxable: 0,
          igst: 0,
          cgst: 0,
          sgst: 0,
          cess: 0,
          total: 0
        });
      }
    });

    sheetsToProcess.forEach((option) => {
      const matchedSheetName = workbook.SheetNames.find(
        (sheetName) => normalizeText(sheetName) === normalizeText(option)
      );

      if (!matchedSheetName) {
        syncImportedRowsToState(option, [], null);
        return;
      }

      const worksheet = workbook.Sheets[matchedSheetName];
      const rows = sheetToObjects(worksheet);

      const filteredRows = Array.isArray(rows)
        ? rows.filter((row) =>
            Object.values(row || {}).some(
              (value) => String(value || "").trim() !== ""
            )
          )
        : [];

      syncImportedRowsToState(matchedSheetName, filteredRows, worksheet);
    });

    setActiveSubTab("Summary");
    setImportStep("sources");
    setUploadedFile(null);

    alert("Excel imported successfully.");
  } catch (error) {
    console.error("Import failed:", error);
    alert("File read failed.");
  } finally {
    setIsUploading(false);
  }
};
const [outwardSupplies, setOutwardSupplies] = useState(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.outward));

    if (
      Array.isArray(saved) &&
      saved.length === 5
    ) {
      return saved;
    }

    return defaultOutwardSupplies;
  } catch {
    return defaultOutwardSupplies;
  }
});
    // 2. ECO u/s 9(5)
    const defaultEcoSupplies = [
  {
    nature: "1- Taxable Supplies on which ECO pays tax u/s 9(5) [To be furnished by ECO]",
    taxable: "",
    igst: "",
    cgst: "",
    sgst: "",
    cess: "",
    total: ""
  },
  {
    nature: "2- Taxable Supplies made by registered person through ECO, on which ECO is required to pay tax u/s 9(5) [To be furnished by Registered person making Supplies through ECO]",
    taxable: "",
    igst: "",
    cgst: "",
    sgst: "",
    cess: "",
    total: ""
  }
];

const [ecoSupplies, setEcoSupplies] = useState(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.ecoSupplies));

    if (Array.isArray(saved) && saved.length === 2) {
      return saved;
    }

    return defaultEcoSupplies;
  } catch {
    return defaultEcoSupplies;
  }
});
    // 3. Inter-State Supplies (composition, exempt, nil, non-GST)
  const [unregisteredSupplies, setUnregisteredSupplies] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEYS.interstateUnregistered);
  return saved
    ? JSON.parse(saved)
    : [{ placeOfSupply: "", taxableValue: "", igst: "" }];
});

const [compositionSupplies, setCompositionSupplies] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEYS.interstateComposition);
  return saved
    ? JSON.parse(saved)
    : [{ placeOfSupply: "", taxableValue: "", igst: "" }];
});

const [uinSupplies, setUinSupplies] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEYS.interstateUin);
  return saved
    ? JSON.parse(saved)
    : [{ placeOfSupply: "", taxableValue: "", igst: "" }];
});
    // 4. Eligible ITC (sabse bada table)
    const [itcDetails, setItcDetails] = useState(() => {
      const saved = localStorage.getItem(STORAGE_KEYS.itc);
      return saved ? JSON.parse(saved) : {
        available: [
          { desc: "(1) Import of Goods", igst: "", cgst: "", sgst: "", cess: "" },
          { desc: "(2) Import of Services", igst: "", cgst: "", sgst: "", cess: "" },
          { desc: "(3) Inward Supplies liable to Reverse Charge (other than 1 & 2 above)", igst: "", cgst: "", sgst: "", cess: "" },
          { desc: "(4) Inward Supplies from ISD", igst: "", cgst: "", sgst: "", cess: "" },
          { desc: "(5) All other ITC", igst: "", cgst: "", sgst: "", cess: "" }
        ],
        reversed: [
          { desc: "(1) As per Rule 42,43 & 44 of CGST Rules & section 17(5) of CGST Act", igst: "", cgst: "", sgst: "", cess: "" },
          { desc: "(2) Others", igst: "", cgst: "", sgst: "", cess: "" }
        ],
        netItc: { igst: "", cgst: "", sgst: "", cess: "" },
        ineligible: [
          { desc: "(1) ITC Reclaimed which was reversed under Table 4(A)(5) in earlier tax period", igst: "", cgst: "", sgst: "", cess: "" },
          { desc: "(2) Ineligible ITC under section 16(4) & ITC restricted due to POS rules", igst: "", cgst: "", sgst: "", cess: "" }
        ]
      };
    });
    // 5. Exempt, Nil Rated, Non-GST Supplies
    const [exemptNonGst, setExemptNonGst] = useState(() => {
      const saved = localStorage.getItem(STORAGE_KEYS.exempt);
      return saved ? JSON.parse(saved) : [
        { nature: "From a supplier under composition scheme, Exempt and NIL Rated Supply", interstate: "", intrastate: "" },
        { nature: "Non GST Supply", interstate: "", intrastate: "" }
      ];
    });
    // 6. Interest & Late Fee
    const [interestLateFee, setInterestLateFee] = useState(() => {
      const saved = localStorage.getItem(STORAGE_KEYS.interestLateFee);
      return saved ? JSON.parse(saved) : [
        { desc: "Interest", igst: "", cgst: "", sgst: "", cess: "" },
        { desc: "Late Fees", igst: "", cgst: "", sgst: "", cess: "" }
      ];
    });
    // Save all states to localStorage
    const [importStep, setImportStep] = useState("sources"); // start with source selection
const [selectedSource, setSelectedSource] = useState(null);
const [uploadedFile, setUploadedFile] = useState(null);
const [isUploading, setIsUploading] = useState(false);

// Keep your existing ones
const [selectedOptions, setSelectedOptions] = useState([]);
const [selectAllImport, setSelectAllImport] = useState(false);
const [skipValidation, setSkipValidation] = useState(false);

    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const [gstr3bSavedSummary, setGstr3bSavedSummary] = useState(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.gstr3bSavedSummary);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
});
    // Dropdown controls
    const [openPosDropdownRow, setOpenPosDropdownRow] = useState(null);
    const [openSupplyTypeDropdownRow, setOpenSupplyTypeDropdownRow] = useState(null);
    const [openNatureDropdownRow, setOpenNatureDropdownRow] = useState(null);
    const [openDocumentNatureDropdownRow, setOpenDocumentNatureDropdownRow] = useState(null);
    const [openUrTypeDropdownRow, setOpenUrTypeDropdownRow] = useState(null);

    const [openApplicableTaxDropdownRow, setOpenApplicableTaxDropdownRow] = useState(null);
    const [openInvoiceTypeDropdownRow, setOpenInvoiceTypeDropdownRow] = useState(null);
    const [openRateDropdownRow, setOpenRateDropdownRow] = useState(null);
    const [openTypeDropdownRow, setOpenTypeDropdownRow] = useState(null);
    const [openRcmDropdownRow, setOpenRcmDropdownRow] = useState(null);
    const [openUcqDropdownRow, setOpenUcqDropdownRow] = useState(null);
    const [openNoteTypeDropdownRow, setOpenNoteTypeDropdownRow] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);
    const monthDropdownRef = useRef(null);



useEffect(() => {

  const handleClickOutside = (event) => {
    if (
      openDropdown &&
      !event.target.closest(".custom-dropdown-container")
    ) {
      setOpenDropdown(null);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };

}, [openDropdown]);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      monthDropdownRef.current &&
      !monthDropdownRef.current.contains(event.target)
    ) {
      setDownloadCenterMonthDropdownOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);
    

    // Save to localStorage
    useEffect(() => localStorage.setItem(STORAGE_KEYS.b2b, JSON.stringify(b2bRows)), [b2bRows]);
    useEffect(() => localStorage.setItem(STORAGE_KEYS.b2cLarge, JSON.stringify(b2cLargeRows)), [b2cLargeRows]);
    useEffect(() => localStorage.setItem(STORAGE_KEYS.b2cOthers, JSON.stringify(b2cOthersRows)), [b2cOthersRows]);
    useEffect(() => localStorage.setItem(STORAGE_KEYS.nilExempt, JSON.stringify(nilExemptRows)), [nilExemptRows]);
    useEffect(() => localStorage.setItem(STORAGE_KEYS.creditDebitRegistered, JSON.stringify(creditDebitRegisteredRows)), [creditDebitRegisteredRows]);
    useEffect(() => localStorage.setItem(STORAGE_KEYS.creditDebitUnregistered, JSON.stringify(creditDebitUnregisteredRows)), [creditDebitUnregisteredRows]);
    useEffect(() => localStorage.setItem(STORAGE_KEYS.advanceLiability, JSON.stringify(advanceLiabilityRows)), [advanceLiabilityRows]);
    useEffect(() => localStorage.setItem(STORAGE_KEYS.advanceAdjustment, JSON.stringify(advanceAdjustmentRows)), [advanceAdjustmentRows]);
    useEffect(() => localStorage.setItem(STORAGE_KEYS.hsn, JSON.stringify(hsnRows)), [hsnRows]);
    useEffect(() => localStorage.setItem(STORAGE_KEYS.documents, JSON.stringify(documentsRows)), [documentsRows]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.ecoRows, JSON.stringify(ecoRows)), [ecoRows]);
  
    useEffect(() => localStorage.setItem(STORAGE_KEYS.summaryTotals, JSON.stringify(summaryTotals)), [summaryTotals]);
    useEffect(() => {
  localStorage.setItem(
    STORAGE_KEYS.gstr3bSavedSummary,
    JSON.stringify(gstr3bSavedSummary)
  );
}, [gstr3bSavedSummary]);
    useEffect(() => {
      localStorage.setItem(STORAGE_KEYS.outward, JSON.stringify(outwardSupplies));
    }, [outwardSupplies]);
    useEffect(() => {
  localStorage.setItem(STORAGE_KEYS.ecoSupplies, JSON.stringify(ecoSupplies));
}, [ecoSupplies]);
    useEffect(() => {
  localStorage.setItem(
    STORAGE_KEYS.interstateUnregistered,
    JSON.stringify(unregisteredSupplies)
  );
}, [unregisteredSupplies]);

useEffect(() => {
  localStorage.setItem(
    STORAGE_KEYS.interstateComposition,
    JSON.stringify(compositionSupplies)
  );
}, [compositionSupplies]);

useEffect(() => {
  localStorage.setItem(
    STORAGE_KEYS.interstateUin,
    JSON.stringify(uinSupplies)
  );
}, [uinSupplies]);
    useEffect(() => {
      localStorage.setItem(STORAGE_KEYS.itc, JSON.stringify(itcDetails));
    }, [itcDetails]);
    useEffect(() => {
      localStorage.setItem(STORAGE_KEYS.exempt, JSON.stringify(exemptNonGst));
    }, [exemptNonGst]);
    useEffect(() => {
      localStorage.setItem(STORAGE_KEYS.interestLateFee, JSON.stringify(interestLateFee));
    }, [interestLateFee]);
    const years = Array.from({ length: 9 }, (_, i) => 2025 - i).map(y => `${y}-${String(y + 1).slice(-2)}`);
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    // GSTR-1 sections (normal case - non-amendment)
    const gstr1Sections = [
      "1 - 4A, 4B, 6B, 6C - B2B, SEZ, DE Invoices",
      "2 - B2C (Large) Invoices",
      "3 - Exports Invoices",
      "4 - B2C (Others)",
      "5 - 8B, 8C, 8D - Nil Rated Supplies",
      "6 - 9B  Credit / Debit Notes (Registered)",
      "7 - 9B  Credit / Debit Notes (Unregistered)",
      "8 - 11A(1), 11A(2) - Tax Liability (Advances Received)",
      "9 - 11B Adjustment of Advances",
      "12 - HSN-wise summary of outward supplies",
      "13 - Documents Issued",
      "15 - Supplies U/s 9(5)",
      "18 - ECO B2B",
      "19 - ECO URP B2B",
      "20 - ECO B2C",
      "21 - ECO URP B2C",
    ];
    // Amendment sections (shown separately)
    const gstr1AmendmentSections = [
      "14 - Supplies made through ECO",
      "16 - B2B Amendment",
      "17 - Export Amendment",
      "22 - ECO Amendment B2B",
      "23 - ECO Amendment B2C",
      "24 - ECO Amendment URP B2B",
      "25 - B2BA",
      "26 - B2CLA",
      "27 - CDNRA",
      "28 - CDNURA",
      "29 - ECO URP2C Amendment",
      "30 - Amended Tax Liability",
      "31 - B2C (Small) Amendment",
      "32 - Advance Received Amendment",
      "33 - Advance Adjustment Amendment",
      "34 - Supply through ECO Amendment"
    ];
    // GSTR-3B ke 6 options
    const gstr3bSections = [
      "tax on outward supplies & reverse charge inward",
      "Supplies notified u/s 9(5) of the CGST Act 2017",
      "Inter State Supplies",
      "Eligible ITC",
      "Exempt , Nil Rated and Non - Gst Supplies",
      "Intrest and Late fee For Previous Tax Period",
      "Payment of tax "
    ];
    
  const isGSTR3B = title.toUpperCase().includes("3B");
  const isGSTR1A = title.toUpperCase().includes("1A");
  const isITC04 = title.toUpperCase().includes("ITC-04");
const isTDSTCS = title.toUpperCase().includes("TDS/TCS");
const tdsTcsSections = ["Download", "Upload", "TDS/TCS Filing"];
const isReports = title.toUpperCase().includes("REPORTS");

const itc04Sections = ["Table 4", "Table 5(A)", "Table 5(B)", "Table 5(C)"];
const isDownloadCenter = title.toUpperCase().includes("DOWNLOAD CENTER");

const stateOptions = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];

const currentSections = isGSTR3B
  ? gstr3bSections
  : isITC04
    ? itc04Sections
    : gstr1Sections;

const canSelect = selectedYear && selectedMonth;


const toggleDownloadMonth = (month) => {
  setSelectedDownloadMonths((prev) =>
    prev.includes(month)
      ? prev.filter((m) => m !== month)
      : [...prev, month]
  );
};

const toggleDownloadOption = (option) => {
  setSelectedDownloadOptions((prev) =>
    prev.includes(option)
      ? prev.filter((item) => item !== option)
      : [...prev, option]
  );
};

const handleDownloadCenterSelectAll = () => {
  if (downloadCenterSelectAll) {
    setSelectedDownloadOptions([]);
  } else {
    setSelectedDownloadOptions(downloadCenterOptions);
  }
  setDownloadCenterSelectAll(!downloadCenterSelectAll);
};

const handleDownloadCenterCancel = () => {
  setDownloadCenterYear("");
  setSelectedDownloadMonths([]);
  setSelectedDownloadOptions([]);
  setDownloadCenterSelectAll(false);
  setDownloadCenterMonthDropdownOpen(false);
  
};
const handleCancelAll = () => {
  setSelectedDownloadOptions([]);
  setSelectedDownloadMonths([]);
};

const handleDownloadCenterDownload = () => {
  toast.success("Download Center request submitted successfully!");
};
useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      monthDropdownRef.current &&
      !monthDropdownRef.current.contains(event.target)
    ) {
      setDownloadCenterMonthDropdownOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);


const reportTabs = ["Summary", "Compare", "Annual", "PDF Reports"];

const summaryReports = [
  "GSTR-3B Summary",
  "GSTR-1 Summary",
  "GSTR-1A Summary",
  "GSTR-2A Summary",
  "GSTR-2B Summary",
  "GSTR Consolidated Reports",
  "GSTR-3B All Table Details",
  "GSTR-1 Financial Year Invoice Dates",
  "GSTR-2B Invoice Date in Next FY"
];



const compareReports = [
  "GSTR-2 vs GSTR-2A",
  "GSTR-2 vs GSTR-2A (Party Wise)",
  "GSTR-2 vs GSTR-2B",
  "GSTR-2 vs GSTR-2B (Party Wise)",
  "GSTR-2A vs GSTR-3B (ITC)",
  "GSTR-2B vs GSTR-3B (ITC)",
  "GSTR-3B vs GSTR-1",
  "Tax Compare Report",
  "GSTR-9 Compare Report",
  "GSTR-3B vs TDS/TCS"
];

const annualReports = [
  // ── Inward Supply Related Reports ──
  "GSTR-2 Annual Report",
  "GSTR-2A Annual Report",
  "GSTR-2A Annual Report (Party Wise)",
  "GSTR-2A Annual Report (Rate Wise)",
  "GSTR-2B Annual Reports",
  "GSTR-2B Annual Report (Party Wise)",
  "GSTR-2B Annual Report (Rate Wise)",
  "Rate Wise Reports (Inward)",
  "GSTR-2B ITC Reclaim Reports",
  // ── Outward Supply Related Reports ──
  "GSTR-1 Annual Report",
  "GSTR-1A Annual Report",
  "Rate Wise Reports (Outward)",
  "GSTR-3B Monthly Yearly Report",
  // ── Other Reports ──
  "Interest and Late Fee Report",
  "Rate Wise Reports (Outward & Inward)",
  "Trading Report",
  "TDSTCS Annual Report",
  "Tax Liability and ITC Summary",
  "Electronic Credit/Cash Ledger",
];

const PDFReports = [
  "GSTR-1 Return Filed-PDF",
  "GSTR-3B Return Filed-PDF",
  "TDS & TCS credit Received-PDF",
  "GSTR-9 Return filed-PDF",
  "GSTR-9C Return Filed- PDF"
];


const getCurrentReportList = () => {
  switch (activeReportTab) {
    case "Summary":
      return summaryReports;
    case "Compare":
      return compareReports;
    case "Annual":
      return annualReports;
    case "PDF Reports":
      return PDFReports;
    case "Notice/Order":
      return NoticeOrderReports;
    default:
      return [];
  }
};

const REPORT_FILE_MAP = {
  // =========================
  // Summary
  // =========================
  "GSTR-3B Summary": {
    url: "/GSTR-3B%20Summary%20(1).xlsx",
    downloadName: "GSTR-3B Summary (1).xlsx",
  },
  "GSTR-1 Summary": {
    url: "/GSTR-1%20Summary.xlsx",
    downloadName: "GSTR-1 Summary.xlsx",
  },
  "GSTR-1A Summary": {
    url: "/GSTR-1A%20Summary.xlsx",
    downloadName: "GSTR-1A Summary.xlsx",
  },
  "GSTR-2A Summary": {
    url: "/GSTR-2A%20Summary.xlsx",
    downloadName: "GSTR-2A Summary.xlsx",
  },
  "GSTR-2B Summary": {
    url: "/GSTR-2B%20Summary.xlsx",
    downloadName: "GSTR-2B Summary.xlsx",
  },
  "GSTR Consolidated Reports": {
    url: "/CONSOLIDATED%20SUMMARY%20(1-1A-2A-2B-3B).xlsx",
    downloadName: "CONSOLIDATED SUMMARY (1-1A-2A-2B-3B).xlsx",
  },
  "GSTR-3B All Table Details": {
    url: "/GSTR-3B%20All%20Table%20Details.xlsx",
    downloadName: "GSTR-3B All Table Details.xlsx",
  },

  // =========================
  // Compare
  // =========================
  "GSTR-2 vs GSTR-2A": {
    url: "/GSTR-2%20VS%20GSTR-2A%20(Invoice%20Wise).xlsx",
    downloadName: "GSTR-2 VS GSTR-2A (Invoice Wise).xlsx",
  },
  "GSTR-2 vs GSTR-2A (Party Wise)": {
    url: "/GSTR-2%20VS%20GSTR-2A%20(Party%20Wise).xlsx",
    downloadName: "GSTR-2 VS GSTR-2A (Party Wise).xlsx",
  },
  "GSTR-2 vs GSTR-2B": {
    url: "/GSTR-2%20VS%20GSTR-2B%20(Invoice%20Wise).xlsx",
    downloadName: "GSTR-2 VS GSTR-2B (Invoice Wise).xlsx",
  },
  "GSTR-2 vs GSTR-2B (Party Wise)": {
    url: "/GSTR-2%20VS%20GSTR-2B%20(Party%20Wise).xlsx",
    downloadName: "GSTR-2 VS GSTR-2B (Party Wise).xlsx",
  },
  "GSTR-2A vs GSTR-3B (ITC)": {
    url: "/GSTR-2A%20vs%20GSTR-3B.xlsx",
    downloadName: "GSTR-2A vs GSTR-3B.xlsx",
  },
  "GSTR-2B vs GSTR-3B (ITC)": {
    url: "/GSTR-2B%20vs%20GSTR-3B.xlsx",
    downloadName: "GSTR-2B vs GSTR-3B.xlsx",
  },
  "GSTR-3B vs GSTR-1": {
    url: "/GSTR-3B%20vs%20GSTR-1.xlsx",
    downloadName: "GSTR-3B vs GSTR-1.xlsx",
  },
"Tax Compare Report": {
  url: "/TAX%20COMPARE%20REPORT.xlsx",
  downloadName: "TAX COMPARE REPORT.xlsx",
},
  "GSTR-9 Compare Report": {
    url: "/GSTR-9%20Compare%20Report.xlsx",
    downloadName: "GSTR-9 Compare Report.xlsx",
  },
  "GSTR-3B vs TDS/TCS": {
    url: "/GSTR3B%20vs%20TDS-TCS.xlsx",
    downloadName: "GSTR3B vs TDS-TCS.xlsx",
  },
  "GSTR-2 Annual Report": {
  url: "/GSTR-2%20Annual%20Report.xlsx",
  downloadName: "GSTR-2 Annual Report.xlsx",
},


"GSTR-2A Annual Report": {
  url: "/GSTR-2A%20Annual%20Report.xlsx",
  downloadName: "GSTR-2A Annual Report.xlsx",
},

"GSTR-2B Annual Reports": {
  url: "/GSTR-2B%20Annual%20Reports.xlsx",
  downloadName: "GSTR-2B Annual Reports.xlsx",
},

"GSTR-1 Annual Report": {
  url: "/GSTR-1%20Annual%20Report.xlsx",
  downloadName: "GSTR-1 Annual Report.xlsx",
},
"GSTR-1A Annual Report": {
  url: "/GSTR-1A%20Annual%20Report.xlsx",
  downloadName: "GSTR-1A Annual Report.xlsx",
},
"Rate Wise Reports (Inward)": {
  url: "/Rate%20Wise%20Reports.xlsx",
  downloadName: "Rate Wise Reports.xlsx",
},

"Interest and Late Fee Report": {
  url: "/Interest%20and%20Late%20Fee%20Report.xlsx",
  downloadName: "Interest and Late Fee Report.xlsx",
},


"Trading Report": {
  url: "/Trading%20Report.xlsx",
  downloadName: "Trading Report.xlsx",
},

"GSTR-2A Annual Report (Party Wise)": {
  url: "/GSTR-2A%20Annual%20Report%20(Party%20Wise).xlsx",
  downloadName: "GSTR-2A Annual Report (Party Wise).xlsx",
},

"GSTR-2A Annual Report (Rate Wise)": {
  url: "/GSTR-2A%20Annual%20Report%20(Rate%20Wise).xlsx",
  downloadName: "GSTR-2A Annual Report (Rate Wise).xlsx",
},

"GSTR-2B Annual Report (Party Wise)": {
  url: "/GSTR-2B%20Annual%20Report%20(Party%20Wise).xlsx",
  downloadName: "GSTR-2B Annual Report (Party Wise).xlsx",
},

"GSTR-2B Annual Report (Rate Wise)": {
  url: "/GSTR-2B%20Annual%20Report%20(Rate%20Wise).xlsx",
  downloadName: "GSTR-2B Annual Report (Rate Wise).xlsx",
},

"Rate Wise Reports (Outward & Inward)": {
  url: "/Rate%20Wise%20Reports%20(Outward%20%26%20Inward).xlsx",
  downloadName: "Rate Wise Reports (Outward & Inward).xlsx",
},

"Tax Liability and ITC Summary": {
  url: "/Tax%20Liability%20and%20ITC%20Summary.xlsx",
  downloadName: "Tax Liability and ITC Summary.xlsx",
},

"GSTR-1 Annual Report": {
  url: "/GSTR-1%20Annual%20Report.xlsx",
  downloadName: "GSTR-1 Annual Report.xlsx",
},

"GSTR-2B ITC Reclaim Reports": {
  url: "/GSTR-2B%20ITC%20Reclaim%20Reports.xlsx",
  downloadName: "GSTR-2B ITC Reclaim Reports.xlsx",
},
"Rate Wise Reports (Outward)": {
  url: "/Rate%20Wise%20Reports%20(Outward).xlsx",
  downloadName: "Rate Wise Reports (Outward).xlsx",
},
"GSTR-2B ITC Reclaim Reports": {
  url: "/GSTR-2B%20ITC%20Reclaim%20Reports.xlsx",
  downloadName: "GSTR-2B ITC Reclaim Reports.xlsx",
},
"TDSTCS Annual Report": {
  url: "/TDSTCS%20Annual%20Report.xlsx",
  downloadName: "TDSTCS Annual Report.xlsx",
},



"Electronic Credit/Cash Ledger": {
  url: "/Electronic%20CreditCash%20Ledger.xlsx",
  downloadName: "Electronic Credit/Cash Ledger.xlsx",
},

"GSTR-3B Monthly Yearly Report": {
  url: "/GSTR-3B%20Monthly%20Yearly%20Report.xlsx",
  downloadName: "GSTR-3B Monthly Yearly Report.xlsx",
},
"GSTR-3B Return Filed-PDF": {
  url: "/gstr3b-return.pdf",
  downloadName: "GSTR-3B Return Filed-PDF.pdf",
},

"GSTR-1 Return Filed-PDF": {
  url: "/gstr1-return.pdf",
  downloadName: "GSTR-1 Return Filed-PDF.pdf",
},

"TDS & TCS credit Received-PDF": {
  url: "/TDS & TCS credit Received-PDF.pdf",
  downloadName: "TDS & TCS credit Received-PDF.pdf",
},
"GSTR-9 Return filed-PDF": {
  url: "/gstr9-return.pdf",
  downloadName: "GSTR-9 Return filed-PDF.pdf",
},
"GSTR-9C Return Filed- PDF": {
  url: "/gstr9c-return.pdf",
  downloadName: "GSTR-9C Return Filed-PDF.pdf",
},
};

const removeBrokenValidations = (ws) => {
  try {
    const sheetName = (ws.name || "").toLowerCase().trim();

    // Only target the broken sheet(s)
    if (
      sheetName === "gstr-2b amended summary" ||
      sheetName === "gstr-2b summary"
    ) {
      console.log(`🧹 Removing broken data validations from ${ws.name}`);

      // ExcelJS runtime object
      if (ws.dataValidations) {
        if (Array.isArray(ws.dataValidations.model)) {
          ws.dataValidations.model = [];
        }

        if (ws.dataValidations.model && typeof ws.dataValidations.model === "object") {
          ws.dataValidations.model = [];
        }
      }

      // Worksheet model
      if (ws.model && ws.model.dataValidations) {
        if (Array.isArray(ws.model.dataValidations.model)) {
          ws.model.dataValidations.model = [];
        } else {
          ws.model.dataValidations = { model: [] };
        }
      }

      // Extra hard cleanup for some ExcelJS versions
      if (ws._model && ws._model.dataValidations) {
        if (Array.isArray(ws._model.dataValidations.model)) {
          ws._model.dataValidations.model = [];
        } else {
          ws._model.dataValidations = { model: [] };
        }
      }

      console.log(`✅ Broken validations removed from ${ws.name}`);
    }
  } catch (err) {
    console.warn(`⚠ Failed removing validations from ${ws.name}`, err);
  }
};





const trimProblematicTemplate = (ws, reportName) => {
  try {
    if (!ws) return;

    // remove very wide merges that go till XFD
    const badMergeRefs = [];
    if (ws.model?.merges) {
      ws.model.merges.forEach((ref) => {
        if (String(ref).includes("XFD")) {
          badMergeRefs.push(ref);
        }
      });
    }

    badMergeRefs.forEach((ref) => {
      try {
        ws.unMergeCells(ref);
      } catch (e) {
        // ignore
      }
    });

    if (ws.model?.merges) {
      ws.model.merges = ws.model.merges.filter(
        (ref) => !String(ref).includes("XFD")
      );
    }

    if (ws._merges) {
      Object.keys(ws._merges).forEach((key) => {
        if (String(key).includes("XFD")) {
          delete ws._merges[key];
        }
      });
    }

    // trim hidden/fake columns after actual visible area
    let maxAllowedCol = 20;

    if (reportName === "GSTR-2A vs GSTR-3B (ITC)") {
      maxAllowedCol = 13; // A:M
    }

    if (reportName === "GSTR-2B vs GSTR-3B (ITC)") {
      maxAllowedCol = 16; // A:P
    }

    if (ws.model?.cols) {
      ws.model.cols = ws.model.cols
        .filter((c) => Number(c.min) <= maxAllowedCol)
        .map((c) => ({
          ...c,
          max: Math.min(Number(c.max), maxAllowedCol),
        }));
    }

    if (ws._columns && ws._columns.length > maxAllowedCol) {
      ws._columns = ws._columns.slice(0, maxAllowedCol);
    }

    // re-add only valid visible merges
    if (reportName === "GSTR-2A vs GSTR-3B (ITC)") {
      try { ws.mergeCells("A5:M5"); } catch(e) {}
    }

    if (reportName === "GSTR-2B vs GSTR-3B (ITC)") {
      try { ws.mergeCells("D3:P3"); } catch(e) {}
    }

  } catch (err) {
    console.error("❌ trimProblematicTemplate error:", err);
  }
};

const hardSanitizeTaxCompareWorksheet = (ws) => {
  try {
    if (!ws) return;

    const MAX_COL = 7; // A:G only

    // 1) remove data validations fully
    if (ws.dataValidations) {
      ws.dataValidations.model = [];
    }
    if (ws.model?.dataValidations) {
      ws.model.dataValidations = { model: [] };
    }
    if (ws._model?.dataValidations) {
      ws._model.dataValidations = { model: [] };
    }

    // 2) remove merges containing XFD
    if (Array.isArray(ws.model?.merges)) {
      ws.model.merges = ws.model.merges.filter(
        (ref) => !String(ref).includes("XFD")
      );
    }

    if (ws._merges) {
      Object.keys(ws._merges).forEach((key) => {
        if (String(key).includes("XFD")) {
          delete ws._merges[key];
        }
      });
    }

    // 3) trim columns metadata
    if (Array.isArray(ws.model?.cols)) {
      ws.model.cols = ws.model.cols
        .filter((c) => Number(c.min) <= MAX_COL)
        .map((c) => ({
          ...c,
          min: Math.min(Number(c.min), MAX_COL),
          max: Math.min(Number(c.max), MAX_COL),
        }));
    }

    if (Array.isArray(ws._columns) && ws._columns.length > MAX_COL) {
      ws._columns = ws._columns.slice(0, MAX_COL);
    }

    // 4) trim row cell arrays beyond G
    if (Array.isArray(ws._rows)) {
      ws._rows.forEach((row) => {
        if (!row) return;

        if (Array.isArray(row.values) && row.values.length > MAX_COL + 1) {
          row.values = row.values.slice(0, MAX_COL + 1);
        }

        if (Array.isArray(row._cells) && row._cells.length > MAX_COL) {
          row._cells = row._cells.slice(0, MAX_COL);
        }

        if (row.model && Array.isArray(row.model.cells) && row.model.cells.length > MAX_COL) {
          row.model.cells = row.model.cells.slice(0, MAX_COL);
        }
      });
    }

    // 5) trim worksheet dimensions
    if (ws.model) {
      ws.model.dimensions = {
        top: 1,
        left: 1,
        bottom: Math.max(ws.rowCount || 10, 10),
        right: MAX_COL,
      };
    }

    // 6) safety cleanup for views / autoFilter
    if (ws.model?.autoFilter) {
      const ref = String(ws.model.autoFilter);
      if (ref.includes("XFD")) {
        delete ws.model.autoFilter;
      }
    }

    console.log(`✅ Hard sanitized: ${ws.name}`);
  } catch (err) {
    console.error(`❌ hardSanitizeTaxCompareWorksheet failed for ${ws?.name}`, err);
  }
};
const handleDownload = async (reportName) => {
  
  console.log("reportName received:", reportName);
  console.log("Is PDF?", ["gstr1-return", "gstr3b-return", "tds-tcs-credit"].includes(reportName));
  
  try {
    const file = REPORT_FILE_MAP[reportName];
    if (!file) {
      alert("Invalid report");
      return;
    }

    // ==================== PDF DIRECT DOWNLOAD ====================
    const PDF_REPORTS = [
  "GSTR-1 Return Filed-PDF",
  "GSTR-3B Return Filed-PDF",   // use exact name you have in your map
  "TDS & TCS Credit Received-PDF" // use exact name you have in your map
];

    // PDF_REPORTS array ki zaroorat nahi
if (file.url.endsWith(".pdf")) {
  const response = await fetch(file.url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`PDF not found at: ${file.url}`);
  }
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = file.downloadName || file.url.split("/").pop();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  return;
}

    // ==================== EXCEL REPORTS (only runs if NOT a PDF) ====================
    const response2 = await fetch(file.url, { cache: "no-store" });
    if (!response2.ok) throw new Error(`File not found: ${file.url}`);

    const arrayBuffer = await response2.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer); // ← This was receiving a PDF before
    
    // ... rest of your Excel logic

 
    // =========================
    // 🔥 GLOBAL CLEANUP
    // =========================
    workbook.worksheets.forEach((ws) => {
      try {
        console.log("🧹 Cleaning sheet:", ws.name);

        if (ws.model?.merges) {
          ws.model.merges = ws.model.merges.filter(
            (ref) => !String(ref).includes("XFD")
          );
        }
        if (ws._merges) {
          Object.keys(ws._merges).forEach((key) => {
            if (key.includes("XFD")) delete ws._merges[key];
          });
        }

        if (ws.dataValidations) ws.dataValidations.model = [];
        if (ws.model?.dataValidations) ws.model.dataValidations = { model: [] };
        if (ws._model?.dataValidations) ws._model.dataValidations = { model: [] };

        if (ws.model?.autoFilter) delete ws.model.autoFilter;

        const MAX_COL = 50;
        if (ws._columns && ws._columns.length > MAX_COL) {
          ws._columns = ws._columns.slice(0, MAX_COL);
        }
        if (ws.model?.cols) {
          ws.model.cols = ws.model.cols.filter(c => c.min <= MAX_COL);
        }

        ws.eachRow((row) => {
          if (row.values.length > MAX_COL + 1) {
            row.values = row.values.slice(0, MAX_COL + 1);
          }
        });

      } catch (err) {
        console.warn("Cleanup failed:", ws.name);
      }
    });

    

    if (reportName === "GSTR-1 Summary") {
      const ws = workbook.getWorksheet("GSTR-1 Summary");

      ws.getCell("B8").value = 10;
      ws.getCell("B9").value = 50000;
      ws.getCell("B10").value = 9000;
      ws.getCell("B11").value = 4500;
      ws.getCell("B12").value = 4500;
      ws.getCell("B13").value = 500;
    }

    // =========================
    // GSTR-1A Summary
    // =========================
    if (reportName === "GSTR-1A Summary") {
      const ws = workbook.getWorksheet("GSTR-1A Summary");

      ws.getCell("B8").value = 12;
      ws.getCell("B9").value = 65000;
      ws.getCell("B10").value = 11700;
      ws.getCell("B11").value = 5850;
      ws.getCell("B12").value = 5850;
      ws.getCell("B13").value = 650;
    }
    

    if (reportName === "GSTR-2A Summary") {
  console.log("Filling GSTR-2A Summary");

  const ws = workbook.worksheets.find(s =>
    s.name.includes("2A Summary")
  );

  if (!ws) {
    console.error("Sheet not found!", workbook.worksheets.map(s => s.name));
    return;
  }

  ws.getCell("B8").value = 10;
  ws.getCell("B9").value = 50000;
  ws.getCell("B10").value = 9000;
  ws.getCell("B11").value = 4500;
  ws.getCell("B12").value = 4500;
  ws.getCell("B13").value = 500;
}
if (reportName === "GSTR Consolidated Reports") {
  console.log("✅ Filling Consolidated Report");

  const summaryData = {
    gstr1:  { b8: 10, b9: 50000, b10: 9000,  b11: 4500, b12: 4500, b13: 500 },
    gstr1a: { b8: 12, b9: 65000, b10: 11700, b11: 5850, b12: 5850, b13: 650 },
    gstr2a: { b8: 20, b9: 80000, b10: 14400, b11: 7200, b12: 7200, b13: 800 },
    gstr2b: { b8: 25, b9: 90000, b10: 16200, b11: 8100, b12: 8100, b13: 900 },
    gstr3b: { b8: 15, b9: 70000, b10: 12600, b11: 6300, b12: 6300, b13: 700 },
  };

  const fillRangeB8ToB13 = (ws, values) => {
    ws.getCell("B8").value  = values.b8 ?? "";
    ws.getCell("B9").value  = values.b9 ?? "";
    ws.getCell("B10").value = values.b10 ?? "";
    ws.getCell("B11").value = values.b11 ?? "";
    ws.getCell("B12").value = values.b12 ?? "";
    ws.getCell("B13").value = values.b13 ?? "";
  };

  const fillRangeB9ToB13 = (ws, values) => {
    ws.getCell("B9").value  = values.b9 ?? "";
    ws.getCell("B10").value = values.b10 ?? "";
    ws.getCell("B11").value = values.b11 ?? "";
    ws.getCell("B12").value = values.b12 ?? "";
    ws.getCell("B13").value = values.b13 ?? "";
  };

  const removeBrokenValidations = (ws) => {
    try {
      const sheetName = (ws.name || "").toLowerCase().trim();

      if (
        sheetName === "gstr-2b amended summary" ||
        sheetName === "gstr-2b summary"
      ) {
        console.log(`🧹 Removing broken data validations from ${ws.name}`);

        if (ws.dataValidations) {
          if (Array.isArray(ws.dataValidations.model)) {
            ws.dataValidations.model = [];
          } else {
            ws.dataValidations.model = [];
          }
        }

        if (ws.model && ws.model.dataValidations) {
          if (Array.isArray(ws.model.dataValidations.model)) {
            ws.model.dataValidations.model = [];
          } else {
            ws.model.dataValidations = { model: [] };
          }
        }

        if (ws._model && ws._model.dataValidations) {
          if (Array.isArray(ws._model.dataValidations.model)) {
            ws._model.dataValidations.model = [];
          } else {
            ws._model.dataValidations = { model: [] };
          }
        }

        console.log(`✅ Broken validations removed from ${ws.name}`);
      }
    } catch (err) {
      console.warn(`⚠ Failed removing validations from ${ws.name}`, err);
    }
  };

  workbook.worksheets.forEach((ws) => {
    const sheetName = (ws.name || "").toLowerCase().replace(/\s+/g, "");
    console.log("➡ Processing sheet:", ws.name);

    try {
      if (
        (sheetName.includes("gstr-1") || sheetName.includes("gstr1")) &&
        !sheetName.includes("1a")
      ) {
        fillRangeB8ToB13(ws, summaryData.gstr1);
      } else if (
        sheetName.includes("gstr-1a") ||
        sheetName.includes("gstr1a") ||
        sheetName.includes("1a")
      ) {
        fillRangeB8ToB13(ws, summaryData.gstr1a);
      } else if (
        (sheetName.includes("gstr-2a") || sheetName.includes("gstr2a") || sheetName.includes("2a")) &&
        !sheetName.includes("2b")
      ) {
        fillRangeB8ToB13(ws, summaryData.gstr2a);
      } else if (
        sheetName.includes("gstr-2b") ||
        sheetName.includes("gstr2b") ||
        sheetName.includes("2b")
      ) {
        fillRangeB8ToB13(ws, summaryData.gstr2b);
      } else if (
        sheetName.includes("gstr-3b") ||
        sheetName.includes("gstr3b") ||
        sheetName.includes("3b")
      ) {
        fillRangeB8ToB13(ws, summaryData.gstr3b);
      } else {
        fillRangeB9ToB13(ws, {
          b9: 50000,
          b10: 9000,
          b11: 4500,
          b12: 4500,
          b13: 500,
        });
      }

      // only remove broken validation metadata
      removeBrokenValidations(ws);

    } catch (err) {
      console.error("❌ Error while filling sheet:", ws.name, err);
    }
  });

  try {
    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob(
      [buffer],
      {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "GSTR Consolidated Reports.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    console.log("✅ Consolidated report downloaded successfully");
  } catch (err) {
    console.error("❌ Final writeBuffer failed:", err);
  }
};


// =========================
// 🔥 HARD REMOVE ALL FORMULAS (FIX SHARED FORMULA ERROR)
// =========================
workbook.worksheets.forEach((ws) => {
  try {
    ws.eachRow((row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {

        // 1. remove formula from value
        if (cell.value && typeof cell.value === "object") {
          if (cell.value.formula || cell.value.sharedFormula) {
            cell.value = null;
          }
        }

        // 2. remove from model (IMPORTANT)
        if (cell.model) {
          delete cell.model.formula;
          delete cell.model.sharedFormula;
          delete cell.model.result;
        }

      });
    });

    // 3. extra cleanup (internal model)
    if (ws.model?.rows) {
      ws.model.rows.forEach((r) => {
        if (r?.cells) {
          r.cells.forEach((c) => {
            if (c?.f) delete c.f;   // formula
            if (c?.si) delete c.si; // shared index
          });
        }
      });
    }

    console.log("🧹 FULL formula cleanup:", ws.name);

  } catch (err) {
    console.warn("Cleanup failed:", ws.name);
  }
});

    
    if (reportName === "GSTR-3B Summary") {
      const ws = workbook.worksheets[0];

      ws.getCell("B10").value = 50000;
      ws.getCell("C10").value = 75000;
      ws.getCell("B11").value = 9000;
      ws.getCell("B12").value = 4500;
      ws.getCell("B13").value = 4500;
    }


// =========================
// RATE WISE REPORT (STATIC DATA)
// =========================
if (reportName === "Rate Wise Reports (Inward)") {
  console.log("🔥 Filling Rate Wise Reports (Inward)");

  const ws = workbook.worksheets[0]; // usually first sheet

  if (!ws) {
    console.error("❌ Sheet not found");
    return;
  }

  // =========================
  // 🔥 DATA (Row 9–10)
  // =========================
  const block1 = [
    [50000, 9000, 4500, 4500, 0, 0, 0, 0, 0, 0, 0],   // row 9
    [75000, 13500, 6750, 6750, 0, 0, 0, 0, 0, 0, 0], // row 10
  ];

  const cols = ["B","C","D","E","F","G","H","I","J","K","L"];

  block1.forEach((rowData, i) => {
    const row = 9 + i;

    rowData.forEach((value, j) => {
      ws.getCell(`${cols[j]}${row}`).value = value;
    });
  });

  // =========================
  // 🔥 DATA (Row 25–26)
  // =========================
  const block2 = [
    [60000, 10800, 5400, 5400, 0, 0, 0, 0, 0, 0, 0], // row 25
    [82000, 14760, 7380, 7380, 0, 0, 0, 0, 0, 0, 0], // row 26
  ];

  block2.forEach((rowData, i) => {
    const row = 25 + i;

    rowData.forEach((value, j) => {
      ws.getCell(`${cols[j]}${row}`).value = value;
    });
  });

  console.log("✅ Rate Wise data filled");
}


if (reportName === "GSTR-3B Monthly Yearly Report") {
  console.log("🔥 Filling GSTR-3B Monthly Yearly Report");

  const ws = workbook.worksheets[0]; // usually first sheet

  if (!ws) {
    console.error("❌ Sheet not found");
    return;
  }

  // =========================
  // 🔥 DATA (Row 9–10)
  // =========================
  const block1 = [
    [50000, 9000, 4500, 4500, 0, 0, 0, 0, 0, 0, 0],   // row 9
    [75000, 13500, 6750, 6750, 0, 0, 0, 0, 0, 0, 0], // row 10
  ];

  const cols = ["B","C","D","E","F","G","H","I","J","K","L"];

  block1.forEach((rowData, i) => {
    const row = 9 + i;

    rowData.forEach((value, j) => {
      ws.getCell(`${cols[j]}${row}`).value = value;
    });
  });

  // =========================
  // 🔥 DATA (Row 25–26)
  // =========================
  const block2 = [
    [60000, 10800, 5400, 5400, 0, 0, 0, 0, 0, 0, 0], // row 25
    [82000, 14760, 7380, 7380, 0, 0, 0, 0, 0, 0, 0], // row 26
  ];

  block2.forEach((rowData, i) => {
    const row = 25 + i;

    rowData.forEach((value, j) => {
      ws.getCell(`${cols[j]}${row}`).value = value;
    });
  });

  console.log("✅ GSTR-3B Monthly Yearly Report data filled");
}


if (reportName === "Electronic Credit/Cash Ledger") {
  console.log("🔥 Filling Electronic Credit/Cash Ledger - Original Structure");

  // Load the workbook (already done above, but ensuring)
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  // Find correct sheet - IMPORTANT
  let ws = workbook.getWorksheet("Cash Ledger") || 
           workbook.getWorksheet("ITC Ledger") || 
           workbook.getWorksheet("Home") || 
           workbook.worksheets[0];

  if (!ws) {
    console.error("❌ Sheet not found");
    alert("Sheet not found in Electronic Credit/Cash Ledger");
    return;
  }

  console.log(`✅ Working on sheet: ${ws.name}`);

  // === HARD CLEANUP (Only cleanup, don't destroy structure) ===
  try {
    if (ws.dataValidations) ws.dataValidations.model = [];
    if (ws.model?.dataValidations) ws.model.dataValidations = { model: [] };

    if (ws.model?.merges) {
      ws.model.merges = ws.model.merges.filter(ref => !String(ref).includes("XFD"));
    }
  } catch (e) {
    console.warn("Cleanup warning:", e);
  }

  // =========================
  // STATIC DATA - A to H (as you asked)
  // =========================
  const cols = ["A", "B", "C", "D", "E", "F", "G", "H"];

  // Change these values as per your need
  const dataToFill = [
    // Row 8 (or change row number)
    ["Apr-2025", "Opening Balance", 50000, 9000, 4500, 0, 50000, 68000],
    ["Apr-2025", "ITC Credit",      20000, 3600, 1800, 0, 20000, 27200],
    ["May-2025", "Opening Balance", 70000, 12600, 6300, 0, 70000, 95200],
    ["May-2025", "Debit",           15000, 2700, 1350, 0, 15000, 20400],
  ];

  let startRow = 8;     // ← Change this if you want data in different rows

  dataToFill.forEach((rowData, i) => {
    const rowNumber = startRow + i;
    rowData.forEach((value, colIndex) => {
      ws.getCell(`${cols[colIndex]}${rowNumber}`).value = value;
    });
  });

  console.log("✅ Static data filled in columns A-H successfully");
}

if (reportName === "TDSTCS Annual Report") {
  console.log("🔥 Filling TDSTCS Annual Report");

  const ws = workbook.worksheets[0]; // already loaded workbook

  if (!ws) {
    console.error("❌ Sheet not found");
    return;
  }

  // =========================
  // ✅ STATIC DATA (A → H, Row 1 & 2)
  // =========================

  const cols = ["A","B","C","D","E","F","G","H"];

  const data = [
    // Row 1
    ["TCS", "Oct-2025", "09AARCM9332R1CM", "Oct-2025", "MEESHO", 50000, 9000, 4500],
    
    // Row 2
    ["TCS", "Nov-2025", "09AARCM9332R1CM", "Nov-2025", "MEESHO", 60000, 10800, 5400],
  ];

  data.forEach((rowData, i) => {
    const row = 1 + i;

    rowData.forEach((value, j) => {
      ws.getCell(`${cols[j]}${row}`).value = value;
    });
  });

  console.log("✅ TDSTCS data filled (A:H, Row 1-2)");
}
    // =========================
// GSTR-2A ANNUAL REPORT (B2B STATIC DATA)
// =========================
if (reportName === "GSTR-2A Annual Report") {
  console.log("🔥 Filling GSTR-2A Annual Report");

  // 🔍 find B2B sheet (flexible name)
  const ws = workbook.worksheets.find(sheet =>
    sheet.name.toLowerCase().includes("b2b")
  );

  if (!ws) {
    console.error("❌ B2B sheet not found", workbook.worksheets.map(s => s.name));
    return;
  }

  // =========================
  // 🔥 STATIC DATA (6-7 rows)
  // =========================
  const data = [
    { gstin: "09ABCDE1234F1Z5", party: "ABC Traders", invoice: "INV001" },
    { gstin: "09XYZDE5678K2Z6", party: "XYZ Enterprises", invoice: "INV002" },
    { gstin: "09LMNOP7890Q1Z2", party: "LMN Pvt Ltd", invoice: "INV003" },
    { gstin: "09QWERT5678U2Z3", party: "QWER Industries", invoice: "INV004" },
    { gstin: "09ASDFG1234H3Z4", party: "ASDF Suppliers", invoice: "INV005" },
    { gstin: "09ZXCVB9876J4Z5", party: "ZXCV Traders", invoice: "INV006" },
    { gstin: "09POIUY6543K5Z6", party: "POIUY Corp", invoice: "INV007" }
  ];

  let startRow = 9; // B2B normally starts from row 9

  data.forEach((item, i) => {
    const r = startRow + i;

    // A column → GSTIN
    ws.getCell(`A${r}`).value = item.gstin;

    // B column → Party Name
    ws.getCell(`B${r}`).value = item.party;

    // D column → Invoice Number
    ws.getCell(`D${r}`).value = item.invoice;
  });

  console.log("✅ GSTR-2A B2B data filled");
}


// =========================
// INTEREST & LATE FEE REPORT
// =========================
if (reportName === "Interest and Late Fee Report") {
  console.log("🔥 Filling Interest and Late Fee Report");

  const ws = workbook.worksheets[0];

  if (!ws) {
    console.error("❌ Sheet not found");
    return;
  }

  // =========================
  // 🔥 SAFE START ROW (header ke neeche)
  // =========================
  const startRow = 9;

  // Columns B → I
  const cols = ["B","C","D","E","F","G","H","I"];

  // =========================
  // 🔥 STATIC DATA (Row 9–10)
  // =========================
  const data = [
    // Row 9
    [
      "Apr-2024",   // B (Month)
      50000,        // C (Taxable)
      9000,         // D (IGST)
      4500,         // E (CGST)
      4500,         // F (SGST)
      200,          // G (Interest)
      100,          // H (Late Fee)
      300           // I (Total)
    ],
    // Row 10
    [
      "May-2024",
      75000,
      13500,
      6750,
      6750,
      350,
      150,
      500
    ]
  ];

  // =========================
  // 🔥 FILL DATA
  // =========================
  data.forEach((rowData, i) => {
    const row = startRow + i;

    rowData.forEach((value, j) => {
      ws.getCell(`${cols[j]}${row}`).value = value;
    });
  });

  console.log("✅ Interest & Late Fee data filled");
}

// =========================
// GSTR-1A ANNUAL REPORT (B2B STATIC DATA)
// =========================
if (reportName === "GSTR-1A Annual Report") {
  console.log("🔥 Filling GSTR-1A Annual Report");

  // 🔍 find B2B sheet
  const ws = workbook.worksheets.find(sheet =>
    sheet.name.toLowerCase().includes("b2b")
  );

  if (!ws) {
    console.error("❌ B2B sheet not found", workbook.worksheets.map(s => s.name));
    return;
  }

  // =========================
  // 🔥 STATIC DATA (7 rows)
  // =========================
  const data = [
    {
      gstin: "09AAAAA1111A1Z1",
      party: "Sharma Traders",
      invoice: "AMEND001",
      taxable: 52000,
      igst: 9360,
      cgst: 4680,
      sgst: 4680
    },
    {
      gstin: "09BBBBB2222B2Z2",
      party: "Verma Enterprises",
      invoice: "AMEND002",
      taxable: 78000,
      igst: 14040,
      cgst: 7020,
      sgst: 7020
    },
    {
      gstin: "09CCCCC3333C3Z3",
      party: "Gupta Industries",
      invoice: "AMEND003",
      taxable: 60000,
      igst: 10800,
      cgst: 5400,
      sgst: 5400
    },
    {
      gstin: "09DDDDD4444D4Z4",
      party: "Kumar & Co",
      invoice: "AMEND004",
      taxable: 91000,
      igst: 16380,
      cgst: 8190,
      sgst: 8190
    },
    {
      gstin: "09EEEEE5555E5Z5",
      party: "Agarwal Pvt Ltd",
      invoice: "AMEND005",
      taxable: 47000,
      igst: 8460,
      cgst: 4230,
      sgst: 4230
    },
    {
      gstin: "09FFFFF6666F6Z6",
      party: "Singh Suppliers",
      invoice: "AMEND006",
      taxable: 102000,
      igst: 18360,
      cgst: 9180,
      sgst: 9180
    },
    {
      gstin: "09GGGGG7777G7Z7",
      party: "Rathore Traders",
      invoice: "AMEND007",
      taxable: 32000,
      igst: 5760,
      cgst: 2880,
      sgst: 2880
    }
  ];

  let startRow = 9;

  data.forEach((item, i) => {
    const r = startRow + i;

    // A → GSTIN
    ws.getCell(`A${r}`).value = item.gstin;

    // B → Party Name
    ws.getCell(`B${r}`).value = item.party;

    // D → Invoice Number (Amended)
    ws.getCell(`D${r}`).value = item.invoice;

    // I → Taxable Value
    ws.getCell(`I${r}`).value = item.taxable;

    // J → IGST
    ws.getCell(`J${r}`).value = item.igst;

    // K → CGST
    ws.getCell(`K${r}`).value = item.cgst;

    // L → SGST
    ws.getCell(`L${r}`).value = item.sgst;
  });

  console.log("✅ GSTR-1A B2B data filled");
}


// =========================
// GSTR-1 ANNUAL REPORT (B2B STATIC DATA)
// =========================
if (reportName === "GSTR-1 Annual Report") {
  console.log("🔥 Filling GSTR-1 Annual Report");

  // 🔍 find B2B sheet
  const ws = workbook.worksheets.find(sheet =>
    sheet.name.toLowerCase().includes("b2b")
  );

  if (!ws) {
    console.error("❌ B2B sheet not found", workbook.worksheets.map(s => s.name));
    return;
  }

  // =========================
  // 🔥 STATIC DATA (7 rows)
  // =========================
  const data = [
    {
      gstin: "09AAAAA1111A1Z1",
      party: "Sharma Traders",
      invoice: "INV001",
      taxable: 50000,
      igst: 9000,
      cgst: 4500,
      sgst: 4500
    },
    {
      gstin: "09BBBBB2222B2Z2",
      party: "Verma Enterprises",
      invoice: "INV002",
      taxable: 75000,
      igst: 13500,
      cgst: 6750,
      sgst: 6750
    },
    {
      gstin: "09CCCCC3333C3Z3",
      party: "Gupta Industries",
      invoice: "INV003",
      taxable: 62000,
      igst: 11160,
      cgst: 5580,
      sgst: 5580
    },
    {
      gstin: "09DDDDD4444D4Z4",
      party: "Kumar & Co",
      invoice: "INV004",
      taxable: 88000,
      igst: 15840,
      cgst: 7920,
      sgst: 7920
    },
    {
      gstin: "09EEEEE5555E5Z5",
      party: "Agarwal Pvt Ltd",
      invoice: "INV005",
      taxable: 45000,
      igst: 8100,
      cgst: 4050,
      sgst: 4050
    },
    {
      gstin: "09FFFFF6666F6Z6",
      party: "Singh Suppliers",
      invoice: "INV006",
      taxable: 99000,
      igst: 17820,
      cgst: 8910,
      sgst: 8910
    },
    {
      gstin: "09GGGGG7777G7Z7",
      party: "Rathore Traders",
      invoice: "INV007",
      taxable: 30000,
      igst: 5400,
      cgst: 2700,
      sgst: 2700
    }
  ];

  let startRow = 9;

  data.forEach((item, i) => {
    const r = startRow + i;

    // A → GSTIN
    ws.getCell(`A${r}`).value = item.gstin;

    // B → Party Name
    ws.getCell(`B${r}`).value = item.party;

    // D → Invoice Number
    ws.getCell(`D${r}`).value = item.invoice;

    // I → Taxable Value
    ws.getCell(`I${r}`).value = item.taxable;

    // J → IGST
    ws.getCell(`J${r}`).value = item.igst;

    // K → CGST
    ws.getCell(`K${r}`).value = item.cgst;

    // L → SGST (agar sheet me hai)
    ws.getCell(`L${r}`).value = item.sgst;
  });

  console.log("✅ GSTR-1 B2B data filled");
}



// =========================
// GSTR-2B ANNUAL REPORT (B2B STATIC DATA)
// =========================
if (reportName === "GSTR-2B Annual Reports") {
  console.log("🔥 Filling GSTR-2B Annual Reports");

  // 🔍 find B2B sheet (flexible name)
  const ws = workbook.worksheets.find(sheet =>
    sheet.name.toLowerCase().includes("b2b")
  );

  if (!ws) {
    console.error("❌ B2B sheet not found", workbook.worksheets.map(s => s.name));
    return;
  }

  // =========================
  // 🔥 STATIC DATA (7 rows)
  // =========================
  const data = [
    {
      gstin: "09AAAAA1111A1Z1",
      party: "Sharma Traders",
      invoice: "B2B001",
      taxable: 50000,
      cgst: 4500,
      sgst: 4500
    },
    {
      gstin: "09BBBBB2222B2Z2",
      party: "Verma Enterprises",
      invoice: "B2B002",
      taxable: 75000,
      cgst: 6750,
      sgst: 6750
    },
    {
      gstin: "09CCCCC3333C3Z3",
      party: "Gupta Industries",
      invoice: "B2B003",
      taxable: 62000,
      cgst: 5580,
      sgst: 5580
    },
    {
      gstin: "09DDDDD4444D4Z4",
      party: "Kumar & Co",
      invoice: "B2B004",
      taxable: 88000,
      cgst: 7920,
      sgst: 7920
    },
    {
      gstin: "09EEEEE5555E5Z5",
      party: "Agarwal Pvt Ltd",
      invoice: "B2B005",
      taxable: 45000,
      cgst: 4050,
      sgst: 4050
    },
    {
      gstin: "09FFFFF6666F6Z6",
      party: "Singh Suppliers",
      invoice: "B2B006",
      taxable: 99000,
      cgst: 8910,
      sgst: 8910
    },
    {
      gstin: "09GGGGG7777G7Z7",
      party: "Rathore Traders",
      invoice: "B2B007",
      taxable: 30000,
      cgst: 2700,
      sgst: 2700
    }
  ];

  let startRow = 9;

  data.forEach((item, i) => {
    const r = startRow + i;

    // A → GSTIN
    ws.getCell(`A${r}`).value = item.gstin;

    // B → Party Name
    ws.getCell(`B${r}`).value = item.party;

    // D → Invoice
    ws.getCell(`D${r}`).value = item.invoice;

    // I → Taxable Value
    ws.getCell(`I${r}`).value = item.taxable;

    // J → CGST
    ws.getCell(`J${r}`).value = item.cgst;

    // K → SGST
    ws.getCell(`K${r}`).value = item.sgst;
  });

  console.log("✅ GSTR-2B B2B data filled");
}



    // =========================
// GSTR-1 vs GSTR-2A COMPARE
// =========================
if (reportName === "GSTR-1 vs GSTR-2A") {
  console.log("Filling Compare Report");

  const ws = workbook.worksheets[0]; // first sheet

  if (!ws) {
    console.error("Sheet not found");
    return;
  }

  // 🔥 Dummy Data (tu yaha API ka data daal sakta hai)
  const data = [
    {
      party: "D.K. IRON STORE",
      inv2: 18,
      inv2a: 32,
      taxable2: 4334314.05,
      taxable2a: 8040688.61,
      tax2: 780176.5,
      tax2a: 1447323.94,
    },
    {
      party: "INTERIOR DECOR",
      inv2: 5,
      inv2a: 5,
      taxable2: 1400000,
      taxable2a: 1400000,
      tax2: 252000,
      tax2a: 252000,
    },
    {
      party: "MEERUT STEELS",
      inv2: 1,
      inv2a: 1,
      taxable2: 296704,
      taxable2a: 296704.4,
      tax2: 53406.72,
      tax2a: 53406.8,
    }
  ];

  let startRow = 9;

  data.forEach((item, index) => {
    const row = startRow + index;

    // D & E (invoice count)
    ws.getCell(`D${row}`).value = item.inv2;
    ws.getCell(`E${row}`).value = item.inv2a;

    // F & G (taxable)
    ws.getCell(`F${row}`).value = item.taxable2;
    ws.getCell(`G${row}`).value = item.taxable2a;

    // H & I (tax)
    ws.getCell(`H${row}`).value = item.tax2;
    ws.getCell(`I${row}`).value = item.tax2a;

    // J (taxable diff)
    ws.getCell(`J${row}`).value =
      item.taxable2a - item.taxable2;

    // K (tax diff)
    ws.getCell(`K${row}`).value =
      item.tax2a - item.tax2;
  });

  console.log("✅ Compare report filled");
}

// =========================
// GSTR-2 vs GSTR-2A (INVOICE WISE)
// =========================
if (reportName.includes("GSTR-2 vs GSTR-2A")) {
  console.log("🔥 Filling 2 vs 2A Invoice Wise");

  const ws = workbook.worksheets[0];

  if (!ws) {
    console.error("❌ Sheet not found");
    return;
  }

  let startRow = 11;

  const data = [
    {
      invoice: "04",
      party: "Ultimate Decor Particle",
      month: "Mar-2025",
      date: "04-04-2024",
      taxable: 37650,
      cgst: 3388.58,
      sgst: 3388.58,
    }
  ];

  data.forEach((item, i) => {
    const r = startRow + i;

    ws.getCell(`A${r}`).value = item.invoice;
    ws.getCell(`B${r}`).value = item.party;
    ws.getCell(`C${r}`).value = item.month;
    ws.getCell(`D${r}`).value = item.date;

    ws.getCell(`E${r}`).value = item.taxable;
    ws.getCell(`G${r}`).value = item.cgst;
    ws.getCell(`H${r}`).value = item.sgst;

    ws.getCell(`J${r}`).value = item.month;
    ws.getCell(`K${r}`).value = item.date;
    ws.getCell(`L${r}`).value = item.taxable;
    ws.getCell(`N${r}`).value = item.cgst;
    ws.getCell(`O${r}`).value = item.sgst;

    ws.getCell(`Q${r}`).value = 0;
  });

  console.log("✅ 2A Done");
}


// =========================
// GSTR-2 vs GSTR-2B (INVOICE WISE)
// =========================
if (reportName.includes("GSTR-2 vs GSTR-2B")) {
  console.log("🔥 Filling 2 vs 2B Invoice Wise");

  const ws = workbook.worksheets[0];

  if (!ws) {
    console.error("❌ Sheet not found");
    return;
  }

  let startRow = 10;

  const data = [
    {
      gstin: "09CMIPR8447Q2ZS",
      note: "DN001",
      date: "01-04-2024",
      type: "Debit",
      party: "RUBEENA",
      month: "Apr-2024",
      taxable: 50000,
      cgst: 4500,
      sgst: 4500,
    }
  ];

  data.forEach((item, i) => {
    const r = startRow + i;

    ws.getCell(`A${r}`).value = item.gstin;
    ws.getCell(`B${r}`).value = item.note;
    ws.getCell(`C${r}`).value = item.date;
    ws.getCell(`D${r}`).value = item.type;
    ws.getCell(`E${r}`).value = item.party;

    ws.getCell(`F${r}`).value = item.month;
    ws.getCell(`G${r}`).value = item.taxable;
    ws.getCell(`I${r}`).value = item.cgst;
    ws.getCell(`J${r}`).value = item.sgst;

    ws.getCell(`L${r}`).value = item.month;
    ws.getCell(`M${r}`).value = item.taxable;
    ws.getCell(`O${r}`).value = item.cgst;
    ws.getCell(`P${r}`).value = item.sgst;

    ws.getCell(`Q${r}`).value = 0;
  });

  console.log("✅ 2B Done");
}

// =========================
// GSTR-2 vs GSTR-2B (PARTY WISE)
// =========================
if (reportName.includes("GSTR-2 vs GSTR-2B Party Wise")) {
  console.log("🔥 Filling Party Wise Report");

  const ws = workbook.worksheets[0];

  if (!ws) {
    console.error("❌ Sheet not found");
    return;
  }

  const data = [
    {
      gstin: "09ALXPK5904B2ZV",
      party: "D.K. IRON STORE",
      section: "B2B",
      inv2: 18,
      inv2b: 32,
      taxable2: 4334314.05,
      taxable2b: 8040688.61,
      tax2: 780176.5,
      tax2b: 1447323.94,
    },
    {
      gstin: "09DQHPS5297H1Z1",
      party: "INTERIOR DECOR",
      section: "B2B",
      inv2: 5,
      inv2b: 5,
      taxable2: 1400000,
      taxable2b: 1400000,
      tax2: 252000,
      tax2b: 252000,
    }
  ];

  let startRow = 9;

  data.forEach((item, i) => {
    const r = startRow + i;

    // Basic Info
    ws.getCell(`A${r}`).value = item.gstin;
    ws.getCell(`B${r}`).value = item.party;
    ws.getCell(`C${r}`).value = item.section;

    // Invoice Count
    ws.getCell(`D${r}`).value = item.inv2;
    ws.getCell(`E${r}`).value = item.inv2b;

    // Taxable
    ws.getCell(`F${r}`).value = item.taxable2;
    ws.getCell(`G${r}`).value = item.taxable2b;

    // Tax
    ws.getCell(`H${r}`).value = item.tax2;
    ws.getCell(`I${r}`).value = item.tax2b;

    // Difference
    ws.getCell(`J${r}`).value = item.taxable2b - item.taxable2;
    ws.getCell(`K${r}`).value = item.tax2b - item.tax2;
  });

  console.log("✅ Party Wise Done");
}
if (reportName.includes("GSTR-2A vs GSTR-3B")) {
  console.log("🔥 Filling 2A vs 3B");

  const ws = workbook.worksheets[0];

  const data = [
    {
      month: "Apr/2024",
      gstr3b: { taxable: 1363557.32, cgst: 122720.17, sgst: 122720.17 },
      gstr2a: { taxable: 1363557.32, cgst: 122720.17, sgst: 122720.17 },
    },
    {
      month: "May/2024",
      gstr3b: { taxable: 1273132.99, cgst: 114581.99, sgst: 114581.99 },
      gstr2a: { taxable: 1305612.99, cgst: 117505.19, sgst: 117505.19 },
    }
  ];

  let row = 7;

  data.forEach((item) => {
    // Month
    ws.getCell(`A${row}`).value = item.month;

    // GSTR-3B
    ws.getCell(`B${row}`).value = "GSTR-3B :";
    ws.getCell(`C${row}`).value = item.gstr3b.taxable;
    ws.getCell(`E${row}`).value = item.gstr3b.cgst;
    ws.getCell(`F${row}`).value = item.gstr3b.sgst;

    row++;

    // GSTR-2A
    ws.getCell(`B${row}`).value = "GSTR-2A :";
    ws.getCell(`C${row}`).value = item.gstr2a.taxable;
    ws.getCell(`E${row}`).value = item.gstr2a.cgst;
    ws.getCell(`F${row}`).value = item.gstr2a.sgst;

    row++;

    // Difference
    ws.getCell(`B${row}`).value = "(Difference):";
    ws.getCell(`C${row}`).value =
      item.gstr3b.taxable - item.gstr2a.taxable;
    ws.getCell(`E${row}`).value =
      item.gstr3b.cgst - item.gstr2a.cgst;
    ws.getCell(`F${row}`).value =
      item.gstr3b.sgst - item.gstr2a.sgst;

    row++;
  });

  console.log("✅ 2A vs 3B Done");
}

if (reportName.includes("GSTR-2B vs GSTR-3B")) {
  console.log("🔥 Filling 2B vs 3B");

  const ws = workbook.worksheets[0];

  const data = [
    {
      month: "Apr/2024",
      gstr3b: { taxable: 1363557.32, cgst: 122720.17, sgst: 122720.17 },
      gstr2b: { taxable: 1363557.32, cgst: 122720.17, sgst: 122720.17 },
    },
    {
      month: "May/2024",
      gstr3b: { taxable: 1273132.99, cgst: 114581.99, sgst: 114581.99 },
      gstr2b: { taxable: 1305612.99, cgst: 117505.19, sgst: 117505.19 },
    }
  ];

  let row = 7;

  data.forEach((item) => {
    ws.getCell(`A${row}`).value = item.month;

    // GSTR-3B
    ws.getCell(`B${row}`).value = "GSTR-3B :";
    ws.getCell(`C${row}`).value = item.gstr3b.taxable;
    ws.getCell(`E${row}`).value = item.gstr3b.cgst;
    ws.getCell(`F${row}`).value = item.gstr3b.sgst;

    row++;

    // GSTR-2B
    ws.getCell(`B${row}`).value = "GSTR-2B :";
    ws.getCell(`C${row}`).value = item.gstr2b.taxable;
    ws.getCell(`E${row}`).value = item.gstr2b.cgst;
    ws.getCell(`F${row}`).value = item.gstr2b.sgst;

    row++;

    // Difference
    ws.getCell(`B${row}`).value = "(Difference):";
    ws.getCell(`C${row}`).value =
      item.gstr3b.taxable - item.gstr2b.taxable;
    ws.getCell(`E${row}`).value =
      item.gstr3b.cgst - item.gstr2b.cgst;
    ws.getCell(`F${row}`).value =
      item.gstr3b.sgst - item.gstr2b.sgst;

    row++;
  });

  console.log("✅ 2B vs 3B Done");
}


if (reportName === "GSTR-2A vs GSTR-3B (ITC)") {
  console.log("🔥 Creating fresh GSTR-2A vs GSTR-3B (ITC) workbook");

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("GSTR2A VS GSTR3B");

  // widths
  ws.columns = [
    { width: 42 }, // A
    { width: 14 }, // B
    { width: 14 }, // C
    { width: 14 }, // D
    { width: 14 }, // E
    { width: 14 }, // F
    { width: 14 }, // G
  ];

  // title
  ws.mergeCells("B1:G1");
  ws.getCell("B1").value = "GSTR2A VS GSTR3B";
  ws.getCell("B1").font = { bold: true, size: 14 };
  ws.getCell("B1").alignment = { horizontal: "center", vertical: "middle" };

  // GSTIN / FY
  ws.getCell("A2").value = "GSTIN";
  ws.getCell("B2").value = "09CMIPR8447Q2ZS";

  ws.getCell("A3").value = "FIN YEAR";
  ws.getCell("B3").value = "2024-25";

  // Tax Details row
  ws.getCell("A4").value = "Tax Details";
  ["B4", "C4", "D4", "E4", "F4", "G4"].forEach((cell, i) => {
    ws.getCell(cell).value = ["April", "May", "June", "July", "August", "September"][i];
    ws.getCell(cell).font = { color: { argb: "4472C4" }, bold: false, size: 11 };
    ws.getCell(cell).alignment = { horizontal: "center", vertical: "middle" };
  });

  // orange section row
  ws.mergeCells("A5:G5");
  ws.getCell("A5").value = "ITC Available details in GSTR-3B";
  ws.getCell("A5").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "ED7D31" }
  };
  ws.getCell("A5").font = { bold: true };
  ws.getCell("A5").alignment = { horizontal: "left", vertical: "middle" };

  // labels
  const labels = [
    "1.Imports of Goods",
    "IGST",
    "CESS",
    "",
    "2.Imports of Services",
    "IGST",
    "CESS",
    "",
    "3. Inward Supplies liable to reverse charge(other than 1 & 2 Above)",
    "IGST",
    "CGST",
    "SGST",
    "CESS",
    "",
    "4. Inward Supplies from ISD",
    "IGST",
    "CGST",
    "SGST",
  ];

  let startLabelRow = 6;
  labels.forEach((text, idx) => {
    ws.getCell(`A${startLabelRow + idx}`).value = text;
    if (text && !["IGST", "CGST", "SGST", "CESS"].includes(text)) {
      ws.getCell(`A${startLabelRow + idx}`).font = { bold: true };
    }
  });

  // static data only B:G and rows 6:12 as you asked
  const data = {
    B: [0, 12000, 500, "", 0, 8000, 300],
    C: [0, 13000, 550, "", 0, 8500, 320],
    D: [0, 14000, 600, "", 0, 9000, 350],
    E: [0, 15000, 650, "", 0, 9500, 370],
    F: [0, 16000, 700, "", 0, 9800, 390],
    G: [0, 17000, 750, "", 0, 10000, 400],
  };

  Object.entries(data).forEach(([col, values]) => {
    values.forEach((value, idx) => {
      ws.getCell(`${col}${6 + idx}`).value = value;
      ws.getCell(`${col}${6 + idx}`).alignment = { horizontal: "center", vertical: "middle" };
    });
  });

  // borders
  for (let r = 2; r <= 23; r++) {
    for (let c = 1; c <= 7; c++) {
      ws.getRow(r).getCell(c).border = {
        top: { style: "thin", color: { argb: "D9D9D9" } },
        left: { style: "thin", color: { argb: "D9D9D9" } },
        bottom: { style: "thin", color: { argb: "D9D9D9" } },
        right: { style: "thin", color: { argb: "D9D9D9" } },
      };
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "Filled-GSTR-2A vs GSTR-3B.xlsx");
  return;
}


if (reportName === "GSTR-2B vs GSTR-3B (ITC)") {
  console.log("🔥 Creating fresh GSTR-2B vs GSTR-3B (ITC) workbook");

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("GSTR3B VS GSTR2B");

  ws.columns = [
    { width: 8 },   // A
    { width: 42 },  // B
    { width: 10 },  // C
    { width: 14 },  // D
    { width: 14 },  // E
    { width: 14 },  // F
    { width: 14 },  // G
    { width: 14 },  // H
    { width: 14 },  // I
    { width: 14 },  // J
    { width: 14 },  // K
    { width: 14 },  // L
    { width: 14 },  // M
    { width: 14 },  // N
    { width: 14 },  // O
    { width: 14 },  // P
  ];

  ws.mergeCells("A1:C1");
  ws.getCell("A1").value = "GSTR3B VS GSTR2B Report";
  ws.getCell("A1").font = { bold: true, size: 14 };

  ws.getCell("A2").value = "1";
  ws.getCell("B2").value = "Assessee Name";
  ws.getCell("D2").value = "RUBEENA";

  ws.getCell("A3").value = "2";
  ws.getCell("B3").value = "GSTIN";
  ws.getCell("D3").value = "09CMIPR8447Q2ZS";

  ws.getCell("A4").value = "3";
  ws.getCell("B4").value = "Financial Year";
  ws.getCell("D4").value = "2024-25";

  const headers = [
    "Sl.No", "Section", "Type",
    "APR 2024", "MAY 2024", "JUN 2024", "JUL 2024", "AUG 2024", "SEP 2024",
    "OCT 2024", "NOV 2024", "DEC 2024", "JAN 2025", "FEB 2025", "MAR 2025", "Total"
  ];

  headers.forEach((h, i) => {
    const cell = ws.getRow(6).getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "5B9BD5" }
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  const rows = {
    7:  ["1", "ITC Claim - Import of Goods", ""],
    8:  ["", "R3B: 4.A.1 Import of goods", "IGST"],
    9:  ["", "R2B: Import of Goods Invoices", "IGST"],
    10: ["", "R2B: Import of Goods from SEZ Invoices", "IGST"],
    11: ["", "Difference", "IGST"],
    12: ["", "R3B: 4.A.1 Import of goods", "CESS"],
    13: ["", "R2B: Import of Goods Invoices", "CESS"],
    14: ["", "R2B: Import of Goods from SEZ Invoices", "CESS"],
    15: ["", "Difference", "CESS"],
  };

  Object.entries(rows).forEach(([row, vals]) => {
    ws.getCell(`A${row}`).value = vals[0];
    ws.getCell(`B${row}`).value = vals[1];
    ws.getCell(`C${row}`).value = vals[2];
  });

  ws.getCell("B7").font = { bold: true };

  // D:O , rows 8:15
  const rowData = {
    8:  [12000, 12500, 13000, 13500, 14000, 14500, 15000, 15500, 16000, 16500, 17000, 17500],
    9:  [5000,  5200,  5400,  5600,  5800,  6000,  6200,  6400,  6600,  6800,  7000,  7200],
    10: [2000,  2100,  2200,  2300,  2400,  2500,  2600,  2700,  2800,  2900,  3000,  3100],
    11: [5000,  5200,  5400,  5600,  5800,  6000,  6200,  6400,  6600,  6800,  7000,  7200],
    12: [300,   320,   340,   360,   380,   400,   420,   440,   460,   480,   500,   520],
    13: [100,   110,   120,   130,   140,   150,   160,   170,   180,   190,   200,   210],
    14: [50,    60,    70,    80,    90,    100,   110,   120,   130,   140,   150,   160],
    15: [150,   150,   150,   150,   150,   150,   150,   150,   150,   150,   150,   150],
  };

  const cols = ["D","E","F","G","H","I","J","K","L","M","N","O"];

  Object.entries(rowData).forEach(([row, values]) => {
    let total = 0;
    values.forEach((value, idx) => {
      ws.getCell(`${cols[idx]}${row}`).value = value;
      total += Number(value || 0);
    });
    ws.getCell(`P${row}`).value = total;
  });

  // styling
  for (let r = 1; r <= 15; r++) {
    for (let c = 1; c <= 16; c++) {
      ws.getRow(r).getCell(c).border = {
        top: { style: "thin", color: { argb: "D9D9D9" } },
        left: { style: "thin", color: { argb: "D9D9D9" } },
        bottom: { style: "thin", color: { argb: "D9D9D9" } },
        right: { style: "thin", color: { argb: "D9D9D9" } },
      };
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "Filled-GSTR-2B vs GSTR-3B.xlsx");
  return;
} 


// =========================
// GSTR-2 ANNUAL REPORT (B2B DATA)
// =========================
if (reportName === "GSTR-2 Annual Report") {
  console.log("🔥 Filling GSTR-2 Annual Report B2B");

  // find correct sheet (name flexible rakha hai)
  const ws = workbook.worksheets.find(sheet =>
    sheet.name.toLowerCase().includes("b2b")
  );

  if (!ws) {
    console.error("❌ B2B sheet not found", workbook.worksheets.map(s => s.name));
    return;
  }

  // 🔥 STATIC DATA (tu yaha API se replace kar sakta hai)
  const data = [
    {
      gstin: "09ABCDE1234F1Z5",
      party: "ABC Traders",
      invoice: "INV001",
      taxable: 50000,
      cgst: 4500,
      sgst: 4500,
    },
    {
      gstin: "09XYZDE5678K2Z6",
      party: "XYZ Enterprises",
      invoice: "INV002",
      taxable: 75000,
      cgst: 6750,
      sgst: 6750,
    }
  ];

  let startRow = 9; // mostly B2B starts from row 9 (check once)

  data.forEach((item, i) => {
    const r = startRow + i;

    // A, B, C columns
    ws.getCell(`A${r}`).value = item.gstin;
    ws.getCell(`B${r}`).value = item.party;
    ws.getCell(`C${r}`).value = item.invoice;

    // I, J, K columns
    ws.getCell(`I${r}`).value = item.taxable;
    ws.getCell(`J${r}`).value = item.cgst;
    ws.getCell(`K${r}`).value = item.sgst;
  });

  console.log("✅ B2B data filled");
}


if (reportName.includes("GSTR-3B vs GSTR-1")) {
  console.log("🔥 Filling 3B vs 1");

  const ws = workbook.worksheets[0];

  if (!ws) {
    console.error("Sheet not found");
    return;
  }

  const months = [
    "Apr-24", "May-24", "Jun-24", "Jul-24", "Aug-24", "Sep-24",
    "Oct-24", "Nov-24", "Dec-24", "Jan-25", "Feb-25", "Mar-25"
  ];

  const gstr3b = [
    1363557.32, 1273132.99, 2588385.85, 1619512.34, 1196552.60, 1066272.40,
    1144881.34, 849063.00, 3426999.60, 2693976.30, 2222257.08, 2446589.92
  ];

  const gstr1 = [
    1360457.72, 1267851.28, 2588385.85, 1484501.34, 1196552.60, 1062195.00,
    1144881.34, 844075.00, 3426999.60, 2689677.92, 2212536.28, 2306475.92
  ];

  const row3b = 8;
  const row1 = 9;
  const rowDiff = 17;

  months.forEach((m, i) => {
    const col = 3 + i; // C = 3

    ws.getRow(row3b).getCell(col).value = gstr3b[i];
    ws.getRow(row1).getCell(col).value = gstr1[i];
    ws.getRow(rowDiff).getCell(col).value = gstr3b[i] - gstr1[i];
  });

  const total3b = gstr3b.reduce((a, b) => a + b, 0);
  const total1 = gstr1.reduce((a, b) => a + b, 0);

  ws.getCell("O8").value = total3b;
  ws.getCell("O9").value = total1;
  ws.getCell("O17").value = total3b - total1;

  // clear problematic shared formula cells
  ["P17", "Q17", "R17", "S17"].forEach(cell => {
    ws.getCell(cell).value = null;
  });

  console.log("✅ 3B vs 1 Done");
}
if (reportName === "GSTR-3B vs TDS/TCS") {
  // remove old sheet if exists
  const oldSheet = workbook.getWorksheet("GSTR3BVsTDS");
  if (oldSheet) {
    workbook.removeWorksheet(oldSheet.id);
  }

  // create fresh sheet
  const ws = workbook.addWorksheet("GSTR3BVsTDS");

  // column widths
  ws.columns = [
    { width: 18 }, // A
    { width: 16 }, // B
    { width: 16 }, // C
    { width: 12 }, // D
    { width: 12 }, // E
    { width: 12 }, // F
    { width: 12 }, // G
  ];

  // title
  ws.mergeCells("A1:G1");
  ws.getCell("A1").value = "GSTR-3B vs TDS Report";
  ws.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
  ws.getCell("A1").font = { bold: true, size: 16 };
  ws.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "E26B0A" }
  };
  ws.getCell("A1").border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" }
  };

  // info rows
  ws.getCell("A2").value = "Name";
  ws.getCell("B2").value = "LAVI INDIA INDUSTRIES";

  ws.getCell("A3").value = "Legal Name";
  ws.getCell("B3").value = "RUBEENA";

  ws.getCell("A4").value = "GSTIN";
  ws.getCell("B4").value = "09CMIPR8447Q2ZS";

  ws.getCell("A5").value = "Financial Year";
  ws.getCell("B5").value = "2024-25";

  // header row
  const headerRow = 7;
  const headers = ["Month-Year", "Category", "Taxable", "IGST", "CGST", "SGST", "CESS"];
  headers.forEach((h, i) => {
    const cell = ws.getRow(headerRow).getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "366092" }
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" }
    };
  });

  const rows = [
    ["Apr-24", "GSTR3B", 1363557.32, 0.0, 122720.17, 122720.17, 0.0],
    ["", "TDS/TCS", 0.0, 0.0, 0.0, 0.0, 0.0],
    ["", "Difference", 1363557.32, 0.0, 122720.17, 122720.17, 0.0],

    ["May-24", "GSTR3B", 1273132.99, 0.0, 114581.99, 114581.99, 0.0],
    ["", "TDS/TCS", 0.0, 0.0, 0.0, 0.0, 0.0],
    ["", "Difference", 1273132.99, 0.0, 114581.99, 114581.99, 0.0],

    ["Jun-24", "GSTR3B", 2588385.85, 0.0, 232954.74, 232954.74, 0.0],
    ["", "TDS/TCS", 0.0, 0.0, 0.0, 0.0, 0.0],
    ["", "Difference", 2588385.85, 0.0, 232954.74, 232954.74, 0.0],

    ["Jul-24", "GSTR3B", 1619512.34, 0.0, 145756.12, 145756.12, 0.0],
    ["", "TDS/TCS", 0.0, 0.0, 0.0, 0.0, 0.0],
    ["", "Difference", 1619512.34, 0.0, 145756.12, 145756.12, 0.0],

    ["Aug-24", "GSTR3B", 1196552.60, 0.0, 107689.74, 107689.74, 0.0],
    ["", "TDS/TCS", 0.0, 0.0, 0.0, 0.0, 0.0],
    ["", "Difference", 1196552.60, 0.0, 107689.74, 107689.74, 0.0],
  ];

  let startRow = 8;

  rows.forEach((item, idx) => {
    for (let col = 1; col <= 7; col++) {
      const cell = ws.getRow(startRow).getCell(col);
      cell.value = item[col - 1];

      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };

      if (col >= 3) {
        cell.numFmt = "0.00";
      }

      // yellow for difference rows
      if (item[1] === "Difference") {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFC000" }
        };
      }

      cell.alignment = {
        horizontal: col <= 2 ? "center" : "right",
        vertical: "middle"
      };
    }

    startRow++;
  });

  // merge month cells for each 3-row group
  const monthGroups = [8, 11, 14, 17, 20];
  monthGroups.forEach((r) => {
    ws.mergeCells(`A${r}:A${r + 2}`);
    ws.getCell(`A${r}`).alignment = { horizontal: "center", vertical: "middle" };
  });

  console.log("✅ GSTR-3B vs TDS/TCS fresh sheet created");
}
if (reportName === "Tax Compare Report") {
  console.log("🔥 Filling Tax Compare Report");

  const fillTaxCompareSheet = (ws, startRow, rows) => {
    rows.forEach((item, index) => {
      const r = startRow + index;

      ws.getCell(`C${r}`).value = item.taxable ?? 0;
      ws.getCell(`D${r}`).value = item.igst ?? 0;
      ws.getCell(`E${r}`).value = item.cgst ?? 0;
      ws.getCell(`F${r}`).value = item.sgst ?? 0;
      ws.getCell(`G${r}`).value = item.cess ?? 0;
    });
  };

  const staticRows = [
    { taxable: 50000, igst: 9000,  cgst: 4500, sgst: 4500, cess: 500 },
    { taxable: 65000, igst: 11700, cgst: 5850, sgst: 5850, cess: 650 },
    { taxable: 80000, igst: 14400, cgst: 7200, sgst: 7200, cess: 800 },
    { taxable: 90000, igst: 16200, cgst: 8100, sgst: 8100, cess: 900 },
    { taxable: 70000, igst: 12600, cgst: 6300, sgst: 6300, cess: 700 },
  ];

  const targetSheets = [
    "GSTR1VsGSTR3B",
    "GSTR2VsGSTR3B",
    "GSTR2AVsGSTR3B",
    "GSTR2BVsGSTR3B",
  ];

  targetSheets.forEach((sheetName) => {
    const ws = workbook.getWorksheet(sheetName);

    if (!ws) {
      console.warn(`⚠ Sheet not found: ${sheetName}`);
      return;
    }

    hardSanitizeTaxCompareWorksheet(ws);
    fillTaxCompareSheet(ws, 3, staticRows);


    console.log(`✅ Filled Tax Compare sheet: ${sheetName}`);
  });
}

// =========================
// GSTR-2A ANNUAL REPORT (PARTY WISE)
// =========================
if (reportName === "GSTR-2A Annual Report (Party Wise)") {
  console.log("🔥 Filling GSTR-2A Annual Report (Party Wise)");
  const ws = workbook.worksheets[0];
  if (!ws) { console.error("❌ Sheet not found"); return; }
  const data = [
    { gstin: "09ABCDE1234F1Z5", party: "ABC Traders",     inv: 5, taxable: 250000, igst: 45000, cgst: 22500, sgst: 22500 },
    { gstin: "09XYZDE5678K2Z6", party: "XYZ Enterprises",  inv: 3, taxable: 180000, igst: 32400, cgst: 16200, sgst: 16200 },
    { gstin: "09LMNOP7890Q1Z2", party: "LMN Pvt Ltd",      inv: 7, taxable: 320000, igst: 57600, cgst: 28800, sgst: 28800 },
    { gstin: "09QWERT5678U2Z3", party: "QWER Industries",  inv: 4, taxable: 210000, igst: 37800, cgst: 18900, sgst: 18900 },
    { gstin: "09ASDFG1234H3Z4", party: "ASDF Suppliers",   inv: 6, taxable: 290000, igst: 52200, cgst: 26100, sgst: 26100 },
    { gstin: "09ZXCVB9876J4Z5", party: "ZXCV Traders",    inv: 2, taxable: 120000, igst: 21600, cgst: 10800, sgst: 10800 },
    { gstin: "09POIUY6543K5Z6", party: "POIUY Corp",       inv: 8, taxable: 410000, igst: 73800, cgst: 36900, sgst: 36900 },
  ];
  let startRow = 9;
  data.forEach((item, i) => {
    const r = startRow + i;
    ws.getCell(`A${r}`).value = item.gstin;
    ws.getCell(`B${r}`).value = item.party;
    ws.getCell(`C${r}`).value = item.inv;
    ws.getCell(`D${r}`).value = item.taxable;
    ws.getCell(`E${r}`).value = item.igst;
    ws.getCell(`F${r}`).value = item.cgst;
    ws.getCell(`G${r}`).value = item.sgst;
  });
  console.log("✅ GSTR-2A Party Wise filled");
}

// =========================
// GSTR-2A ANNUAL REPORT (RATE WISE)
// =========================
if (reportName === "GSTR-2A Annual Report (Rate Wise)") {
  console.log("🔥 Filling GSTR-2A Annual Report (Rate Wise)");
  const ws = workbook.worksheets[0];
  if (!ws) { console.error("❌ Sheet not found"); return; }
  const data = [
    { rate: "5%",  taxable: 150000, igst: 7500,  cgst: 3750,  sgst: 3750 },
    { rate: "12%", taxable: 200000, igst: 24000, cgst: 12000, sgst: 12000 },
    { rate: "18%", taxable: 350000, igst: 63000, cgst: 31500, sgst: 31500 },
    { rate: "28%", taxable: 100000, igst: 28000, cgst: 14000, sgst: 14000 },
    { rate: "0%",  taxable: 80000,  igst: 0,     cgst: 0,     sgst: 0 },
  ];
  let startRow = 9;
  data.forEach((item, i) => {
    const r = startRow + i;
    ws.getCell(`A${r}`).value = item.rate;
    ws.getCell(`B${r}`).value = item.taxable;
    ws.getCell(`C${r}`).value = item.igst;
    ws.getCell(`D${r}`).value = item.cgst;
    ws.getCell(`E${r}`).value = item.sgst;
  });
  console.log("✅ GSTR-2A Rate Wise filled");
}

// =========================
// GSTR-2B ANNUAL REPORT (PARTY WISE)
// =========================
if (reportName === "GSTR-2B Annual Report (Party Wise)") {
  console.log("🔥 Filling GSTR-2B Annual Report (Party Wise)");
  const ws = workbook.worksheets[0];
  if (!ws) { console.error("❌ Sheet not found"); return; }
  const data = [
    { gstin: "09AAAAA1111A1Z1", party: "Sharma Traders",    inv: 4, taxable: 200000, cgst: 18000, sgst: 18000 },
    { gstin: "09BBBBB2222B2Z2", party: "Verma Enterprises",  inv: 6, taxable: 300000, cgst: 27000, sgst: 27000 },
    { gstin: "09CCCCC3333C3Z3", party: "Gupta Industries",   inv: 3, taxable: 150000, cgst: 13500, sgst: 13500 },
    { gstin: "09DDDDD4444D4Z4", party: "Kumar & Co",         inv: 5, taxable: 250000, cgst: 22500, sgst: 22500 },
    { gstin: "09EEEEE5555E5Z5", party: "Agarwal Pvt Ltd",    inv: 7, taxable: 350000, cgst: 31500, sgst: 31500 },
    { gstin: "09FFFFF6666F6Z6", party: "Singh Suppliers",    inv: 2, taxable: 100000, cgst: 9000,  sgst: 9000 },
    { gstin: "09GGGGG7777G7Z7", party: "Rathore Traders",   inv: 8, taxable: 400000, cgst: 36000, sgst: 36000 },
  ];
  let startRow = 9;
  data.forEach((item, i) => {
    const r = startRow + i;
    ws.getCell(`A${r}`).value = item.gstin;
    ws.getCell(`B${r}`).value = item.party;
    ws.getCell(`C${r}`).value = item.inv;
    ws.getCell(`D${r}`).value = item.taxable;
    ws.getCell(`E${r}`).value = item.cgst;
    ws.getCell(`F${r}`).value = item.sgst;
  });
  console.log("✅ GSTR-2B Party Wise filled");
}

// =========================
// GSTR-2B ANNUAL REPORT (RATE WISE)
// =========================
if (reportName === "GSTR-2B Annual Report (Rate Wise)") {
  console.log("🔥 Filling GSTR-2B Annual Report (Rate Wise)");
  const ws = workbook.worksheets[0];
  if (!ws) { console.error("❌ Sheet not found"); return; }
  const data = [
    { rate: "5%",  taxable: 120000, cgst: 3000,  sgst: 3000 },
    { rate: "12%", taxable: 180000, cgst: 10800, sgst: 10800 },
    { rate: "18%", taxable: 300000, cgst: 27000, sgst: 27000 },
    { rate: "28%", taxable: 90000,  cgst: 12600, sgst: 12600 },
    { rate: "0%",  taxable: 60000,  cgst: 0,     sgst: 0 },
  ];
  let startRow = 9;
  data.forEach((item, i) => {
    const r = startRow + i;
    ws.getCell(`A${r}`).value = item.rate;
    ws.getCell(`B${r}`).value = item.taxable;
    ws.getCell(`C${r}`).value = item.cgst;
    ws.getCell(`D${r}`).value = item.sgst;
  });
  console.log("✅ GSTR-2B Rate Wise filled");
}

// =========================
// RATE WISE REPORTS (OUTWARD)
// =========================
if (reportName === "Rate Wise Reports (Outward)") {
  console.log("🔥 Filling Rate Wise Reports (Outward)");
  const ws = workbook.worksheets[0];
  if (!ws) { console.error("❌ Sheet not found"); return; }
  const cols = ["B","C","D","E","F","G","H","I","J","K","L"];
  [[60000,10800,5400,5400,0,0,0,0,0,0,0],[85000,15300,7650,7650,0,0,0,0,0,0,0]].forEach((rowData, i) => {
    rowData.forEach((value, j) => { ws.getCell(`${cols[j]}${9+i}`).value = value; });
  });
  [[70000,12600,6300,6300,0,0,0,0,0,0,0],[90000,16200,8100,8100,0,0,0,0,0,0,0]].forEach((rowData, i) => {
    rowData.forEach((value, j) => { ws.getCell(`${cols[j]}${25+i}`).value = value; });
  });
  console.log("✅ Rate Wise (Outward) filled");
}

// =========================
// RATE WISE REPORTS (OUTWARD & INWARD)
// =========================
if (reportName === "Rate Wise Reports (Outward & Inward)") {
  console.log("🔥 Filling Rate Wise Reports (Outward & Inward)");
  const ws = workbook.worksheets[0];
  if (!ws) { console.error("❌ Sheet not found"); return; }
  const cols = ["B","C","D","E","F","G","H","I","J","K","L"];
  [[60000,10800,5400,5400,0,0,0,0,0,0,0],[85000,15300,7650,7650,0,0,0,0,0,0,0]].forEach((rowData, i) => {
    rowData.forEach((value, j) => { ws.getCell(`${cols[j]}${9+i}`).value = value; });
  });
  [[50000,9000,4500,4500,0,0,0,0,0,0,0],[75000,13500,6750,6750,0,0,0,0,0,0,0]].forEach((rowData, i) => {
    rowData.forEach((value, j) => { ws.getCell(`${cols[j]}${25+i}`).value = value; });
  });
  console.log("✅ Rate Wise (Outward & Inward) filled");
}

// =========================
// TRADING REPORT
// =========================
if (reportName === "Trading Report") {
  console.log("🔥 Filling Trading Report");
  const ws = workbook.worksheets[0];
  if (!ws) { console.error("❌ Sheet not found"); return; }
  const data = [
    { month: "Apr-2024", sales: 500000, purchases: 350000, profit: 150000 },
    { month: "May-2024", sales: 620000, purchases: 430000, profit: 190000 },
    { month: "Jun-2024", sales: 580000, purchases: 400000, profit: 180000 },
    { month: "Jul-2024", sales: 710000, purchases: 510000, profit: 200000 },
    { month: "Aug-2024", sales: 660000, purchases: 460000, profit: 200000 },
    { month: "Sep-2024", sales: 750000, purchases: 530000, profit: 220000 },
  ];
  let startRow = 9;
  data.forEach((item, i) => {
    const r = startRow + i;
    ws.getCell(`A${r}`).value = item.month;
    ws.getCell(`B${r}`).value = item.sales;
    ws.getCell(`C${r}`).value = item.purchases;
    ws.getCell(`D${r}`).value = item.profit;
  });
  console.log("✅ Trading Report filled");
}

// =========================
// TAX LIABILITY AND ITC SUMMARY
// =========================
if (reportName === "Tax Liability and ITC Summary") {
  console.log("🔥 Filling Tax Liability and ITC Summary");
  const ws = workbook.worksheets[0];
  if (!ws) { console.error("❌ Sheet not found"); return; }
  const data = [
    { month: "Apr-2024", liability: 122720, itc: 95000, net: 27720 },
    { month: "May-2024", liability: 114582, itc: 88000, net: 26582 },
    { month: "Jun-2024", liability: 232955, itc: 190000, net: 42955 },
    { month: "Jul-2024", liability: 145756, itc: 112000, net: 33756 },
    { month: "Aug-2024", liability: 107690, itc: 82000, net: 25690 },
    { month: "Sep-2024", liability: 95965,  itc: 75000, net: 20965 },
  ];
  let startRow = 9;
  data.forEach((item, i) => {
    const r = startRow + i;
    ws.getCell(`A${r}`).value = item.month;
    ws.getCell(`B${r}`).value = item.liability;
    ws.getCell(`C${r}`).value = item.itc;
    ws.getCell(`D${r}`).value = item.net;
  });
  console.log("✅ Tax Liability and ITC Summary filled");
}

// =========================
// GSTR-2B ITC RECLAIM REPORTS
// =========================
if (reportName === "GSTR-2B ITC Reclaim Reports") {
  console.log("🔥 Filling GSTR-2B ITC Reclaim Reports");
  const ws = workbook.worksheets[0];
  if (!ws) { console.error("❌ Sheet not found"); return; }
  const data = [
    { gstin: "09ABCDE1234F1Z5", party: "ABC Traders",     invoice: "INV001", taxable: 50000, cgst: 4500, sgst: 4500, reclaimMonth: "Apr-2024" },
    { gstin: "09XYZDE5678K2Z6", party: "XYZ Enterprises", invoice: "INV002", taxable: 75000, cgst: 6750, sgst: 6750, reclaimMonth: "May-2024" },
    { gstin: "09LMNOP7890Q1Z2", party: "LMN Pvt Ltd",     invoice: "INV003", taxable: 60000, cgst: 5400, sgst: 5400, reclaimMonth: "Jun-2024" },
    { gstin: "09QWERT5678U2Z3", party: "QWER Industries", invoice: "INV004", taxable: 88000, cgst: 7920, sgst: 7920, reclaimMonth: "Jul-2024" },
    { gstin: "09ASDFG1234H3Z4", party: "ASDF Suppliers",  invoice: "INV005", taxable: 45000, cgst: 4050, sgst: 4050, reclaimMonth: "Aug-2024" },
  ];
  let startRow = 9;
  data.forEach((item, i) => {
    const r = startRow + i;
    ws.getCell(`A${r}`).value = item.gstin;
    ws.getCell(`B${r}`).value = item.party;
    ws.getCell(`C${r}`).value = item.invoice;
    ws.getCell(`D${r}`).value = item.taxable;
    ws.getCell(`E${r}`).value = item.cgst;
    ws.getCell(`F${r}`).value = item.sgst;
    ws.getCell(`G${r}`).value = item.reclaimMonth;
  });
  console.log("✅ GSTR-2B ITC Reclaim filled");
}

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `Filled-${file.downloadName}`);

  } catch (error) {
    console.error("Error:", error);
  }
};






    const tableColumns = {
      "1 - 4A, 4B, 6B, 6C - B2B, SEZ, DE Invoices": [
        { key: "gstin", label: "GSTIN", align: "left" },
        { key: "recipientName", label: "Recipient Name", align: "left" },
        { key: "invNo", label: "Inv. No.", align: "left" },
        { key: "invDate", label: "Inv. Date", align: "center" },
        { key: "invValue", label: "Inv. Value", align: "right", type: "number" },
        { key: "pos", label: "POS", align: "center" },
        { key: "rcm", label: "RCM", align: "center" },
        { key: "invType", label: "Inv. Type", align: "center" },
        { key: "ecoGstin", label: "ECO GSTIN", align: "center" },
        { key: "applicableTaxRate", label: "App. % Tax rate", align: "center" },
        { key: "gstRate", label: "Rate", align: "right", type: "number" },
        { key: "taxableValue", label: "Taxable Value", align: "right", type: "number" },
        { key: "igst", label: "IGST", align: "right", type: "number" },
        { key: "cgst", label: "CGST", align: "right", type: "number" },
        { key: "sgst", label: "SGST", align: "right", type: "number" },
        { key: "cess", label: "CESS", align: "right", type: "number" }
      ],

      
      "2 - B2C (Large) Invoices": [
        { key: "invNo", label: "Inv. No.", align: "left" },
        { key: "invValue", label: "Inv. Value", align: "right", type: "number" },
        { key: "pos", label: "POS", align: "center" },
        { key: "applicableTaxRate", label: "App. % of Tax Rate", align: "center" },
        { key: "gstRate", label: "Rate", align: "right", type: "number" },
        { key: "taxableValue", label: "Taxable Value", align: "right", type: "number" },
        { key: "igst", label: "IGST", align: "right", type: "number" },
        { key: "cgst", label: "CGST", align: "right", type: "number" },
        { key: "sgst", label: "SGST", align: "right", type: "number" },
        { key: "cess", label: "CESS", align: "right", type:   "number"}
      ],


      "3 - Exports Invoices": [

  { key: "exportType", label: "Export Type", align: "center" },

  { key: "invoiceNumber", label: "Invoice Number", align: "left" },

  { key: "invoiceDate", label: "Invoice Date", align: "center" },

  { key: "invoiceValue", label: "Invoice Value", align: "right", type: "number" },

  { key: "portCode", label: "Port Code", align: "center" },

  { key: "shippingBillNumber", label: "Shipping Bill Number", align: "left" },

  { key: "shippingBillDate", label: "Shipping Bill Date", align: "center" },

  { key: "rate", label: "Rate", align: "right" },

  { key: "taxableValue", label: "Taxable Value", align: "right", type: "number" },

  { key: "igst", label: "IGST", align: "right", type: "number" },

  { key: "cgst", label: "CGST", align: "right", type: "number" },

  { key: "sgst", label: "SGST", align: "right", type: "number" },

  { key: "cessAmount", label: "Cess Amount", align: "right", type: "number" }

],

                  
  
  

      "5 - 8B, 8C, 8D - Nil Rated Supplies": [
        { key: "invNo", label: "Inv. No.", align: "left" },
        { key: "invDate", label: "Inv. Date", align: "center" },
        { key: "invValue", label: "Inv. Value", align: "right", type: "number" },
        { key: "pos", label: "POS", align: "center" },
        { key: "applicableTaxRate", label: "Applicable % of Tax rate", align: "center" },
        { key: "gstRate", label: "Rate", align: "right", type: "number" },
        { key: "taxableValue", label: "Taxable Value", align: "right", type: "number" },
        { key: "igst", label: "IGST", align: "right", type: "number" },
        { key: "cgst", label: "CGST", align: "right", type: "number" },
        { key: "sgst", label: "SGST", align: "right", type: "number" },
        { key: "cess", label: "CESS", align: "right", type: "number" }
      ],
     
      "4 - B2C (Others)": [
        { key: "type", label: "Type", align: "center" },
        { key: "pos", label: "POS", align: "center" },
        { key: "applicableTaxRate", label: "App. % of Tax Rate", align: "center" },
        { key: "rate", label: "Rate", align: "right", type: "number" },
        { key: "taxableValue", label: "Taxable Value", align: "right", type: "number" },
        { key: "igst", label: "IGST", align: "right", type: "number" },
        { key: "cgst", label: "CGST", align: "right", type: "number" },
        { key: "sgst", label: "SGST", align: "right", type: "number" },
        { key: "cess", label: "Cess", align: "right", type: "number" },
        { key: "total", label: "Total", align: "right", type: "number" }
      ],
       
      "5 - 8B, 8C, 8D - Nil Rated Supplies":[
        { key: "description", label: "Description", align: "left" },
        { key: "nilRated", label: "Nil Rated", align: "right", type: "number" },
        { key: "exempted", label: "Exempted", align: "right", type: "number" },
        { key: "nonGst", label: "Non-GST", align: "right", type: "number" }
      ],

       
      "6 - 9B  Credit / Debit Notes (Registered)": [
        { key: "gstin", label: "GSTIN of Recipient", align: "left" },
        { key: "recipientName", label: "Recipient Name", align: "left" },
        { key: "noteNo", label: "Note No", align: "left" },
        { key: "noteDate", label: "Note Date", align: "center" },
        { key: "noteType", label: "Note Type", align: "center" },
        { key: "pos", label: "POS", align: "center" },
        { key: "rcm", label: "RCM", align: "center" },
        { key: "noteSupplyType", label: "Note Supply Type", align: "left" },
        { key: "noteValue", label: "Note Value", align: "right", type: "number" },
        { key: "applicableTaxRate", label: "App. % of Tax Rate", align: "center" },
        { key: "rate", label: "Rate", align: "right", type: "number" },
        { key: "taxable", label: "Taxable", align: "right", type: "number" },
        { key: "igst", label: "IGST", align: "right", type: "number" },
        { key: "cgst", label: "CGST", align: "right", type: "number" },
        { key: "sgst", label: "SGST", align: "right", type: "number" },
        { key: "cess", label: "Cess", align: "right", type: "number" },
        { key: "total", label: "Total", align: "right", type: "number" }
      ],

       
      "7 - 9B  Credit / Debit Notes (Unregistered)": [
        { key: "urType", label: "UR Type", align: "center" },
        { key: "noteNo", label: "Note No", align: "left" },
        { key: "noteDate", label: "Note Date", align: "center" },
        { key: "noteType", label: "Note Type", align: "center" },
        { key: "pos", label: "POS", align: "center" },
        { key: "noteSupplyType", label: "Note Supply Type", align: "left" },
        { key: "noteValue", label: "Note Value", align: "right", type: "number" },
        { key: "applicableTaxRate", label: "App. % of Tax Rate", align: "center" },
        { key: "rate", label: "Rate", align: "right", type: "number" },
        { key: "taxable", label: "Taxable", align: "right", type: "number" },
        { key: "igst", label: "IGST", align: "right", type: "number" },
        { key: "cgst", label: "CGST", align: "right", type: "number" },
        { key: "sgst", label: "SGST", align: "right", type: "number" },
        { key: "cess", label: "Cess", align: "right", type: "number" },
        { key: "total", label: "Total", align: "right", type: "number" }
      ],
      
      "8 - 11A(1), 11A(2) - Tax Liability (Advances Received)": [
        { key: "pos", label: "POS", align: "center" },
        { key: "applicableTaxRate", label: "App. % of Tax Rate", align: "center" },
        { key: "rate", label: "Rate", align: "right", type: "number" },
        { key: "grossAdvance", label: "Gross Advance Received", align: "right", type: "number" },
        // { key: "taxable", label: "Taxable", align: "right", type: "number" },
        { key: "igst", label: "IGST", align: "right", type: "number" },
        { key: "cgst", label: "CGST", align: "right", type: "number" },
        { key: "sgst", label: "SGST", align: "right", type: "number" },
        { key: "cess", label: "Cess", align: "right", type: "number" },
        { key: "total", label: "Total", align: "right", type: "number" }
      ],
      
      "9 - 11B Adjustment of Advances": [
        { key: "pos", label: "POS", align: "center" },
        { key: "applicableTaxRate", label: "App. % of Tax Rate", align: "center" },
        { key: "rate", label: "Rate", align: "right", type: "number" },
        { key: "grossAdvance", label: "Gross Advance Received", align: "right", type: "number" },
        { key: "taxable", label: "Taxable", align: "right", type: "number" },
        { key: "igst", label: "IGST", align: "right", type: "number" },
        { key: "cgst", label: "CGST", align: "right", type: "number" },
        { key: "sgst", label: "SGST", align: "right", type: "number" },
        { key: "cess", label: "Cess", align: "right", type: "number" },
        { key: "total", label: "Total", align: "right", type: "number" }
      ],
      "12 - HSN-wise summary of outward supplies": [
        { key: "hsn", label: "HSN", align: "center" },
        { key: "description", label: "Description", align: "left" },
        { key: "uqc", label: "UQC", align: "center" },
        { key: "totalQty", label: "Total Qty", align: "right", type: "number" },
        { key: "totalValue", label: "Total Value", align: "right", type: "number" },
        { key: "rate", label: "Rate", align: "right", type: "number" },
        { key: "taxable", label: "Taxable", align: "right", type: "number" },
        { key: "igst", label: "IGST", align: "right", type: "number" },
        { key: "cgst", label: "CGST", align: "right", type: "number" },
        { key: "sgst", label: "SGST", align: "right", type: "number" },
        { key: "cess", label: "Cess", align: "right", type: "number" }
      ],
      "13 - Documents Issued": [
        { key: "nature", label: "Nature of Documents Issued", align: "left" },
        { key: "srFrom", label: "Sr No from", align: "center" },
        { key: "srTo", label: "Sr No. To", align: "center" },
        { key: "totalNumber", label: "Total Number", align: "right", type: "number" },
        { key: "cancelled", label: "Cancelled", align: "right", type: "number" }
      ],
      "14 - Supplies made through ECO": [
        { key: "nature", label: "Supply", align: "left" },
        { key: "gstinEco", label: "GSTIN of ECO", align: "left" },
        { key: "nameEco", label: "Name of ECO", align: "left" },
        { key: "netValue", label: "Net Value of Supply", align: "right", type: "number" },
        { key: "igst", label: "IGST", align: "right", type: "number" },
        { key: "cgst", label: "CGST", align: "right", type: "number" },
        { key: "sgst", label: "SGST", align: "right", type: "number" },
        { key: "cess", label: "Cess", align: "right", type: "number" },
        { key: "total", label: "Total", align: "right", type: "number" }
      ],

      "15 - Supplies U/s 9(5)": [
          { key: "nature", label: "Nature of Supply", align: "left" },      
          { key: "gstinEco", label: "GSTIN of ECO", align: "left" },
          { key: "nameEco", label: "Name of ECO", align: "left" },
          { key: "netValue", label: "Net Value of Supply", align: "right", type: "number" },
          { key: "igst", label: "IGST", align: "right", type: "number" },
          { key: "cgst", label: "CGST", align: "right", type: "number" },
          { key: "sgst", label: "SGST", align: "right", type: "number" },       
          { key: "cess", label: "Cess", align: "right", type: "number" },
          { key: "total", label: "Total", align: "right", type:"number" }    
      ],

      "16 - B2B Amendment": [
        { key: "gstin", label: "GSTIN", align: "left" },
        { key: "invoiceNo", label: "Invoice No", align: "left" },
        { key: "invoiceDate", label: "Invoice Date", align: "left" },     // or "center" if you prefer
        { key: "invoiceValue", label: "Invoice Value", align: "right", type: "number" },
        { key: "pos", label: "POS", align: "center" },                    // Place of Supply - often shown centered
        { key: "rate", label: "Rate", align: "right", type: "number" },
        { key: "taxableValue", label: "Taxable Value", align: "right", type: "number" },
        { key: "igst", label: "IGST", align: "right", type: "number" },
        { key: "cgst", label: "CGST", align: "right", type: "number" },
        { key: "sgst", label: "SGST", align: "right", type: "number" },
        { key: "cess", label: "CESS", align: "right", type: "number" }
      ],
      "17 - Export Amendment": [
        { key: "exportType", label: "Export Type", align: "left" },
        { key: "invoiceNo", label: "Invoice No", align: "left" },
        { key: "invoiceDate", label: "Invoice Date", align: "left" },
        { key: "invoiceValue", label: "Invoice Value", align: "right", type: "number" },
        { key: "portCode", label: "Port Code", align: "left" },
        { key: "shippingBillNo", label: "Shipping Bill No", align: "left" },
        { key: "shippingBillDate", label: "Shipping Bill Date", align: "left" },
        { key: "rate", label: "Rate", align: "right", type: "number" },
        { key: "taxableValue", label: "Taxable Value", align: "right", type: "number" },
        { key: "igst", label: "IGST", align: "right", type: "number" },
        { key: "cess", label: "CESS", align: "right", type: "number" }
      ],
"18 - ECO B2B": [
  { key: "supplierGstin", label: "Supplier GSTIN/UIN", align: "left" },
  { key: "supplierName", label: "Supplier Name", align: "left" },
  {key:"receipstGstin", label: "Recipient GSTIN/UIN", align: "left" },
  {key:"recipientName", label: "Recipient Name", align: "left" },
  {key:"documentNumber", label: "Document Number", align: "left" },
  {key:"documentDate", label: "Document Date", align: "center" },
  {key:"suppliesValue", label: "Value of Supplies Made", align: "right", type: "number" },


  { key: "pos", label: "POS", align: "center" },
  {key:"documentType", label: "Document Type", align: "center" },

  { key: "rate", label: "Rate", align: "right", type: "number" },

  { key: "taxableValue", label: "Taxable Value", align: "right", type: "number" },

  { key: "igst", label: "IGST", align: "right", type: "number" },

  { key: "cgst", label: "CGST", align: "right", type: "number" },

  { key: "sgst", label: "SGST", align: "right", type: "number" },

  { key: "cess", label: "CESS", align: "right", type: "number" }
],

    "19 - ECO URP B2B": [
  { key: "recipientGstin", label: "Recipient GSTIN/UIN", align: "left" },
  { key: "recipientName", label: "Recipient Name", align: "left" },

  { key: "documentNumber", label: "Document Number", align: "left" },
  { key: "documentDate", label: "Document Date", align: "center" },

  { key: "suppliesValue", label: "Value of Supplies Made", align: "right", type: "number" },

  { key: "pos", label: "POS", align: "center" },

  { key: "documentType", label: "Document Type", align: "center" },

  { key: "rate", label: "Rate", align: "right", type: "number" },
  { key: "taxableValue", label: "Taxable Value", align: "right", type: "number" },

  { key: "igst", label: "IGST", align: "right", type: "number" },
  { key: "cgst", label: "CGST", align: "right", type: "number" },
  { key: "sgst", label: "SGST", align: "right", type: "number" },

  { key: "cess", label: "CESS", align: "right", type: "number" }
],
"20 - ECO B2C": [
  { key: "supplierGstin", label: "Supplier GSTIN/UIN", align: "left" },
  { key: "supplierName", label: "Supplier Name", align: "left" },

  { key: "pos", label: "POS", align: "center" },
  { key: "rate", label: "Rate", align: "right", type: "number" },
  { key: "taxableValue", label: "Taxable Value", align: "right", type: "number" },
  { key: "igst", label: "IGST", align: "right", type: "number" },
  { key: "cgst", label: "CGST", align: "right", type: "number" },
  { key: "sgst", label: "SGST", align: "right", type: "number" },
  { key: "cess", label: "CESS", align: "right", type: "number" }
],

      "21 - ECO URP B2C": [
        { key: "pos", label: "POS", align: "center" },
        { key: "rate", label: "Rate", align: "right", type: "number" },
        { key: "taxableValue", label: "Taxable Value", align: "right", type: "number" },
        { key: "igst", label: "IGST", align: "right", type: "number" },
        { key: "cgst", label: "CGST", align: "right", type: "number" },
        { key: "sgst", label: "SGST", align: "right", type: "number" },
        { key: "cess", label: "CESS", align: "right", type: "number" }
      ],

      "22 - ECO Amendment B2B": [
        { key: "Supplier gstin", label: "GSTIN", align: "left" },
        {key: "supplierName", label: "Supplier Name", align: "left" },
        {key: "recipientGstin", label: "Recipient GSTIN", align: "left" },
        {key: "recipientName", label: "Recipient Name", align: "left" },
        {key: "Document number", label: "Document Number", align: "center" },
        {key:"Document date", label: "Document Date", align: "center" },
        // { key: "invoiceNo", label: "Invoice No", align: "left" },
        // { key: "invoiceDate", label: "Invoice Date", align: "left" },
        { key: "SuppliesValue Made", label: "Supplies Made", align: "right", type: "number" },

        { key: "pos", label: "POS", align: "center" },
        {key:"Invoice type", label: "Invoice Type", align: "center" },
        { key: "rate", label: "Rate", align: "right", type: "number" },
        { key: "taxableValue", label: "Taxable Value", align: "right", type: "number" },
        { key: "igst", label: "IGST", align: "right", type: "number" },
        { key: "cgst", label: "CGST", align: "right", type: "number" },
        { key: "sgst", label: "SGST", align: "right", type: "number" },
        { key: "cess", label: "CESS", align: "right", type: "number" }
      ],

      "23 - ECO Amendment B2C": [
        {key:"financialYear", label: "Financial Year", align: "left" },
        {key:"originalmonth", label: "Original Month", align: "left" },
        { key: "suppliesGstin", label: "Supplies GSTIN", align: "right" },
        { key: "suppliesName", label: "Supplies Name", align: "left" },
        { key: "pos", label: "POS", align: "center" },
        { key: "rate", label: "Rate", align: "right", type: "number" },
        { key: "taxableValue", label: "Taxable Value", align: "right", type: "number" },
        { key: "igst", label: "IGST", align: "right", type: "number" },
        { key: "cgst", label: "CGST", align: "right", type: "number" },
        { key: "sgst", label: "SGST", align: "right", type: "number" },
        { key: "cess", label: "CESS", align: "right", type: "number" },
        {key: "total", label: "Total", align: "right", type: "number" }
      ],

      "24 - ECO Amendment URP B2B": [
        {key:"gstin", label: "GSTIN", align: "left" },
        {key:"ReceiptName", label: "Receipt Name", align: "left" },
        {key:"OriginalDocumentNumber", label: "Original Document Number", align: "center" },
        {key:"OriginalDocumentDate", label: "Original Document Date", align: "center" },
        {key:"RevisedDocumentNumber", label: "Revised Document Number", align: "center" },
        {key:"RevisedDocumentDate", label: "Revised Document Date", align: "center" },
        {key:"valueofSupplies", label: "Value of Supplies", align: "right", type: "number" },
        {key:"documentType", label: "Document Type", align: "center" },
        
        { key: "pos", label: "POS", align: "center" },
        { key: "rate", label: "Rate", align: "right", type: "number" },
        { key: "taxableValue", label: "Taxable Value", align: "right", type: "number" },
        { key: "igst", label: "IGST", align: "right", type: "number" },
        { key: "cgst", label: "CGST", align: "right", type: "number" },
        { key: "sgst", label: "SGST", align: "right", type: "number" },
        { key: "cess", label: "CESS", align: "right", type: "number" }
      ],
      
      "25 - B2BA": [
        { key: "gstin", label: "GSTIN/UIN of Recipient", align: "left" },
        { key: "receiverName", label: "Receiver Name", align: "left" },
        { key: "original number", label: "Original Number", align: "center" },
        { key: "origInvDate", label: "Original  date", align: "center" },
        { key: "revInvNum", label: "Revised  Number", align: "center" },
        { key: "revInvDate", label: "Revised  date", align: "center" },
        { key: "Value", label: "values", align: "right", type: "number" },

        { key: "pos", label: "POS", align: "center" },
        { key: "rcm", label: "RCM", align: "center" },
        { key: "applicableTaxRate", label: "App. % of Tax Rate", align: "center" },

        // ← Yeh dono ab bilkul baki sections jaisa hai (dropdown kaam karega)
        { key: "invType", label: "Inv. Type", align: "center" },
        { key: "ecoGstin", label: "ECO GSTIN", align: "center" },

        { key: "rate", label: "Rate", align: "right", type: "number" },
        { key: "taxableValue", label: "Taxable Value", align: "right", type: "number" },
        { key: "igst", label: "IGST", align: "right", type: "number" },
        { key: "cgst", label: "CGST", align: "right", type: "number" },
        { key: "sgst", label: "SGST", align: "right", type: "number" },
        { key: "cess", label: "Cess", align: "right", type: "number" }
      ],

      "26 - B2CLA": [

        { key: "origInvNo", label: "Original Invoice Number", align: "left" },
        { key: "origInvDate", label: "Original Invoice Date", align: "center" },

        { key: "origPos", label: "POS", align: "center" },

        { key: "revInvNo", label: "Revised Invoice Number", align: "left" },
        { key: "revInvDate", label: "Revised Invoice Date", align: "center" },

        { key: "invoiceValueB2CLA", label: "Invoice Value", align: "right", type: "number" },

        { key: "applicableTaxRateB2CLA", label: "Applicable % of Tax Rate", align: "center" },

        { key: "rateB2CLA", label: "Rate", align: "right", type: "number" },

        { key: "taxableValueB2CLA", label: "Taxable Value", align: "right", type: "number" },

        { key: "cgst", label: "CGST", align: "right", type: "number" },
        { key: "igst", label: "IGST", align: "right", type: "number" },
        { key: "sgst", label: "SGST", align: "right", type: "number" },

        { key: "cessAmount", label: "Cess Amount", align: "right", type: "number" },

        { key: "ecoGstin", label: "E-Commerce GSTIN", align: "left" }

      ],

      "27 - CDNRA": [

        { key: "gstin", label: "GSTIN/UIN of Recipient", align: "left" },
        { key: "receiverName", label: "Receiver Name", align: "left" },

        { key: "origNoteNo", label: "Original Note Number", align: "left" },
        { key: "origNoteDate", label: "Original Note Date", align: "center" },

        { key: "revNoteNo", label: "Revised Note Number", align: "left" },
        { key: "revNoteDate", label: "Revised Note Date", align: "center" },

        { key: "noteType", label: "Note Type", align: "center" },
        { key: "pos", label: "Place Of Supply", align: "center" },

        { key: "rcm", label: "Reverse Charge", align: "center" },

        { key: "noteSupplyType", label: "Note Supply Type", align: "center" },

        { key: "noteValue", label: "Note Value", align: "right", type: "number" },

        { key: "applicableTaxRate", label: "Applicable % of Tax Rate", align: "center" },

        { key: "rate", label: "Rate", align: "right", type: "number" },

        { key: "taxableValue", label: "Taxable Value", align: "right", type: "number" },

        { key: "cgst", label: "CGST", align: "right", type: "number" },
        { key: "igst", label: "IGST", align: "right", type: "number" },
        { key: "sgst", label: "SGST", align: "right", type: "number" },

        { key: "cessAmount", label: "Cess Amount", align: "right", type: "number" }

],

        "28 - CDNURA": [

          { key: "urType", label: "UR Type", align: "center" },

          { key: "origNoteNo", label: "Original Note Number", align: "left" },
          { key: "origNoteDate", label: "Original Note Date", align: "center" },

          { key: "revNoteNo", label: "Revised Note Number", align: "left" },
          { key: "revNoteDate", label: "Revised Note Date", align: "center" },

          { key: "noteType", label: "Note Type", align: "center" },

          { key: "pos", label: "Place Of Supply", align: "center" },

          { key: "noteValue", label: "Note Value", align: "right", type: "number" },

          { key: "applicableTaxRate", label: "Applicable % of Tax Rate", align: "center" },

          { key: "rate", label: "Rate", align: "right", type: "number" },

          { key: "taxableValue", label: "Taxable Value", align: "right", type: "number" },

          { key: "cgst", label: "CGST", align: "right", type: "number" },
          { key: "igst", label: "IGST", align: "right", type: "number" },
          { key: "sgst", label: "SGST", align: "right", type: "number" },

          { key: "cessAmount", label: "Cess Amount", align: "right", type: "number" }

        ],

        "29 - ECO URP2C Amendment": [

          { key: "financialYear", label: "Financial Year", align: "center" },

          { key: "originalMonth", label: "Original Month", align: "center" },

          { key: "pos", label: "Place Of Supply", align: "center" },

          { key: "rate", label: "Rate", align: "right", type: "number" },

          { key: "taxableValue", label: "Taxable Value", align: "right", type: "number" },
          { key: "igst", label: "IGST", align: "right", type: "number" },
          { key: "cgst", label: "CGST", align: "right", type: "number" },
          { key: "sgst", label: "SGST", align: "right", type: "number" },


          { key: "cessAmount", label: "Cess Amount", align: "right", type: "number" }

], 

"30 - Amended Tax Liability": [
  { key: "financialYear", label: "Financial Year", align: "center" },
  { key: "originalMonth", label: "Original Month", align: "center" },
  { key: "originalPlaceOfSupply", label: "Original Place Of Supply", align: "center" },
  { key: "applicableTaxRate", label: "Applicable % of Tax Rate", align: "right" },
  { key: "rate", label: "Rate", align: "right" },
  { key: "grossAdvanceReceived", label: "Gross Advance Received", align: "right", type: "number" },
  { key: "igst", label: "IGST", align: "right", type: "number" },
  { key: "cgst", label: "CGST", align: "right", type: "number" },
  { key: "sgst", label: "SGST", align: "right", type: "number" },
  { key: "cessAmount", label: "Cess Amount", align: "right", type: "number" }
],

// New amendment tables from Excel
"31 - B2C (Small) Amendment": [
  { key: "financialYear", label: "Financial Year", align: "center" },
  { key: "originalMonth", label: "Original Month", align: "center" },
  { key: "pos", label: "Place Of Supply", align: "center" },
  { key: "type", label: "Type", align: "center" },
  { key: "applicableTaxRate", label: "Applicable % of Tax Rate", align: "center" },
  { key: "rate", label: "Rate", align: "right", type: "number" },
  { key: "taxableValue", label: "Taxable Value", align: "right", type: "number" },
  { key: "cess", label: "Cess Amount", align: "right", type: "number" },
  {key: "igst", label: "IGST", align: "right", type: "number" }, 
  {key: "cgst", label: "CGST", align: "right", type: "number" },
  {key: "sgst", label: "SGST", align: "right", type: "number" },
  { key: "ecoGstin", label: "E-Commerce GSTIN", align: "left" }
],

"32 - Advance Received Amendment": [
  { key: "financialYear", label: "Financial Year", align: "center" },
  { key: "originalMonth", label: "Original Month", align: "center" },
  { key: "pos", label: "Place Of Supply", align: "center" },
  { key: "applicableTaxRate", label: "Applicable % of Tax Rate", align: "center" },
  { key: "rate", label: "Rate", align: "right", type: "number" },
  { key: "grossAdvance", label: "Gross Advance Received", align: "right", type: "number" },
  { key: "igst", label: "IGST", align: "right", type: "number" },
  { key: "cgst", label: "CGST", align: "right", type: "number" },
  { key: "sgst", label: "SGST", align: "right", type: "number" },
  { key: "cess", label: "Cess Amount", align: "right", type: "number" }
],

"33 - Advance Adjustment Amendment": [
  { key: "financialYear", label: "Financial Year", align: "center" },
  { key: "originalMonth", label: "Original Month", align: "center" },
  { key: "pos", label: "Place Of Supply", align: "center" },
  { key: "applicableTaxRate", label: "Applicable % of Tax Rate", align: "center" },
  { key: "rate", label: "Rate", align: "right", type: "number" },
  { key: "grossAdvance", label: "Gross Advance Adjusted", align: "right", type: "number" },
  { key: "igst", label: "IGST", align: "right", type: "number" },
  { key: "cgst", label: "CGST", align: "right", type: "number" },
  { key: "sgst", label: "SGST", align: "right", type: "number" },
  { key: "cess", label: "Cess Amount", align: "right", type: "number" }
],

"34 - Supply through ECO Amendment": [
  { key: "nature", label: "Nature of Supply", align: "center" },
  { key: "financialYear", label: "Financial Year", align: "center" },
  { key: "originalMonth", label: "Original Month", align: "center" },
  { key: "origEcoGstin", label: "Original ECO GSTIN", align: "left" },
  { key: "revisedEcoGstin", label: "Revised ECO GSTIN", align: "left" },
  { key: "ecoName", label: "ECO Name", align: "left" },
  { key: "netValue", label: "Revised Net Value", align: "right", type: "number" },
  { key: "igst", label: "IGST", align: "right", type: "number" },
  { key: "cgst", label: "CGST", align: "right", type: "number" },
  { key: "sgst", label: "SGST", align: "right", type: "number" },
  { key: "cess", label: "Cess", align: "right", type: "number" }
],
"Table 4": [
  { key: "gstinJobWorker", label: "GSTIN of Job Worker", align: "left" },
  { key: "state", label: "State (in case of Unregistered)", align: "left" },
  { key: "jobWorkerType", label: "Job Worker's Type", align: "center" },
  { key: "challanNumber", label: "Challan Number", align: "left" },
  { key: "challanDate", label: "Challan Date", align: "center" },
  { key: "goodsType", label: "Type of Goods", align: "center" },
  { key: "description", label: "Description of Goods", align: "left" },
  { key: "uqc", label: "Unique Quantity Code (UQC)", align: "center" },
  { key: "quantity", label: "Quantity", align: "right", type: "number" },
  { key: "taxableValue", label: "Taxable Value", align: "right", type: "number" },
  { key: "rate", label: "Rate", align: "right", type: "number" },
  { key: "igst", label: "IGST", align: "right", type: "number" },
  { key: "cgst", label: "CGST", align: "right", type: "number" },
  { key: "sgst", label: "SGST", align: "right", type: "number" },
  { key: "cess", label: "CESS", align: "right", type: "number" }
],

"Table 5(A)": [
  { key: "gstinJobWorker", label: "GSTIN of Job Worker", align: "left" },
  { key: "state", label: "State (in case of Unregistered)", align: "left" },
  { key: "jobWorkerType", label: "Job Worker's Type", align: "center" },
  { key: "challanNumber", label: "Challan Number", align: "left" },
  { key: "challanDate", label: "Challan Date", align: "center" },
  { key: "goodsType", label: "Type of Goods", align: "center" },
  { key: "description", label: "Description of Goods", align: "left" },
  { key: "uqc", label: "Unique Quantity Code (UQC)", align: "center" },
  { key: "quantity", label: "Quantity", align: "right", type: "number" },
  { key: "taxableValue", label: "Taxable Value", align: "right", type: "number" },
  { key: "rate", label: "Rate", align: "right", type: "number" },
  { key: "igst", label: "IGST", align: "right", type: "number" },
  { key: "cgst", label: "CGST", align: "right", type: "number" },
  { key: "sgst", label: "SGST", align: "right", type: "number" },
  { key: "cess", label: "CESS", align: "right", type: "number" }
],

"Table 5(B)": [
  { key: "gstinJobWorker", label: "GSTIN of Job Worker", align: "left" },
  { key: "state", label: "State (in case of Unregistered)", align: "left" },
  { key: "jobWorkerType", label: "Job Worker's Type", align: "center" },
  { key: "challanNumber", label: "Challan Number", align: "left" },
  { key: "challanDate", label: "Challan Date", align: "center" },
  { key: "goodsType", label: "Type of Goods", align: "center" },
  { key: "description", label: "Description of Goods", align: "left" },
  { key: "uqc", label: "Unique Quantity Code (UQC)", align: "center" },
  { key: "quantity", label: "Quantity", align: "right", type: "number" },
  { key: "taxableValue", label: "Taxable Value", align: "right", type: "number" },
  { key: "rate", label: "Rate", align: "right", type: "number" },
  { key: "igst", label: "IGST", align: "right", type: "number" },
  { key: "cgst", label: "CGST", align: "right", type: "number" },
  { key: "sgst", label: "SGST", align: "right", type: "number" },
  { key: "cess", label: "CESS", align: "right", type: "number" }
],

"Table 5(C)": [
  { key: "gstinJobWorker", label: "GSTIN of Job Worker", align: "left" },
  { key: "state", label: "State (in case of Unregistered)", align: "left" },
  { key: "jobWorkerType", label: "Job Worker's Type", align: "center" },
  { key: "challanNumber", label: "Challan Number", align: "left" },
  { key: "challanDate", label: "Challan Date", align: "center" },
  { key: "goodsType", label: "Type of Goods", align: "center" },
  { key: "description", label: "Description of Goods", align: "left" },
  { key: "uqc", label: "Unique Quantity Code (UQC)", align: "center" },
  { key: "quantity", label: "Quantity", align: "right", type: "number" },
  { key: "taxableValue", label: "Taxable Value", align: "right", type: "number" },
  { key: "rate", label: "Rate", align: "right", type: "number" },
  { key: "igst", label: "IGST", align: "right", type: "number" },
  { key: "cgst", label: "CGST", align: "right", type: "number" },
  { key: "sgst", label: "SGST", align: "right", type: "number" },
  { key: "cess", label: "CESS", align: "right", type: "number" }
],

};




   const currentColumns = tableColumns[isITC04 ? selectedItcTable : selectedSection] || [];
   const getRowsAndSetter = () => {
  if (isITC04) {
    switch (selectedItcTable) {
      case "Table 4":
        return [itc04Table4Rows, setItc04Table4Rows];
      case "Table 5(A)":
        return [itc04Table5ARows, setItc04Table5ARows];
      case "Table 5(B)":
        return [itc04Table5BRows, setItc04Table5BRows];
      case "Table 5(C)":
        return [itc04Table5CRows, setItc04Table5CRows];
      default:
        return [[], () => {}];
    }
  } 
      switch (selectedSection) {
        case "1 - 4A, 4B, 6B, 6C - B2B, SEZ, DE Invoices": return [b2bRows, setB2bRows];
        case "2 - B2C (Large) Invoices": return [b2cLargeRows, setB2cLargeRows];
        case "3 - Exports Invoices": return [b2cOthersRows, setB2cOthersRows];
        case "4 - B2C (Others)": return [nilExemptRows, setNilExemptRows];
        case "5 - 8B, 8C, 8D - Nil Rated Supplies": return [nilExemptRows, setNilExemptRows];
        case "6 - 9B  Credit / Debit Notes (Registered)": return [creditDebitRegisteredRows, setCreditDebitRegisteredRows];
        case "7 - 9B  Credit / Debit Notes (Unregistered)": return [creditDebitUnregisteredRows, setCreditDebitUnregisteredRows];
        case "8 - 11A(1), 11A(2) - Tax Liability (Advances Received)": return [advanceLiabilityRows, setAdvanceLiabilityRows];
        case "9 - 11B Adjustment of Advances": return [advanceAdjustmentRows, setAdvanceAdjustmentRows];
        case "12 - HSN-wise summary of outward supplies": return [hsnRows, setHsnRows];
        case "13 - Documents Issued": return [documentsRows, setDocumentsRows];
        case "14 - Supplies made through ECO": return [ecoRows, setEcoRows];
        case "15 - Supplies U/s 9(5)": return [outwardSupplies, setOutwardSupplies];
        case "16 - B2B Amendment": return [b2bAmendmentRows, setB2bAmendmentRows];
        case "17 - Export Amendment": return [exportAmendmentRows, setExportAmendmentRows];
        case "18 - ECO B2B": return [ecoB2bRows, setEcoB2bRows];
        case "19 - ECO URP B2B": return [ecoUrpB2bRows, setEcoUrpB2bRows];
        case "20 - ECO B2C": return [ecoB2cRows, setEcoB2cRows];
        case "21 - ECO URP B2C": return [ecoUrpB2cRows, setEcoUrpB2cRows];
        case "22 - ECO Amendment B2B": return [ecoAmendmentB2bRows, setEcoAmendmentB2bRows];
        case "23 - ECO Amendment B2C": return [ecoAmendmentB2cRows, setEcoAmendmentB2cRows];
        case "24 - ECO Amendment URP B2B": return [ecoAmendmentUrpB2bRows, setEcoAmendmentUrpB2bRows];
        case "25 - B2BA": return [b2baRows, setB2baRows];
        case "26 - B2CLA": return [b2claRows, setB2claRows];
        case "27 - CDNRA": return [cdnraRows, setCdnraRows];
        case "28 - CDNURA": return [cdnuraRows, setCdnuraRows];
        case "29 - ECO URP2C Amendment":return [ecoUrp2cAmendmentRows, setEcoUrp2cAmendmentRows];
        case "30 - Amended Tax Liability": return [amendedTaxLiabilityRows, setAmendedTaxLiabilityRows];
        case "31 - B2C (Small) Amendment": return [b2csaRows, setB2csaRows];
        case "32 - Advance Received Amendment": return [advanceReceivedAmendmentRows, setAdvanceReceivedAmendmentRows];
        case "33 - Advance Adjustment Amendment": return [advanceAdjustmentAmendmentRows, setAdvanceAdjustmentAmendmentRows];
        case "34 - Supply through ECO Amendment": return [ecoSupplyAmendmentRows, setEcoSupplyAmendmentRows];
        default: return [[], () => {}];
      }
    };
    const [rows, setRows] = getRowsAndSetter();
    
    const addRow = () => {
      const newSl = rows.length + 1;
      let newRow = { sl: newSl };
      if (selectedSection.includes("B2C (Others)")) newRow.type = "E/OF";
      if (selectedSection.includes("Credit / Debit Notes (Registered)")) {
        newRow.noteType = "Debit";
        newRow.noteSupplyType = "Regular B2B";
      }
      if (selectedSection.includes("Credit / Debit Notes (Unregistered)")) {
        newRow.urType = urTypeOptions[0];
        newRow.noteType = "Debit";
        newRow.noteSupplyType = "Regular B2B";
      }
      if (selectedSection.includes("Documents Issued")) newRow.nature = documentNatureOptions[0];
      if (selectedSection.includes("ECO")) newRow.nature = natureOptions[0];
      setRows([...rows, newRow]);
    };
    const updateCell = (index, key, value) => {
      const newRows = [...rows];
      newRows[index][key] = value;
      setRows(newRows);
    };
    const deleteRow = (index) => {
      if (rows.length > 1) setRows(rows.filter((_, i) => i !== index));
    };
    const handleSave = () => {
      let taxable = 0, igst = 0, cgst = 0, sgst = 0, cess = 0, total = 0;
      rows.forEach(row => {
        taxable += Number(row.taxableValue || row.taxable || row.totalValue || row.netValue || row.nilRated || row.exempted || row.nonGst || row.grossAdvance || 0);
        igst += Number(row.igst || 0);
        cgst += Number(row.cgst || 0);
        sgst += Number(row.sgst || 0);
        cess += Number(row.cess || 0);
        total += Number(row.total || (taxable + igst + cgst + sgst + cess));
      });
      let key = "";
      if (selectedSection.includes("B2B")) key = "b2b";
      else if (selectedSection.includes("B2C (Large)")) key = "b2cLarge";
      else if (selectedSection.includes("B2C (Others)")) key = "b2cOthers";
      else if (selectedSection.includes("HSN")) key = "hsn";
      if (key && total > 0) {
        
        alert("Saved successfully!");
      }
    };
    const toNum = (value) => Number(value || 0);

const getGstr3bSectionFileName = (sectionName) => {
  const map = {
    [gstr3bSections[0]]: "GSTR-3B-3.1-Outward-Reverse-Charge.xlsx",
    [gstr3bSections[1]]: "GSTR-3B-3.1.1-Supplies-u-s-9(5).xlsx",
    [gstr3bSections[2]]: "GSTR-3B-3.2-Inter-State-Supplies.xlsx",
    [gstr3bSections[3]]: "GSTR-3B-4-Eligible-ITC.xlsx",
    [gstr3bSections[4]]: "GSTR-3B-5-Exempt-Nil-Non-GST.xlsx",
    [gstr3bSections[5]]: "GSTR-3B-5.1-Interest-Late-Fee.xlsx",
    [gstr3bSections[6]]: "GSTR-3B-6.1-Payment-of-Tax.xlsx"
  };
  return map[sectionName] || "GSTR-3B-Section.xlsx";
};

const buildGstr3bSectionPayload = (sectionName) => {
  if (sectionName === gstr3bSections[0]) {
    return {
      sectionName,
      fileName: getGstr3bSectionFileName(sectionName),
      rows: outwardSupplies.map((row) => ({
        "Nature of Supplies": row.nature,
        "Taxable Value": toNum(row.taxable),
        IGST: row.igst === "Hide" ? "" : toNum(row.igst),
        CGST: row.cgst === "Hide" ? "" : toNum(row.cgst),
        SGST: row.sgst === "Hide" ? "" : toNum(row.sgst),
        CESS: row.cess === "Hide" ? "" : toNum(row.cess)
      }))
    };
  }

  if (sectionName === gstr3bSections[1]) {
    return {
      sectionName,
      fileName: getGstr3bSectionFileName(sectionName),
      rows: ecoSupplies.map((row) => ({
        "Nature of Supplies": row.nature,
        "Taxable Value": toNum(row.taxable),
        IGST: toNum(row.igst),
        CGST: toNum(row.cgst),
        SGST: toNum(row.sgst),
        CESS: toNum(row.cess),
        Total: toNum(row.total)
      }))
    };
  }

  if (sectionName === gstr3bSections[2]) {
    return {
      sectionName,
      fileName: getGstr3bSectionFileName(sectionName),
      rows: [
        ...unregisteredSupplies.map((row) => ({
          Category: "Unregistered Persons",
          "Place of Supply": row.placeOfSupply,
          "Taxable Value": toNum(row.taxableValue),
          IGST: toNum(row.igst)
        })),
        ...compositionSupplies.map((row) => ({
          Category: "Composition Taxable Persons",
          "Place of Supply": row.placeOfSupply,
          "Taxable Value": toNum(row.taxableValue),
          IGST: toNum(row.igst)
        })),
        ...uinSupplies.map((row) => ({
          Category: "UIN Holders",
          "Place of Supply": row.placeOfSupply,
          "Taxable Value": toNum(row.taxableValue),
          IGST: toNum(row.igst)
        }))
      ]
    };
  }

  if (sectionName === gstr3bSections[3]) {
    return {
      sectionName,
      fileName: getGstr3bSectionFileName(sectionName),
      rows: [
        ...itcDetails.available.map((row) => ({
          Block: "ITC Available",
          Description: row.desc,
          IGST: toNum(row.igst),
          CGST: toNum(row.cgst),
          SGST: toNum(row.sgst),
          CESS: toNum(row.cess)
        })),
        ...itcDetails.reversed.map((row) => ({
          Block: "ITC Reversed",
          Description: row.desc,
          IGST: toNum(row.igst),
          CGST: toNum(row.cgst),
          SGST: toNum(row.sgst),
          CESS: toNum(row.cess)
        })),
        {
          Block: "Net ITC",
          Description: "Net ITC Available (A - B)",
          IGST: toNum(itcDetails.netItc.igst),
          CGST: toNum(itcDetails.netItc.cgst),
          SGST: toNum(itcDetails.netItc.sgst),
          CESS: toNum(itcDetails.netItc.cess)
        },
        ...itcDetails.ineligible.map((row) => ({
          Block: "Other Details",
          Description: row.desc,
          IGST: toNum(row.igst),
          CGST: toNum(row.cgst),
          SGST: toNum(row.sgst),
          CESS: toNum(row.cess)
        }))
      ]
    };
  }

  if (sectionName === gstr3bSections[4]) {
    return {
      sectionName,
      fileName: getGstr3bSectionFileName(sectionName),
      rows: exemptNonGst.map((row) => ({
        "Nature of Supplies": row.nature,
        "Inter-State": toNum(row.interstate),
        "Intra-State": toNum(row.intrastate),
        Total: toNum(row.interstate) + toNum(row.intrastate)
      }))
    };
  }

  if (sectionName === gstr3bSections[5]) {
    return {
      sectionName,
      fileName: getGstr3bSectionFileName(sectionName),
      rows: interestLateFee.map((row) => ({
        Description: row.desc,
        IGST: toNum(row.igst),
        CGST: toNum(row.cgst),
        SGST: toNum(row.sgst),
        CESS: toNum(row.cess),
        Total: toNum(row.igst) + toNum(row.cgst) + toNum(row.sgst) + toNum(row.cess)
      }))
    };
  }

  if (sectionName === gstr3bSections[6]) {
    return {
      sectionName,
      fileName: getGstr3bSectionFileName(sectionName),
      rows: [
        ...cashLedger.map((row) => ({
          Block: "Cash Ledger",
          Description: row.desc,
          IGST: toNum(row.igst),
          CGST: toNum(row.cgst),
          SGST: toNum(row.sgst),
          CESS: toNum(row.cess),
          Total: toNum(row.igst) + toNum(row.cgst) + toNum(row.sgst) + toNum(row.cess)
        })),
        ...creditLedger.map((row) => ({
          Block: "Credit Ledger",
          Description: "Credit Ledger Balance",
          IGST: toNum(row.igst),
          CGST: toNum(row.cgst),
          SGST: toNum(row.sgst),
          CESS: toNum(row.cess),
          Total: toNum(row.igst) + toNum(row.cgst) + toNum(row.sgst) + toNum(row.cess)
        }))
      ]
    };
  }

  return null;
};

const handleGstr3bSave = () => {
  if (!selectedSection) {
    alert("Please select section first.");
    return;
  }

  const payload = buildGstr3bSectionPayload(selectedSection);

  if (!payload || !payload.rows || payload.rows.length === 0) {
    alert("No data found to save.");
    return;
  }

  setGstr3bSavedSummary((prev) => ({
    ...prev,
    [selectedSection]: {
      ...payload,
      savedAt: new Date().toLocaleString("en-IN")
    }
  }));

  setActiveSubTab("Summary");
  alert(`${selectedSection} saved successfully!`);
};

const downloadGstr3bSectionExcel = (sectionName) => {
  const payload = gstr3bSavedSummary[sectionName];
  if (!payload || !payload.rows || payload.rows.length === 0) {
    alert("No saved data found for download.");
    return;
  }

  const wb = XLSX.utils.book_new();

  const headingRows = [
    ["GSTR-3B Summary Report"],
    ["Section", payload.sectionName],
    ["Financial Year", selectedYear || ""],
    ["Month", selectedMonth || ""],
    ["Saved At", payload.savedAt || ""],
    []
  ];

  const dataRows = payload.rows;
  const ws = XLSX.utils.json_to_sheet([]);

  XLSX.utils.sheet_add_aoa(ws, headingRows, { origin: "A1" });
  XLSX.utils.sheet_add_json(ws, dataRows, {
    origin: "A7",
    skipHeader: false
  });

  XLSX.utils.book_append_sheet(wb, ws, "Summary");
  XLSX.writeFile(wb, payload.fileName || "GSTR-3B-Section.xlsx");
};
    const formatIndian = (num) => num === 0 ? "—" : Number(num).toLocaleString("en-IN");
    // Visible Summary
    const visibleSummary = [];
    if ((summaryTotals?.b2b?.total || 0) > 0) {
  visibleSummary.push({ id: "b2b", label: "B2B Supplies", ...summaryTotals.b2b });
}

if ((summaryTotals?.b2cLarge?.total || 0) > 0) {
  visibleSummary.push({ id: "b2cLarge", label: "B2C Large", ...summaryTotals.b2cLarge });
}

if ((summaryTotals?.b2cOthers?.total || 0) > 0) {
  visibleSummary.push({ id: "b2cOthers", label: "B2C Others", ...summaryTotals.b2cOthers });
}

if ((summaryTotals?.hsn?.total || 0) > 0) {
  visibleSummary.push({ id: "hsn", label: "HSN wise", ...summaryTotals.hsn });
}

if ((summaryTotals?.eco?.total || 0) > 0) {
  visibleSummary.push({ id: "eco", label: "14A / ECO Amendment", ...summaryTotals.eco });
}
   const grandTotal = visibleSummary.reduce(
  (acc, item) => ({
    taxable: acc.taxable + Number(item?.taxable || 0),
    igst: acc.igst + Number(item?.igst || 0),
    cgst: acc.cgst + Number(item?.cgst || 0),
    sgst: acc.sgst + Number(item?.sgst || 0),
    cess: acc.cess + Number(item?.cess || 0),
    total: acc.total + Number(item?.total || 0)
  }),
  { taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, total: 0 }
);
    // Checkbox handlers
    const toggleSelectAll = () => {
      if (selectAll) {
        setSelectedRows([]);
      } else {
        setSelectedRows(visibleSummary.map(item => item.id));
      }
      setSelectAll(!selectAll);
    };
    const toggleRow = (id) => {
      if (selectedRows.includes(id)) {
        setSelectedRows(selectedRows.filter(r => r !== id));
      } else {
        setSelectedRows([...selectedRows, id]);
      }
    };
     const handleChange = (setter, data, index, field, value) => {
      const newData = [...data];
      newData[index][field] = value;
      setter(newData);
    };
    const handleItcAvailableChange = (index, field, value) => {
      const newItc = { ...itcDetails };
      newItc.available[index][field] = value;
      setItcDetails(newItc);
    };
    const handleItcReversedChange = (index, field, value) => {
      const newItc = { ...itcDetails };
      newItc.reversed[index][field] = value;
      setItcDetails(newItc);
    };
    const handleNetItcChange = (field, value) => {
      setItcDetails(prev => ({
        ...prev,
        netItc: { ...prev.netItc, [field]: value }
      }));
    };
    const handleItcIneligibleChange = (index, field, value) => {
      const newItc = { ...itcDetails };
      newItc.ineligible[index][field] = value;
      setItcDetails(newItc);
    };

    const addInterstateRow = (setter) => {
  setter((prev) => [
    ...prev,
    { placeOfSupply: "", taxableValue: "", igst: "" }
  ]);
};

const deleteInterstateRow = (setter, rows, index) => {
  if (rows.length === 1) {
    setter([{ placeOfSupply: "", taxableValue: "", igst: "" }]);
    return;
  }
  setter(rows.filter((_, i) => i !== index));
};

const updateInterstateCell = (setter, rows, index, field, value) => {
  const updated = [...rows];
  updated[index][field] = value;
  setter(updated);
};
    const renderInput = (value, onChange) => (
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="0.00"
        style={{
          width: "100%",
          height: "30px",
          padding: "5px 8px",
          textAlign: "right",
          border: "1px solid #cbd5e1",
          borderRadius: "5px",
          fontSize: "13px",
          lineHeight: "20px",
          boxSizing: "border-box"
        }}
      />
    );
    const renderHide = () => <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Hide</span>;
    const tableActions = (
      <div style={{ padding: "10px 14px", display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid #e5e7eb" }}>
        <button
          onClick={() => {
  if (isGSTR3B) {
    handleGstr3bSave();
  } else {
    alert("Data Saved Successfully!");
  }
}}
          style={{
            padding: "6px 18px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "0.82rem",
            minWidth: "85px"
          }}
        >
          Save
        </button>
        <button
          onClick={() => alert("Delete functionality coming soon...")}
          style={{
            padding: "6px 18px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "0.82rem",
            minWidth: "85px"
          }}
        >
          Delete
        </button>
      </div>
    );
    const handleBack = () => {
      setActiveSubTab("Manually");
    };
    return (
      <div style={{ padding: "12px", background: "#f8fafc", minHeight: "100vh" }}>
        <style>{`
          .jump-to-select:hover { border-color: #4f46e5 !important; }
          .jump-to-select option:hover { background: #dbeafe; color: #1d4ed8; }
          .gstr-compact-table th, .gstr-compact-table td { font-size: 12px; }
          .gstr-compact-table input[type="number"] { padding: 4px 6px !important; font-size: 12px !important; }
        `}</style>
        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "10px 16px", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "24px"
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                {/* Left DotMatrix — 3×4, only for non-Dashboard/Client Detail sections */}
                {(() => {
                  const skipDot = title === "GST Dashboard" || title === "Client Detail";
                  if (skipDot) return null;
                  return (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 3.5px)",
                      gap: "4px",
                      opacity: 0.5,
                      flexShrink: 0,
                      pointerEvents: "none",
                    }}>
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} style={{ width: "3.5px", height: "3.5px", borderRadius: "50%", background: "#4f46e5" }} />
                      ))}
                    </div>
                  );
                })()}

                {/* Section icon — title ke hisaab se */}
                {(() => {
                  const iconMap = {
                    "GSTR-1":          "📄",
                    "GSTR-1A":         "📋",
                    "GSTR-3B":         "🧾",
                    "ITC-04":          "🔄",
                    "TDS/TCS":         "💼",
                    "Reports":         "📊",
                    "Download Center": "⬇️",
                  };
                  const skipIcon = title === "GST Dashboard" || title === "Client Detail";
                  const emoji = iconMap[title];
                  if (skipIcon || !emoji) return null;
                  return (
                    <span style={{
                      fontSize: "1.35rem",
                      lineHeight: 1,
                      filter: "drop-shadow(0 1px 3px rgba(79,70,229,0.25))",
                      flexShrink: 0,
                    }}>{emoji}</span>
                  );
                })()}

                <h1 style={{ margin: 0, 
    fontSize: "1.5rem",
    fontWeight: 700, 
    color: "#4f46e5",
    textShadow: "0 1px 2px rgba(124, 58, 237, 0.1)" }}>
                  {title}
                </h1>

                {/* Right DotMatrix — 3×4 */}
                {(() => {
                  const skipDot = title === "GST Dashboard" || title === "Client Detail";
                  if (skipDot) return null;
                  return (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 3.5px)",
                      gap: "4px",
                      opacity: 0.5,
                      flexShrink: 0,
                      pointerEvents: "none",
                    }}>
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} style={{ width: "3.5px", height: "3.5px", borderRadius: "50%", background: "#4f46e5" }} />
                      ))}
                    </div>
                  );
                })()}
              </div>
      
 
  
{/* ══ PREMIUM MONTH / YEAR PICKER ══ */}
{activeSubTab === "Manually" && !isReports && (isITC04 || isTDSTCS || isDownloadCenter || !selectedSection) && (
  <PremiumYMPicker
    years={years}
    selectedYear={selectedYear}
    setSelectedYear={setSelectedYear}
    selectedMonth={selectedMonth}
    setSelectedMonth={setSelectedMonth}
    setSelectedItcTable={setSelectedItcTable}
    setSelectedTdsTcsSection={setSelectedTdsTcsSection}
    isDownloadCenter={isDownloadCenter}
  />
)}
            
            </div>
          </div>
          
{!isTDSTCS && !isDownloadCenter && !isReports && !isITC04 && (
  <div
  style={{
    display: "flex",
    background: "#ffffff", 
    borderBottom: isGSTR3B ? "2px solid #dbeafe" : "4px solid #e2e8f0",
    alignItems: "center"
  }}
>
  {[
    { id: "Manually", label: "✎ Manually" },
    { id: "Import", label: "⬇ Import" }, // Tirchha arrow update kar diya
    { id: "Summary", label: "▤ Summary" }
  ].map((tab, index, array) => (
    <React.Fragment key={tab.id}>
      <button
        onClick={() => setActiveSubTab(tab.id)}
        onMouseEnter={(e) => {
          // Hover karne par inactive text halka dark hoga
          if (activeSubTab !== tab.id) e.currentTarget.style.color = isGSTR3B ? "#1d4ed8" : "#0f172a";
        }}
        onMouseLeave={(e) => {
          // Hover hatne par wapas normal
          if (activeSubTab !== tab.id) e.currentTarget.style.color = isGSTR3B ? "#60a5fa" : "#64748b";
        }}
        style={{
          flex: 1,
          padding: isGSTR3B ? "8px 12px" : "14px 12px",
          background: "transparent", 
          color: activeSubTab === tab.id ? (isGSTR3B ? "#1d4ed8" : "#4f46e5") : (isGSTR3B ? "#60a5fa" : "#64748b"), 
          border: "none",
          outline: "none", 
          fontSize: isGSTR3B ? "0.85rem" : "0.95rem",
          fontWeight: activeSubTab === tab.id ? 600 : 500,
          letterSpacing: "0.3px",
          cursor: "pointer",
          borderBottom: activeSubTab === tab.id ? (isGSTR3B ? "2px solid #2563eb" : "2px solid #0a3697") : (isGSTR3B ? "2px solid transparent" : "3px solid transparent"), 
          transition: "all 0.2s ease-in-out"
        }}
      >
        {tab.label}
      </button>

      {/* Bich me | (Premium fading separator) */}
      {index < array.length - 1 && (
        <div
          style={{
            width: "1.5px",
            height: isGSTR3B ? "14px" : "20px", 
            background: "linear-gradient(to bottom, transparent, #cbd5e1, transparent)"
          }}
        />
      )}
    </React.Fragment>
  ))}
</div>
)}
{activeSubTab === "Import" && (
  <div style={{ padding: "16px", background: "#f8fafc", minHeight: "100vh" }}>

    {/* ────────────────────────────── */}
    {/* SOURCE SELECTION MAIN WRAPPER */}
    {/* ────────────────────────────── */}
    {importStep === "sources" && (
      <div style={{ 
        display: "flex", 
        backgroundColor: "#f8fafc", 
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
      }}>
        
        {/* ── MAIN CONTENT AREA ── */}
        <div style={{ flex: 1, padding: "4px 8px", overflowY: "auto" }}>
          <div style={{ maxWidth: "1320px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* ── TOP PREMIUM NAVIGATION BAR (COMPACT & REDUCED HEIGHT) ── */}
            <div style={{
              background: "#ffffff",
              borderRadius: "10px",
              padding: "12px 20px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px"
            }}>
              {/* Left Side: Premium Enterprise Import Heading */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  {/* Accent icon block */}
                  <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:"#16a34a", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(79,70,229,0.3)", flexShrink:0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                     <h2 style={{ fontSize:"1.18rem", fontWeight:800, color:"#0f172a", margin:0, letterSpacing:"-0.3px", lineHeight:1.2 }}>
  {isGSTR3B ? (
    <>IMPORT <span style={{ color: "#2563eb" }}>GSTR-3B</span> DATA</>
  ) : isGSTR1A ? (
    <>IMPORT <span style={{ color: "#2563eb" }}>GSTR-1A</span> DATA</>
  ) : (
    <>IMPORT <span style={{ color: "#2563eb" }}>GSTR-1</span> DATA</>
  )}
</h2>
                      
                    </div>
                    <p style={{ color:"#64748b", fontSize:"0.78rem", margin:"2px 0 0", fontWeight:400, lineHeight:1.4 }}>
                      Import via Excel, JSON, or connected software — validated for accuracy
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side: 100% Secure Badge with Matched Dot Handles */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginRight: "10px" }}>
                
                {/* Left Full Height Matrix Dot Grid Handle */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 4px)", gap: "3px", opacity: 0.35 }}>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                </div>

                {/* Secure Badge (Slightly more compact padding to match lower nav height) */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f0fdf4", padding: "8px 16px", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#16a34a", borderRadius: "50%", width: "18px", height: "18px" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#14532d", lineHeight: "1.1" }}>100% Secure</div>
                    <div style={{ fontSize: "0.72rem", color: "#16a34a", fontWeight: 500 }}>Your data is safe with us</div>
                  </div>
                </div>

                {/* Right Full Height Matrix Dot Grid Handle */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 4px)", gap: "3px", opacity: 0.35 }}>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#64748b" }}></div>
                </div>

              </div>
            </div>

            {/* Three Cards Container Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
            }}>

              {/* ── CARD 1: EXCEL IMPORTS ── */}
              <div style={{
                background: "#ffffff",
                borderRadius: "10px",
                padding: "16px 14px", // Reduced outer card padding
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 4px rgba(0,0,0,0.01)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}>
                <div>
                  {/* Clean Rich White Nav Header Fitted Right at Top */}
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px", 
                    marginBottom: "12px", // Less gap below the nav header
                    padding: "10px 12px", 
                    background: "#ffffff", 
                    borderRadius: "8px", 
                    boxShadow: "0 4px 10px rgba(0,0,0,0.04)"
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <h3 style={{ margin: 0, fontSize: "1rem", color: "#0f172a", fontWeight: 800 }}>Excel Imports</h3>
                  </div>

                  {/* Excel Rows (Tighter Internal Gap) */}
                  {[
                    "Taxoza Excel", "Govt. Excel", "Tally Excel", "Busy Excel",
                    "Vyapar Excel", "ECO Excel", "Department (V2.2)"
                  ].map((name) => (
                    <div key={name} style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px", // Reduced internal padding
                      borderRadius: "6px",
                      marginBottom: "6px", // Reduced bottom gap between row content
                      background: "#f8fafc",
                      border: "1px solid #f1f5f9",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        </svg>
                        <span style={{ fontWeight: 600, fontSize: "0.82rem", color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {name}
                        </span>
                      </div>
                      
                      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                        <button
                          onClick={() => alert(`Template: ${name}`)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                            padding: "5px 10px",
                            background: "#16a34a",
                            color: "#ffffff",
                            border: "1px solid #15803d",
                            borderRadius: "5px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            boxShadow: "0 1px 4px rgba(22,163,74,0.25)"
                          }}
                        >
                          Template
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <polyline points="19 12 12 19 5 12"></polyline>
                          </svg>
                        </button>
                        <button
                          onClick={() => { setSelectedSource(name); setImportStep("list"); }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                            padding: "5px 10px",
                            background: "#ffffff",
                            color: "#4f46e5",
                            border: "1.5px solid #bfdbfe",
                            borderRadius: "5px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          Import
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <polyline points="19 12 12 19 5 12"></polyline>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Footer Support Tip */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px", padding: "8px 10px", background: "#f0fdf4", borderRadius: "5px", border: "1px solid #dcfce7", minHeight: "34px", boxSizing: "border-box" }}>
                  <span style={{ color: "#16a34a", fontSize: "0.78rem", fontWeight: 700, flexShrink: 0 }}>💡 Tip:</span>
                  <span style={{ fontSize: "0.75rem", color: "#15803d", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    Download templates and import your excel.
                  </span>
                </div>
              </div>

              {/* ── CARD 2: JSON IMPORTS ── */}
              <div style={{
                background: "#ffffff",
                borderRadius: "10px",
                padding: "16px 14px", // Reduced outer card padding
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 4px rgba(0,0,0,0.01)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}>
                <div>
                  {/* Clean Rich White Nav Header Fitted Right at Top */}
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px", 
                    marginBottom: "12px", // Less gap below the nav header
                    padding: "10px 12px", 
                    background: "#ffffff", 
                    borderRadius: "8px", 
                    boxShadow: "0 4px 10px rgba(0,0,0,0.04)"
                  }}>
                    {/* Perfect Purple JSON Icon */}
                    <div style={{ 
                      display: "flex", 
                      flexDirection: "column",
                      alignItems: "center", 
                      justifyContent: "center", 
                      width: "20px", 
                      height: "22px", 
                      borderRadius: "3px", 
                      border: "2px solid #4f46e5", 
                      position: "relative",
                      background: "#ffffff"
                    }}>
                      <div style={{ position: "absolute", top: 0, right: 0, width: "5px", height: "5px", background: "#6D4AFF", borderBottomLeftRadius: "1px" }} />
                      <span style={{ color: "#4f46e5", fontSize: "0.5rem", fontWeight: 900, marginTop: "2px" }}>JSON</span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: "1rem", color: "#0f172a", fontWeight: 800 }}>JSON Imports</h3>
                  </div>

                  {/* JSON Rows (Tighter Internal Gap) */}
                  {[
                    "Govt. JSON", "Tally JSON", "Busy JSON",
                    "Taxoza JSON", "Vyapar JSON", "Other software JSON"
                  ].map((name) => (
                    <div key={name} style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px", // Reduced internal padding
                      borderRadius: "6px",
                      marginBottom: "6px", // Reduced bottom gap between row content
                      background: "#f8fafc",
                      border: "1px solid #f1f5f9",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          minWidth: "16px", 
                          height: "18px", 
                          borderRadius: "3px", 
                          border: "1.5px solid #4f46e5",
                          background: "#f5f3ff"
                        }}>
                          <span style={{ color: "#4f46e5", fontSize: "0.45rem", fontWeight: 900 }}>JSON</span>
                        </div>
                        <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {name}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                        <button
                          onClick={() => { setSelectedSource(name); setImportStep("list"); }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                            padding: "5px 10px", // Reduced breadth-wise padding
                            background: "#ffffff",
                            color: "#4f46e5",
                            border: "1.5px solid #bfdbfe",
                            borderRadius: "5px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          Import
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <polyline points="19 12 12 19 5 12"></polyline>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Footer Support Tip */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px", padding: "8px 10px", background: "#f5f3ff", borderRadius: "5px", border: "1px solid #ddd6fe", minHeight: "34px", boxSizing: "border-box" }}>
                  <span style={{ color: "#4f46e5", fontSize: "0.78rem", fontWeight: 700, flexShrink: 0 }}>💡 Tip:</span>
                  <span style={{ fontSize: "0.75rem", color: "#5b21b6", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    Ensure to import your json safely.
                  </span>
                </div>
              </div>

              {/* ── CARD 3: DIRECT FROM SOFTWARE ── */}
              <div style={{
                background: "#ffffff",
                borderRadius: "10px",
                padding: "16px 14px", // Reduced outer card padding
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 4px rgba(0,0,0,0.01)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}>
                <div>
                  {/* Clean Rich White Nav Header Fitted Right at Top */}
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px", 
                    marginBottom: "12px", // Less gap below the nav header
                    padding: "10px 12px", 
                    background: "#ffffff", 
                    borderRadius: "8px", 
                    boxShadow: "0 4px 10px rgba(0,0,0,0.04)"
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21"/>
                    </svg>
                    <h3 style={{ margin: 0, fontSize: "1rem", color: "#0f172a", fontWeight: 800 }}>Direct from Software</h3>
                  </div>

                  {/* Software Rows (Tighter Internal Gap) */}
                  {[
                    "Taxoza Book", "Tally", "Busy", "Mank ERP", "Other Software"
                  ].map((name) => (
                    <div key={name} style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px", // Reduced internal padding
                      borderRadius: "6px",
                      marginBottom: "6px", // Reduced bottom gap between row content
                      background: "#f8fafc",
                      border: "1px solid #f1f5f9",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        </svg>
                        <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {name}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                        <button
                          onClick={() => { setSelectedSource(name); setImportStep("list"); }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                            padding: "5px 10px", // Reduced breadth-wise padding
                            background: "#ffffff",
                            color: "#4f46e5",
                            border: "1.5px solid #bfdbfe",
                            borderRadius: "5px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          Import
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <polyline points="19 12 12 19 5 12"></polyline>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Footer Support Tip */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px", padding: "10px 12px", background: "#f0f9ff", borderRadius: "5px", border: "1px solid #bae6fd", minHeight: "34px", boxSizing: "border-box" }}>
                  <span style={{ color: "#0284c7", fontSize: "0.78rem", fontWeight: 700, flexShrink: 0 }}>💡 Tip:</span>
                  <span style={{ fontSize: "0.75rem", color: "#0369a1", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    Ensure your are logged in to your software.                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    )}
  

    {importStep === "list" && (
  <div style={{ maxWidth: "1380px", margin: "0 auto" }}>

    {/* Top source badge */}
    <div style={{ marginBottom: "18px", display: "flex", alignItems: "center", gap: "10px" }}>
      <button
        onClick={() => setImportStep("sources")}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#6366f1", fontWeight: 600, fontSize: "0.88rem",
          display: "flex", alignItems: "center", gap: "5px", padding: "4px 0"
        }}
      >
        ← Back
      </button>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "8px",
        background: "white", border: "1px solid #e0e7ff",
        borderRadius: "8px", padding: "6px 14px",
        boxShadow: "0 1px 4px rgba(109,74,255,0.10)",
        fontSize: "0.9rem", color: "#374151"
      }}>
        <span style={{ color: "#6366f1", fontWeight: 700 }}>📂</span>
        <span>Source:</span>
        <strong style={{ color: "#3730a3" }}>{selectedSource || "—"}</strong>
      </div>
    </div>

    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "22px",
      alignItems: "start",
    }}>

      {/* ─── LEFT: SELECT SECTIONS ─── */}
      <div style={{
        background: "linear-gradient(160deg, #f8faff 0%, #f0f5ff 100%)",
        borderRadius: "14px",
        padding: "26px 24px",
        border: "1px solid #dde5ff",
        boxShadow: "0 4px 18px rgba(109,74,255,0.08)",
        minHeight: "480px",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#1e1b4b" }}>
            📋 Select Sections
          </h2>
          <span style={{
            background: "#e0e7ff", color: "#4338ca",
            borderRadius: "20px", padding: "3px 12px",
            fontSize: "0.82rem", fontWeight: 600
          }}>
            {selectedOptions.length} / {importOptions.length} selected
          </span>
        </div>
        <div style={{ height: "1px", background: "#dde5ff", margin: "14px 0 18px 0" }} />

        {/* Select All */}
        <label style={{
          display: "flex", alignItems: "center", gap: "10px",
          marginBottom: "16px", cursor: "pointer",
          background: selectAllImport ? "#e0e7ff" : "#f3f0ff",
          border: "1px solid " + (selectAllImport ? "#a5b4fc" : "#c7d2fe"),
          borderRadius: "8px", padding: "9px 14px",
          transition: "all 0.15s ease",
        }}>
          <input
            type="checkbox"
            checked={selectAllImport}
            onChange={(e) => { e.preventDefault(); e.stopPropagation(); handleSelectAllImport(); }}
            style={{ width: "15px", height: "15px", accentColor: "#4f46e5" }}
          />
          <span style={{ fontWeight: 700, fontSize: "0.93rem", color: "#3730a3" }}>Select All</span>
        </label>

        {/* Options Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "8px",
        }}>
          {importOptions.map((option, idx) => {
            const isSelected = selectedOptions.includes(option);
            return (
              <div
                key={idx}
                onClick={() => handleOptionToggle(option)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  background: isSelected ? "#e0e7ff" : "white",
                  border: "1px solid " + (isSelected ? "#a5b4fc" : "#dde5ff"),
                  transition: "all 0.14s ease",
                  boxShadow: isSelected ? "0 1px 4px rgba(109,74,255,0.12)" : "0 1px 3px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#f5f3ff"; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "white"; }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  style={{ width: "14px", height: "14px", accentColor: "#4f46e5", pointerEvents: "none", flexShrink: 0 }}
                />
                <span style={{
                  fontSize: "0.88rem",
                  color: isSelected ? "#3730a3" : "#374151",
                  fontWeight: isSelected ? 600 : 400,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                }}>
                  {option}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── RIGHT: UPLOAD FILE ─── */}
      <div style={{
        background: "linear-gradient(160deg, #fafffe 0%, #f0fdf8 100%)",
        borderRadius: "14px",
        padding: "26px 24px",
        border: "1px solid #bbf7d0",
        boxShadow: "0 4px 18px rgba(16,185,129,0.08)",
        minHeight: "480px",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#064e3b" }}>
            📤 Upload File
          </h2>
          {selectedOptions.length > 0 && (
            <span style={{
              background: "#d1fae5", color: "#065f46",
              borderRadius: "20px", padding: "3px 12px",
              fontSize: "0.82rem", fontWeight: 600
            }}>
              {selectedOptions.length} section{selectedOptions.length > 1 ? "s" : ""} ready
            </span>
          )}
        </div>
        <div style={{ height: "1px", background: "#bbf7d0", margin: "14px 0 18px 0" }} />

        {/* Drop zone */}
        <div style={{
          border: "2px dashed " + (selectedOptions.length > 0 ? "#6ee7b7" : "#d1d5db"),
          borderRadius: "12px",
          padding: "44px 24px",
          background: selectedOptions.length > 0 ? "#f0fdf8" : "#f9fafb",
          textAlign: "center",
          transition: "all 0.2s ease",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
        }}>
          {selectedOptions.length === 0 ? (
            <>
              <div style={{ fontSize: "2.2rem", opacity: 0.35 }}>📁</div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "#6b7280" }}>
                Select sections first
              </div>
              <div style={{ fontSize: "0.88rem", color: "#9ca3af", lineHeight: 1.5 }}>
                Choose at least one section on the left<br/>to enable file upload
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: "2.2rem" }}>📂</div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "#065f46" }}>
                Upload your file
              </div>
              <div style={{ fontSize: "0.88rem", color: "#6b7280", marginBottom: "4px" }}>
                Supports .xlsx, .xls, .csv formats
              </div>
              <label style={{
                display: "inline-block",
                cursor: "pointer",
                background: "white",
                border: "1.5px solid #6ee7b7",
                borderRadius: "8px",
                padding: "0",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(16,185,129,0.12)",
                width: "100%",
                maxWidth: "340px",
              }}>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => {
                    if (selectedOptions.length === 0) return;
                    handleImportFile(e);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    fontSize: "0.9rem",
                    color: "#374151",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    outline: "none",
                  }}
                />
              </label>
            </>
          )}
        </div>

        {/* Info footer when sections selected */}
        {selectedOptions.length > 0 && (
          <div style={{
            marginTop: "16px",
            padding: "12px 16px",
            borderRadius: "9px",
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            fontSize: "0.88rem",
            lineHeight: 1.5,
            display: "flex",
            gap: "8px",
            alignItems: "flex-start",
          }}>
            <span style={{ flexShrink: 0 }}>ℹ️</span>
            <span>Selected: <strong>{selectedOptions.join(", ")}</strong>. After upload, processing and summary will continue.</span>
          </div>
        )}
      </div>

    </div>
  </div>
)}

 
    {importStep === "upload" && (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: "100%",
            maxWidth: "640px",
            background: "white",
            borderRadius: "12px",
            padding: "28px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.08)"
          }}
        >
          <h2 style={{ margin: "0 0 16px 0", fontSize: "1.5rem", fontWeight: 700, color: "#111827" }}>
            Upload File
          </h2>

          <div style={{ marginBottom: "20px", color: "#4b5563", fontSize: "0.98rem" }}>
            <strong>{selectedSource || "—"}</strong> • Sections: {selectedOptions.join(", ") || "None"}
          </div>

          <div
            id="dropzone"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.style.borderColor = "#6366f1";
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = "#d1d5db";
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.dataTransfer.files?.[0]) setUploadedFile(e.dataTransfer.files[0]);
            }}
            style={{
              border: "2px dashed #d1d5db",
              borderRadius: "10px",
              padding: "50px 30px",
              textAlign: "center",
              transition: "border-color 0.2s",
              cursor: "pointer"
            }}
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              accept=".xlsx,.xls,.csv,.zip,.json"
              onChange={async (e) => {
                const file = e.target.files[0];
                setUploadedFile(file);
                if (!file) return;
                try {
                  const buffer = await file.arrayBuffer();
                  const workbook = XLSX.read(buffer, { type: "array" });
                  const workbookSections = getWorkbookImportOptions(workbook);
                  setImportOptions(workbookSections);
                  setSelectedOptions([]);
                  setSelectAllImport(false);
                } catch (error) {
                  console.error("Failed to read uploaded file:", error);
                }
              }}
            />

            {!uploadedFile ? (
              <>
                <p style={{ color: "#4f46e5", fontSize: "1.1rem", marginBottom: "12px" }}>
                  Click or drag file here
                </p>
                <div style={{ fontSize: "2.8rem", color: "#9ca3af" }}>↓</div>
              </>
            ) : (
              <div style={{ padding: "16px", background: "#f0fdfa", borderRadius: "8px" }}>
                <p style={{ fontWeight: 600, color: "#0f766e" }}>Selected:</p>
                <p style={{ margin: "4px 0", fontSize: "1rem" }}>{uploadedFile.name}</p>
                <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                  {(uploadedFile.size / 1048576).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          <div style={{ marginTop: "24px", display: "flex", justifyContent: "center", gap: "16px" }}>
            <button
              disabled={!uploadedFile || isUploading}
              
          onClick={() => {
  setIsUploading(true);
  handleImportFile();

  setTimeout(() => {
    setIsUploading(false);
  }, 1400);
}}

              style={{
                padding: "10px 40px",
                background: uploadedFile && !isUploading ? "#4f46e5" : "#9ca3af",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.98rem",
                fontWeight: 600,
                cursor: uploadedFile && !isUploading ? "pointer" : "not-allowed"
              }}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>

            <button
              onClick={() => {
                setUploadedFile(null);
                setImportStep("sources");
              }}
              style={{
                padding: "10px 32px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.98rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)}
      {/* Manually Tab */}
      {activeSubTab === "Manually" && (
        <div style={{ padding: "12px 16px" }}>

         {isITC04 && (
  <div style={{
    padding: "8px 0 12px 0",
    background: "#f8fafc",
    overflowX: "auto",
    whiteSpace: "nowrap",
    marginBottom: "8px"
  }}>
    <div style={{ display: "inline-flex", gap: "12px" }}>
      {itc04Sections.map((section) => (
        <button
  onClick={() => setSelectedItcTable(section)}
  style={{
    height: "36px",
    minWidth: "140px",           // 🔥 box ki width badhayi
    padding: "2px 10px",         // 🔥 andar left-right space

    borderRadius: "6px",
    border: "1.5px solid #3b82f6",
    background: selectedItcTable === section ? "#e0edff" : "#ffffff",
    color: "#000",
    fontWeight: 600,
    fontSize: "0.75rem",

    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    lineHeight: "1.1",

    margin: "0px",

    transition: "all 0.2s ease"
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = "#f0f7ff";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background =
      selectedItcTable === section ? "#e0edff" : "#ffffff";
  }}
>
  {section}
</button>
      ))}
    </div>
  </div>
)}

        {/* GSTR-1 / GSTR-1A / GSTR-3B: Section Cards Grid (always visible, no month needed) */}
        {!isGSTR3B && !isITC04 && !isTDSTCS && !isDownloadCenter && !isReports && !selectedSection && (
  <div style={{ marginBottom: "10px" }}>
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: "8px"
    }}>
      {currentSections.map((section, idx) => (
        <div
          key={section}
          onClick={() => setSelectedSection(section)}
          style={{
            background: "white",
            border: "1px solid #c7d2fe",
            borderRadius: "8px",
            padding: "10px 12px",
            cursor: "pointer",
            boxShadow: "0 1px 4px rgba(31,42,112,0.07)",
            transition: "all 0.18s ease",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "#3b4cc0";
            e.currentTarget.style.boxShadow = "0 6px 18px rgba(31,42,112,0.18)";
            }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "#c7d2fe";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(31,42,112,0.07)";
            }}
        >
          <div style={{
            width: "28px",
            height: "28px",
            minWidth: "28px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1f2a70, #3b4cc0)",
            color: "white",
            fontSize: "0.75rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            alignSelf: "center"
          }}>
            {idx + 1}
          </div>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", lineHeight: 1.4 }}>
            {section.replace(/^\d+\s*[-–]\s*/, "").replace(/^[\d.,A-Z\s(/)]+\s*[-–]\s*/, "")}
          </span>
        </div>
      ))}
    </div>
  </div>
)}

{/* GSTR-1 Amendments Section */}
{/* [FIX #4] Amendment Navbar — white background, 3D effect, grey shadow */}
{!isGSTR3B && !isITC04 && !isTDSTCS && !isDownloadCenter && !isReports && !selectedSection && (
  <div style={{
    marginTop: "20px",
    background: "white",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    overflow: "hidden",
    marginBottom: "16px"
  }}>
    <div style={{
      background: "#ffffff",
      padding: "10px 16px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      borderBottom: "1px solid #e2e8f0",
      boxShadow: "0 4px 15px rgba(0,0,0,0.10), inset 0 1px 0 #fff, inset 0 -1px 0 rgba(0,0,0,0.04)"
    }}>
      <span style={{ fontSize: "1rem" }}>✏️</span>
      <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#3730a3" }}>
        Amendments
      </h4>
      
    </div>
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: "8px",
      padding: "12px"
    }}>
      {gstr1AmendmentSections.map((section, idx) => (
        <div
          key={section}
          onClick={() => setSelectedSection(section)}
          style={{
            background: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            cursor: "pointer",
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            transition: "all 0.18s ease",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(31,42,112,0.12)";
            e.currentTarget.style.borderColor = "#c4b5fd";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
            e.currentTarget.style.borderColor = "#e2e8f0";
          }}
        >
          <div style={{
            width: "24px",
            height: "24px",
            minWidth: "24px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1f2a70, #3b4cc0)",
            color: "white",
            fontSize: "0.68rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            alignSelf: "center"
          }}>
            {idx + 1}
          </div>
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1e293b", lineHeight: 1.3, flex: 1 }}>
            {section.replace(/^\d+\s*[-–]\s*/, "")}
          </span>
        </div>
      ))}
    </div>
  </div>
)}

{/* GSTR-3B: Section Cards Grid (always visible, no month needed) */}
{isGSTR3B && !selectedSection && (
  <div style={{ marginBottom: "10px" }}>
    <h3 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", fontWeight: 700, color: "#1e293b" }}>
      Select a Section
    </h3>
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
      gap: "8px"
    }}>
      {gstr3bSections.map((section, idx) => (
        <div
          key={section}
          onClick={() => setSelectedSection(section)}
          style={{
            background: "white",
            border: "1px solid #c7d2fe",
            borderRadius: "10px",
            padding: "14px 16px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(31,42,112,0.08)",
            transition: "all 0.18s ease",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "#3b4cc0";
            e.currentTarget.style.boxShadow = "0 6px 18px rgba(31,42,112,0.18)";
            }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "#c7d2fe";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(31,42,112,0.08)";
            }}
        >
          <div style={{
            width: "28px",
            height: "28px",
            minWidth: "28px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1f2a70, #3b4cc0)",
            color: "white",
            fontSize: "0.75rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            alignSelf: "center"
          }}>
            {idx + 1}
          </div>
          <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1e293b", lineHeight: 1.4 }}>
            {section}
          </span>
        </div>
      ))}
    </div>
  </div>
)}

{isTDSTCS && selectedYear && (
  <div
    style={{
      padding: "18px 0 28px 0",
      background: "#f8fafc",
      overflowX: "auto",
      whiteSpace: "nowrap",
      marginBottom: "24px"
    }}
  >
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px"
      }}
    >
      {tdsTcsSections.map((section) => {
        const isActive = selectedTdsTcsSection === section;
        const isHovered = hoveredTdsTcsSection === section;

        return (
          <button
            key={section}
            onClick={() => setSelectedTdsTcsSection(section)}
            onMouseEnter={() => setHoveredTdsTcsSection(section)}
            onMouseLeave={() => setHoveredTdsTcsSection("")}
            style={{
              minWidth: "120px",
              width: "auto",
              height: "32px",
              padding: "0 14px",
              background: isActive ? "linear-gradient(135deg,#2563eb,#1d4ed8)" : isHovered ? "#eff6ff" : "#ffffff",
              color: isActive ? "#ffffff" : "#2563eb",
              border: isActive ? "none" : "1.5px solid #93c5fd",
              borderRadius: "8px",
              fontSize: "0.84rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isActive
                ? "0 3px 10px rgba(37,99,235,0.3)"
                : isHovered
                ? "0 2px 8px rgba(37,99,235,0.12)"
                : "0 1px 4px rgba(37,99,235,0.08)",
              transition: "all 0.2s ease"
            }}
          >
            {section}
          </button>
        );
      })}
    </div>
  </div>
)}


          {selectedSection && isGSTR3B && (
            <>
              {/* [FIX #4] Compact section nav bar for GSTR-3B — white background, premium 3D */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "8px",
                padding: "7px 12px",
                background: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
              }}>
                <button
                  onClick={() => setSelectedSection("")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "5px 12px",
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    color: "#3730a3",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    transition: "all 0.15s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#c4b5fd"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(31,42,112,0.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; }}
                >
                  ← Back
                </button>
                  {/* [FIX #5] Jump to - Custom styled dropdown with fixed height + scroller */}
                  {(() => {
                    const stripNumber3b = (s) => s.replace(/^\d+\s*[-\u2013]\s*/, "").trim();
                    return (
                      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500, whiteSpace: "nowrap" }}>Jump to:</span>
                        <div style={{ position: "relative" }}>
                          <button
                            id="gstr3b-jump-trigger"
                            onClick={() => {
                              const dd = document.getElementById("gstr3b-jump-dropdown");
                              if (dd) dd.style.display = dd.style.display === "block" ? "none" : "block";
                            }}
                            style={{
                              display: "flex", alignItems: "center", gap: "6px",
                              padding: "5px 10px 5px 12px",
                              borderRadius: "8px",
                              border: "1.5px solid #c7d2fe",
                              fontSize: "0.78rem", fontWeight: 600,
                              background: "#ffffff", color: "#0f172a",
                              cursor: "pointer", minWidth: 200, maxWidth: 260,
                              outline: "none",
                              boxShadow: "0 2px 8px rgba(79,70,229,0.10)",
                              justifyContent: "space-between",
                              whiteSpace: "nowrap", overflow: "hidden",
                            }}
                          >
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", flex: 1, textAlign: "left" }}>
                              {stripNumber3b(selectedSection)}
                            </span>
                            <svg width="10" height="10" viewBox="0 0 10 10" style={{ flexShrink: 0 }}>
                              <path d="M1 3l4 4 4-4" stroke="#4f46e5" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                            </svg>
                          </button>
                          <div
                            id="gstr3b-jump-dropdown"
                            style={{
                              display: "none", position: "absolute",
                              top: "calc(100% + 4px)", right: 0,
                              zIndex: 9999, background: "#ffffff",
                              border: "1.5px solid #c7d2fe", borderRadius: "8px",
                              boxShadow: "0 8px 24px rgba(79,70,229,0.15)",
                              minWidth: 260, maxWidth: 320, overflow: "hidden",
                            }}
                          >
                            <div style={{
                              padding: "6px 12px 4px 12px", fontSize: "0.68rem", fontWeight: 700,
                              color: "#ffffff", background: "#3730a3",
                              letterSpacing: "0.06em", textTransform: "uppercase", userSelect: "none",
                            }}>Select Section</div>
                            <div style={{ maxHeight: "280px", overflowY: "auto", padding: "4px 0" }}>
                              {gstr3bSections.map((s) => (
                                <div key={s}
                                  onClick={() => {
                                    setSelectedSection(s);
                                    const dd = document.getElementById("gstr3b-jump-dropdown");
                                    if (dd) dd.style.display = "none";
                                  }}
                                  style={{
                                    padding: "7px 14px", fontSize: "0.78rem",
                                    fontWeight: s === selectedSection ? 700 : 500,
                                    color: "#1e293b",
                                    background: s === selectedSection ? "#e5e7eb" : "#ffffff",
                                    cursor: "pointer", whiteSpace: "nowrap",
                                    overflow: "hidden", textOverflow: "ellipsis",
                                    transition: "background 0.12s",
                                  }}
                                  onMouseEnter={e => { if (s !== selectedSection) e.currentTarget.style.background = "#dbeafe"; }}
                                  onMouseLeave={e => { if (s !== selectedSection) e.currentTarget.style.background = "#ffffff"; }}
                                >
                                  {stripNumber3b(s)}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
              </div>
              <h2 style={{ margin: "4px 0 6px 0", fontSize: "1rem", color: "#1e293b", fontWeight: 700 }}>{selectedSection}</h2>

              {/* ───────────────────────────────────────────────
                  SECTION 1: Outward Supplies + RCM
              ─────────────────────────────────────────────── */}
              {selectedSection === gstr3bSections[0] && (
                <div style={{ overflowX: "auto", border: "1px solid #d1d5db", borderRadius: 8 , marginTop:"0px"}}>
                  <table style={{ 
  width: "100%", 
  borderCollapse: "collapse", 
  fontSize: "12px",
  border: "1px solid #d1d5db"
}}>
                    <thead>
                      <tr style={{ background: "#ede9fe", fontWeight: 600 }}>
                        <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "left", minWidth: 340 }}>Nature of Supplies</th>
                        <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>Total Taxable Value</th>
                        <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>IGST</th>
                        <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>CGST</th>
                        <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>SGST</th>
                        <th style={{ padding: "6px 10px", textAlign: "right" }}>CESS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outwardSupplies.map((row, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db" }}>{row.nature}</td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>
                            {row.taxable !== "Hide" ? renderInput(row.taxable, v => handleChange(setOutwardSupplies, outwardSupplies, i, "taxable", v)) : "—"}
                          </td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>
                            {row.igst !== "Hide" ? renderInput(row.igst, v => handleChange(setOutwardSupplies, outwardSupplies, i, "igst", v)) : renderHide()}
                          </td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>
                            {row.cgst !== "Hide" ? renderInput(row.cgst, v => handleChange(setOutwardSupplies, outwardSupplies, i, "cgst", v)) : renderHide()}
                          </td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>
                            {row.sgst !== "Hide" ? renderInput(row.sgst, v => handleChange(setOutwardSupplies, outwardSupplies, i, "sgst", v)) : renderHide()}
                          </td>
                          <td style={{ padding: "6px 10px", textAlign: "right" }}>
                            {row.cess !== "Hide" ? renderInput(row.cess, v => handleChange(setOutwardSupplies, outwardSupplies, i, "cess", v)) : renderHide()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {tableActions}
                </div>
              )}
              {/* ───────────────────────────────────────────────
                  SECTION 2: ECO u/s 9(5)
              ─────────────────────────────────────────────── */}
              {selectedSection === gstr3bSections[1] && (
                <div style={{ overflowX: "auto", border: "1px solid #d1d5db", borderRadius: 8 }}>
                  <table style={{ 
  width: "100%", 
  borderCollapse: "collapse", 
  fontSize: "12px",
  border: "1px solid #d1d5db"
}}>
                    <thead>
                      <tr style={{ background: "#ede9fe", fontWeight: 600 }}>
                        <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "left", minWidth: 380 }}>Nature of Supplies (ECO)</th>
                        <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>Taxable Value</th>
                        <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>IGST</th>
                        <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>CGST</th>
                        <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>SGST</th>
                        <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>CESS</th>
                        <th style={{ padding: "6px 10px", textAlign: "right" }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ecoSupplies.map((row, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db" }}>{row.nature}</td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{renderInput(row.taxable, v => handleChange(setEcoSupplies, ecoSupplies, i, "taxable", v))}</td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{renderInput(row.igst, v => handleChange(setEcoSupplies, ecoSupplies, i, "igst", v))}</td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{renderInput(row.cgst, v => handleChange(setEcoSupplies, ecoSupplies, i, "cgst", v))}</td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{renderInput(row.sgst, v => handleChange(setEcoSupplies, ecoSupplies, i, "sgst", v))}</td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{renderInput(row.cess, v => handleChange(setEcoSupplies, ecoSupplies, i, "cess", v))}</td>
                          <td style={{ padding: "6px 10px", textAlign: "right" }}>{renderInput(row.total, v => handleChange(setEcoSupplies, ecoSupplies, i, "total", v))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {tableActions}
                </div>
              )}
              {/* ───────────────────────────────────────────────
                  SECTION 3: Inter-State Supplies
              ─────────────────────────────────────────────── */}
             {selectedSection === gstr3bSections[2] && (() => {
  const renderCompactInput = (value, onChange) => (
    <input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="0.00"
      style={{
        width: "100%",
        height: "30px",
        padding: "5px 8px",
        textAlign: "right",
        border: "1px solid #cbd5e1",
        borderRadius: "5px",
        fontSize: "13px",
        lineHeight: "20px",
        boxSizing: "border-box"
      }}
    />
  );
  const compactCheckboxStyle = { width: "16px", height: "16px", cursor: "pointer" };
  return (
  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
    
    <div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "#eff6ff",
          padding: "5px 12px",
          fontWeight: 700,
          fontSize: "0.88rem",
          borderRadius: "6px",
          marginBottom: "8px",
          color: "#1e40af",
          border: "1px solid #bfdbfe"
        }}
      >
        <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>1.</span>
        <span>Supplies made to Unregistered Persons</span>
      </div>

      <div style={{ overflowX: "auto", border: "1px solid #d1d5db", borderRadius: 8 }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
            border: "1px solid #d1d5db"
          }}
        >
          <thead>
            <tr style={{ background: "#dbeafe", fontWeight: 600 }}>
              <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "center", width: "40px" }}></th>
              <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "left", minWidth: "280px" }}>
                Place of Supply (State/UT)
              </th>
              <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right", minWidth: "180px" }}>
                Total Taxable Value
              </th>
              <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right", minWidth: "140px" }}>
                IGST
              </th>
              <th style={{ padding: "6px 10px", textAlign: "left", minWidth: "120px" }}>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {unregisteredSupplies.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "center" }}>
                  <input type="checkbox" style={compactCheckboxStyle} />
                </td>

                <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db" }}>
                  {renderCompactInput(
                    row.placeOfSupply,
                    (v) => updateInterstateCell(setUnregisteredSupplies, unregisteredSupplies, i, "placeOfSupply", v)
                  )}
                </td>

                <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>
                  {renderCompactInput(
                    row.taxableValue,
                    (v) => updateInterstateCell(setUnregisteredSupplies, unregisteredSupplies, i, "taxableValue", v)
                  )}
                </td>

                <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>
                  {renderCompactInput(
                    row.igst,
                    (v) => updateInterstateCell(setUnregisteredSupplies, unregisteredSupplies, i, "igst", v)
                  )}
                </td>

                <td style={{ padding: "6px 10px" }}>
                  <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => addInterstateRow(setUnregisteredSupplies)}
                      style={{ border: "none", background: "transparent", color: "green", cursor: "pointer", fontWeight: 600, fontSize: "13px", padding: 0 }}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteInterstateRow(setUnregisteredSupplies, unregisteredSupplies, i)}
                      style={{ border: "none", background: "transparent", color: "red", cursor: "pointer", fontWeight: 600, fontSize: "13px", padding: 0 }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "#eff6ff",
          padding: "5px 12px",
          fontWeight: 700,
          fontSize: "0.88rem",
          borderRadius: "6px",
          marginBottom: "8px",
          color: "#1e40af",
          border: "1px solid #bfdbfe"
        }}
      >
        <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>2.</span>
        <span>Supplies made to Composition Taxable Persons</span>
      </div>

      <div style={{ overflowX: "auto", border: "1px solid #d1d5db", borderRadius: 8 }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
            border: "1px solid #d1d5db"
          }}
        >
          <thead>
            <tr style={{ background: "#dbeafe", fontWeight: 600 }}>
              <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "center", width: "40px" }}></th>
              <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "left", minWidth: "280px" }}>
                Place of Supply (State/UT)
              </th>
              <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right", minWidth: "180px" }}>
                Total Taxable Value
              </th>
              <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right", minWidth: "140px" }}>
                IGST
              </th>
              <th style={{ padding: "6px 10px", textAlign: "left", minWidth: "120px" }}>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {compositionSupplies.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "center" }}>
                  <input type="checkbox" style={compactCheckboxStyle} />
                </td>

                <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db" }}>
                  {renderCompactInput(
                    row.placeOfSupply,
                    (v) => updateInterstateCell(setCompositionSupplies, compositionSupplies, i, "placeOfSupply", v)
                  )}
                </td>

                <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>
                  {renderCompactInput(
                    row.taxableValue,
                    (v) => updateInterstateCell(setCompositionSupplies, compositionSupplies, i, "taxableValue", v)
                  )}
                </td>

                <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>
                  {renderCompactInput(
                    row.igst,
                    (v) => updateInterstateCell(setCompositionSupplies, compositionSupplies, i, "igst", v)
                  )}
                </td>

                <td style={{ padding: "6px 10px" }}>
                  <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => addInterstateRow(setCompositionSupplies)}
                      style={{ border: "none", background: "transparent", color: "green", cursor: "pointer", fontWeight: 600, fontSize: "13px", padding: 0 }}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteInterstateRow(setCompositionSupplies, compositionSupplies, i)}
                      style={{ border: "none", background: "transparent", color: "red", cursor: "pointer", fontWeight: 600, fontSize: "13px", padding: 0 }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "#eff6ff",
          padding: "5px 12px",
          fontWeight: 700,
          fontSize: "0.88rem",
          borderRadius: "6px",
          marginBottom: "8px",
          color: "#1e40af",
          border: "1px solid #bfdbfe"
        }}
      >
        <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>3.</span>
        <span>Supplies made to UIN Holders</span>
      </div>

      <div style={{ overflowX: "auto", border: "1px solid #d1d5db", borderRadius: 8 }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
            border: "1px solid #d1d5db"
          }}
        >
          <thead>
            <tr style={{ background: "#dbeafe", fontWeight: 600 }}>
              <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "center", width: "40px" }}></th>
              <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "left", minWidth: "280px" }}>
                Place of Supply (State/UT)
              </th>
              <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right", minWidth: "180px" }}>
                Total Taxable Value
              </th>
              <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right", minWidth: "140px" }}>
                IGST
              </th>
              <th style={{ padding: "6px 10px", textAlign: "left", minWidth: "120px" }}>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {uinSupplies.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "center" }}>
                  <input type="checkbox" style={compactCheckboxStyle} />
                </td>

                <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db" }}>
                  {renderCompactInput(
                    row.placeOfSupply,
                    (v) => updateInterstateCell(setUinSupplies, uinSupplies, i, "placeOfSupply", v)
                  )}
                </td>

                <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>
                  {renderCompactInput(
                    row.taxableValue,
                    (v) => updateInterstateCell(setUinSupplies, uinSupplies, i, "taxableValue", v)
                  )}
                </td>

                <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>
                  {renderCompactInput(
                    row.igst,
                    (v) => updateInterstateCell(setUinSupplies, uinSupplies, i, "igst", v)
                  )}
                </td>

                <td style={{ padding: "6px 10px" }}>
                  <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => addInterstateRow(setUinSupplies)}
                      style={{ border: "none", background: "transparent", color: "green", cursor: "pointer", fontWeight: 600, fontSize: "13px", padding: 0 }}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteInterstateRow(setUinSupplies, uinSupplies, i)}
                      style={{ border: "none", background: "transparent", color: "red", cursor: "pointer", fontWeight: 600, fontSize: "13px", padding: 0 }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  );
})()}
              {/* ───────────────────────────────────────────────
                  SECTION 4: Eligible ITC (sabse lamba table)
              ─────────────────────────────────────────────── */}
              {selectedSection === gstr3bSections[3] && (
                <div style={{ overflowX: "auto", border: "1px solid #d1d5db", borderRadius: 8 }}>
                  <table style={{ 
  width: "100%", 
  borderCollapse: "collapse", 
  fontSize: "12px",
  border: "1px solid #d1d5db"
}}>
                    <thead>
                      <tr style={{ background: "#ede9fe", fontWeight: 600 }}>
                        <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "left" }}>Details</th>
                        <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>IGST</th>
                        <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>CGST</th>
                        <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>SGST</th>
                        <th style={{ padding: "6px 10px", textAlign: "right" }}>CESS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ background: "#f0f9ff" }}>
                        <td colSpan={5} style={{ padding: "6px 10px", fontWeight: 700, background: "#f0f9ff", fontSize: "0.82rem", color: "#0369a1" }}>(A) ITC Available (whether in full or part)</td>
                      </tr>
                      {itcDetails.available.map((row, i) => (
                        <tr key={`a${i}`}>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db" }}>{row.desc}</td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{renderInput(row.igst, v => handleItcAvailableChange(i, "igst", v))}</td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{renderInput(row.cgst, v => handleItcAvailableChange(i, "cgst", v))}</td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{renderInput(row.sgst, v => handleItcAvailableChange(i, "sgst", v))}</td>
                          <td style={{ padding: "6px 10px", textAlign: "right" }}>{renderInput(row.cess, v => handleItcAvailableChange(i, "cess", v))}</td>
                        </tr>
                      ))}
                      <tr style={{ background: "#f0f9ff" }}>
                        <td colSpan={5} style={{ padding: "6px 10px", fontWeight: 700, background: "#f0f9ff", fontSize: "0.82rem", color: "#0369a1" }}>(B) ITC Reversed</td>
                      </tr>
                      {itcDetails.reversed.map((row, i) => (
                        <tr key={`r${i}`}>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db" }}>{row.desc}</td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{renderInput(row.igst, v => handleItcReversedChange(i, "igst", v))}</td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{renderInput(row.cgst, v => handleItcReversedChange(i, "cgst", v))}</td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{renderInput(row.sgst, v => handleItcReversedChange(i, "sgst", v))}</td>
                          <td style={{ padding: "6px 10px", textAlign: "right" }}>{renderInput(row.cess, v => handleItcReversedChange(i, "cess", v))}</td>
                        </tr>
                      ))}
                      <tr style={{ background: "#ede9fe", fontWeight: 600 }}>
                        <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db" }}>(C) Net ITC Available (A - B)</td>
                        <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{renderInput(itcDetails.netItc.igst, v => handleNetItcChange("igst", v))}</td>
                        <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{renderInput(itcDetails.netItc.cgst, v => handleNetItcChange("cgst", v))}</td>
                        <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{renderInput(itcDetails.netItc.sgst, v => handleNetItcChange("sgst", v))}</td>
                        <td style={{ padding: "6px 10px", textAlign: "right" }}>{renderInput(itcDetails.netItc.cess, v => handleNetItcChange("cess", v))}</td>
                      </tr>
                      <tr style={{ background: "#f0f9ff" }}>
                        <td colSpan={5} style={{ padding: "6px 10px", fontWeight: 700, background: "#f0f9ff", fontSize: "0.82rem", color: "#0369a1" }}>(D) Other Details</td>
                      </tr>
                      {itcDetails.ineligible.map((row, i) => (
                        <tr key={`in${i}`}>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db" }}>{row.desc}</td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{renderInput(row.igst, v => handleItcIneligibleChange(i, "igst", v))}</td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{renderInput(row.cgst, v => handleItcIneligibleChange(i, "cgst", v))}</td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{renderInput(row.sgst, v => handleItcIneligibleChange(i, "sgst", v))}</td>
                          <td style={{ padding: "6px 10px", textAlign: "right" }}>{renderInput(row.cess, v => handleItcIneligibleChange(i, "cess", v))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {tableActions}
                </div>
              )}
              {selectedSection === gstr3bSections[4] && (
                <div style={{ overflowX: "auto", border: "1px solid #d1d5db", borderRadius: 8 }}>
                  <table style={{ 
  width: "100%", 
  borderCollapse: "collapse", 
  fontSize: "12px",
  border: "1px solid #d1d5db"
}}>
                    <thead>
                      <tr style={{ background: "#ede9fe", fontWeight: 600 }}>
                        <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "left", minWidth: 340 }}>Nature of Supplies</th>
                        <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>Inter-State Supplies</th>
                        <th style={{ padding: "6px 10px", textAlign: "right" }}>Intra-State Supplies</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exemptNonGst.map((row, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db" }}>{row.nature}</td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{renderInput(row.interstate, v => handleChange(setExemptNonGst, exemptNonGst, i, "interstate", v))}</td>
                          <td style={{ padding: "6px 10px", textAlign: "right" }}>{renderInput(row.intrastate, v => handleChange(setExemptNonGst, exemptNonGst, i, "intrastate", v))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {tableActions}
                </div>
              )}
              {/* ───────────────────────────────────────────────
                  SECTION 6: Interest & Late Fee
              ─────────────────────────────────────────────── */}
              {selectedSection === gstr3bSections[5] && (
                <div style={{ overflowX: "auto", border: "1px solid #d1d5db", borderRadius: 8 }}>
                  <table style={{ 
  width: "100%", 
  borderCollapse: "collapse", 
  fontSize: "12px",
  border: "1px solid #d1d5db"
}}>
                    <thead>
                      <tr style={{ background: "#ede9fe", fontWeight: 600 }}>
                        <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "left" }}>Description</th>
                        <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>IGST</th>
                        <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>CGST</th>
                        <th style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>SGST</th>
                        <th style={{ padding: "6px 10px", textAlign: "right" }}>CESS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interestLateFee.map((row, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db" }}>{row.desc}</td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{renderInput(row.igst, v => handleChange(setInterestLateFee, interestLateFee, i, "igst", v))}</td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{renderInput(row.cgst, v => handleChange(setInterestLateFee, interestLateFee, i, "cgst", v))}</td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{renderInput(row.sgst, v => handleChange(setInterestLateFee, interestLateFee, i, "sgst", v))}</td>
                          <td style={{ padding: "6px 10px", textAlign: "right" }}>{renderInput(row.cess, v => handleChange(setInterestLateFee, interestLateFee, i, "cess", v))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {tableActions}
                </div>
              )}
              
            </>
            
            
          )}
          {/* ───────────────────────────────────────────────
    SECTION 7: Payment of Tax
────────────────────────────────────────────── */}
{selectedSection === gstr3bSections[6] && (
  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

    {/* CASH LEDGER BALANCE */}
    <div style={{ border: "1px solid #d1d5db", borderRadius: 8, overflow: "hidden" }}>
      
      <div style={{
        background: "#ede9fe",
        padding: "7px 12px",
        fontWeight: 700,
        fontSize: "0.9rem",
        textAlign: "center"
      }}>
        Cash Ledger Balance
      </div>

     <table style={{ 
  width: "100%", 
  borderCollapse: "collapse", 
  fontSize: "12px",
  border: "1px solid #d1d5db"
}}>
        <thead>
          <tr style={{ background: "#ede9fe" }}>
            <th style={{ padding: "6px 10px", border: "1px solid #d1d5db" }}>Description</th>
            <th style={{ padding: "6px 10px", border: "1px solid #d1d5db" }}>IGST</th>
            <th style={{ padding: "6px 10px", border: "1px solid #d1d5db" }}>CGST</th>
            <th style={{ padding: "6px 10px", border: "1px solid #d1d5db" }}>SGST</th>
            <th style={{ padding: "6px 10px", border: "1px solid #d1d5db" }}>CESS</th>
            <th style={{ padding: "6px 10px", border: "1px solid #d1d5db" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {cashLedger.map((row, i) => {
            const total =
              Number(row.igst || 0) +
              Number(row.cgst || 0) +
              Number(row.sgst || 0) +
              Number(row.cess || 0);

            return (
              <tr key={i}>
                <td style={{ padding: "6px 10px", border: "1px solid #d1d5db" }}>{row.desc}</td>
                {["igst","cgst","sgst","cess"].map((field) => (
                  <td key={field} style={{ padding: "6px 10px", border: "1px solid #d1d5db" }}>
                    <input
                      type="number"
                      value={row[field]}
                      onChange={(e) => {
                        const newData = [...cashLedger];
                        newData[i][field] = e.target.value;
                        setCashLedger(newData);
                      }}
                      style={{ width: "100%", height: "30px", padding: "5px 8px", fontSize: "13px", border: "1px solid #d1d5db", borderRadius: "5px", boxSizing: "border-box" }}
                    />
                  </td>
                ))}
                <td style={{ padding: "6px 10px", border: "1px solid #d1d5db", fontWeight: 600 }}>
                  {total}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {/* CREDIT LEDGER BALANCE */}
    <div style={{ border: "1px solid #d1d5db", borderRadius: 8, overflow: "hidden" }}>
      
      <div style={{
        background: "#bbf7d0",
        padding: "7px 12px",
        fontWeight: 700,
        fontSize: "0.9rem",
        textAlign: "center"
      }}>
        Credit Ledger Balance
      </div>

      <table style={{ 
  width: "100%", 
  borderCollapse: "collapse", 
  fontSize: "12px",
  border: "1px solid #d1d5db"
}}>
        <thead>
          <tr style={{ background: "#dcfce7" }}>
            <th style={{ padding: "6px 10px", border: "1px solid #d1d5db" }}>IGST</th>
            <th style={{ padding: "6px 10px", border: "1px solid #d1d5db" }}>CGST</th>
            <th style={{ padding: "6px 10px", border: "1px solid #d1d5db" }}>SGST</th>
            <th style={{ padding: "6px 10px", border: "1px solid #d1d5db" }}>CESS</th>
            <th style={{ padding: "6px 10px", border: "1px solid #d1d5db" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {creditLedger.map((row, i) => {
            const total =
              Number(row.igst || 0) +
              Number(row.cgst || 0) +
              Number(row.sgst || 0) +
              Number(row.cess || 0);

            return (
              <tr key={i}>
                {["igst","cgst","sgst","cess"].map((field) => (
                  <td key={field} style={{ padding: "6px 10px", border: "1px solid #d1d5db" }}>
                    <input
                      type="number"
                      value={row[field]}
                      onChange={(e) => {
                        const newData = [...creditLedger];
                        newData[i][field] = e.target.value;
                        setCreditLedger(newData);
                      }}
                      style={{ width: "100%", height: "30px", padding: "5px 8px", fontSize: "13px", border: "1px solid #d1d5db", borderRadius: "5px", boxSizing: "border-box" }}
                    />
                  </td>
                ))}
                <td style={{ padding: "6px 10px", border: "1px solid #d1d5db", fontWeight: 600 }}>
                  {total}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

  </div>
)}



{/* this is report section  */}




{isReports && (() => {
  // 🔥 CURRENT MONTH + YEAR DYNAMIC
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear();

  return (
    <div style={{ padding: "4px 0 16px 0" }}>
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "16px 18px",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.06)",
        }}
      >
        {/* 🔥 TOP HEADER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "16px",
          }}
        >
          {/* Reports Badge */}
          <div
            
          >
          
          </div>


          

          {/* Premium Month & Year Selectors */}
          <div style={{ display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap" }}>
            <style>{`
              .rpt-sel { appearance:none; -webkit-appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234f46e5' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 10px center; padding-right:30px !important; }
              .rpt-sel:focus { outline:none; border-color:#6366f1 !important; box-shadow:0 0 0 3px rgba(99,102,241,0.15) !important; }
              .rpt-sel:hover { border-color:#818cf8 !important; background-color:#f5f3ff !important; }
            `}</style>

            {/* Year Selector */}
            <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span style={{ fontSize:"0.68rem", fontWeight:700, color:"#4f46e5", textTransform:"uppercase", letterSpacing:"0.06em" }}>Year</span>
              </div>
              <select
                className="rpt-sel"
                value={reportYear}
                onChange={(e) => setReportYear(Number(e.target.value))}
                style={{ height:"42px", padding:"0 30px 0 14px", borderRadius:"10px", border:"1.5px solid #c7d2fe", fontSize:"0.86rem", fontWeight:700, background:"#f8f9ff", minWidth:"130px", color:"#1e1b4b", cursor:"pointer", boxShadow:"0 2px 8px rgba(79,70,229,0.08), inset 0 1px 0 rgba(255,255,255,0.9)", transition:"all 0.18s" }}
              >
                {Array.from({ length: 11 }, (_, i) => {
                  const startYear = 2017 + i;
                  const endYear = String(startYear + 1).slice(-2);
                  return (
                    <option key={startYear} value={startYear}>
                      {startYear}-{endYear}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* From Month Selector */}
            <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span style={{ fontSize:"0.68rem", fontWeight:700, color:"#4f46e5", textTransform:"uppercase", letterSpacing:"0.06em" }}>From Month</span>
              </div>
              <select
                className="rpt-sel"
                value={reportFromMonth}
                onChange={(e) => setReportFromMonth(e.target.value)}
                style={{ height:"42px", padding:"0 30px 0 14px", borderRadius:"10px", border:"1.5px solid #c7d2fe", fontSize:"0.86rem", fontWeight:700, background:"#f8f9ff", minWidth:"155px", color:"#1e1b4b", cursor:"pointer", boxShadow:"0 2px 8px rgba(79,70,229,0.08), inset 0 1px 0 rgba(255,255,255,0.9)", transition:"all 0.18s" }}
              >
                {["January","February","March","April","May","June","July","August","September","October","November","December"].map((month) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            {/* To Month Selector */}
            <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span style={{ fontSize:"0.68rem", fontWeight:700, color:"#4f46e5", textTransform:"uppercase", letterSpacing:"0.06em" }}>To Month</span>
              </div>
              <select
                className="rpt-sel"
                value={reportToMonth}
                onChange={(e) => setReportToMonth(e.target.value)}
                style={{ height:"42px", padding:"0 30px 0 14px", borderRadius:"10px", border:"1.5px solid #c7d2fe", fontSize:"0.86rem", fontWeight:700, background:"#f8f9ff", minWidth:"155px", color:"#1e1b4b", cursor:"pointer", boxShadow:"0 2px 8px rgba(79,70,229,0.08), inset 0 1px 0 rgba(255,255,255,0.9)", transition:"all 0.18s" }}
              >
                {["January","February","March","April","May","June","July","August","September","October","November","December"].map((month) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* 🔥 TABS */}
        <div
  style={{
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "-60px",
    marginBottom: "16px",
    paddingBottom: "16px",
    borderBottom: "1px solid #f1f5f9",
    
  }}
>
        
          {reportTabs.map((tab) => {
            const isActive = activeReportTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveReportTab(tab);
                }}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: isActive ? "1px solid #4f46e5" : "1px solid #c4b5fd",
                  background: isActive ? "#ede9fe" : "#ffffff",
                  color: "#4f46e5",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "0.83rem",
                  transition: "all 0.25s ease",
                  boxShadow: isActive ? "0 4px 12px rgba(37, 99, 235, 0.18)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "#f3f0ff";
                    e.currentTarget.style.borderColor = "#6D4AFF";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "#ffffff";
                    e.currentTarget.style.borderColor = "#c4b5fd";
                  }
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* REPORT LIST - Smart Rendering */}
        {activeReportTab === "Annual" ? (
          /* Annual Reports - Grouped by Category (Screenshot-matched) */
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {[
              {
                title: "Inward Supply Related Reports:",
                color: "#3730a3",
                reports: [
                  "GSTR-2 Annual Report",
                  "GSTR-2A Annual Report",
                  "GSTR-2A Annual Report (Party Wise)",
                  "GSTR-2A Annual Report (Rate Wise)",
                  "GSTR-2B Annual Reports",
                  "GSTR-2B Annual Report (Party Wise)",
                  "GSTR-2B Annual Report (Rate Wise)",
                  "Rate Wise Reports (Inward)",
                  "GSTR-2B ITC Reclaim Reports",
                ],
              },
              {
                title: "Outward Supply Related Reports:",
                color: "#3730a3",
                reports: [
                  "GSTR-1 Annual Report",
                  "GSTR-1A Annual Report",
                  "Rate Wise Reports (Outward)",
                  "GSTR-3B Monthly Yearly Report",
                ],
              },
              {
                title: "Other Reports:",
                color: "#3730a3",
                reports: [
                  "Interest and Late Fee Report",
                  "Rate Wise Reports (Outward & Inward)",
                  "Trading Report",
                  "TDSTCS Annual Report",
                  "Tax Liability and ITC Summary",
                  "Electronic Credit/Cash Ledger",
                ],
              },
            ].map((group) => (
              <div key={group.title}>
                {/* Category Header */}
                <div
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: group.color,
                    marginBottom: "10px",
                    paddingBottom: "6px",
                    borderBottom: "2px solid #dbeafe",
                    letterSpacing: "0.01em",
                  }}
                >
                  {group.title}
                </div>
                {/* Reports Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: "10px",
                  }}
                >
                  {group.reports.map((report, index) => (
                    <div
                      key={report}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        border: "1px solid #bfdbfe",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)",
                        boxShadow: "0 2px 8px rgba(79,70,229,0.07)",
                        transition: "all 0.22s ease",
                        gap: "12px",
                        cursor: "default",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "0 8px 18px rgba(79,70,229,0.15)";
                        e.currentTarget.style.borderColor = "#818cf8";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(79,70,229,0.07)";
                        e.currentTarget.style.borderColor = "#c4b5fd";
                      }}
                    >
                      {/* Number badge + Name */}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            height: "36px", width: "36px", borderRadius: "8px",
                            background: "#ede9fe", color: "#4f46e5",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: "700", fontSize: "0.85rem", flexShrink: 0,
                            boxShadow: "0 2px 5px rgba(79,70,229,0.12)",
                          }}
                        >
                          {index + 1}
                        </div>
                        <div
                          style={{
                            color: "#3730a3", fontSize: "0.76rem", fontWeight: 600,
                            lineHeight: 1.35, overflow: "hidden",
                            textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%",
                          }}
                        >
                          {report}
                        </div>
                      </div>
                      {/* Download Button */}
                      <button
                        onClick={() => handleDownload(report)}
                        title={`Download ${report}`}
                        style={{
                          height: "58px",
                          width: "58px",
                          minWidth: "58px",
                          background: "linear-gradient(145deg, #e8f0fe 0%, #dbeafe 60%, #bfdbfe 100%)",
                          border: "1.5px solid rgba(147,197,253,0.6)",
                          borderRadius: "14px",
                          cursor: "pointer",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 14px rgba(79,70,229,0.18), inset 0 1px 0 rgba(255,255,255,0.8)",
                          transition: "all 0.22s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "0 8px 22px rgba(79,70,229,0.32), inset 0 1px 0 rgba(255,255,255,0.8)";
                          e.currentTarget.style.transform = "translateY(-2px) scale(1.04)";
                          e.currentTarget.style.background = "linear-gradient(145deg, #dbeafe 0%, #bfdbfe 60%, #93c5fd 100%)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "0 4px 14px rgba(79,70,229,0.18), inset 0 1px 0 rgba(255,255,255,0.8)";
                          e.currentTarget.style.transform = "translateY(0) scale(1)";
                          e.currentTarget.style.background = "linear-gradient(145deg, #e8f0fe 0%, #dbeafe 60%, #bfdbfe 100%)";
                        }}
                      >
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                          <path d="M12 3v13M7 11l5 5 5-5" stroke="#3730a3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M4 20h16" stroke="#3730a3" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Summary / Compare / PDF Reports - Original Grid */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "14px",
            }}
          >
            {getCurrentReportList().map((report, index) => (
              <div
                key={report}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  border: "1px solid #bfdbfe",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)",
                  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.08)",
                  transition: "all 0.25s ease",
                  gap: "12px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 10px 20px rgba(37, 99, 235, 0.15)";
                  e.currentTarget.style.borderColor = "#818cf8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(37, 99, 235, 0.08)";
                  e.currentTarget.style.borderColor = "#c4b5fd";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      height: "42px", width: "42px", borderRadius: "10px",
                      background: "#ede9fe", color: "#4f46e5",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: "700", fontSize: "1rem", flexShrink: 0,
                      boxShadow: "0 2px 6px rgba(79,70,229,0.15)",
                    }}
                  >
                    {index + 1}
                  </div>
                  <div
                    style={{
                      color: "#3730a3", fontSize: "0.75rem", fontWeight: 600,
                      lineHeight: 1.35, overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%",
                    }}
                  >
                    {report}
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(report)}
                  title="Download Report"
                  style={{
                    height: "58px",
                          width: "58px",
                          minWidth: "58px",
                    background: "linear-gradient(145deg, #e8f0fe 0%, #dbeafe 60%, #bfdbfe 100%)",
                    border: "1.5px solid rgba(147,197,253,0.6)",
                    borderRadius: "14px",
                    cursor: "pointer",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 14px rgba(79,70,229,0.18), inset 0 1px 0 rgba(255,255,255,0.8)",
                    transition: "all 0.22s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 8px 22px rgba(79,70,229,0.32), inset 0 1px 0 rgba(255,255,255,0.8)";
                    e.currentTarget.style.transform = "translateY(-2px) scale(1.04)";
                    e.currentTarget.style.background = "linear-gradient(145deg, #dbeafe 0%, #bfdbfe 60%, #93c5fd 100%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(79,70,229,0.18), inset 0 1px 0 rgba(255,255,255,0.8)";
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.background = "linear-gradient(145deg, #e8f0fe 0%, #dbeafe 60%, #bfdbfe 100%)";
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3v13M7 11l5 5 5-5" stroke="#3730a3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 20h16" stroke="#3730a3" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
})()}

{/* download center code start from here  */}


{isDownloadCenter && (
  <div
    style={{
      width: "100%",
      maxWidth: "1320px",
      margin: "0 auto",
      padding: "18px",
      borderRadius: "18px",
      background: "#eef6ff",
      border: "1px solid #dbeafe",
      boxShadow: "0 6px 24px rgba(15,23,42,0.06)",
      fontFamily: "Inter, system-ui, sans-serif",
    }}
  >
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "62% 38%",
        gap: "18px",
        alignItems: "stretch",
      }}
    >

      {/* ================= LEFT ================= */}
      <div
        style={{
          border: "1px solid #93c5fd",
          borderRadius: "16px",
          padding: "8px 10px",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 4px 16px rgba(109,74,255,0.08)",
        }}
      >
        <div>

          {/* HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700 }}>
                Select Files
              </div>
              <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                {selectedDownloadOptions.length} selected
              </div>
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 10px",
                borderRadius: "9px",
                border: "1px solid #93c5fd",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                height: "32px",
                background: "#f0f7ff",
              }}
            >
              <input
                type="checkbox"
                checked={
                  selectedDownloadOptions.length ===
                  downloadCenterOptions.length
                }
                onChange={() => {
                  if (
                    selectedDownloadOptions.length ===
                    downloadCenterOptions.length
                  ) {
                    setSelectedDownloadOptions([]);
                  } else {
                    setSelectedDownloadOptions([
                      ...downloadCenterOptions,
                    ]);
                  }
                }}
                style={{ width: "14px", height: "14px", margin: 0 }}
              />
              All
            </label>
          </div>

          {/* FILE GRID */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
            }}
          >
            {downloadCenterOptions.map((option) => {
              const isSelected =
                selectedDownloadOptions.includes(option);

              return (
                <label
                  key={option}
                  style={{
                    height: "52px",
                    borderRadius: "10px",
                    border: isSelected
                      ? "2px solid #4f46e5"
                      : "1px solid #bfdbfe",
                    background: isSelected ? "#ede9fe" : "#f8fbff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "#3730a3",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleDownloadOption(option)}
                    style={{ display: "none" }}
                  />
                  {option}
                </label>
              );
            })}
          </div>
        </div>

        {/* BUTTONS */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "14px",
          }}
        >
          <button
            onClick={() => {
              setSelectedDownloadOptions([]);
              setSelectedDownloadMonths([]);
            }}
            style={{
              padding: "9px 18px",
              borderRadius: "10px",
              border: "1px solid #ef4444",
              background: "#fff",
              color: "#ef4444",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleDownloadCenterDownload}
            style={{
              padding: "9px 18px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(135deg,#10b981,#059669)",
              color: "#fff",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Download
          </button>
        </div>
      </div>

      {/* ================= RIGHT ================= */}
      <div
        style={{
          border: "1px solid #93c5fd",
          borderRadius: "16px",
          padding: "8px 10px",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
        }}
      >

        {/* YEAR + MONTH ALL (FIXED ALIGNMENT) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "12px",
            gap: "10px",
          }}
        >

          {/* YEAR */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, marginBottom: "4px" }}>
              Year
            </div>

            <select
              style={{
                width: "100%",
                height: "34px",
                borderRadius: "8px",
                border: "2px solid #3b82f6",
                fontSize: "0.8rem",
                fontWeight: 600,
                padding: "0 8px",
                background: "#f8fbff",
                cursor: "pointer",
              }}
            >
              {[
                "2017-2018",
                "2018-2019",
                "2019-2020",
                "2020-2021",
                "2021-2022",
                "2022-2023",
                "2023-2024",
                "2024-2025",
                "2025-2026",
              ].map((year) => (
                <option key={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* MONTH ALL (SHIFTED UP ALIGNMENT FIX) */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 10px",
              borderRadius: "8px",
              border: "1px solid #93c5fd",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              height: "34px",
              background: "#f0f7ff",
              whiteSpace: "nowrap",

              /* 🔥 ALIGNMENT FIX */
              marginTop: "20px",
            }}
          >
            <input
              type="checkbox"
              checked={
                selectedDownloadMonths.length === downloadCenterMonths.length
              }
              onChange={() => {
                if (
                  selectedDownloadMonths.length === downloadCenterMonths.length
                ) {
                  setSelectedDownloadMonths([]);
                } else {
                  setSelectedDownloadMonths([...downloadCenterMonths]);
                }
              }}
              style={{ width: "14px", height: "14px", margin: 0 }}
            />
            All Months
          </label>
        </div>

        {/* MONTH GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "8px",
          }}
        >
          {downloadCenterMonths.map((month) => {
            const isSelected =
              selectedDownloadMonths.includes(month);

            return (
              <label
                key={month}
                style={{
                  height: "46px",
                  borderRadius: "10px",
                  border: isSelected
                    ? "2px solid #10b981"
                    : "1px solid #86efac",
                  background: isSelected ? "#ecfdf5" : "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {
                    if (isSelected) {
                      setSelectedDownloadMonths(
                        selectedDownloadMonths.filter(m => m !== month)
                      );
                    } else {
                      setSelectedDownloadMonths([
                        ...selectedDownloadMonths,
                        month,
                      ]);
                    }
                  }}
                  style={{ display: "none" }}
                />
                {month}
              </label>
            );
          })}
        </div>

      </div>
    </div>
  </div>
)}
          {isTDSTCS && selectedTdsTcsSection === "Download" && (
            <>
              <div style={{ overflowX: "auto", border: "1px solid #d1d5db", borderRadius: 8, background: "white" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", border: "1px solid #d1d5db" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={{ padding: "8px 10px", borderRight: "1px solid #d1d5db", textAlign: "left", whiteSpace: "nowrap" }}>Taxation Type</th>
                      <th style={{ padding: "8px 10px", borderRight: "1px solid #d1d5db", textAlign: "left", whiteSpace: "nowrap" }}>GSTIN of Deductor</th>
                      <th style={{ padding: "8px 10px", borderRight: "1px solid #d1d5db", textAlign: "center", whiteSpace: "nowrap" }}>Tax Period of GSTR-7</th>
                      <th style={{ padding: "8px 16px", borderRight: "1px solid #d1d5db", textAlign: "left", minWidth: "220px" }}>Trade Name / Legal Name of Deductor</th>
                      <th style={{ padding: "8px 10px", borderRight: "1px solid #d1d5db", textAlign: "right", whiteSpace: "nowrap" }}>Taxable Value</th>
                      <th style={{ padding: "8px 10px", borderRight: "1px solid #d1d5db", textAlign: "right", whiteSpace: "nowrap" }}>IGST</th>
                      <th style={{ padding: "8px 10px", borderRight: "1px solid #d1d5db", textAlign: "center", whiteSpace: "nowrap" }}>CGST</th>
                      <th style={{ padding: "8px 10px", borderRight: "1px solid #d1d5db", textAlign: "center", whiteSpace: "nowrap" }}>SGST</th>
                      <th style={{ padding: "8px 10px", borderRight: "1px solid #d1d5db", textAlign: "center", whiteSpace: "nowrap" }}>Status</th>
                      <th style={{ padding: "8px 10px", textAlign: "center", whiteSpace: "nowrap" }}>Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tdsTcsDownloadRows.map((row) => (
                      <tr key={row.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "7px 10px", borderRight: "1px solid #d1d5db" }}>{row.taxationType}</td>
                        <td style={{ padding: "7px 10px", borderRight: "1px solid #d1d5db" }}>{row.gstin}</td>
                        <td style={{ padding: "7px 10px", borderRight: "1px solid #d1d5db", textAlign: "center" }}>{row.taxPeriod}</td>
                        <td style={{ padding: "7px 10px", borderRight: "1px solid #d1d5db" }}>{row.tradeName}</td>
                        <td style={{ padding: "7px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{Number(row.taxableValue).toFixed(2)}</td>
                        <td style={{ padding: "7px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{Number(row.igst).toFixed(2)}</td>
                        <td style={{ padding: "7px 10px", borderRight: "1px solid #d1d5db", textAlign: "center" }}>{row.cgst}</td>
                        <td style={{ padding: "7px 10px", borderRight: "1px solid #d1d5db", textAlign: "center" }}>{row.sgst}</td>
                        <td style={{
                          padding: "7px 10px",
                          borderRight: "1px solid #d1d5db",
                          textAlign: "center",
                          color: row.status === "Accepted" ? "#16a34a" : row.status === "Rejected" ? "#ea580c" : "#4f46e5",
                          fontWeight: 600
                        }}>
                          {row.status}
                        </td>
                        <td style={{ padding: "7px 10px", textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={() => toggleTdsTcsRow(setTdsTcsDownloadRows, row.id)}
                            style={{ width: 16, height: 16, cursor: "pointer" }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                <button onClick={handleTdsTcsDownload} style={{ padding: "7px 16px", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: "0.82rem", boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }}>
                  Download
                </button>
                <button onClick={handleTdsTcsAllAccept} style={{ padding: "7px 16px", background: "linear-gradient(135deg,#38bdf8,#0ea5e9)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: "0.82rem", boxShadow: "0 2px 8px rgba(14,165,233,0.25)" }}>
                  All Accept
                </button>
                <button onClick={handleTdsTcsReject} style={{ padding: "7px 16px", background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: "0.82rem", boxShadow: "0 2px 8px rgba(234,88,12,0.25)" }}>
                  Reject
                </button>
                <button onClick={handleTdsTcsDelete} style={{ padding: "7px 16px", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: "0.82rem", boxShadow: "0 2px 8px rgba(220,38,38,0.25)" }}>
                  Delete
                </button>
              </div>
            </>
          )}

          {isTDSTCS && selectedTdsTcsSection === "Upload" && (
            <>
              <div style={{ overflowX: "auto", border: "1px solid #d1d5db", borderRadius: 8, background: "white" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", border: "1px solid #d1d5db" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={{ padding: "8px 10px", borderRight: "1px solid #d1d5db", textAlign: "left", whiteSpace: "nowrap" }}>Taxation Type</th>
                      <th style={{ padding: "8px 10px", borderRight: "1px solid #d1d5db", textAlign: "left", whiteSpace: "nowrap" }}>GSTIN of Deductor</th>
                      <th style={{ padding: "8px 10px", borderRight: "1px solid #d1d5db", textAlign: "center", whiteSpace: "nowrap" }}>Tax Period of GSTR-7</th>
                      <th style={{ padding: "8px 16px", borderRight: "1px solid #d1d5db", textAlign: "left", minWidth: "220px" }}>Trade Name / Legal Name of Deductor</th>
                      <th style={{ padding: "8px 10px", borderRight: "1px solid #d1d5db", textAlign: "right", whiteSpace: "nowrap" }}>Taxable Value</th>
                      <th style={{ padding: "8px 10px", borderRight: "1px solid #d1d5db", textAlign: "right", whiteSpace: "nowrap" }}>IGST</th>
                      <th style={{ padding: "8px 10px", borderRight: "1px solid #d1d5db", textAlign: "center", whiteSpace: "nowrap" }}>CGST</th>
                      <th style={{ padding: "8px 10px", borderRight: "1px solid #d1d5db", textAlign: "center", whiteSpace: "nowrap" }}>SGST</th>
                      <th style={{ padding: "8px 10px", borderRight: "1px solid #d1d5db", textAlign: "center", whiteSpace: "nowrap" }}>Status</th>
                      <th style={{ padding: "8px 10px", textAlign: "center", whiteSpace: "nowrap" }}>Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tdsTcsUploadRows.map((row) => (
                      <tr key={row.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "7px 10px", borderRight: "1px solid #d1d5db" }}>{row.taxationType}</td>
                        <td style={{ padding: "7px 10px", borderRight: "1px solid #d1d5db" }}>{row.gstin}</td>
                        <td style={{ padding: "7px 10px", borderRight: "1px solid #d1d5db", textAlign: "center" }}>{row.taxPeriod}</td>
                        <td style={{ padding: "7px 10px", borderRight: "1px solid #d1d5db" }}>{row.tradeName}</td>
                        <td style={{ padding: "7px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{Number(row.taxableValue).toFixed(2)}</td>
                        <td style={{ padding: "7px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{Number(row.igst).toFixed(2)}</td>
                        <td style={{ padding: "7px 10px", borderRight: "1px solid #d1d5db", textAlign: "center" }}>{row.cgst}</td>
                        <td style={{ padding: "7px 10px", borderRight: "1px solid #d1d5db", textAlign: "center" }}>{row.sgst}</td>
                        <td style={{
                          padding: "7px 10px",
                          borderRight: "1px solid #d1d5db",
                          textAlign: "center",
                          color: row.status === "Accepted" ? "#16a34a" : "#ea580c",
                          fontWeight: 600
                        }}>
                          {row.status}
                        </td>
                        <td style={{ padding: "7px 10px", textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={() => toggleTdsTcsRow(setTdsTcsUploadRows, row.id)}
                            style={{ width: 16, height: 16, cursor: "pointer" }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                <button
                  onClick={handleTdsTcsUploadPortal}
                  style={{
                    padding: "7px 18px",
                    background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "0.82rem",
                    boxShadow: "0 2px 8px rgba(37,99,235,0.25)"
                  }}
                >
                  Upload on Portal
                </button>
              </div>
            </>
          )}

          {isTDSTCS && selectedTdsTcsSection === "TDS/TCS Filing" && (
            <>
              <div style={{ overflowX: "auto", border: "1px solid #d1d5db", borderRadius: 8, background: "white" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", border: "1px solid #d1d5db" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={{ padding: "8px 10px", borderRight: "1px solid #d1d5db", textAlign: "center", whiteSpace: "nowrap" }}>SL</th>
                      <th style={{ padding: "8px 10px", borderRight: "1px solid #d1d5db", textAlign: "left", whiteSpace: "nowrap" }}>Category</th>
                      <th style={{ padding: "8px 10px", borderRight: "1px solid #d1d5db", textAlign: "center", whiteSpace: "nowrap" }}>Status</th>
                      <th style={{ padding: "8px 10px", borderRight: "1px solid #d1d5db", textAlign: "center", whiteSpace: "nowrap" }}>No of Records</th>
                      <th style={{ padding: "8px 10px", borderRight: "1px solid #d1d5db", textAlign: "right", whiteSpace: "nowrap" }}>Taxable Value</th>
                      <th style={{ padding: "8px 10px", borderRight: "1px solid #d1d5db", textAlign: "right", whiteSpace: "nowrap" }}>IGST</th>
                      <th style={{ padding: "8px 10px", borderRight: "1px solid #d1d5db", textAlign: "center", whiteSpace: "nowrap" }}>CGST</th>
                      <th style={{ padding: "8px 10px", textAlign: "center", whiteSpace: "nowrap" }}>SGST</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tdsTcsFilingRows.map((row) => (
                      <tr key={row.sl} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "7px 10px", borderRight: "1px solid #d1d5db", textAlign: "center" }}>{row.sl}</td>
                        <td style={{ padding: "7px 10px", borderRight: "1px solid #d1d5db" }}>{row.category}</td>
                        <td style={{ padding: "7px 10px", borderRight: "1px solid #d1d5db", textAlign: "center", color: "#16a34a", fontWeight: 600 }}>{row.status}</td>
                        <td style={{ padding: "7px 10px", borderRight: "1px solid #d1d5db", textAlign: "center" }}>{row.records}</td>
                        <td style={{ padding: "7px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{Number(row.taxableValue).toFixed(2)}</td>
                        <td style={{ padding: "7px 10px", borderRight: "1px solid #d1d5db", textAlign: "right" }}>{Number(row.igst).toFixed(2)}</td>
                        <td style={{ padding: "7px 10px", borderRight: "1px solid #d1d5db", textAlign: "center" }}>{row.cgst}</td>
                        <td style={{ padding: "7px 10px", textAlign: "center" }}>{row.sgst}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                <button
                  onClick={handleTdsTcsSubmit}
                  style={{
                    padding: "7px 20px",
                    background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "0.82rem",
                    boxShadow: "0 2px 8px rgba(37,99,235,0.25)"
                  }}
                >
                  Submit File
                </button>
              </div>
            </>
          )}
          
          
      
{!isDownloadCenter && !isTDSTCS && !isReports && ((isITC04 && selectedItcTable) || (!isITC04 && selectedSection)) && currentColumns.length > 0 && (          
  <>
    {/* [FIX #4] Compact section nav bar for GSTR-1/GSTR-1A — white 3D premium */}
    {!isGSTR3B && !isITC04 && selectedSection && (
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
        marginBottom: "8px",
        padding: "7px 12px",
        background: "#ffffff",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
      }}>
        {/* Back button */}
        <button
          onClick={() => setSelectedSection("")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "5px 12px",
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            color: "#3730a3",
            fontWeight: 600,
            fontSize: "0.82rem",
            cursor: "pointer",
            whiteSpace: "nowrap",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            transition: "all 0.15s"
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#c4b5fd"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(31,42,112,0.12)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; }}
        >
          ← Back
        </button>

        {/* [FIX #5] Jump-to-section dropdown — Custom styled with fixed height + scroll */}
        {(() => {
          // Helper: section name se number prefix hatao (e.g. "3 - Exports Invoices" → "Exports Invoices")
          const stripNumber = (s) => s.replace(/^\d+\s*-\s*/, "").trim();

          return (
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500, whiteSpace: "nowrap" }}>Jump to:</span>

              {/* Custom dropdown wrapper */}
              <div style={{ position: "relative" }}>
                {/* Trigger button */}
                <button
                  id="gstr1-jump-trigger"
                  onClick={() => {
                    const dd = document.getElementById("gstr1-jump-dropdown");
                    if (dd) dd.style.display = dd.style.display === "block" ? "none" : "block";
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 10px 5px 12px",
                    borderRadius: "6px",
                    border: "1.5px solid #c7d2fe",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    background: "#ffffff",
                    color: "#1e293b",
                    cursor: "pointer",
                    minWidth: 200,
                    maxWidth: 260,
                    outline: "none",
                    boxShadow: "0 2px 8px rgba(79,70,229,0.10)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, textAlign: "left" }}>
                    {stripNumber(selectedSection)}
                  </span>
                  <svg width="10" height="10" viewBox="0 0 10 10" style={{ flexShrink: 0 }}>
                    <path d="M1 3l4 4 4-4" stroke="#4f46e5" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  </svg>
                </button>

                {/* Dropdown panel */}
                <div
                  id="gstr1-jump-dropdown"
                  style={{
                    display: "none",
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    right: 0,
                    zIndex: 9999,
                    background: "#ffffff",
                    border: "1.5px solid #c7d2fe",
                    borderRadius: "8px",
                    boxShadow: "0 8px 24px rgba(79,70,229,0.15)",
                    minWidth: 260,
                    maxWidth: 320,
                    overflow: "hidden",
                  }}
                >
                  {/* Fixed height scrollable list */}
                  <div style={{ maxHeight: "320px", overflowY: "auto", padding: "4px 0" }}>

                    {/* Group 1: Select Section */}
                    <div style={{
                      padding: "6px 12px 4px 12px",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: "#ffffff",
                      background: "#3730a3",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      userSelect: "none",
                    }}>
                      Select Section
                    </div>

                    {currentSections.map((s) => (
                      <div
                        key={s}
                        onClick={() => {
                          setSelectedSection(s);
                          const dd = document.getElementById("gstr1-jump-dropdown");
                          if (dd) dd.style.display = "none";
                        }}
                        style={{
                          padding: "7px 14px",
                          fontSize: "0.78rem",
                          fontWeight: s === selectedSection ? 700 : 500,
                          color: "#1e293b",
                          background: s === selectedSection ? "#e5e7eb" : "#ffffff",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={e => {
                          if (s !== selectedSection) e.currentTarget.style.background = "#dbeafe";
                        }}
                        onMouseLeave={e => {
                          if (s !== selectedSection) e.currentTarget.style.background = "#ffffff";
                        }}
                      >
                        {stripNumber(s)}
                      </div>
                    ))}

                    {/* Group 2: Amendments */}
                    <div style={{
                      padding: "6px 12px 4px 12px",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: "#ffffff",
                      background: "#3730a3",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      userSelect: "none",
                      marginTop: "4px",
                    }}>
                      Amendments
                    </div>

                    {gstr1AmendmentSections.map((s) => (
                      <div
                        key={s}
                        onClick={() => {
                          setSelectedSection(s);
                          const dd = document.getElementById("gstr1-jump-dropdown");
                          if (dd) dd.style.display = "none";
                        }}
                        style={{
                          padding: "7px 14px",
                          fontSize: "0.78rem",
                          fontWeight: s === selectedSection ? 700 : 500,
                          color: "#1e293b",
                          background: s === selectedSection ? "#e5e7eb" : "#ffffff",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={e => {
                          if (s !== selectedSection) e.currentTarget.style.background = "#dbeafe";
                        }}
                        onMouseLeave={e => {
                          if (s !== selectedSection) e.currentTarget.style.background = "#ffffff";
                        }}
                      >
                        {stripNumber(s)}
                      </div>
                    ))}

                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    )}
    {!isReports && !isDownloadCenter && !isTDSTCS && (
  <h2 style={{ margin: "4px 0 6px 0", fontSize: "1rem", color: "#1e293b", fontWeight: 700 }}>
    {isITC04 ? selectedItcTable : selectedSection}
  </h2>
)}
    <div style={{ overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 8, background: "white", marginTop: "0px",     // ← yahan 0 ya -4px daal sakte ho agar bhi space dikhe
  padding: "0" }}>
      <table style={{ 
  width: "100%", 
  borderCollapse: "collapse", 
  fontSize: "12px",
  border: "1px solid #d1d5db"
}}>
        <thead>
          {/* [FIX #6] Premium table header — white navbar, better typography */}
          <tr style={{ background: "#ffffff", borderBottom: "2px solid #e2e8f0" }}>
  <th style={{
    padding: "9px 10px",
    textAlign: "center",
    minWidth: 45,
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    whiteSpace: "nowrap",
    fontWeight: 700,
    fontSize: "0.75rem",
    color: "#3730a3",
    letterSpacing: "0.03em"
  }}>SL</th>

  {currentColumns.map((col, i) => (
    <th key={i} style={{
      padding: "6px 8px",
      textAlign: "center",
      minWidth: 100,
      border: "1px solid #e2e8f0",
      whiteSpace: "nowrap",
      background: "#ffffff",
      fontWeight: 700,
      fontSize: "0.72rem",
      color: "#3730a3",
      letterSpacing: "0.03em"
    }}>
      {col.label}
    </th>
  ))}
  

  <th style={{
    padding: "6px 8px",
    textAlign: "center",
    minWidth: 100,
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    fontWeight: 700,
    fontSize: "0.72rem",
    color: "#3730a3",
    letterSpacing: "0.03em"
  }}>Action</th>
</tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} style={{
              background: rowIndex % 2 === 0 ? "#ffffff" : "#f8fafc",
              transition: "background 0.12s ease"
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f0f4ff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = rowIndex % 2 === 0 ? "#ffffff" : "#f8fafc"; }}
            >
 <td
  style={{
    padding: "2px 4px",      // 3px 8px se aur chhota
    height: "30px",          // row height control
    border: "1px solid #e2e8f0",
    textAlign: "center",
    verticalAlign: "middle", // center
    fontSize: "0.72rem",
    color: "#64748b",
    fontWeight: 600
  }}
>
  {row.sl || (rowIndex + 1)}
</td>

{currentColumns.map((col, colIndex) => (
  <td
    key={colIndex}
    style={{
      padding: "3px 6px",
      border: "1px solid #e2e8f0",
      position: "relative",
      fontSize: "0.8rem",
      color: "#334155"
    }}
  >
{(() => {


  
 
const fieldKey = (col.key || "").toLowerCase();

const isDropdownField =
  col.key === "pos" ||
  fieldKey === "invtype" ||
  fieldKey === "invoicetype" ||
  fieldKey === "exporttype" ||
  fieldKey === "financialyear" ||
  fieldKey === "originalmonth" ||
  fieldKey === "notetype" ||
  fieldKey === "nature" ||
  fieldKey === "urtype" ||
  fieldKey === "applicabletaxrate" ||
fieldKey === "applicabletaxrateb2cla" ||
fieldKey === "applicablepercent" ||
fieldKey === "applicable %".replace(/\s/g, "") ||
fieldKey === "rate" ||
fieldKey === "rateb2cla" ||
fieldKey === "gstrate" ||
fieldKey === "taxrate" ||
  fieldKey === "type" ||
  fieldKey === "rcm" ||
  fieldKey === "uqc" ||
  fieldKey === "jobworkertype" ||
  fieldKey === "goodstype" ||
  fieldKey.replace(/\s/g, "") === "natureofsupply";

  // ──────────────────────────────
  // Normal input (text / number)
  // ──────────────────────────────
  if (!isDropdownField) {
    return (
      <input
        type={col.type === "number" ? "number" : "text"}
        value={row[col.key] ?? ""}
        onChange={(e) => updateCell(rowIndex, col.key, e.target.value)}
        style={{
          width: "100%",
          height: "26px",
          padding: "0 4px",
          border: "none",
          outline: "none",
          background: "transparent",
          boxSizing: "border-box",
          lineHeight: "26px",
          fontSize: "0.8rem",
          textAlign: "center",
        }}
      />
    );
  }

  // ──────────────────────────────
  // Dropdown config (your original logic, unchanged)
  // ──────────────────────────────
  let dropdownType = "";
  let placeholderText = "";
  let dropdownWidth = "220px";
  let optionsArray = [];
  let textAlign = "center";

  if (col.key === "pos") {
    dropdownType = "pos";
    placeholderText = "Select State";
    dropdownWidth = "280px";
    optionsArray = stateList.map((s) => ({
      label: `${s.name} (${s.code}) - ${s.stateCode}`,
      value: s.code,
    }));
  }
  else if (col.key === "exportType") {
  dropdownType = "exportType";
  placeholderText = "Select Export Type";
  dropdownWidth = "160px";

  optionsArray = [
    { label: "WOPAY", value: "WOPAY" },
    { label: "WPAY", value: "WPAY" }
  ];
}
 else if (
  (col.key || "").toLowerCase() === "invtype" ||
  (col.key || "").toLowerCase() === "invoicetype"
) {
  dropdownType = "invoiceType";
  placeholderText = "Select Invoice Type";
  dropdownWidth = "340px";
  optionsArray = [
    "Regular B2B",
    "SEZ Supply WPAY",
    "SEZ Supply WOPAY",
    "Deemed Export",
    "Intra-State Supply Attracting IGST"
  ].map(opt => ({ label: opt, value: opt }));
  textAlign = "left";
}
  else if (col.key === "financialYear") {
  dropdownType = "financialYear";
  placeholderText = "Select Financial Year";
  dropdownWidth = "180px";
  optionsArray = [
    "2017-18","2018-19","2019-20","2020-21","2021-22",
    "2022-23","2023-24","2024-25","2025-26",
  ].map(opt => ({ label: opt, value: opt }));
} else if (col.key === "originalMonth") {
  dropdownType = "originalMonth";
  placeholderText = "Select Original Month";
  dropdownWidth = "180px";
  optionsArray = [
    "April", "May", "June", "July", "August", "September",
    "October", "November", "December", "January", "February", "March"
  ].map(opt => ({ label: opt, value: opt }));
} else if (col.key === "noteType") {
    dropdownType = "noteType";
    placeholderText = "Select Note Type";
    dropdownWidth = "180px";
    optionsArray = noteTypeOptions.map(opt => ({ label: opt, value: opt }));
  } else if (col.key === "nature") {
    if (selectedSection === "14 - Supplies made through ECO") {
      dropdownType = "nature-eco";
      placeholderText = "Select Nature";
      dropdownWidth = "300px";
      optionsArray = natureOptions.map(opt => ({ label: opt, value: opt }));
    } else if (selectedSection === "13 - Documents Issued") {
      dropdownType = "nature-doc";
      placeholderText = "Select Nature";
      dropdownWidth = "420px";
      optionsArray = documentNatureOptions.map(opt => ({ label: opt, value: opt }));
    }
    textAlign = "left";
  } else if (col.key === "urType") {
    dropdownType = "urType";
    placeholderText = "Select UR Type";
    dropdownWidth = "240px";
    optionsArray = urTypeOptions.map(opt => ({ label: opt, value: opt }));
  } else if (
  ["applicableTaxRate", "applicablePercent", "applicable %", "applicableTaxRateB2CLA"].includes(col.key)
) {
    dropdownType = "applicableTaxRate";
    placeholderText = "Select %";
    dropdownWidth = "140px";
    optionsArray = ["0%", "65%"].map(opt => ({ label: opt, value: opt }));
 } else if (["rate", "gstRate", "taxRate", "rateB2CLA"].includes(col.key)) {
    dropdownType = "rate";
    placeholderText = "Select Rate";
    dropdownWidth = "220px";
    optionsArray = ["0%", "0.10%", "0.25%", "1%", "1.50%", "3%", "5%", "6%"].map(opt => ({ label: opt, value: opt }));
  } else if ((col.key || "").toLowerCase() === "type") {
    dropdownType = "type";
    placeholderText = "Select Type";
    dropdownWidth = "140px";
    optionsArray = TypeofDocumenstOptions.map(opt => ({ label: opt, value: opt }));
  } else if ((col.key || "").toLowerCase() === "notetype") {
    dropdownType = "notetype";
    placeholderText = "Select Note Type";
    dropdownWidth = "160px";
    optionsArray = noteTypeOptions.map(opt => ({ label: opt, value: opt }));
  } else if ((col.key || "").toLowerCase() === "rcm") {
    dropdownType = "rcm";
    placeholderText = "Select RCM";
    dropdownWidth = "120px";
    optionsArray = rcmOptions.map(opt => ({ label: opt, value: opt }));
  } else if ((col.key || "").toLowerCase() === "uqc") {
    dropdownType = "uqc";
    placeholderText = "Select UQC";
    dropdownWidth = "240px";
    optionsArray = ucqOptions.map(opt => ({ label: opt, value: opt }));
    textAlign = "left";
  } else if ((col.key || "").toLowerCase().replace(/\s/g, "") === "natureofsupply") {
    dropdownType = "natureofsupply";
    placeholderText = "Select Nature of Supply";
    dropdownWidth = "320px";
    optionsArray = natureOptions.map(opt => ({ label: opt, value: opt }));
    textAlign = "left";
  }else if (col.key === "jobWorkerType") {
  dropdownType = "jobWorkerType";
  placeholderText = "Select Type";
  dropdownWidth = "140px";
  optionsArray = [
    { label: "SEZ", value: "SEZ" },
    { label: "Non SEZ", value: "Non SEZ" }
  ];
}
else if (col.key === "goodsType") {
  dropdownType = "goodsType";
  placeholderText = "Select Goods Type";
  dropdownWidth = "160px";
  optionsArray = [
    { label: "Capital Goods", value: "Capital Goods" },
    { label: "Inputs", value: "Inputs" }
  ];
}
else if (col.key === "uqc") {
  dropdownType = "uqc";
  placeholderText = "Select UQC";
  dropdownWidth = "120px";
  optionsArray = [
    { label: "KGS", value: "KGS" },
    { label: "MTR", value: "MTR" },
    { label: "SQF", value: "SQF" }
  ];
}
else if (col.key === "documentType") {
  dropdownType = "documentType";
  placeholderText = "Select Document Type";

  optionsArray = [
    { label: "Regular", value: "Regular" },
    { label: "Deemed Exp", value: "Deemed Exp" },
    { label: "SEZ supplies with payment", value: "SEZ supplies with payment" },
    { label: "SEZ supplies without payment", value: "SEZ supplies without payment" }
  ];
}

  const isOpen = openDropdown?.row === rowIndex && openDropdown?.type === dropdownType;

  // ──────────────────────────────
  // Position calculation when opening
  // ──────────────────────────────
  let posStyles = {
    top: "100%",
    left: "0px",
    marginTop: "4px",
  };

  if (isOpen && openDropdown?.rect) {
    const r = openDropdown.rect;
    const dropdownEstHeight = Math.min(optionsArray.length * 36 + 20, 340);

    // Flip up if not enough space below
    if (window.innerHeight - r.bottom < dropdownEstHeight + 30) {
      posStyles = {
        bottom: "100%",
        top: "auto",
        marginBottom: "4px",
        marginTop: "0px",
      };
    }

    // Shift left if going off right side
    const rightSpace = window.innerWidth - r.right;
    if (rightSpace < Number.parseInt(dropdownWidth) + 20) {
      posStyles.left = `-${Number.parseInt(dropdownWidth) - r.width - 8}px`;
    }
  }
return (
    <>
      <input
  type="text"
  readOnly
  value={row[col.key] || ""}
  placeholder={placeholderText}
  onClick={(e) => {
    e.stopPropagation();

    setOpenDropdown({
      row: rowIndex,
      type: dropdownType
    });
  }}
  style={{
    width: "100%",
    height: "26px",
    padding: "0 8px",
    border: "none",
    outline: "none",
    background: "transparent",
    boxSizing: "border-box",
    lineHeight: "26px",
    fontSize: "0.8rem",
    textAlign: "center",
    cursor: "pointer",
    color: row[col.key] ? "#1e293b" : "#94a3b8",
  }}
/>

   {isOpen && (
  <div
  className="custom-dropdown-container"
  onClick={(e) => {
    // agar overlay pe click hua
    if (e.target === e.currentTarget) {
      setOpenDropdown(null);
    }
  }}
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.25)",
    zIndex: 2000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }}
>
    <div
      style={{
        width: "420px",
        maxHeight: "70vh",
        background: "white",
        borderRadius: "10px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}
    >

      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #e5e7eb",
          fontWeight: 600,
          fontSize: "15px"
        }}
      >
        {placeholderText}
      </div>

      {/* Options */}
      <div
        style={{
          overflowY: "auto",
          maxHeight: "60vh"
        }}
      >
        {optionsArray.map((item, idx) => (
          <div
            key={idx}
            onClick={() => {
              updateCell(rowIndex, col.key, item.value);
              setOpenDropdown(null);
            }}
            style={{
              padding: "10px 16px",
              cursor: "pointer",
              fontSize: "14px",
              borderBottom:
                idx < optionsArray.length - 1
                  ? "1px solid #f1f5f9"
                  : "none",
              background:
                row[col.key] === item.value
                  ? "#f3f0ff"
                  : "transparent",
              color:
                row[col.key] === item.value
                  ? "#4f46e5"
                  : "#1e293b"
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#f8fafc")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                row[col.key] === item.value
                  ? "#f3f0ff"
                  : "transparent")
            }
          >
            {item.label}
          </div>
        ))}
      </div>

    </div>
  </div>
)}
    </>
  );
})()}
  </td>
))}

<td style={{ padding: "3px 8px", textAlign: "center", border: "1px solid #e2e8f0" }}>
  {/* [FIX #7] Normal delete button - no circular icon, plain text */}
  <button onClick={() => deleteRow(rowIndex)} style={{ color: "#ef4444", cursor: "pointer", background: "none", border: "none", fontWeight: 600, fontSize: "0.75rem", padding: "2px 6px" }}>
    Delete
  </button>
</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ background: "#f8fafc", fontWeight: 700 }}>
            <td colSpan={currentColumns.length + 1} style={{ padding: "7px 10px", textAlign: "right", border: "1px solid #e2e8f0", fontSize: "0.78rem", color: "#3730a3" }}>Total</td>
            <td style={{
      padding: "7px 10px",
      textAlign: "right",
      border: "1px solid #e2e8f0",
      fontSize: "0.78rem",
      color: "#3730a3"
    }}>0.00</td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between" }}>
      <button
        onClick={addRow}
        style={{
          padding: "8px 20px",          // ← padding kam: 12px 32px → 8px 20px
      background: "linear-gradient(135deg, #6D4AFF, #4f46e5)",
      color: "white",
      border: "none",
      borderRadius: 6,              // radius bhi thoda chhota
      fontWeight: 500,              // fontWeight kam (600 → 500)
      fontSize: "0.9rem",           // optional: text chhota
      cursor: "pointer"
        }}
      >
        + Add Row
      </button>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={handleSave}
          style={{
            padding: "8px 20px",
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: 6 ,
            fontWeight: 500,
            fontSize: "0.9rem",
            cursor: "pointer"
          }}
        >
          Save
        </button>
        <button
          style={{
            padding: "8px 28px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontWeight: 500,
            fontSize: "0.9rem",
            cursor: "pointer"
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </>
)}
          </div>
        )}

      {/* Summary Tab */}
{activeSubTab === "Summary" && !isDownloadCenter && !isReports && (
  <div style={{ padding: "20px" }}>
    {isGSTR3B ? (
      <>
        {/* ── GSTR-3B SUMMARY: unchanged as requested ── */}
        {/* Premium GSTR-3B Summary Header */}
        <div style={{ borderRadius:"16px", border:"1px solid #e2e8f0", boxShadow:"0 8px 32px rgba(100,116,139,0.14), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)", overflow:"hidden", background:"#ffffff", marginBottom:"20px" }}>
          <div style={{ background:"linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)", padding:"14px 20px", display:"flex", alignItems:"center", gap:"12px", borderBottom:"1.5px solid #e2e8f0", boxShadow:"0 4px 16px rgba(100,116,139,0.10)", transform:"perspective(600px) rotateX(0.6deg)", transformOrigin:"top center" }}>
            <div style={{ width:"34px", height:"34px", borderRadius:"9px", background:"linear-gradient(135deg,#4f46e5,#3730a3)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 3px 10px rgba(79,70,229,0.35)", flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
            </div>
            <div>
              <div style={{ fontWeight:900, fontSize:"0.92rem", color:"#0f172a", letterSpacing:"-0.01em", lineHeight:1.2 }}>GSTR-3B SUMMARY</div>
              <div style={{ fontSize:"0.68rem", color:"#64748b", fontWeight:600, marginTop:"1px" }}>Monthly Return Section Summary</div>
            </div>
            <div style={{ marginLeft:"auto" }}>
              <span style={{ background:"#f0f4ff", border:"1px solid #c7d2fe", borderRadius:"20px", padding:"3px 10px", fontSize:"0.72rem", color:"#3730a3", fontWeight:700 }}>
                {Object.keys(gstr3bSavedSummary).length} saved
              </span>
            </div>
          </div>
          <div
  style={{
    overflowX:"auto",
    margin:0,
    padding:0
  }}
>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.83rem", border:"1.5px solid #1e293b" }}>
              <thead>
                <tr style={{ background:"#f0f4ff", borderBottom:"2px solid #1e293b" }}>
                  <th style={{ padding:"12px 16px", border:"1px solid #1e293b", textAlign:"left", color:"#0f172a", fontWeight:800, fontSize:"0.71rem", letterSpacing:"0.06em", textTransform:"uppercase" }}>Section Name</th>
                  <th style={{ padding:"12px 16px", border:"1px solid #1e293b", textAlign:"center", color:"#0f172a", fontWeight:800, fontSize:"0.71rem", letterSpacing:"0.06em", textTransform:"uppercase" }}>Status</th>
                  <th style={{ padding:"12px 16px", border:"1px solid #1e293b", textAlign:"center", color:"#0f172a", fontWeight:800, fontSize:"0.71rem", letterSpacing:"0.06em", textTransform:"uppercase" }}>Rows</th>
                  <th style={{ padding:"12px 16px", border:"1px solid #1e293b", textAlign:"center", color:"#0f172a", fontWeight:800, fontSize:"0.71rem", letterSpacing:"0.06em", textTransform:"uppercase" }}>Saved At</th>
                  <th style={{ padding:"12px 16px", border:"1px solid #1e293b", textAlign:"center", color:"#0f172a", fontWeight:800, fontSize:"0.71rem", letterSpacing:"0.06em", textTransform:"uppercase" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {gstr3bSections.map((section) => {
                  const item = gstr3bSavedSummary[section];
                  return (
                    <tr key={section} style={{ borderBottom:"1px solid #cbd5e1", transition:"background 0.12s" }}
                      onMouseEnter={e=>e.currentTarget.style.background="#f8f7ff"}
                      onMouseLeave={e=>e.currentTarget.style.background=""}>
                      <td style={{ padding:"12px 16px", border:"1px solid #cbd5e1", fontWeight:600, color:"#1e293b" }}>{section}</td>
                      <td style={{ padding:"12px 16px", border:"1px solid #cbd5e1", textAlign:"center" }}>
                        {item
                          ? <span style={{ background:"#dcfce7", color:"#15803d", border:"1px solid #bbf7d0", borderRadius:"20px", padding:"3px 10px", fontSize:"0.72rem", fontWeight:700 }}>✓ Saved</span>
                          : <span style={{ background:"#f1f5f9", color:"#64748b", border:"1px solid #e2e8f0", borderRadius:"20px", padding:"3px 10px", fontSize:"0.72rem", fontWeight:600 }}>Not Saved</span>
                        }
                      </td>
                      <td style={{ padding:"12px 16px", border:"1px solid #cbd5e1", textAlign:"center", fontWeight:600, color:"#374151" }}>{item?.rows?.length||0}</td>
                      <td style={{ padding:"12px 16px", border:"1px solid #cbd5e1", textAlign:"center", color:"#64748b", fontSize:"0.78rem" }}>{item?.savedAt||"—"}</td>
                      <td style={{ padding:"12px 16px", border:"1px solid #cbd5e1", textAlign:"center" }}>
                        <button disabled={!item} onClick={() => downloadGstr3bSectionExcel(section)}
                          style={{ padding:"7px 14px", background:item?"linear-gradient(135deg,#4f46e5,#3730a3)":"#f3f4f6", border:item?"none":"1px solid #d1d5db", borderRadius:7, color:item?"#fff":"#9ca3af", cursor:item?"pointer":"not-allowed", fontWeight:700, fontSize:"0.78rem", boxShadow:item?"0 2px 8px rgba(79,70,229,0.25)":"none" }}>
                          Download Excel
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {Object.keys(gstr3bSavedSummary).length===0 && (
                  <tr><td colSpan={5} style={{ padding:"40px", textAlign:"center", color:"#94a3b8" }}>
                    <div style={{ fontSize:"1.8rem", marginBottom:"6px" }}>📭</div>
                    <div style={{ fontWeight:600, fontSize:"0.88rem" }}>No GSTR-3B section saved yet</div>
                    <div style={{ fontSize:"0.78rem", marginTop:"4px", color:"#cbd5e1" }}>Save entries from Manually tab to see them here</div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    ) : (
      <>
        {/* ── PREMIUM GSTR-1 / GSTR-1A SUMMARY TABLE ── */}
        <style>{`
          .prem-sum-row:hover td { background: #f8f7ff !important; }
          .prem-cb { appearance:none; -webkit-appearance:none; }
          @keyframes checkPop { 0%{transform:scale(0.4) rotate(-10deg);opacity:0} 60%{transform:scale(1.15) rotate(2deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
        `}</style>

        <div
  style={{
    borderRadius:"14px",
    border:"2px solid #94a3b8",
    boxShadow:"0 4px 12px rgba(0,0,0,0.12)",
    overflow:"hidden",
    background:"#fff"
  }}
>
          {/* Table header strip */}
          <div style={{ background:"linear-gradient(180deg,#ffffff 0%,#f1f5f9 100%)",
borderBottom:"2px solid #94a3b8", padding:"12px 18px", display:"flex", alignItems:"center", gap:"10px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <span style={{ color:"#2563eb", fontWeight:800, fontSize:"0.88rem", letterSpacing:"0.03em" }}>
              {title} — Summary
            </span>
            <span style={{ marginLeft:"auto", fontSize:"0.72rem", color:"#2563eb", fontWeight:600 }}>
              {visibleSummary.length} record{visibleSummary.length!==1?"s":""}
            </span>
          </div>

          <div
  style={{
    overflowX:"auto",
    margin:0,
    padding:0
  }}
>
            <table
  style={{
    width:"100%",
    borderCollapse:"collapse",
    fontSize:"0.82rem",
    border:"0"
  }}
>
              <thead>
                <tr style={{
  background:"#ffffff",
  borderBottom:"2px solid #94a3b8"
}}>
                  <th style={{ padding:"11px 14px", textAlign:"center", border:"1px solid #1e293b", width:"48px", background:"#ffffff",
border:"1px solid #cbd5e1" }}>
                    <label style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:"22px", height:"22px", borderRadius:"6px", border: selectAll ? "2px solid #16a34a" : "2px solid #94a3b8", background: selectAll ? "#16a34a" : "#ffffff", cursor:"pointer", transition:"all 0.2s ease", boxShadow: selectAll ? "0 2px 8px rgba(22,163,74,0.35)" : "0 1px 3px rgba(0,0,0,0.1)", flexShrink:0 }}>
                      <input type="checkbox" className="prem-cb" checked={selectAll} onChange={toggleSelectAll} style={{ position:"absolute", opacity:0, width:0, height:0 }} />
                      {selectAll && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation:"checkPop 0.2s ease" }}><polyline points="20 6 9 17 4 12"/></svg>}
                    </label>
                  </th>
                  {["ACT","TAXABLE VALUE","IGST","CGST","SGST","CESS","TOTAL","ACTION"].map((h,i) => (
                    <th key={h} style={{ padding:"11px 14px", textAlign: (i===0)?"left":"center", border:"1px solid #1e293b", color:"#0f172a", fontWeight:800, fontSize:"0.71rem", letterSpacing:"0.06em", textTransform:"uppercase", whiteSpace:"nowrap", background:"#f0f4ff" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleSummary.map((item) => (
                  <tr key={item.id ?? item.label} className="prem-sum-row" style={{ borderBottom:"1px solid #cbd5e1" }}>
                    <td style={{ padding:"10px 14px", textAlign:"center", border:"1px solid #cbd5e1" }}>
                      <label style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:"22px", height:"22px", borderRadius:"6px", border: selectedRows.includes(item.id) ? "2px solid #16a34a" : "2px solid #94a3b8", background: selectedRows.includes(item.id) ? "#16a34a" : "#ffffff", cursor:"pointer", transition:"all 0.2s ease", boxShadow: selectedRows.includes(item.id) ? "0 2px 8px rgba(22,163,74,0.35)" : "0 1px 3px rgba(0,0,0,0.1)", flexShrink:0 }}>
                        <input type="checkbox" className="prem-cb" checked={selectedRows.includes(item.id)} onChange={() => toggleRow(item.id)} style={{ position:"absolute", opacity:0, width:0, height:0 }} />
                        {selectedRows.includes(item.id) && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation:"checkPop 0.2s ease" }}><polyline points="20 6 9 17 4 12"/></svg>}
                      </label>
                    </td>
                    <td style={{ padding:"10px 14px", border:"1px solid #cbd5e1", fontWeight:600, color:"#1e293b" }}>{item.label}</td>
                    <td style={{ padding:"10px 14px", textAlign:"center", border:"1px solid #cbd5e1", color:"#374151", fontVariantNumeric:"tabular-nums" }}>{formatIndian(item.taxable)}</td>
                    <td style={{ padding:"10px 14px", textAlign:"center", border:"1px solid #cbd5e1", color:"#374151", fontVariantNumeric:"tabular-nums" }}>{formatIndian(item.igst)}</td>
                    <td style={{ padding:"10px 14px", textAlign:"center", border:"1px solid #cbd5e1", color:"#374151", fontVariantNumeric:"tabular-nums" }}>{formatIndian(item.cgst)}</td>
                    <td style={{ padding:"10px 14px", textAlign:"center", border:"1px solid #cbd5e1", color:"#374151", fontVariantNumeric:"tabular-nums" }}>{formatIndian(item.sgst)}</td>
                    <td style={{ padding:"10px 14px", textAlign:"center", border:"1px solid #cbd5e1", color:"#374151", fontVariantNumeric:"tabular-nums" }}>{formatIndian(item.cess)}</td>
                    <td style={{ padding:"10px 14px", textAlign:"center", border:"1px solid #cbd5e1", fontWeight:700, color:"#1e1b4b", fontVariantNumeric:"tabular-nums" }}>{formatIndian(item.total)}</td>
                    <td style={{ padding:"10px 14px", textAlign:"center", border:"1px solid #cbd5e1", color:"#9ca3af" }}>&#x2014;</td>
                  </tr>
                ))}

                {visibleSummary.length > 0 && (
                  <tr style={{ background:"#ffffff", borderTop:"2px solid #94a3b8" }}>
                    <td style={{ padding:"11px 14px", border:"1px solid #cbd5e1" }}></td>
                    <td style={{ padding:"11px 14px", fontWeight:800, color:"#0f172a", border:"1px solid #cbd5e1", fontSize:"0.85rem" }}>Grand Total</td>
                    {[grandTotal.taxable,grandTotal.igst,grandTotal.cgst,grandTotal.sgst,grandTotal.cess,grandTotal.total].map((v,i) => (
                      <td key={i} style={{ padding:"11px 14px", textAlign:"center", border:"1px solid #cbd5e1", fontWeight:800, color:"#1e293b", fontVariantNumeric:"tabular-nums" }}>{formatIndian(v)}</td>
                    ))}
                    <td style={{ padding:"11px 14px", textAlign:"center", border:"1px solid #cbd5e1", color:"#9ca3af" }}>&#x2014;</td>
                  </tr>
                )}

                {visibleSummary.length===0 && (
                  <tr>
                    <td colSpan={9} style={{ padding:"48px", textAlign:"center", color:"#94a3b8" }}>
                      <div style={{ fontSize:"2rem", marginBottom:"8px" }}>📭</div>
                      <div style={{ fontWeight:600, fontSize:"0.88rem" }}>No data saved yet</div>
                      <div style={{ fontSize:"0.78rem", marginTop:"4px", color:"#cbd5e1" }}>Save entries from Manually tab to see them here</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )}


            {/* Bottom Buttons — premium */}
            <div style={{ marginTop:20, display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap" }}>
              {/* Back — black gradient */}
              <button onClick={handleBack}
                style={{ padding:"9px 22px", background:"linear-gradient(135deg,#1e293b,#0f172a)", border:"none", borderRadius:9, color:"#fff", fontSize:"0.85rem", fontWeight:700, cursor:"pointer", minWidth:"100px", boxShadow:"0 3px 10px rgba(15,23,42,0.3)", transition:"all 0.18s", letterSpacing:"0.02em" }}
                onMouseEnter={e => { e.currentTarget.style.background="linear-gradient(135deg,#334155,#1e293b)"; e.currentTarget.style.transform="translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="linear-gradient(135deg,#1e293b,#0f172a)"; e.currentTarget.style.transform="translateY(0)"; }}>
                ← Back
              </button>
              {/* Upload on Portal — blue gradient */}
              <button style={{ padding:"9px 22px", background:"linear-gradient(135deg,#4f46e5,#3730a3)", border:"none", borderRadius:9, color:"#fff", fontSize:"0.85rem", fontWeight:700, cursor:"pointer", minWidth:"140px", boxShadow:"0 3px 10px rgba(79,70,229,0.35)", transition:"all 0.18s", letterSpacing:"0.02em" }}
                onMouseEnter={e => { e.currentTarget.style.background="linear-gradient(135deg,#6366f1,#4f46e5)"; e.currentTarget.style.transform="translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="linear-gradient(135deg,#4f46e5,#3730a3)"; e.currentTarget.style.transform="translateY(0)"; }}>
                ↑ Upload on Portal
              </button>
              {/* Excel — blue gradient */}
              <button style={{ padding:"9px 18px", background:"linear-gradient(135deg,#4f46e5,#3730a3)", border:"none", borderRadius:9, color:"#fff", fontSize:"0.85rem", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, boxShadow:"0 3px 10px rgba(79,70,229,0.35)", transition:"all 0.18s" }}
                onClick={() => alert("Downloading Excel 📊 ...")}
                onMouseEnter={e => { e.currentTarget.style.background="linear-gradient(135deg,#6366f1,#4f46e5)"; e.currentTarget.style.transform="translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="linear-gradient(135deg,#4f46e5,#3730a3)"; e.currentTarget.style.transform="translateY(0)"; }}>
                Excel 📊
              </button>
              {/* PDF — blue gradient */}
              <button style={{ padding:"9px 18px", background:"linear-gradient(135deg,#4f46e5,#3730a3)", border:"none", borderRadius:9, color:"#fff", fontSize:"0.85rem", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, boxShadow:"0 3px 10px rgba(79,70,229,0.35)", transition:"all 0.18s" }}
                onClick={() => alert("Downloading PDF 📄 ...")}
                onMouseEnter={e => { e.currentTarget.style.background="linear-gradient(135deg,#6366f1,#4f46e5)"; e.currentTarget.style.transform="translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="linear-gradient(135deg,#4f46e5,#3730a3)"; e.currentTarget.style.transform="translateY(0)"; }}>
                PDF 📄
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const renderContent = () => {
  if (activeMenu !== "Dashboard") {
    if (activeMenu === "Client Detail") {

     const inputStyle = {
  width: "100%",
  padding: "2px 7px",
  marginTop: "2px",
  borderRadius: "7px",
  border: "1px solid #dbeafe",
  fontSize: "0.875rem",
  background: "#ffffff",
  color: "#1e293b",
  outline: "none",
  height: "34px",
  minHeight: "26px",
  lineHeight: "0",
  transition: "all 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "0 1px 4px rgba(79,70,229,0.04)",
};

const labelStyle = {
  fontSize: "0.85rem",
  fontWeight: "800",
  color: "#334155",
  letterSpacing: "0px",
  lineHeight: "1",
  display: "block",
  marginBottom: "1px",
  paddingBottom: "0px",
};
const fieldStyle = {
  marginBottom: "-4px",
  paddingBottom: "-1px",
  display: "flex",
  flexDirection: "column",
  gap: "-4px",
};
const cardStyle = {
  background: "rgba(255,255,255,0.97)",
  padding: "6px 8px",
  borderRadius: "16px",
  border: "1px solid #dbeafe",
  boxShadow: "0 6px 24px rgba(79,70,229,0.07)",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
};

const focusInput = (e) => {
  e.target.style.borderColor = "#6D4AFF";
  e.target.style.boxShadow = "0 0 0 3px rgba(109,74,255,0.10)";
  e.target.style.background = "#f8fbff";
};

const blurInput = (e) => {
  e.target.style.borderColor = "#ede9fe";
  e.target.style.boxShadow = "0 1px 4px rgba(79,70,229,0.04)";
  e.target.style.background = "#ffffff";
};

const cardEnter = (e) => {
  e.currentTarget.style.boxShadow = "0 16px 32px rgba(79,70,229,0.13)";
  e.currentTarget.style.borderColor = "#c4b5fd";
};

const cardLeave = (e) => {
  e.currentTarget.style.boxShadow = "0 6px 24px rgba(79,70,229,0.07)";
  e.currentTarget.style.borderColor = "#ede9fe";
};

return (
  <div
    style={{
      padding: "10px",
      minHeight: "100vh",
      background: "linear-gradient(135deg,#f0f7ff 0%,#f8fbff 40%,#eef6ff 100%)",
    }}
  >
    <div>
      {/* Header */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
          padding: "8px 16px",
          background: "linear-gradient(135deg,#f8fbff 0%,#edf5ff 45%,#e0eeff 100%)",
          borderRadius: "16px",
          border: "1px solid #cfe3ff",
          boxShadow: "0 8px 24px rgba(79,70,229,0.09), inset 0 1px 0 rgba(255,255,255,0.7)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "120px",
            height: "100%",
            background: "linear-gradient(to left,rgba(109,74,255,0.05),transparent)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 2 }}>
          <h3
            style={{
              margin: 0,
              fontSize: "1.28rem",
              fontWeight: "800",
              color: "#0f172a",
              letterSpacing: "-0.4px",
            }}
          >
            📁 Client Details
          </h3>
          <p style={{ margin: "1px 0 0", fontSize: "0.84rem", color: "#6D4AFF", fontWeight: "600" }}>
            Manage and update all client information
          </p>
        </div>

        <button
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 14px 28px rgba(79,70,229,0.30)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 6px 18px rgba(79,70,229,0.22)";
          }}
          style={{
            position: "relative",
            zIndex: 2,
            background: "linear-gradient(135deg,#4f46e5,#6D4AFF)",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: "10px",
            fontSize: "0.82rem",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.25s ease",
            boxShadow: "0 6px 18px rgba(79,70,229,0.22)",
          }}
        >
          ⬇ Get Data From GSTN
        </button>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>

        {/* Personal Details */}
        <div style={cardStyle} onMouseEnter={cardEnter} onMouseLeave={cardLeave}>
          <h4
              style={{
                margin: "0 0 4px",
                fontSize: "1.05rem",
                fontWeight: "800",
                color: "#4f46e5",
                borderBottom: "1.5px solid #eff6ff",
                paddingBottom: "4px",
              }}
            >
            Personal Details
          </h4>

          {[
            ["Name *", "name"],
            ["Address", "address"],
            ["Place", "place"],
            ["PIN", "pin"],
            ["Mobile Number", "mobile"],
            ["Email Id", "email"],
            ["Phone Number", "phone"],
          ].map(([label, name]) => (
            <div key={name} style={fieldStyle}>
              <label style={labelStyle}>{label}</label>
              <input
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
                style={inputStyle}
                onFocus={focusInput}
                onBlur={blurInput}
              />
            </div>
          ))}

          <div style={fieldStyle}>
            <label style={labelStyle}>State *</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              style={inputStyle}
            >
              <option>Uttar Pradesh</option>
            </select>
          </div>
        </div>

        {/* Business Details */}
        <div style={cardStyle} onMouseEnter={cardEnter} onMouseLeave={cardLeave}>
          <h4
            style={{
              margin: "0 0 4px",
              fontSize: "1.05rem",
              fontWeight: "800",
              color: "#4f46e5",
              borderBottom: "1.5px solid #eff6ff",
              paddingBottom: "4px",
            }}
          >
            Business Details
          </h4>

          {[
            ["Trade Name", "tradeName"],
            ["GSTIN *", "gstin"],
            ["Registration Date *", "regDate"],
            ["TAN", "tan"],
            ["PAN", "pan"],
            ["CIN Number", "cin"],
          ].map(([label, name]) => (
            <div key={name} style={fieldStyle}>
              <label style={labelStyle}>{label}</label>
              <input
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
                style={inputStyle}
                onFocus={focusInput}
                onBlur={blurInput}
              />
            </div>
          ))}

          <div style={fieldStyle}>
            <label style={labelStyle}>Business Type</label>
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleInputChange}
              style={inputStyle}
            >
              <option>Proprietorship</option>
              <option>Partnership</option>
              <option>Private Limited</option>
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              style={inputStyle}
            >
              <option>Select</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        {/* Other Details */}
        <div style={cardStyle} onMouseEnter={cardEnter} onMouseLeave={cardLeave}>
          <h4
            style={{
              margin: "0 0 4px",
              fontSize: "1.05rem",
              fontWeight: "800",
              color: "#4f46e5",
              borderBottom: "1.5px solid #eff6ff",
              paddingBottom: "4px",
            }}
          >
            Other Details
          </h4>

          {[
            ["File No", "fileNo"],
            ["Responsible Person", "responsiblePerson"],
            ["Designation", "designation"],
            ["Alternate Mobile", "alternateMobile"],
            ["GST User ID *", "gstUserId"],
            ["LUT Number", "lutNumber"],
          ].map(([label, name]) => (
            <div key={name} style={fieldStyle}>
              <label style={labelStyle}>{label}</label>
              <input
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
                style={inputStyle}
                onFocus={focusInput}
                onBlur={blurInput}
              />
            </div>
          ))}

          <div style={fieldStyle}>
            <label style={labelStyle}>Tax Payer Type *</label>
            <select
              name="taxPayerType"
              value={formData.taxPayerType}
              onChange={handleInputChange}
              style={inputStyle}
            >
              <option>Normal</option>
              <option>Composition</option>
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Upload Type *</label>
            <select
              name="uploadType"
              value={formData.uploadType}
              onChange={handleInputChange}
              style={inputStyle}
            >
              <option>GST</option>
            </select>
          </div>
        </div>
      </div>

      {/* Update Button */}
      <div style={{ textAlign: "right", marginTop: "8px" }}>
        <button
          onClick={handleUpdate}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 14px 28px rgba(79,70,229,0.30)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(79,70,229,0.20)";
          }}
          style={{
            background: "linear-gradient(135deg,#4f46e5 0%,#6D4AFF 55%,#818cf8 100%)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.15)",
            padding: "9px 32px",
            borderRadius: "11px",
            fontSize: "0.88rem",
            fontWeight: "800",
            letterSpacing: "0.2px",
            cursor: "pointer",
            transition: "all 0.25s ease",
            boxShadow: "0 8px 20px rgba(79,70,229,0.20)",
          }}
        >
          Update
        </button>
      </div>
    </div>
  </div>
);
}
      const regularGstrTabs = ["gstr-1", "gstr-1A", "gstr 3b", "itc-04", "tds/tcs", "reports","download center"];
    if (regularGstrTabs.includes(activeMenu)) {
  const displayTitle =
    activeMenu === "tds/tcs"
      ? "TDS/TCS"
      : activeMenu === "download center"
      ? "Download Center"
      : activeMenu.toUpperCase().replace("GSTR ", "GSTR-").replace(" 3B", " 3B");

  return <GSTRLayout title={displayTitle} />;
}

 
      if (activeMenu === "Annual Return") {
        return (
          <div style={{ padding: "20px", background: "#f8fafc" }}>
            <div style={{ background: "#ffffff", borderRadius: "12px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", gap: "12px", marginBottom: "32px", borderBottom: "2px solid #e2e8f0" }}>
                {["GSTR-9", "GSTR-9C"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveAnnualSubTab(tab)}
                    style={{
                      padding: "12px 28px",
                      background: activeAnnualSubTab === tab ? "#4f46e5" : "transparent",
                      color: activeAnnualSubTab === tab ? "white" : "#475569",
                      border: "none",
                      borderRadius: "10px 10px 0 0",
                      fontSize: "1.1rem",
                      fontWeight: activeAnnualSubTab === tab ? "600" : "500",
                      cursor: "pointer",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <GSTRLayout title={activeAnnualSubTab} />
            </div>
          </div>
        );
      }
      return (
        <div style={{ padding: "80px 40px", textAlign: "center", color: "#64748b" }}>
          <h2 style={{ fontSize: "2rem", color: "#4f46e5", marginBottom: "20px" }}>{activeMenu.toUpperCase().replace(/-/g, " ")}</h2>
          <p style={{ fontSize: "1.3rem" }}>This section is under development.</p>
        </div>
      );
    }
    // ───────── DASHBOARD ─────────
   return <GSTDashboardAllPanels initialSection={initialSection} />;
  };
  return (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.4)",          // ← bahut light black (dark theme mein 0.5–0.6 bhi try kar sakte ho)
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      // backdropFilter: "blur(4px)",         // ← optional – blur hata bhi sakte ho agar bilkul clean chahiye
    }}
    onClick={onClose}
  >
    <div
      style={{
        width: "100vw",                        // ← pura width
        height: "100vh",                       // ← pura height
        background: "#ffffff",
        overflow: "hidden",
        boxShadow: "none",                     // ← shadow hata diya full-screen feel ke liye
        display: "flex",
        flexDirection: "column",
        borderRadius: 0,                       // ← zero radius → bilkul edge-to-edge
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ══ TOP HEADER ══ */}
      <div style={{
        background: "linear-gradient(135deg, #1a1f6e 0%, #12175a 50%, #0e1347 100%)",
        padding: "0",
        position: "relative",
        zIndex: 2,
        boxShadow: "0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)",
        overflow: "hidden",
      }}>
        {/* Subtle texture overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(ellipse at 60% 50%, rgba(79,70,229,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* ── ROW 1: Back | Company Center | GST Portal + Active ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 29px 1px",
          position: "relative", zIndex: 1,
          minHeight: "52px",
        }}>

          {/* LEFT: Back button — slightly lowered */}
          <div style={{ display: "flex", alignItems: "center", flexShrink: 0, marginTop: "10px" }}>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1.5px solid rgba(255,255,255,0.22)",
                color: "#ffffff",
                padding: "7px 16px",
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                transition: "all 0.18s ease",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.16)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
              }}
            >
              ← Back to Clients
            </button>
          </div>

          {/* CENTER: Icon + Company Name + Verified badge */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            padding: "0 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.5rem", lineHeight: 1, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>🏛️</span>
              <span style={{
                fontSize: "1.28rem",
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
                textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "460px",
              }}>
                {dynamicClient.company}
              </span>
              {/* Blue verified badge */}
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "22px", height: "22px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                boxShadow: "0 2px 8px rgba(59,130,246,0.5)",
                flexShrink: 0,
                fontSize: "0.68rem",
                color: "#ffffff",
                fontWeight: 900,
              }}>✓</span>
            </div>
          </div>

          {/* RIGHT: GST Portal + Active — slightly lowered */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, marginTop: "10px" }}>

            {/* GST Portal — blue background */}
            <a
              href="https://services.gst.gov.in/services/login"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.78rem",
                padding: "7px 14px",
                borderRadius: "8px",
                border: "1.5px solid rgba(99,132,255,0.55)",
                background: "rgba(79,70,229,0.55)",
                transition: "all 0.18s ease",
                letterSpacing: "0.01em",
                boxShadow: "0 2px 10px rgba(79,70,229,0.3)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(79,70,229,0.8)";
                e.currentTarget.style.borderColor = "rgba(99,132,255,0.8)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(79,70,229,0.55)";
                e.currentTarget.style.borderColor = "rgba(99,132,255,0.55)";
              }}
            >
              <span style={{ fontSize: "0.95rem" }}>💰</span>
              <span>GST Portal</span>
              <span style={{ fontSize: "0.85rem", opacity: 0.85 }}>↗</span>
            </a>

            {/* Active pill */}
            <div style={{
              background: "rgba(34,197,94,0.14)",
              border: "1.5px solid rgba(74,222,128,0.4)",
              color: "#4ade80",
              padding: "7px 16px",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "7px",
              letterSpacing: "0.06em",
            }}>
              <span style={{
                width: "8px", height: "8px",
                borderRadius: "50%",
                background: "#4ade80",
                display: "inline-block",
                boxShadow: "0 0 6px #4ade80",
                animation: "clientBlink 1.2s infinite",
              }} />
              ACTIVE
              <style>{`
                @keyframes clientBlink {
                  0%,100% { opacity:1; }
                  50% { opacity:0.25; }
                }
              `}</style>
            </div>

          </div>
        </div>

        {/* ── ROW 2: REG NO | GSTIN | REG DATE centered ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0",
          padding: "2px 22px 10px",
          position: "relative", zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.45)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>REG NO:</span>
            <span style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.88)", fontWeight: 700 }}>{dynamicClient.registrationDate}</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.18)", margin: "0 14px", fontSize: "0.9rem" }}>|</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.45)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>GSTIN:</span>
            <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "#facc15", letterSpacing: "0.05em" }}>{dynamicClient.gstin}</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.18)", margin: "0 14px", fontSize: "0.9rem" }}>|</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.45)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>REG DATE:</span>
            <span style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.88)", fontWeight: 700 }}>{dynamicClient.registrationDate}</span>
          </div>
        </div>
      </div>

      {/* ══ TAB BAR ══ */}
      <div style={{
        background: "linear-gradient(180deg, #1e2a7a 0%, #172068 100%)",
        padding: "4px 26px",
        borderBottom: "2px solid rgba(79,70,229,0.35)",
        boxShadow: "0 6px 18px rgba(30,42,122,0.55), 0 2px 6px rgba(79,70,229,0.3)",
        marginTop: "0",
      }}>
        <div style={{
          display: "flex",
          gap: "16px",
          padding: "10px 0",
          flexWrap: "nowrap",
          overflowX: "auto",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {(() => {
            const TAB_META = {
              "Dashboard":       { Icon: HiHome,         label: "DASHBOARD" },
              "Client Detail":   { Icon: HiUserGroup,    label: "CLIENT DETAIL" },
              "gstr-1":          { Icon: HiDocumentText, label: "GSTR 1" },
              "gstr-1A":         { Icon: HiDocumentText, label: "GSTR 1A" },
              "gstr 3b":         { Icon: HiDocumentText, label: "GSTR 3B" },
              "itc-04":          { Icon: HiDocumentText, label: "ITC 04" },
              "tds/tcs":         { Icon: HiDocumentAdd,  label: "TDS/TCS" },
              "reports":         { Icon: HiChartBar,     label: "REPORTS" },
              "download center": { Icon: HiDownload,     label: "DOWNLOAD CENTER" },
            };
            return menuItems.map((item) => {
              const isActive = activeMenu === item;
              const meta = TAB_META[item] || { Icon: HiDocumentText, label: item.toUpperCase().replace(/-/g, " ") };
              const { Icon, label } = meta;
              return (
                <button
                  key={item}
                  onClick={() => {
                    setActiveMenu(item);
                    setActiveSubTab("Manually");
                    if (item === "Annual Return") setActiveAnnualSubTab("GSTR-9");
                  }}
                  style={{
                    padding: "9px 18px",
                    fontSize: "0.71rem",
                    fontWeight: 800,
                    background: isActive
                      ? "linear-gradient(135deg, #4f46e5, #3730a3)"
                      : "#ffffff",
                    color: isActive ? "#ffffff" : "#1e3a8a",
                    border: isActive
                      ? "1.5px solid rgba(255,255,255,0.25)"
                      : "1.5px solid rgba(255,255,255,0.15)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 0.15s",
                    letterSpacing: "0.05em",
                    boxShadow: isActive
                      ? "0 4px 14px rgba(79,70,229,0.5), inset 0 1px 0 rgba(255,255,255,0.2)"
                      : "0 1px 3px rgba(0,0,0,0.12)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = "#dbeafe";
                      e.currentTarget.style.color = "#1e3a8a";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.color = "#1e3a8a";
                    }
                  }}
                >
                  <Icon style={{
                    fontSize: "0.92rem",
                    color: isActive ? "#ffffff" : "#3b82f6",
                    flexShrink: 0,
                  }} />
                  <span>{label}</span>
                </button>
              );
            });
          })()}
        </div>
      </div>

      {/* Content – pura bacha hua area */}
      <div
        ref={scrollContainerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          background: "#f9fafb",
          padding: "20px 24px",
        }}
      >
        {renderContent()}
      </div>
    </div>
  </div>
);
};


// here is the part where you make change



  const PendingVouchersModal = () => (
    <div style={modalOverlayStyle} onClick={() => setShowPendingVouchersModal(false)}>
      <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, color: "#4f46e5" }}>Pending Vouchers ({pendingVouchersData.length})</h3>
          <button onClick={() => setShowPendingVouchersModal(false)} style={{ background: "none", border: "none", fontSize: "1.8rem", cursor: "pointer" }}>
            <HiX />
          </button>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f0f0ff" }}>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>Name</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>GSTIN</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>PAN</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>Mobile</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>Pending Date</th>
              </tr>
            </thead>
            <tbody>
              {pendingVouchersData.map((voucher) => (
                <tr key={voucher.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "14px" }}>{voucher.clientName}</td>
                  <td style={{ padding: "14px" }}>{voucher.gstin}</td>
                  <td style={{ padding: "14px" }}>{voucher.pan}</td>
                  <td style={{ padding: "14px" }}>{voucher.mobile}</td>
                  <td style={{ padding: "14px" }}>{voucher.pendingSince}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ReturnsDueModal = () => (
    <div style={modalOverlayStyle} onClick={() => setShowReturnsDueModal(false)}>
      <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, color: "#4f46e5" }}>Due This Week ({returnsDueData.length})</h3>
          <button onClick={() => setShowReturnsDueModal(false)} style={{ background: "none", border: "none", fontSize: "1.8rem", cursor: "pointer" }}>
            <HiX />
          </button>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f0f0ff" }}>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>Name</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>GSTIN</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>GST Type</th>
              </tr>
            </thead>
            <tbody>
              {returnsDueData.map((ret) => (
                <tr key={ret.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "14px" }}>{ret.clientName}</td>
                  <td style={{ padding: "14px" }}>{ret.gstin}</td>
                  <td style={{ padding: "14px" }}>{ret.returnType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ITCAvailableModal = () => (
    <div style={modalOverlayStyle} onClick={() => setShowITCAvailableModal(false)}>
      <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, color: "#4f46e5" }}>ITC Available</h3>
          <button onClick={() => setShowITCAvailableModal(false)} style={{ background: "none", border: "none", fontSize: "1.8rem", cursor: "pointer" }}>
            <HiX />
          </button>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f0f0ff" }}>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>Name</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>Company</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>GSTIN</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>PAN</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>Mobile</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {itcAvailableData.map((itc) => (
                <tr key={itc.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "14px" }}>{itc.clientName}</td>
                  <td style={{ padding: "14px" }}>{itc.company}</td>
                  <td style={{ padding: "14px" }}>{itc.gstin}</td>
                  <td style={{ padding: "14px" }}>{itc.pan}</td>
                  <td style={{ padding: "14px" }}>{itc.mobile}</td>
                  <td style={{ padding: "14px" }}>{itc.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const [clientViewMode, setClientViewMode] = useState("all");
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddClient, setShowAddClient] = useState(false);

  // ── Scroll Lock: jab client dashboard modal open ho, body ka scroll hide karo ──
  useEffect(() => {
    const isModalOpen = selectedClient && selectedClient.showFullDashboard;
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    // cleanup: agar component unmount ho
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedClient]);

  const filteredClients = allClients.filter((c) => {
    if (clientViewMode === "active") return c.status === "active";
    if (clientViewMode === "inactive") return c.status === "inactive";
    return true;
  });

  const activateClient = (id) => {
    setAllClients(prev => prev.map((c) => (c.id === id ? { ...c, status: "active" } : c)));
  };

  const deactivateClient = (id) => {
    setAllClients(prev => prev.map((c) => (c.id === id ? { ...c, status: "inactive" } : c)));
  };

  const deleteClient = (id) => {
    setAllClients(prev => prev.filter((c) => c.id !== id));
  };


  const ClientDetailCard = () => (
    <div style={modalOverlayStyle} onClick={() => setSelectedClient(null)}>
      <div style={{ ...modalCardStyle, width: "500px" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3>Client Details</h3>
          <button onClick={() => setSelectedClient(null)} style={{ background: "none", border: "none", fontSize: "1.8rem", cursor: "pointer" }}>
            <HiX />
          </button>
        </div>
        <div style={{ marginBottom: "15px" }}><strong>Name:</strong> {selectedClient.name}</div>
        <div style={{ marginBottom: "15px" }}><strong>Company:</strong> {selectedClient.company}</div>
        <div style={{ marginBottom: "15px" }}><strong>GSTIN:</strong> {selectedClient.gstin}</div>
        <div style={{ marginBottom: "15px" }}><strong>PAN:</strong> {selectedClient.pan}</div>
        <div style={{ marginBottom: "20px" }}><strong>Mobile:</strong> {selectedClient.mobile}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          <button style={{ background: "#6D4AFF" }}>
            <HiPencil style={{ marginRight: "8px" }} /> Edit
          </button>
          {selectedClient.status === "active" ? (
            <button onClick={() => deactivateClient(selectedClient.id)} style={{ background: "#f59e0b" }}>
              Deactivate
            </button>
          ) : (
            <button onClick={() => activateClient(selectedClient.id)} style={{ background: "#22c55e" }}>
              <HiCheckCircle style={{ marginRight: "8px" }} /> Activate
            </button>
          )}
          <button onClick={() => deleteClient(selectedClient.id)} style={{ background: "#ef4444" }}>
            <HiTrash style={{ marginRight: "8px" }} /> Delete
          </button>
          <button onClick={() => setSelectedClient(null)} style={{ background: "#ccc" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
const ClientsPage = ({
  allClients,
  clientViewMode,
  setClientViewMode,
  selectedClient,
  setSelectedClient,
  activateClient,
  deactivateClient,
  deleteClient,
  setConfirmModal,
  addClient,
  openAddClientModal = () => {},
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const locationHook = useLocation();

  // Auto-open client dashboard if navigated with state
  React.useEffect(() => {
    const state = locationHook.state;
    if (state && state.openClientDashboard) {
      const section = state.section || null;
      const firstActive = allClients.find(c => c.status === "active");
      if (firstActive) {
        setSelectedClient({ ...firstActive, showFullDashboard: true, initialSection: section });
      }
      window.history.replaceState(null, "");
    }
    // Dashboard cards se filter apply karo
    if (state && state.filter) {
      if (state.filter === "active") setClientViewMode("active");
      else if (state.filter === "inactive") setClientViewMode("inactive");
      else setClientViewMode("all");
      window.history.replaceState(null, "");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredClients = allClients
    .filter((c) => {
      if (clientViewMode === "active" && c.status !== "active") return false;
      if (clientViewMode === "inactive" && c.status !== "inactive") return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase().trim();
      return (
        (c.name || "").toLowerCase().includes(term) ||
        (c.company || "").toLowerCase().includes(term) ||
        (c.gstin || "").toLowerCase().includes(term)
      );
    })
    .sort((a, b) => (b.id || 0) - (a.id || 0)); // newest client at top

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filter/search changes
  React.useEffect(() => { setCurrentPage(1); }, [searchTerm, clientViewMode]);

  const activeCount = allClients.filter(c => c.status === "active").length;
  const inactiveCount = allClients.filter(c => c.status === "inactive").length;

  return (
    <>
    <div style={{ padding: "10px 15px", background: "#f1f5f9", minHeight: "100%" }}>

      {/* ── Page Header ─────────────────────────────────────── */}
     <div
  style={{
    marginBottom: "16px",
    padding: "16px 18px",
    borderRadius: "18px",
    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    border: "1px solid #e8edf5",
    boxShadow: "0 6px 20px rgba(15,23,42,0.06)",
    display: "grid",
    gridTemplateColumns: "1.2fr minmax(260px, 400px) auto",
    alignItems: "center",
    gap: "14px",
  }}
>
  <div style={{ minWidth: 0 }}>
    <h1
      style={{
        fontSize: "1.5rem",
        fontWeight: 900,
        color: "#0f172a",
        margin: 0,
        letterSpacing: "-0.02em",
      }}
    >
      All Clients
    </h1>
    <p
      style={{
        color: "#64748b",
        fontSize: "0.88rem",
        marginTop: "5px",
        marginBottom: 0,
        lineHeight: 1.4,
      }}
    >
      Manage and monitor all your clients in one place
    </p>
  </div>

  <div
    style={{
      position: "relative",
      width: "100%",
    }}
  >
    <HiSearch
      style={{
        position: "absolute",
        left: "14px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#94a3b8",
        fontSize: "0.95rem",
        zIndex: 2,
      }}
    />

    <input
      type="text"
      placeholder="Search by name, company or GSTIN..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      style={{
        width: "100%",
        height: "44px",
        margin:"7px",
        paddingLeft: "38px",
        paddingRight: "14px",
        borderRadius: "14px",
        border: "1px solid #dbeafe",
        fontSize: "0.84rem",
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        boxShadow:
          "0 10px 24px rgba(148,163,184,0.12), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -2px 0 rgba(0,0,0,0.03)",
        outline: "none",
        transition: "all 0.2s ease",
        boxSizing: "border-box",
        color: "#0f172a",
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "#4f46e5";
        e.target.style.boxShadow =
          "0 12px 26px rgba(79,70,229,0.12), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -2px 0 rgba(0,0,0,0.03)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "#ede9fe";
        e.target.style.boxShadow =
          "0 10px 24px rgba(148,163,184,0.12), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -2px 0 rgba(0,0,0,0.03)";
      }}
    />
  </div>

  <div>
    <button
      onClick={() => openAddClientModal("clients")}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "11px 18px",
        background: "linear-gradient(135deg, #3730a3, #4f46e5)",
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        fontWeight: 800,
        fontSize: "0.86rem",
        cursor: "pointer",
        boxShadow: "0 8px 18px rgba(79,70,229,0.28)",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 12px 24px rgba(79,70,229,0.34)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow = "0 8px 18px rgba(79,70,229,0.28)";
      }}
    >
      <HiPlus style={{ fontSize: "1rem" }} />
      Add Client
    </button>
  </div>

  {/* Right DotMatrix removed */}

  <style>{`
    @keyframes activeDotBlink {
      0% { opacity: 1; }
      50% { opacity: 0.25; }
      100% { opacity: 1; }
    }
    @keyframes inactiveBlink {
      0% { opacity: 1; }
      50% { opacity: 0.35; }
      100% { opacity: 1; }
    }

    @media (max-width: 1100px) {
      .clients-topbar {
        grid-template-columns: 1fr;
      }
    }
  `}</style>
</div>
      {/* ── Search Bar (top) ────────────────────────────────── */}
     
      {/* ── Table Card ─────────────────────────────────────────── */}
      <div style={{
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{
                background: "linear-gradient(180deg, #ffffff 0%, #eef2ff 100%)",
                boxShadow: "0 4px 0 #c7d2fe, 0 2px 8px rgba(79,70,229,0.10)",
              }}>
                {[
                  { label: "NAME", center: false },
                  { label: "COMPANY", center: false },
                  { label: "GSTIN", center: true },
                  { label: "STATUS", center: true },
                  { label: "ACTIONS", center: true },
                  { label: "SELECT", center: true },
                ].map((col, i) => (
                  <th key={i} style={{
                    padding: "14px 16px",
                    textAlign: col.center ? "center" : "left",
                    color: "#3730a3",
                    fontWeight: 800,
                    fontSize: "0.78rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    background: "transparent",
                    borderBottom: "3px solid #c7d2fe",
                  }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedClients.map((client, index) => {
                const isActive = client.status === "active";
                const isEven = index % 2 === 0;
                return (
                  <tr
                    key={client.id}
                    style={{
                      background: isEven ? "#ffffff" : "#f8fafc",
                      transition: "background 0.15s ease",
                      cursor: "default",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f3f0ff"}
                    onMouseLeave={e => e.currentTarget.style.background = isEven ? "#ffffff" : "#f8fafc"}
                  >
                    {/* Name */}
                    <td style={{ padding: "13px 16px", borderBottom: "1px solid #f1f5f9" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "32px", height: "32px", borderRadius: "8px",
                          background: "linear-gradient(135deg,#dbeafe,#bfdbfe)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, fontSize: "0.85rem", color: "#3730a3",
                          flexShrink: 0,
                        }}>
                          {(client.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: "#3730a3", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block", verticalAlign: "middle" }} title={client.name}>{client.name}</span>
                      </div>
                    </td>

                    {/* Company */}
                    <td style={{ padding: "13px 16px", borderBottom: "1px solid #f1f5f9", color: "#1e40af", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={client.company}>
                      {client.company}
                    </td>

                    {/* GSTIN */}
                    <td style={{ padding: "13px 16px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>
                      <code style={{
                        background: "#f1f5f9", padding: "4px 10px",
                        borderRadius: "6px", fontSize: "0.88rem",
                        color: "#1e40af", fontFamily: "monospace", fontWeight: 600,
                      }}>
                        {client.gstin}
                      </code>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "13px 16px", textAlign: "center", borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        padding: "5px 13px",
                        borderRadius: "999px",
                        fontSize: "0.77rem",
                        fontWeight: 700,
                        background: isActive ? "#dcfce7" : "#f1f5f9",
                        color: isActive ? "#15803d" : "#64748b",
                        border: isActive ? "1.5px solid #86efac" : "1.5px solid #e2e8f0",
                        letterSpacing: "0.02em",
                      }}>
                        {isActive ? (
                          <span className="active-blink-dot" />
                        ) : (
                          <span style={{
                            width: "8px", height: "8px", borderRadius: "50%",
                            background: "#94a3b8",
                            display: "inline-block",
                          }} />
                        )}
                        {isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "13px 16px", textAlign: "center", borderBottom: "1px solid #f1f5f9" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClient({ ...client, showFullDashboard: false });
                        }}
                        style={{
                          background: "none",
                          border: "1.5px solid #4f46e5",
                          color: "#4f46e5",
                          padding: "6px 14px",
                          borderRadius: "8px",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.18s ease",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#4f46e5"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#4f46e5"; }}
                      >
                        View Details →
                      </button>
                    </td>

                    {/* Select */}
                    <td style={{ padding: "13px 16px", textAlign: "center", borderBottom: "1px solid #f1f5f9" }}>
                      <button
                        onClick={() => setSelectedClient({ ...client, showFullDashboard: true })}
                        style={{
                          background: "linear-gradient(135deg, #4f46e5, #3730a3)",
                          color: "white",
                          padding: "6px 16px",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
                          transition: "all 0.18s ease",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(79,70,229,0.4)"; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(79,70,229,0.3)"; }}
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={6} style={{
                    padding: "60px 20px", textAlign: "center",
                    color: "#94a3b8", fontSize: "1rem",
                  }}>
                    <div style={{ marginBottom: "8px", fontSize: "2.2rem" }}>🔍</div>
                    {searchTerm.trim()
                      ? <>No clients found matching <strong style={{ color: "#475569" }}>"{searchTerm}"</strong></>
                      : "No clients in this category"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ──────────────────────────────────────── */}
        {filteredClients.length > 0 && (
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 20px",
            borderTop: "1px solid #f1f5f9",
            background: "#fafbfc",
          }}>
            <span style={{ fontSize: "0.84rem", color: "#64748b" }}>
              Showing{" "}
              <strong style={{ color: "#0f172a" }}>
                {Math.min((currentPage - 1) * itemsPerPage + 1, filteredClients.length)}
              </strong>
              {" "}to{" "}
              <strong style={{ color: "#0f172a" }}>
                {Math.min(currentPage * itemsPerPage, filteredClients.length)}
              </strong>
              {" "}of{" "}
              <strong style={{ color: "#0f172a" }}>{filteredClients.length}</strong> clients
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  width: "34px", height: "34px", borderRadius: "8px",
                  border: "1.5px solid #e2e8f0",
                  background: currentPage === 1 ? "#f8fafc" : "#fff",
                  color: currentPage === 1 ? "#cbd5e1" : "#475569",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontSize: "1rem", fontWeight: 700,
                  transition: "all 0.15s",
                }}
              >‹</button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    width: "34px", height: "34px", borderRadius: "8px",
                    border: page === currentPage ? "none" : "1.5px solid #e2e8f0",
                    background: page === currentPage
                      ? "linear-gradient(135deg, #4f46e5, #3730a3)"
                      : "#fff",
                    color: page === currentPage ? "#fff" : "#475569",
                    fontWeight: page === currentPage ? 700 : 500,
                    cursor: "pointer",
                    fontSize: "0.86rem",
                    boxShadow: page === currentPage ? "0 2px 8px rgba(79,70,229,0.3)" : "none",
                    transition: "all 0.15s",
                  }}
                >{page}</button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  width: "34px", height: "34px", borderRadius: "8px",
                  border: "1.5px solid #e2e8f0",
                  background: currentPage === totalPages ? "#f8fafc" : "#fff",
                  color: currentPage === totalPages ? "#cbd5e1" : "#475569",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  fontSize: "1rem", fontWeight: 700,
                  transition: "all 0.15s",
                }}
              >›</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Premium View Details Modal ─────────────────────── */}
        {selectedClient && !selectedClient.showFullDashboard && (
          <div
            style={{
              position: "fixed", inset: 0,
              background: "rgba(15,23,42,0.55)",
              backdropFilter: "blur(6px)",
              display: "flex", justifyContent: "center", alignItems: "center",
              zIndex: 9999,
              animation: "fadeIn 0.2s ease",
            }}
            onClick={() => setSelectedClient(null)}
          >
            <div
              style={{
                background: "#fff",
                width: "460px",
                borderRadius: "18px",
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
                animation: "scaleIn 0.2s ease",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Nav Header - compact, light grey with sky blue shadow */}
              <div style={{
                background: "#f0f6ff",
                padding: "12px 18px 10px",
                position: "relative",
                boxShadow: "0 3px 12px rgba(56,189,248,0.18)",
                borderBottom: "1px solid #e0ecff",
              }}>
                <button
                  onClick={() => setSelectedClient(null)}
                  style={{
                    position: "absolute", top: "10px", right: "12px",
                    background: "rgba(79,70,229,0.08)",
                    border: "none", borderRadius: "6px",
                    color: "#64748b", width: "24px", height: "24px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", fontSize: "0.8rem",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(79,70,229,0.15)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(79,70,229,0.08)"}
                >
                  ✕
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "10px",
                    background: "linear-gradient(135deg,#4f46e5,#6D4AFF)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.2rem", fontWeight: 800, color: "#fff",
                    boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
                    flexShrink: 0,
                  }}>
                    {(selectedClient.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ color: "#0f172a", margin: 0, fontSize: "1rem", fontWeight: 800 }}>
                      {selectedClient.name}
                    </h3>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: "4px",
                      marginTop: "3px",
                      padding: "2px 8px", borderRadius: "999px",
                      background: selectedClient.status === "active"
                        ? "rgba(34,197,94,0.12)"
                        : "rgba(148,163,184,0.15)",
                      color: selectedClient.status === "active" ? "#15803d" : "#64748b",
                      fontSize: "0.72rem", fontWeight: 700,
                      border: selectedClient.status === "active" ? "1px solid #86efac" : "1px solid #e2e8f0",
                    }}>
                      {selectedClient.status === "active" ? (
                        <span className="active-blink-dot" />
                      ) : (
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#94a3b8", display: "inline-block" }} />
                      )}
                      {selectedClient.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div style={{ padding: "18px 20px" }}>

                {/* Info Cards - Company full row, Email full row, GSTIN+PAN side by side, Mobile+RegType side by side */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>

                  {/* Company - full width */}
                  <div style={{
                    gridColumn: "1 / -1",
                    background: "#f8fafc", border: "1.5px solid #e2e8f0",
                    borderRadius: "10px", padding: "10px 13px",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#c4b5fd"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
                  >
                    <div style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>🏢 Company</div>
                    <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#0f172a" }}>{selectedClient.company}</div>
                  </div>

                  {/* GSTIN */}
                  <div style={{
                    background: "#f8fafc", border: "1.5px solid #e2e8f0",
                    borderRadius: "10px", padding: "10px 13px",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#c4b5fd"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
                  >
                    <div style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>🔖 GSTIN</div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a", fontFamily: "monospace", letterSpacing: "0.06em" }}>{selectedClient.gstin || "—"}</div>
                  </div>

                  {/* PAN */}
                  <div style={{
                    background: "#f8fafc", border: "1.5px solid #e2e8f0",
                    borderRadius: "10px", padding: "10px 13px",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#c4b5fd"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
                  >
                    <div style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>🪪 PAN</div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>{selectedClient.pan || "—"}</div>
                  </div>

                  {/* Mobile */}
                  <div style={{
                    background: "#f8fafc", border: "1.5px solid #e2e8f0",
                    borderRadius: "10px", padding: "10px 13px",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#c4b5fd"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
                  >
                    <div style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>📱 Mobile</div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>{selectedClient.mobile || "—"}</div>
                  </div>

                  {/* Reg. Type */}
                  <div style={{
                    background: "#f8fafc", border: "1.5px solid #e2e8f0",
                    borderRadius: "10px", padding: "10px 13px",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#c4b5fd"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
                  >
                    <div style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>📋 Reg. Type</div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>{selectedClient.registrationType || "Regular"}</div>
                  </div>

                  {/* Email - full width */}
                  <div style={{
                    gridColumn: "1 / -1",
                    background: "#f8fafc", border: "1.5px solid #e2e8f0",
                    borderRadius: "10px", padding: "10px 13px",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#c4b5fd"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
                  >
                    <div style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>📧 Email</div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>{selectedClient.email || "\u2014"}</div>
                  </div>
                </div>

                {/* Action Buttons - equal width */}
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                  {selectedClient.status === "active" ? (
                    <button
                      onClick={() => {
                        const cId = selectedClient.id;
                        const cName = selectedClient.name;
                        setConfirmModal({
                          open: true,
                          message: `Are you sure you want to inactivate "${cName}"? This will mark them as inactive.`,
                          onConfirm: () => {
                            deactivateClient(cId);
                            setSelectedClient(prev => prev && prev.id === cId ? { ...prev, status: "inactive" } : prev);
                            toast.success(`${cName} inactivated successfully!`);
                          }
                        });
                      }}
                      style={{ width: "120px", padding: "10px 0", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "white", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", boxShadow: "0 3px 12px rgba(245,158,11,0.3)", transition: "all 0.2s" }}
                      
                      
                    >
                      Inactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const cId = selectedClient.id;
                        const cName = selectedClient.name;
                        setConfirmModal({
                          open: true,
                          message: `Are you sure you want to activate "${cName}"? This will mark them as active.`,
                          onConfirm: () => {
                            activateClient(cId);
                            setSelectedClient(prev => prev && prev.id === cId ? { ...prev, status: "active" } : prev);
                            toast.success(`${cName} activated successfully!`);
                          }
                        });
                      }}
                      style={{ width: "120px", padding: "10px 0", background: "linear-gradient(135deg,#16a34a,#15803d)", color: "white", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", boxShadow: "0 3px 12px rgba(22,163,74,0.3)", transition: "all 0.2s" }}
                      
                      
                    >
                      Activate
                    </button>
                  )}

                  <button
                    onClick={() => {
                      const cId = selectedClient.id;
                      const cName = selectedClient.name;
                      setConfirmModal({
                        open: true,
                        message: `Are you sure you want to delete "${cName}"? This action cannot be undone.`,
                        onConfirm: () => {
                          deleteClient(cId);
                          setSelectedClient(null);
                          toast.success("Client deleted successfully!");
                        }
                      });
                    }}
                    style={{ width: "120px", padding: "10px 0", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "white", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", boxShadow: "0 3px 12px rgba(239,68,68,0.3)", transition: "all 0.2s" }}
                    
                    
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full GST Dashboard Modal - rendered at parent level via selectedClient.showFullDashboard */}
        {/* This modal is now rendered in UserDashboard to avoid prop instability */}
      </div>

      {/* Add Client Modal is rendered at root level via shared state */}
    </>
  );
};


  
const DashboardHome = React.memo(({ allClients = [], addClient = () => {}, navigate = () => {}, setSelectedClient, openAddClientModal = () => {} }) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const monthShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [calendarCells, setCalendarCells] = useState([]);
  const [reminders, setReminders] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gst_cal_reminders") || "[]"); } catch { return []; }
  });
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderDay, setReminderDay] = useState(null);
  const [reminderText, setReminderText] = useState("");
  const [highRiskPopup, setHighRiskPopup] = useState(null);
  const [noticesMaximized, setNoticesMaximized] = useState(false);
  const [highRiskMaximized, setHighRiskMaximized] = useState(false);
  const [expandedNotice, setExpandedNotice] = useState(null);
  const [showPortalPanel, setShowPortalPanel] = useState(false);
  const [filingYear, setFilingYear] = useState(currentYear);
  const [filingMonth, setFilingMonth] = useState(today.getMonth());
  const [selectedGrowthPoint, setSelectedGrowthPoint] = useState(null);
  const [selectedFilingItem, setSelectedFilingItem] = useState(null);

  const [importantLinks, setImportantLinks] = useState([]);
  const [importantPortals, setImportantPortals] = useState([]);
  useEffect(() => {
    let cancelled = false;
    loadDashboardLinksOnce()
      .then(({ links, portals }) => {
        if (cancelled) return;
        setImportantLinks(links);
        setImportantPortals(portals);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  const [showAddLink, setShowAddLink] = useState(false);
  const [showAddPortal, setShowAddPortal] = useState(false);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newPortalLabel, setNewPortalLabel] = useState("");
  const [newPortalUrl, setNewPortalUrl] = useState("");

  const years = Array.from({ length: currentYear - 2016 }, (_, i) => 2017 + i);

  const gstDueDates = {
    7:  { label: "R7", color: "#8b5cf6" },
    10: { label: "IF", color: "#0891b2" },
    11: { label: "R1", color: "#3730a3" },
    13: { label: "R1", color: "#3730a3" },
    20: { label: "3B", color: "#dc2626" },
    22: { label: "3B", color: "#dc2626" },
    25: { label: "CM", color: "#d97706" },
    28: { label: "3B", color: "#dc2626" },
  };

  useEffect(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    let cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length < 42) cells.push(null);
    setCalendarCells(cells);
  }, [selectedYear, selectedMonth]);

  const saveReminder = () => {
    if (!reminderText.trim()) return;
    const newR = { day: reminderDay, month: selectedMonth, year: selectedYear, text: reminderText.trim(), id: Date.now() };
    const updated = [...reminders, newR];
    setReminders(updated);
    localStorage.setItem("gst_cal_reminders", JSON.stringify(updated));
    setReminderText("");
    setShowReminderModal(false);
    setTimeout(() => { toast.success("Reminder saved!"); }, 150);
  };

  const deleteReminder = (id) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    localStorage.setItem("gst_cal_reminders", JSON.stringify(updated));
    setTimeout(() => { toast.success("Reminder deleted!"); }, 100);
  };

  const getDayReminders = (day) => reminders.filter(r => r.day === day && r.month === selectedMonth && r.year === selectedYear);

  // DashboardHome uses shared openAddClientModal from parent — no local client state needed

  const activeCount = allClients.filter(c => c.status === "active").length;
  const inactiveCount = allClients.filter(c => c.status === "inactive").length;

  const thisMonthKey = new Date().toISOString().slice(0, 7);
  const addedThisMonth = (c) => (c.registrationDate || "").startsWith(thisMonthKey);
  const totalThisMonth = allClients.filter(addedThisMonth).length;
  const activeThisMonth = allClients.filter(c => c.status === "active" && addedThisMonth(c)).length;
  const inactiveThisMonth = allClients.filter(c => c.status === "inactive" && addedThisMonth(c)).length;

  const noticesData = [
    { id: 1, client: "National Grafics & Signage", type: "SCN", typeColor: "#ef4444", typeBg: "#fef2f2", date: "12 Apr 2026", amount: "₹45,200", borderColor: "#ef4444" },
    { id: 2, client: "Bismi Enterprises", type: "DRC-01", typeColor: "#f59e0b", typeBg: "#fffbeb", date: "05 Apr 2026", amount: "₹18,750", borderColor: "#f59e0b" },
    { id: 3, client: "The Olympic Sports", type: "Order", typeColor: "#6D4AFF", typeBg: "#f3f0ff", date: "28 Mar 2026", amount: "₹62,100", borderColor: "#6D4AFF" },
    { id: 4, client: "Taxmate Technology Pvt Ltd", type: "SCN", typeColor: "#ef4444", typeBg: "#fef2f2", date: "20 Mar 2026", amount: "₹1,23,000", borderColor: "#ef4444" },
  ];

  const highRiskData = [
    { id: 1, gstin: "Royal Spents", mismatch: "GSTR-3B vs GSTR-2A", amount: "₹1,20,520", year: "2026-27", borderColor: "#f59e0b", amountColor: "#d97706", tags: ["ITC Mismatch"], risk: "High Risk", riskColor: "#ef4444", riskBg: "#fef2f2" },
    { id: 2, gstin: "Bismi Enterprises", mismatch: "GSTR-3B vs GSTR-1", amount: "₹15,320", year: "2026-27", borderColor: "#f59e0b", amountColor: "#d97706", tags: ["GSTR-3B vs GSTR-1"], risk: "High Risk", riskColor: "#ef4444", riskBg: "#fef2f2" },
    { id: 3, gstin: "Taxmate Technology\nPvt Ltd", mismatch: "GSTR-3B vs GSTR-2B", amount: "₹3,20,850", year: "2026-27", borderColor: "#ef4444", amountColor: "#ef4444", tags: ["GSTR-3B vs GSTR-2B"], risk: "Critical", riskColor: "#dc2626", riskBg: "#fef2f2" },
    { id: 4, gstin: "Sai Traders", mismatch: "GSTR-2 vs GSTR-2B", amount: "₹85,880", year: "2026-27", borderColor: "#94a3b8", amountColor: "#d97706", tags: ["GSTR-2 vs GSTR-2B"], risk: "Medium Risk", riskColor: "#f59e0b", riskBg: "#fffbeb" },
  ];

  const filingData = [
    { label: "GSTR-1",  filed: 365, due: 156, overdue: 31 },
    { label: "GSTR-1A", filed: 280, due: 120, overdue: 18 },
    { label: "GSTR-3B", filed: 300, due: 140, overdue: 22 },
    { label: "GSTR-7",  filed: 80,  due: 30,  overdue: 5  },
    { label: "GSTR-8",  filed: 60,  due: 20,  overdue: 3  },
    { label: "GSTR-9",  filed: 200, due: 90,  overdue: null },
    { label: "GSTR-9C", filed: 180, due: 85,  overdue: null },
    { label: "CMP-08",  filed: 40,  due: 15,  overdue: 2  },
    { label: "TDS/TCS", filed: 483, due: 156, overdue: 31 },
  ];

  // Chart data for client growth
  const chartYears = [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026];
  const clientData  = [12,28,45,58,82,110,145,186,220, allClients.length || 248];
  const C = { w:400, h:140, pl:32, pr:8, pt:10, pb:24 };
  const cW = C.w-C.pl-C.pr, cH = C.h-C.pb-C.pt;
  const maxC = Math.max(...clientData)*1.15;
  const xS = cW/(chartYears.length-1);
  const barH = (v,mx) => (v/mx)*cH;
  const ly = (v,mx) => C.pt + cH - (v/mx)*cH;
  const linePath = (data, mx) => data.map((v,i) => `${i===0?"M":"L"} ${C.pl+i*xS} ${ly(v,mx)}`).join(" ");
  const areaPath = (data, mx) => `${linePath(data,mx)} L ${C.pl+(data.length-1)*xS} ${C.pt+cH} L ${C.pl} ${C.pt+cH} Z`;

  // White nav header style (no color)
  const S = {
    card: { background:"#fff", borderRadius:"14px", border:"1px solid #ddd6fe", boxShadow:"0 3px 0 #c4b5fd, 0 5px 18px rgba(79,70,229,0.08)", overflow:"hidden" },
    hdr: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 14px", borderBottom:"1px solid #ede9fe", background:"#fff" },
    hdrTitle: { display:"flex", alignItems:"center", gap:"7px", fontWeight:700, fontSize:"0.83rem", color:"#0f172a" },
    viewAll: { background:"none", border:"none", color:"#4f46e5", fontSize:"0.72rem", fontWeight:600, cursor:"pointer", padding:0 },
  };

  return (
    <div style={{ background:"#f0f2ff", padding:"16px 18px", minHeight:"100%", fontFamily:"'Inter',-apple-system,sans-serif", boxSizing:"border-box" }}>
      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        *{box-sizing:border-box}
 .topcard{
  border-radius:14px;
  border:1px solid #e5e7eb;
  overflow:hidden;
  background:#fff;
  box-shadow:0 3px 0 #e5e7eb,0 5px 18px rgba(0,0,0,.05);
  transition:border-color .15s ease, box-shadow .15s ease, transform .15s ease;
}

.topcard:hover{
  border-color:#8b5cf6; /* violet border */
  transform:translateY(-2px);
  box-shadow:
    0 3px 0 #c4b5fd,
    0 8px 20px rgba(139,92,246,.15);
}

.topcard:active{
  border-color:#8b5cf6;
  transform:translateY(1px);
  box-shadow:
    0 2px 0 #c4b5fd,
    0 4px 10px rgba(139,92,246,.10);
}
        .btn-blue{background:linear-gradient(180deg,#6D4AFF,#4f46e5);color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:700;transition:all .13s;box-shadow:0 2px 0 #3730a3;}
        .btn-blue:hover{transform:translateY(-1px);box-shadow:0 3px 0 #3730a3;}
        .btn-blue:active{transform:translateY(1px);box-shadow:0 0px 0 #3730a3;}
        .btn-white{background:#fff;color:#334155;border:1px solid #d1d9e8;border-radius:8px;cursor:pointer;font-weight:700;transition:all .13s;box-shadow:0 3px 0 #c8d2e4;}
        .btn-white:hover{transform:translateY(-1px);box-shadow:0 4px 0 #b8c4d8;}
        .btn-white:active{transform:translateY(1px);box-shadow:0 0px 0 #c8d2e4;}
        .cd:hover{background:#eef2ff!important;border-color:#c7d2fe!important;}
        .cd-today:hover{background:linear-gradient(135deg,#1e2875,#3b4cc0)!important;box-shadow:0 3px 0 #111d5e!important;}
        .li:hover{background:#f3f0ff!important;border-color:#c7d2fe!important}
        .pi:hover{background:#f0f4ff!important;border-color:#c7d2fe!important}
        .hrrow:hover{background:#faf5ff;transform:translateY(-1px);box-shadow:0 4px 12px rgba(109,74,255,0.10)!important;}
        .notrow:hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(15,23,42,0.08)!important;}
        select:focus,input:focus{outline:none;border-color:#4f46e5!important;box-shadow:0 0 0 3px rgba(79,70,229,.15)!important}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:#f1f5f9}
        ::-webkit-scrollbar-thumb{background:#c4b5fd;border-radius:99px}
      `}</style>

      {/* ══ ROW 1: TOP 6 CARDS ══ */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"11px", marginBottom:"16px" }}>

        {/* 1. Total Clients */}
        <div className="topcard" onClick={()=>navigate("/user/clients",{state:{filter:"all"}})} style={{ padding:"14px 13px", cursor:"pointer" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
           <div style={{
  width:"42px",
  height:"42px",
  borderRadius:"11px",
  background:"#eef2ff",
  display:"flex",
  alignItems:"center",
  justifyContent:"center",
  flexShrink:0
}}>
  <HiUserGroup style={{ color:"#6366f1", fontSize:"1.1rem" }} />
</div>
            <div>
              <div style={{ fontSize:"1.35rem", fontWeight:900, color:"#0f172a", lineHeight:1 }}>{allClients.length}</div>
              <div style={{ fontSize:"0.68rem", color:"#64748b", fontWeight:600, marginTop:"2px" }}>Total Clients</div>
              <div style={{ margin: 0, fontSize: "0.60rem", color: "#6D4AFF", fontWeight: 700, marginTop: "2px" }}>+{totalThisMonth} this month</div>
            </div>
          </div>
        </div>

        {/* 2. Active Clients */}
        <div className="topcard" onClick={()=>navigate("/user/clients",{state:{filter:"active"}})} style={{ padding:"14px 13px", cursor:"pointer" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{
  width:"42px",
  height:"42px",
  borderRadius:"11px",
  background:"#ecfdf5",
  display:"flex",
  alignItems:"center",
  justifyContent:"center",
  flexShrink:0
}}>
  <span style={{ fontSize:"1.15rem" }}>🟢</span>
</div>
            <div>
              <div style={{ fontSize:"1.35rem", fontWeight:900, color:"#0f172a", lineHeight:1 }}>{activeCount}</div>
              <div style={{ fontSize:"0.68rem", color:"#64748b", fontWeight:600, marginTop:"2px" }}>Active Clients</div>
              <div style={{ fontSize:"0.60rem", color:"#22c55e", fontWeight:700, marginTop:"2px", display:"flex", alignItems:"center", gap:"3px" }}>
                <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:"#22c55e", display:"inline-block", animation:"blink 1.2s infinite" }}/>+{activeThisMonth} this month
              </div>
            </div>
          </div>
        </div>

        {/* 3. Inactive Clients */}
        <div className="topcard" onClick={()=>navigate("/user/clients",{state:{filter:"inactive"}})} style={{ padding:"14px 13px", cursor:"pointer" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{
  width:"42px",
  height:"42px",
  borderRadius:"11px",
  background:"#fffbeb",
  display:"flex",
  alignItems:"center",
  justifyContent:"center",
  flexShrink:0
}}>
  <span style={{ fontSize:"1.1rem" }}>🚫</span>
            </div>
            <div>
              <div style={{ fontSize:"1.35rem", fontWeight:900, color:"#0f172a", lineHeight:1 }}>{inactiveCount}</div>
              <div style={{ fontSize:"0.68rem", color:"#64748b", fontWeight:600, marginTop:"2px" }}>Inactive Clients</div>
              <div style={{ fontSize:"0.60rem", color:"#f59e0b", fontWeight:700, marginTop:"2px" }}>+{inactiveThisMonth} this month</div>
            </div>
          </div>
        </div>

        {/* 4. Add Client */}
        <div className="topcard" onClick={()=>openAddClientModal("dashboard")} style={{ padding:"14px 13px", cursor:"pointer" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{
  width:"42px",
  height:"42px",
  borderRadius:"11px",
  background:"#f5f3ff",
  display:"flex",
  alignItems:"center",
  justifyContent:"center",
  flexShrink:0
}}>
  <span style={{ fontSize:"1.15rem", color:"#7c3aed" }}>➕</span>
</div>
            <div>
              <div style={{ fontSize:"0.80rem", fontWeight:800, color:"#0f172a" }}>Add Client</div>
              <div style={{ fontSize:"0.63rem", color:"#64748b", marginTop:"2px" }}>Quickly add new client</div>
              <div style={{ fontSize:"0.72rem", color:"#4f46e5", fontWeight:700, marginTop:"4px" }}>+ New</div>
            </div>
          </div>
        </div>

        {/* 5. Important Portals */}
        <div className="topcard" onClick={()=>setShowPortalPanel(true)} style={{ padding:"14px 13px", cursor:"pointer" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{
  width:"42px",
  height:"42px",
  borderRadius:"11px",
  background:"#ecfeff",
  display:"flex",
  alignItems:"center",
  justifyContent:"center",
  flexShrink:0
}}>
  <span style={{ fontSize:"1.15rem" }}>🌐</span>
</div>
            <div>
              <div style={{ fontSize:"0.80rem", fontWeight:800, color:"#0f172a" }}>Imp. Portals</div>
              <div style={{ fontSize:"0.63rem", color:"#64748b", marginTop:"2px" }}>
                {importantPortals.length
                  ? importantPortals.slice(0,3).map(p=>p.label.split(" ")[0]).join(", ")
                  : "Govt. Portals"}
              </div>
              <div style={{ fontSize:"0.60rem", color:"#0891b2", fontWeight:700, marginTop:"2px" }}>{importantPortals.length} portals →</div>
            </div>
          </div>
        </div>

        {/* 6. GST Portal */}
        <div className="topcard" onClick={()=>window.open("https://www.gst.gov.in","_blank")} style={{ padding:"14px 13px", cursor:"pointer" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{
  width:"42px",
  height:"42px",
  borderRadius:"11px",
  background:"#f0fdf4",
  display:"flex",
  alignItems:"center",
  justifyContent:"center",
  flexShrink:0
}}>
  <span style={{ fontSize:"1.15rem" }}>🏛️</span>
</div>
            <div>
              <div style={{ fontSize:"0.80rem", fontWeight:800, color:"#0f172a" }}>GST Portal</div>
              <div style={{ fontSize:"0.63rem", color:"#64748b", marginTop:"2px" }}>gst.gov.in</div>
              <div style={{ fontSize:"0.60rem", color:"#15803d", fontWeight:700, marginTop:"2px" }}>Open ↗</div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ ROW 2: Calendar (50%) | GST Filing Table (50%) — equal width ══ */}
      
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"14px", alignItems:"stretch" }}>

        {/* GST Compliance Calendar */}
        <div style={{ ...S.card, display: "flex", flexDirection: "column" }}>
  <div style={S.hdr}>
    <div style={S.hdrTitle}>
      <span>📅</span>
      GST Compliance Calendar
    </div>
  </div>

  <div
    style={{
      padding: "10px 11px",
      flex: 1,
      display: "flex",
      flexDirection: "column"
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        marginBottom: "9px",
        flexWrap: "nowrap"
      }}
    >
      <button
        onClick={() => {
          let m = selectedMonth - 1;
          let y = selectedYear;
          if (m < 0) {
            m = 11;
            y--;
          }
          setSelectedMonth(m);
          setSelectedYear(y);
        }}
        className="btn-white"
        style={{
          width: "28px",
          height: "28px",
          minWidth: "28px",
          borderRadius: "7px",
          boxShadow: "0 2px 6px rgba(15,23,42,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.9rem",
          padding: 0,
          lineHeight: 1,
          flexShrink: 0
        }}
        title="Previous Month"
      >
        ‹
      </button>

      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(Number(e.target.value))}
        style={{
          width: "92px",
          minWidth: "92px",
          margin:"12px",
          height: "28px",
          padding: "0 8px",
          borderRadius: "6px",
          border: "1px solid #e2e8f0",
          fontSize: "0.72rem",
          background: "#fff",
          color: "#0f172a",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(15,23,42,0.04)",
          flexShrink: 0
        }}
      >
        {months.map((m, i) => (
          <option key={i} value={i}>
            {m}
          </option>
        ))}
      </select>

      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(Number(e.target.value))}
        style={{
          width: "70px",
          minWidth: "70px",
          margin:"12px",
          height: "28px",
          padding: "0 8px",
          borderRadius: "6px",
          border: "1px solid #e2e8f0",
          fontSize: "0.72rem",
          background: "#fff",
          color: "#0f172a",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(15,23,42,0.04)",
          flexShrink: 0
        }}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <button
        onClick={() => {
          let m = selectedMonth + 1;
          let y = selectedYear;
          if (m > 11) {
            m = 0;
            y++;
          }
          setSelectedMonth(m);
          setSelectedYear(y);
        }}
        className="btn-white"
        style={{
          width: "28px",
          height: "28px",
          minWidth: "28px",
          borderRadius: "7px",
          boxShadow: "0 2px 6px rgba(15,23,42,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.9rem",
          padding: 0,
          lineHeight: 1,
          flexShrink: 0
        }}
        title="Next Month"
      >
        ›
      </button>

      <button
        onClick={() => {
          setSelectedMonth(today.getMonth());
          setSelectedYear(today.getFullYear());
        }}
        className="btn-blue"
        style={{
          height: "28px",
          padding: "0 10px",
          marginLeft: "auto",
          borderRadius: "7px",
          boxShadow: "0 2px 6px rgba(79,70,229,0.15)",
          fontWeight: 700,
          color: "white",
          whiteSpace: "nowrap",
          fontSize: "0.68rem",
          flexShrink: 0
        }}
      >
        Today
      </button>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(7,1fr)",
        gap: "2px",
        marginBottom: "2px"
      }}
    >
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
        <div
          key={d}
          style={{
            textAlign: "center",
            fontSize: "0.58rem",
            fontWeight: 600,
            color: "#94a3b8",
            padding: "2px 0"
          }}
        >
          {d}
        </div>
      ))}
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px" }}>
      {calendarCells.map((day, i) => {
        const isToday =
          day &&
          day === today.getDate() &&
          selectedMonth === today.getMonth() &&
          selectedYear === today.getFullYear();
        const dm = day ? gstDueDates[day] : null;
        const dr = day ? getDayReminders(day) : [];

        return (
          <div
            key={i}
            className={isToday ? "cd cd-today" : day ? "cd" : ""}
            onClick={() => {
              if (day) {
                setReminderDay(day);
                setShowReminderModal(true);
              }
            }}
            style={{
              borderRadius: "5px",
              cursor: day ? "pointer" : "default",
              background: isToday
                ? "linear-gradient(135deg,#1f2a70,#3b4cc0)"
                : day
                  ? "#f8fafc"
                  : "transparent",
              border: isToday ? "none" : day ? "1px solid #edf1f7" : "none",
              boxShadow: isToday ? "0 2px 0 #111d5e" : "none",
              minHeight: "34px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transition: "background .12s"
            }}
          >
            <span
              style={{
                fontSize: "0.64rem",
                fontWeight: isToday ? 800 : 500,
                color: isToday ? "#fff" : "#334155",
                lineHeight: 1
              }}
            >
              {day || ""}
            </span>

            {dm && (
              <div
                style={{
                  background: dm.color,
                  color: "#fff",
                  fontSize: "0.44rem",
                  fontWeight: 800,
                  borderRadius: "2px",
                  padding: "1px 2px",
                  marginTop: "1px",
                  lineHeight: 1
                }}
              >
                {dm.label}
              </div>
            )}

            {dr.length > 0 && (
              <div
                style={{
                  width: "3px",
                  height: "3px",
                  borderRadius: "50%",
                  background: "#f59e0b",
                  marginTop: "1px"
                }}
              />
            )}
          </div>
        );
      })}
    </div>

    <div
      style={{
        display: "flex",
        gap: "5px",
        flexWrap: "wrap",
        marginTop: "8px",
        padding: "5px 7px",
        background: "#f8fafc",
        borderRadius: "7px",
        border: "1px solid #edf1f7"
      }}
    >
      {[
        ["R7", "#8b5cf6"],
        ["IF", "#0891b2"],
        ["R1", "#3730a3"],
        ["3B", "#dc2626"],
        ["CM", "#d97706"]
      ].map(([l, c]) => (
        <div key={l} style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          <div
            style={{
              background: c,
              color: "#fff",
              fontSize: "0.44rem",
              fontWeight: 800,
              borderRadius: "2px",
              padding: "1px 3px"
            }}
          >
            {l}
          </div>
        </div>
      ))}

      <div style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "0.57rem", color: "#64748b" }}>
        <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#f59e0b" }} />
        Reminder
      </div>
    </div>

    {reminders.filter((r) => r.month === selectedMonth && r.year === selectedYear).length > 0 && (
      <div style={{ marginTop: "7px", borderTop: "1px solid #e8edf5", paddingTop: "6px" }}>
        <div style={{ fontSize: "0.63rem", fontWeight: 700, color: "#64748b", marginBottom: "4px" }}>
          📌 This month
        </div>

        {reminders
          .filter((r) => r.month === selectedMonth && r.year === selectedYear)
          .map((r) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "4px",
                padding: "3px 6px",
                marginBottom: "2px",
                fontSize: "0.64rem"
              }}
            >
              <span>
                <strong>{r.day} {monthShort[r.month]}</strong> – {r.text}
              </span>
              <button
                onClick={() => deleteReminder(r.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#ef4444",
                  fontWeight: 700,
                  fontSize: "0.8rem"
                }}
              >
                ×
              </button>
            </div>
          ))}
      </div>
    )}

    <button
      className="btn-blue"
      onClick={() => {
        setReminderDay(today.getDate());
        setShowReminderModal(true);
      }}
      style={{
        width: "100%",
        marginTop: "auto",
        padding: "8px",
        fontSize: "0.74rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px"
      }}
    >
      <HiPlus style={{ fontSize: "0.8rem" }} />
      Add Reminder
    </button>
  </div>
</div>
          

        {/* GST Return Filing Status Table */}
        <div style={{ ...S.card, display:"flex", flexDirection:"column" }}>
          <div style={S.hdr}>
            <div style={S.hdrTitle}>
              <span>📊</span>
              GST Return Filing Status
            </div>
          </div>
          <div style={{ padding:"10px 12px", flex:1, overflowY:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:"0 5px" }}>
              <thead>
                <tr>
                  {["Return","Filed","Due","Overdue"].map((h,i)=>(
                    <th key={h} style={{ padding:"7px 10px", fontSize:"0.70rem", fontWeight:800, color:"#3730a3", background:"#f3f0ff", border:"1px solid #dbeafe", textAlign:i===0?"left":"center", borderRadius:i===0?"6px 0 0 6px":i===3?"0 6px 6px 0":"0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filingData.map((row,i)=>(
                  <tr key={row.label}>
                    <td style={{ padding:"8px 10px", fontSize:"0.76rem", fontWeight:700, color:"#3730a3", background:"#f8fafc", border:"1px solid #e8edf5", borderRight:"none", borderRadius:"6px 0 0 6px" }}>{row.label}</td>
                    <td style={{ padding:"8px 10px", fontSize:"0.76rem", fontWeight:700, color:"#16a34a", background:"#f0fdf4", border:"1px solid #e8edf5", borderLeft:"none", borderRight:"none", textAlign:"center" }}>{row.filed}</td>
                    <td style={{ padding:"8px 10px", fontSize:"0.76rem", fontWeight:700, color:"#d97706", background:"#fffbeb", border:"1px solid #e8edf5", borderLeft:"none", borderRight:"none", textAlign:"center" }}>{row.due}</td>
                    <td style={{ padding:"8px 10px", fontSize:"0.76rem", fontWeight:700, color:row.overdue?"#ef4444":"#94a3b8", background:row.overdue?"#fef2f2":"#f8fafc", border:"1px solid #e8edf5", borderLeft:"none", borderRadius:"0 6px 6px 0", textAlign:"center" }}>{row.overdue ?? "N/S"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ══ ROW 3: Notices (50%) | High Risk (50%) — equal width ══ */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"14px", alignItems:"stretch" }}>

        {/* Notices and Orders */}
        <div style={{ ...S.card, display:"flex", flexDirection:"column" }}>
          <div style={S.hdr}>
            <div style={S.hdrTitle}>
              <span>🔔</span>
              Notices and Orders
            </div>
            <button className="btn-white" onClick={()=>setNoticesMaximized(true)} style={{ padding:"5px 11px", fontSize:"0.72rem", fontWeight:700, color:"#3730a3" }}>↗</button>
          </div>
          <div style={{ padding:"10px 14px 14px", flex:1 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:"10px", marginBottom:"8px", padding:"0 4px" }}>
              <div style={{ fontSize:"0.68rem", fontWeight:800, color:"#94a3b8", letterSpacing:"0.06em" }}>CLIENT</div>
              <div style={{ fontSize:"0.68rem", fontWeight:800, color:"#94a3b8", letterSpacing:"0.06em" }}>DETAILS</div>
            </div>
            {noticesData.map((row) => (
              <div key={row.id} className="notrow" style={{ display:"grid", gridTemplateColumns:"1fr auto", alignItems:"center", gap:"12px", padding:"11px 12px", marginBottom:"7px", background:"#fff", border:"1px solid #e5ecf5", borderLeft:`4px solid ${row.borderColor}`, borderRadius:"10px", cursor:"pointer", transition:"all .15s", boxShadow:"0 1px 4px rgba(15,23,42,0.04)" }}>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontWeight:800, fontSize:"0.84rem", color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.client}</div>
                  <div style={{ fontSize:"0.70rem", color:"#94a3b8", marginTop:"3px" }}>
                    <span style={{ background:row.typeBg, color:row.typeColor, fontWeight:700, padding:"2px 6px", borderRadius:"4px", marginRight:"5px", fontSize:"0.64rem" }}>{row.type}</span>
                    {row.date} · {row.amount}
                  </div>
                </div>
                <button className="btn-blue" onClick={(e)=>e.stopPropagation()} style={{ padding:"7px 13px", fontSize:"0.72rem" }}>Details</button>
              </div>
            ))}
          </div>
        </div>

        {/* High Risk Alerts */}
        <div style={{ ...S.card, display:"flex", flexDirection:"column" }}>
          <div style={S.hdr}>
            <div style={S.hdrTitle}>
              <span>⚠️</span>
              High Risk Alerts
            </div>
            <button className="btn-white" onClick={()=>setHighRiskMaximized(true)} style={{ padding:"5px 11px", fontSize:"0.72rem", fontWeight:700, color:"#3730a3" }}>↗</button>
          </div>
          <div style={{ padding:"10px 12px", flex:1 }}>
            <div style={{ display:"grid", gridTemplateColumns:"32px 1fr 66px 1fr 100px", padding:"0 8px 8px", color:"#94a3b8", fontWeight:800, fontSize:"0.68rem", letterSpacing:"0.04em" }}>
              <div>#</div><div>Taxpayer</div><div>Year</div><div>Mismatch</div><div style={{ textAlign:"right" }}>Amount</div>
            </div>
            {highRiskData.map((r, index) => (
              <div key={r.id} className="hrrow" onClick={()=>setHighRiskPopup(r)} style={{ display:"grid", gridTemplateColumns:"32px 1fr 66px 1fr 100px", alignItems:"center", padding:"10px 8px", marginBottom:"7px", background:"#fff", border:"1px solid #e5e7eb", borderLeft:`4px solid ${r.borderColor}`, borderRadius:"9px", cursor:"pointer", transition:"all .15s", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ fontWeight:800, color:"#94a3b8", fontSize:"0.88rem" }}>{index + 1}</div>
                <div style={{ fontWeight:800, fontSize:"0.80rem", color:"#0f172a", lineHeight:1.3, paddingRight:"6px", whiteSpace:"pre-line" }}>{r.gstin}</div>
                <div style={{ fontWeight:600, color:"#64748b", fontSize:"0.72rem" }}>{r.year}</div>
                <div style={{ color:"#4f46e5", fontWeight:800, fontSize:"0.72rem", paddingRight:"6px" }}>{r.mismatch}</div>
                <div style={{ fontWeight:900, color:r.amountColor, fontSize:"0.82rem", textAlign:"right" }}>{r.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ ROW 4: Client Growth Chart (50%) | GST Filing Bar Chart (50%) — equal width ══ */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"14px" }}>

        {/* Client Growth */}
        <div style={{ ...S.card, display: "flex", flexDirection: "column", overflow: "hidden" }}>
  <div style={S.hdr}>
    <div style={S.hdrTitle}>
      <span>📈</span>
      Client Growth (2017–2026)
    </div>

    <span
      style={{
        background: "#f3f0ff",
        color: "#3730a3",
        fontSize: "0.67rem",
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: "999px",
        border: "1px solid #bfdbfe",
      }}
    >
      Graph
    </span>
  </div>

  <div style={{ padding: "12px 14px 12px", flex: 1, display: "flex", flexDirection: "column" }}>
    {(() => {
      const chartYears = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
      const values = clientData;
      const maxV = Math.max(...values) * 1.12;

      const cw = C.w;
      const ch = 190;
      const pl = 34;
      const pr = 10;
      const pt = 12;
      const pb = 34;
      const iw = cw - pl - pr;
      const ih = ch - pt - pb;
      const bw = iw / values.length;
      const barW = Math.max(12, Math.min(22, bw * 0.42));

      const active = selectedGrowthPoint || {
        year: chartYears[chartYears.length - 1],
        value: values[values.length - 1],
        prev: values[values.length - 2] || 0,
        index: values.length - 1,
      };

      const growth =
        active.prev > 0
          ? Math.round(((active.value - active.prev) / active.prev) * 100)
          : 0;

      const linePoints = values
        .map((v, i) => {
          const x = pl + i * bw + bw / 2;
          const y = pt + ih - (v / maxV) * ih;
          return `${i === 0 ? "M" : "L"} ${x} ${y}`;
        })
        .join(" ");

      const areaPath = `${linePoints} L ${pl + (values.length - 1) * bw + bw / 2} ${pt + ih} L ${pl + bw / 2} ${pt + ih} Z`;

      return (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>
              Year-wise client growth with clickable points
            </div>
            <div
              style={{
                fontSize: "0.65rem",
                color: "#94a3b8",
                fontWeight: 700,
                background: "#f8fafc",
                border: "1px solid #e8edf5",
                borderRadius: "999px",
                padding: "3px 8px",
              }}
            >
              2017 → 2026
            </div>
          </div>

          <div style={{ width: "100%", overflowX: "hidden" }}>
            <svg width="100%" viewBox={`0 0 ${cw} ${ch}`} style={{ overflow: "visible" }}>
              <defs>
                <linearGradient id="cBarG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity=".95" />
                  <stop offset="100%" stopColor="#3730a3" stopOpacity=".78" />
                </linearGradient>

                <linearGradient id="cLineA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity=".18" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>

                <filter id="softBarShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2.2" floodColor="#0f172a" floodOpacity="0.12" />
                </filter>
              </defs>

              {[0.25, 0.5, 0.75, 1].map((f) => (
                <line
                  key={f}
                  x1={pl}
                  x2={cw - pr}
                  y1={pt + ih * (1 - f)}
                  y2={pt + ih * (1 - f)}
                  stroke="#eef2f7"
                  strokeWidth="1"
                />
              ))}

              {/* line area */}
              <path d={areaPath} fill="url(#cLineA)" />
              <path d={linePoints} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />

              {values.map((v, i) => {
                const x = pl + i * bw + bw / 2;
                const h = (v / maxV) * ih;
                const y = pt + ih - h;
                const isActive = selectedGrowthPoint?.index === i;

                return (
                  <g
                    key={i}
                    onClick={() =>
                      setSelectedGrowthPoint({
                        index: i,
                        year: chartYears[i],
                        value: v,
                        prev: i > 0 ? values[i - 1] : 0,
                      })
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <rect
                      x={x - barW / 2}
                      y={y}
                      width={barW}
                      height={h}
                      rx="5"
                      fill="url(#cBarG)"
                      opacity={isActive ? 1 : 0.88}
                      filter="url(#softBarShadow)"
                      stroke={isActive ? "#22c55e" : "transparent"}
                      strokeWidth="1.5"
                    />

                    <circle
                      cx={x}
                      cy={y - 4}
                      r={isActive ? 3.5 : 2.4}
                      fill={isActive ? "#22c55e" : "#4f46e5"}
                      opacity={isActive ? 1 : 0.85}
                    />

                    <text
                      x={x}
                      y={ch - 16}
                      textAnchor="middle"
                      fill={isActive ? "#3730a3" : "#94a3b8"}
                      fontSize="8"
                      fontWeight={isActive ? 800 : 700}
                    >
                      {chartYears[i]}
                    </text>

                    <text
                      x={x}
                      y={y - 10}
                      textAnchor="middle"
                      fill="#0f172a"
                      fontSize="7"
                      fontWeight="700"
                      opacity={isActive ? 1 : 0}
                    >
                      {v}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 1fr",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            <div
              style={{
                background: "linear-gradient(180deg,#f8fafc 0%, #ffffff 100%)",
                border: "1px solid #e8edf5",
                borderRadius: "10px",
                padding: "8px 10px",
              }}
            >
              <div style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 700 }}>Selected Year</div>
              <div style={{ fontSize: "0.86rem", color: "#0f172a", fontWeight: 900, marginTop: "2px" }}>
                {active.year}
              </div>
            </div>

            <div
              style={{
                background: "linear-gradient(180deg,#f8fafc 0%, #ffffff 100%)",
                border: "1px solid #e8edf5",
                borderRadius: "10px",
                padding: "8px 10px",
              }}
            >
              <div style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 700 }}>Clients</div>
              <div style={{ fontSize: "0.86rem", color: "#3730a3", fontWeight: 900, marginTop: "2px" }}>
                {active.value}
              </div>
            </div>

            <div
              style={{
                background:
                  growth >= 0
                    ? "linear-gradient(180deg,#f0fdf4 0%, #ffffff 100%)"
                    : "linear-gradient(180deg,#fef2f2 0%, #ffffff 100%)",
                border: `1px solid ${growth >= 0 ? "#bbf7d0" : "#fecaca"}`,
                borderRadius: "10px",
                padding: "8px 10px",
              }}
            >
              <div style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 700 }}>Growth</div>
              <div
                style={{
                  fontSize: "0.86rem",
                  color: growth >= 0 ? "#16a34a" : "#dc2626",
                  fontWeight: 900,
                  marginTop: "2px",
                }}
              >
                {growth >= 0 ? "+" : ""}
                {growth}%
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.62rem", color: "#64748b" }}>
              <div style={{ width: "10px", height: "8px", borderRadius: "2px", background: "#6D4AFF", opacity: 0.88 }} />
              Client Count
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.62rem", color: "#64748b" }}>
              <div style={{ width: "14px", height: "2px", background: "#22c55e", borderRadius: "1px" }} />
              Growth Trend
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.62rem", color: "#64748b" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e" }} />
              Click any bar
            </div>
          </div>
        </>
      );
    })()}
  </div>
</div>

        {/* GST Return Filing Bar Chart */}
       <div style={{ ...S.card, display: "flex", flexDirection: "column", overflow: "hidden" }}>
  <div style={S.hdr}>
    <div style={S.hdrTitle}>
      <span>📊</span>
      GST Return Filing Status
    </div>

    <span
      style={{
        background: "#f3f0ff",
        color: "#3730a3",
        fontSize: "0.67rem",
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: "999px",
        border: "1px solid #bfdbfe",
      }}
    >
      {monthShort[selectedMonth]} {selectedYear}
    </span>
  </div>

  <div style={{ padding: "12px 14px 14px", flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
    {(() => {
      const filed = filingData?.reduce((sum, item) => sum + (Number(item.filed) || 0), 0) || 0;
      const due = filingData?.reduce((sum, item) => sum + (Number(item.due) || 0), 0) || 0;
      const overdue = filingData?.reduce((sum, item) => sum + (Number(item.overdue) || 0), 0) || 0;
      const total = filed + due + overdue || 1;

      const filedPct = Math.round((filed / total) * 100);
      const duePct = Math.round((due / total) * 100);
      const overduePct = Math.round((overdue / total) * 100);

      const size = 132;
      const stroke = 14;
      const r = 48;
      const cx = 66;
      const cy = 66;
      const c = 2 * Math.PI * r;

      const filedDash = (filed / total) * c;
      const dueDash = (due / total) * c;
      const overdueDash = (overdue / total) * c;

      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "150px 1fr",
            gap: "14px",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={size} height={size} viewBox="0 0 132 132" style={{ overflow: "visible" }}>
              <defs>
                <linearGradient id="gstFiledGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
                <linearGradient id="gstDueGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="gstOverdueGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
                <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.12" />
                </filter>
              </defs>

              <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="url(#gstFiledGrad)"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${filedDash} ${c}`}
                transform={`rotate(-90 ${cx} ${cy})`}
                filter="url(#softShadow)"
              />
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="url(#gstDueGrad)"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${dueDash} ${c}`}
                strokeDashoffset={-filedDash}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="url(#gstOverdueGrad)"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${overdueDash} ${c}`}
                strokeDashoffset={-(filedDash + dueDash)}
                transform={`rotate(-90 ${cx} ${cy})`}
              />

              <circle cx={cx} cy={cy} r="28" fill="#fff" />
              <text x={cx} y={cy - 2} textAnchor="middle" fontSize="18" fontWeight="900" fill="#0f172a">
                100
              </text>
              <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fontWeight="700" fill="#64748b">
                Total
              </text>
            </svg>

            <div
              style={{
                position: "absolute",
                bottom: "2px",
                right: "2px",
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "999px",
                padding: "3px 8px",
                fontSize: "0.58rem",
                fontWeight: 700,
                color: "#475569",
                boxShadow: "0 2px 8px rgba(15,23,42,0.06)",
              }}
            >
              100%
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { label: "Filed", count: filed, pct: filedPct, color: "#22c55e", bg: "#f0fdf4" },
              { label: "Pending", count: due, pct: duePct, color: "#f59e0b", bg: "#fffbeb" },
              { label: "Overdue", count: overdue, pct: overduePct, color: "#ef4444", bg: "#fef2f2" },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "62px 1fr 42px",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 8px",
                  borderRadius: "10px",
                  background: row.bg,
                  border: `1px solid ${row.color}22`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: row.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#334155" }}>
                    {row.label}
                  </span>
                </div>

                <div
                  style={{
                    height: "6px",
                    background: "#e2e8f0",
                    borderRadius: "999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(6, row.pct)}%`,
                      height: "100%",
                      borderRadius: "999px",
                      background: row.color,
                    }}
                  />
                </div>

                <div style={{ textAlign: "right", fontSize: "0.72rem", fontWeight: 900, color: "#0f172a" }}>
                  {row.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    })()}

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
        gap: "6px",
        marginTop: "2px",
      }}
    >
      {filingData.map((d, i) => {
        const totalRow = Math.max(1, (Number(d.filed) || 0) + (Number(d.due) || 0) + (Number(d.overdue) || 0));
        const filedPct = Math.round(((Number(d.filed) || 0) / totalRow) * 100);
        const duePct = Math.round(((Number(d.due) || 0) / totalRow) * 100);
        const overduePct = Math.round(((Number(d.overdue) || 0) / totalRow) * 100);

        return (
          <button
            key={i}
            onClick={() =>
              setSelectedFilingItem({
                ...d,
                filedPct,
                duePct,
                overduePct,
                totalRow,
                rank: i + 1,
              })
            }
            style={{
              textAlign: "left",
              padding: "9px 9px 8px",
              borderRadius: "12px",
              background:
                "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
              border: "1px solid #e8edf5",
              boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
              cursor: "pointer",
              transition: "all .18s ease",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 8px 18px rgba(15,23,42,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(15,23,42,0.04)";
            }}
          >
            <div
              style={{
                fontSize: "0.62rem",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "8px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {d.label}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                <div style={{ flex: 1, height: "5px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ width: `${Math.max(6, filedPct)}%`, height: "100%", background: "#22c55e", borderRadius: "999px" }} />
                </div>
                <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#16a34a", minWidth: "22px", textAlign: "right" }}>
                  {filedPct}%
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />
                <div style={{ flex: 1, height: "5px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ width: `${Math.max(6, duePct)}%`, height: "100%", background: "#f59e0b", borderRadius: "999px" }} />
                </div>
                <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#d97706", minWidth: "22px", textAlign: "right" }}>
                  {duePct}%
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
                <div style={{ flex: 1, height: "5px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ width: `${Math.max(6, overduePct)}%`, height: "100%", background: "#ef4444", borderRadius: "999px" }} />
                </div>
                <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#dc2626", minWidth: "22px", textAlign: "right" }}>
                  {overduePct}%
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  </div>

  {selectedFilingItem && (
    <div
      onClick={() => setSelectedFilingItem(null)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 4000,
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "420px",
          maxWidth: "95vw",
          background: "#fff",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #e2e8f0",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          }}
        >
          <div>
            <div style={{ fontSize: "0.95rem", fontWeight: 900, color: "#3730a3" }}>
              {selectedFilingItem.label}
            </div>
            <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600, marginTop: "2px" }}>
              Clicked filing snapshot
            </div>
          </div>

          <button
            onClick={() => setSelectedFilingItem(null)}
            style={{
              width: "30px",
              height: "30px",
              padding:"2px",
              borderRadius: "50%",
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              cursor: "pointer",
              fontWeight: 800,
              color: "#475569",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "132px 1fr", gap: "14px", alignItems: "center" }}>
            <svg width="132" height="132" viewBox="0 0 132 132">
              <defs>
                <linearGradient id="popupFiled" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
                <linearGradient id="popupDue" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="popupOverdue" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>

              {(() => {
                const total = Math.max(1, selectedFilingItem.totalRow);
                const filedDash = (selectedFilingItem.filed / total) * (2 * Math.PI * 48);
                const dueDash = (selectedFilingItem.due / total) * (2 * Math.PI * 48);
                const overdueDash = (selectedFilingItem.overdue / total) * (2 * Math.PI * 48);

                return (
                  <>
                    <circle cx="66" cy="66" r="48" fill="none" stroke="#e2e8f0" strokeWidth="14" />
                    <circle cx="66" cy="66" r="48" fill="none" stroke="url(#popupFiled)" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${filedDash} ${2 * Math.PI * 48}`} transform="rotate(-90 66 66)" />
                    <circle cx="66" cy="66" r="48" fill="none" stroke="url(#popupDue)" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${dueDash} ${2 * Math.PI * 48}`} strokeDashoffset={-filedDash} transform="rotate(-90 66 66)" />
                    <circle cx="66" cy="66" r="48" fill="none" stroke="url(#popupOverdue)" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${overdueDash} ${2 * Math.PI * 48}`} strokeDashoffset={-(filedDash + dueDash)} transform="rotate(-90 66 66)" />
                    <circle cx="66" cy="66" r="28" fill="#fff" />
                    <text x="66" y="63" textAnchor="middle" fontSize="18" fontWeight="900" fill="#0f172a">
                      100
                    </text>
                    <text x="66" y="76" textAnchor="middle" fontSize="9" fontWeight="700" fill="#64748b">
                      Total
                    </text>
                  </>
                );
              })()}
            </svg>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>
                Year: <span style={{ color: "#0f172a" }}>{selectedFilingItem.year || `${monthShort[selectedMonth]} ${selectedYear}`}</span>
              </div>

              <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>
                Total Returns: <span style={{ color: "#0f172a" }}>{selectedFilingItem.totalRow}</span>
              </div>

              <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>
                Filed: <span style={{ color: "#16a34a" }}>{selectedFilingItem.filed} ({selectedFilingItem.filedPct}%)</span>
              </div>

              <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>
                Due: <span style={{ color: "#d97706" }}>{selectedFilingItem.due} ({selectedFilingItem.duePct}%)</span>
              </div>

              <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>
                Overdue: <span style={{ color: "#dc2626" }}>{selectedFilingItem.overdue} ({selectedFilingItem.overduePct}%)</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            {[
              { label: "Filed", value: selectedFilingItem.filedPct, color: "#22c55e" },
              { label: "Pending", value: selectedFilingItem.duePct, color: "#f59e0b" },
              { label: "Overdue", value: selectedFilingItem.overduePct, color: "#ef4444" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "70px 1fr 40px",
                  gap: "8px",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#334155" }}>
                  {item.label}
                </div>

                <div style={{ height: "8px", borderRadius: "999px", background: "#e2e8f0", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.max(6, item.value)}%`,
                      height: "100%",
                      borderRadius: "999px",
                      background: item.color,
                    }}
                  />
                </div>

                <div style={{ textAlign: "right", fontSize: "0.7rem", fontWeight: 900, color: item.color }}>
                  {item.value}%
                </div>
              </div>
            ))}
          </div>

          
        </div>
      </div>
    </div>
  )}
</div>
      </div>

      {/* ══ ROW 5: Links + Portals — equal width ══ */}
            {/* ══ ROW 5: Links + Portals — equal width ══ */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
        
        {/* ==================== IMPORTANT LINKS ==================== */}
        <div style={{ ...S.card, display:"flex", flexDirection:"column" }}>
          <div style={S.hdr}>
            <div style={S.hdrTitle}>
              <span>🔗</span>
              Important Links
            </div>
            <button onClick={()=>setShowAddLink(!showAddLink)} style={S.viewAll}>Manage Links</button>
          </div>
          
          <div style={{ padding:"10px 12px", flex:1, display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"9px", marginBottom:"10px" }}>
              {importantLinks.map(lnk=>(
                <a key={lnk.id} href={lnk.url} target="_blank" rel="noopener noreferrer" className="li" 
                   style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"5px", padding:"9px 10px", borderRadius:"9px", border:"1px solid #e8edf5", background:"#f8fafc", textDecoration:"none", transition:"all .12s", minWidth:"75px", flex:"1", maxWidth:"110px" }}>
                  <div style={{ width:"32px", height:"32px", borderRadius:"8px", background:"#fff", border:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.05rem", boxShadow:"0 2px 0 #d1dae8" }}>{lnk.icon}</div>
                  <span style={{ fontSize:"0.61rem", fontWeight:600, color:"#334155", textAlign:"center", lineHeight:1.3 }}>{lnk.label}</span>
                </a>
              ))}
            </div>

{showAddLink ? (
  <div style={{ 
    display:"flex", 
    gap:"6px", 
    alignItems:"center",
    marginTop: "4px"   // thoda margin top diya taaki upar se bhi balance rahe
  }}>
    {/* Label Input */}
    <input 
      placeholder="Label" 
      value={newLinkLabel} 
      onChange={e=>setNewLinkLabel(e.target.value)} 
      style={{
        flex: 1,
        height: "32px",
        padding: "0 10px",
        borderRadius: "6px",
        border: "1px solid #dde3ef",
        fontSize: "0.73rem",
        background: "#f8fafc",
        margin: 0
      }} 
    />
    
    {/* URL Input */}
    <input 
      placeholder="https://" 
      value={newLinkUrl} 
      onChange={e=>setNewLinkUrl(e.target.value)} 
      style={{
        flex: 2,
        height: "32px",
        padding: "0 10px",
        borderRadius: "6px",
        border: "1px solid #dde3ef",
        fontSize: "0.73rem",
        background: "#f8fafc",
        margin: 0
      }} 
    />
    
    {/* Add Button */}
    <button 
      className="btn-blue" 
      onClick={()=>{if(newLinkLabel && newLinkUrl){
        setImportantLinks(p=>[...p,{id:Date.now(),label:newLinkLabel,url:newLinkUrl,icon:"🔗"}]);
        setNewLinkLabel(""); setNewLinkUrl(""); setShowAddLink(false);
      }}} 
      style={{
        height: "32px",
        width: "70px",
        padding: "0 12px",
        fontSize: "0.72rem",
        borderRadius: "6px",
        margin: 0
      }}
    >
      Add
    </button>
    
    {/* Cross Button */}
    <button
      onClick={()=>setShowAddLink(false)}
      className="btn-white"
      style={{
        width: "32px",
        height: "32px",
        padding: 0,
        fontSize: "1.1rem",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: 0
      }}
    >
      ✕
    </button>
  </div>
) : (
              <button onClick={()=>setShowAddLink(true)} style={{ width:"100%", padding:"8px", background:"#f8fafc", border:"1px dashed #cbd5e1", borderRadius:"7px", color:"#64748b", fontSize:"0.70rem", fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"4px", marginTop:"auto" }}>
                <HiPlus style={{ fontSize:"0.8rem" }}/> Add New Link
              </button>
            )}
          </div>
        </div>

        {/* ==================== IMPORTANT PORTALS ==================== */}
                {/* ==================== IMPORTANT PORTALS ==================== */}
        <div style={{ ...S.card, display:"flex", flexDirection:"column" }}>
          <div style={S.hdr}>
            <div style={S.hdrTitle}>
              <span>🌐</span>
              Important Portals
            </div>
            <button onClick={()=>setShowAddPortal(!showAddPortal)} style={S.viewAll}>Manage Portals</button>
          </div>
          
          <div style={{ padding:"10px 12px", flex:1, display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"9px", marginBottom:"10px" }}>
              {importantPortals.map(p=>(
                <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="pi" 
                   style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"5px", padding:"9px 10px", borderRadius:"9px", border:"1px solid #e8edf5", background:"#f8fafc", textDecoration:"none", transition:"all .12s", minWidth:"75px", flex:"1", maxWidth:"110px" }}>
                  <div style={{ width:"32px", height:"32px", borderRadius:"8px", background:"#fff", border:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.05rem", boxShadow:"0 2px 0 #d1dae8" }}>{p.icon}</div>
                  <span style={{ fontSize:"0.61rem", fontWeight:600, color:"#334155", textAlign:"center", lineHeight:1.3 }}>{p.label}</span>
                </a>
              ))}
            </div>

            {showAddPortal ? (
              <div style={{ 
                display:"flex", 
                gap:"6px", 
                alignItems:"center",
                marginTop: "4px" 
              }}>
                {/* Label Input */}
                <input 
                  placeholder="Portal Name" 
                  value={newPortalLabel} 
                  onChange={e=>setNewPortalLabel(e.target.value)} 
                  style={{
                    flex: 1,
                    height: "32px",
                    padding: "0 10px",
                    borderRadius: "6px",
                    border: "1px solid #dde3ef",
                    fontSize: "0.73rem",
                    background: "#f8fafc",
                    margin: 0
                  }} 
                />
                
                {/* URL Input */}
                <input 
                  placeholder="https://" 
                  value={newPortalUrl} 
                  onChange={e=>setNewPortalUrl(e.target.value)} 
                  style={{
                    flex: 2,
                    height: "32px",
                    padding: "0 10px",
                    borderRadius: "6px",
                    border: "1px solid #dde3ef",
                    fontSize: "0.73rem",
                    background: "#f8fafc",
                    margin: 0
                  }} 
                />
                
                {/* Add Button */}
                <button 
                  className="btn-blue" 
                  onClick={()=>{if(newPortalLabel && newPortalUrl){
                    setImportantPortals(prev=>[...prev,{id:Date.now(),label:newPortalLabel,url:newPortalUrl,icon:"🌐"}]);
                    setNewPortalLabel(""); 
                    setNewPortalUrl(""); 
                    setShowAddPortal(false);
                  }}} 
                  style={{
                    height: "32px",
                    width: "70px",
                    padding: "0 12px",
                    fontSize: "0.72rem",
                    borderRadius: "6px",
                    margin: 0
                  }}
                >
                  Add
                </button>
                
                {/* Cross Button */}
                <button
                  onClick={()=>setShowAddPortal(false)}
                  className="btn-white"
                  style={{
                    width: "32px",
                    height: "32px",
                    padding: 0,
                    fontSize: "1.1rem",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: 0
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <button onClick={()=>setShowAddPortal(true)} style={{ width:"100%", padding:"8px", background:"#f8fafc", border:"1px dashed #cbd5e1", borderRadius:"7px", color:"#64748b", fontSize:"0.70rem", fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"4px", marginTop:"auto" }}>
                <HiPlus style={{ fontSize:"0.8rem" }}/> Add New Portal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══ REMINDER MODAL ══ */}
      {showReminderModal&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000 }} onClick={()=>setShowReminderModal(false)}>
          <div style={{ background:"#fff", borderRadius:"14px", width:"380px", boxShadow:"0 5px 0 #c8d2e4, 0 12px 32px rgba(15,23,42,.18)", overflow:"hidden" }} onClick={e=>e.stopPropagation()}>
            <div style={{ background:"#fff", padding:"13px 18px", borderBottom:"1px solid #e2e8f0", fontWeight:800, fontSize:"0.88rem", color:"#0f172a" }}>📌 Reminder – {reminderDay || ""} {months[selectedMonth] || ""} {selectedYear}</div>
            <div style={{ padding:"18px 20px 20px" }}>
              <input placeholder="Enter reminder text..." value={reminderText} onChange={e=>setReminderText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveReminder()} style={{ width:"100%", padding:"9px 11px", borderRadius:"8px", border:"1px solid #dde3ef", fontSize:"0.85rem", marginBottom:"12px", background:"#f8fafc" }}/>
              {reminderDay && getDayReminders(reminderDay)?.length>0 && getDayReminders(reminderDay).map(r=>(
                <div key={r.id} style={{ display:"flex", justifyContent:"space-between", background:"#fffbeb", border:"1px solid #fde68a", borderRadius:"5px", padding:"4px 8px", marginBottom:"3px", fontSize:"0.74rem" }}>
                  {r.text}<button onClick={()=>deleteReminder(r.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#ef4444", fontWeight:700 }}>×</button>
                </div>
              ))}
              <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end", marginTop:"4px" }}>
                <button className="btn-white" onClick={()=>setShowReminderModal(false)} style={{ padding:"8px 16px", fontSize:"0.82rem" }}>Cancel</button>
                <button className="btn-blue" onClick={saveReminder} style={{ padding:"8px 20px", fontSize:"0.82rem" }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ HIGH RISK POPUP ══ */}
      {highRiskPopup&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000 }} onClick={()=>setHighRiskPopup(null)}>
          <div style={{ background:"#fff", borderRadius:"14px", width:"460px", boxShadow:"0 5px 0 #c8d2e4, 0 12px 32px rgba(15,23,42,.18)", overflow:"hidden" }} onClick={e=>e.stopPropagation()}>
            <div style={{ background:"#fff", height:"48px", padding:"0 16px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #e2e8f0" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <span>⚠️</span>
                <span style={{ fontWeight:800, fontSize:"0.88rem", color:"#0f172a" }}>High Risk Alert</span>
                <span style={{ background:highRiskPopup.riskBg, color:highRiskPopup.riskColor, fontSize:"0.60rem", fontWeight:800, padding:"2px 7px", borderRadius:"999px", border:`1px solid ${highRiskPopup.riskColor}35` }}>{highRiskPopup.risk}</span>
              </div>
              <button className="btn-white" onClick={()=>setHighRiskPopup(null)} style={{ width:"26px", height:"26px", padding:0, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
            </div>
            <div style={{ padding:"16px 18px 18px" }}>
              <div style={{ fontWeight:800, fontSize:"0.88rem", color:"#0f172a", marginBottom:"8px" }}>{highRiskPopup.gstin}</div>
              <div style={{ fontSize:"0.8rem", color:"#64748b", marginBottom:"8px" }}>Mismatch: <strong style={{ color:"#4f46e5" }}>{highRiskPopup.mismatch}</strong></div>
              <div style={{ fontSize:"0.8rem", color:"#64748b", marginBottom:"12px" }}>Amount: <strong style={{ color:highRiskPopup.amountColor }}>{highRiskPopup.amount}</strong></div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"5px", marginBottom:"14px" }}>
                {highRiskPopup.tags.map(t=><span key={t} style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:"4px", padding:"2px 7px", fontSize:"0.68rem", color:"#475569", fontWeight:600 }}>{t}</span>)}
              </div>
              <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end" }}>
                <button className="btn-white" onClick={()=>setHighRiskPopup(null)} style={{ padding:"8px 16px", fontSize:"0.80rem" }}>Close</button>
                <button className="btn-blue" onClick={()=>{setHighRiskPopup(null);const c=allClients.find(x=>x.status==="active");if(c&&setSelectedClient)setSelectedClient({...c,showFullDashboard:true,initialSection:"liability"});}} style={{ padding:"8px 16px", fontSize:"0.80rem" }}>View Liability →</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ NOTICES MAXIMIZED ══ */}
      {noticesMaximized&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,.65)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:3000 }} onClick={()=>setNoticesMaximized(false)}>
          <div style={{ background:"#fff", borderRadius:"16px", width:"660px", maxWidth:"95vw", maxHeight:"88vh", overflow:"hidden", boxShadow:"0 5px 0 #c8d2e4, 0 14px 40px rgba(15,23,42,.20)" }} onClick={e=>e.stopPropagation()}>
            <div style={{ background:"#fff", height:"50px", padding:"0 20px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #e8edf5" }}>
              <span style={{ fontWeight:800, fontSize:"0.92rem", color:"#0f172a" }}>🔔 Notices and Orders</span>
              <button className="btn-white" onClick={()=>setNoticesMaximized(false)} style={{ width:"28px", height:"28px", padding:0, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
            </div>
            <div style={{ padding:"16px 20px", overflowY:"auto", maxHeight:"calc(88vh - 58px)" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:"10px", marginBottom:"10px", padding:"0 4px" }}>
                <div style={{ fontSize:"0.68rem", fontWeight:800, color:"#94a3b8", letterSpacing:"0.06em" }}>CLIENT</div>
                <div style={{ fontSize:"0.68rem", fontWeight:800, color:"#94a3b8", letterSpacing:"0.06em" }}>DETAILS</div>
              </div>
              {noticesData.map(n=>(
                <div key={n.id} style={{ display:"grid", gridTemplateColumns:"1fr auto", alignItems:"center", gap:"12px", background:"#fff", border:"1px solid #e5ecf5", borderLeft:`4px solid ${n.borderColor}`, borderRadius:"12px", padding:"13px 14px", marginBottom:"9px", boxShadow:"0 1px 4px rgba(15,23,42,0.04)" }}>
                  <div>
                    <div style={{ fontWeight:800, fontSize:"0.88rem", color:"#0f172a" }}>{n.client}</div>
                    <div style={{ fontSize:"0.72rem", color:"#94a3b8", marginTop:"4px" }}>
                      <span style={{ background:n.typeBg, color:n.typeColor, fontWeight:700, padding:"2px 7px", borderRadius:"5px", marginRight:"6px", fontSize:"0.66rem" }}>{n.type}</span>
                      {n.date} · {n.amount}
                    </div>
                  </div>
                  <button className="btn-blue" onClick={()=>{setNoticesMaximized(false);const c=allClients.find(x=>x.status==="active");if(c&&setSelectedClient)setSelectedClient({...c,showFullDashboard:true,initialSection:"notices"});}} style={{ padding:"8px 16px", fontSize:"0.74rem" }}>Details</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ HIGH RISK MAXIMIZED ══ */}
      {highRiskMaximized&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,.65)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:3000 }} onClick={()=>setHighRiskMaximized(false)}>
          <div style={{ background:"#fff", borderRadius:"16px", width:"700px", maxWidth:"95vw", maxHeight:"88vh", overflow:"hidden", boxShadow:"0 5px 0 #c8d2e4, 0 14px 40px rgba(15,23,42,.20)" }} onClick={e=>e.stopPropagation()}>
            <div style={{ background:"#fff", height:"50px", padding:"0 20px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #e8edf5" }}>
              <span style={{ fontWeight:800, fontSize:"0.92rem", color:"#0f172a" }}>⚠️ High Risk Alerts</span>
              <button className="btn-white" onClick={()=>setHighRiskMaximized(false)} style={{ width:"28px", height:"28px", padding:0, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
            </div>
            <div style={{ padding:"16px 20px", overflowY:"auto", maxHeight:"calc(88vh - 58px)" }}>
              <div style={{ display:"grid", gridTemplateColumns:"36px 1fr 80px 1fr 120px auto", padding:"0 10px 10px", color:"#94a3b8", fontWeight:800, fontSize:"0.7rem", letterSpacing:"0.04em" }}>
                <div>#</div><div>Taxpayer</div><div>Year</div><div>Mismatch</div><div>Amount</div><div></div>
              </div>
              {highRiskData.map((r,index)=>(
                <div key={r.id} style={{ display:"grid", gridTemplateColumns:"36px 1fr 80px 1fr 120px auto", alignItems:"center", padding:"12px 10px", marginBottom:"8px", background:"#fff", border:"1px solid #e5e7eb", borderLeft:`4px solid ${r.borderColor}`, borderRadius:"10px", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontWeight:800, color:"#94a3b8" }}>{index+1}</div>
                  <div style={{ fontWeight:800, fontSize:"0.85rem", color:"#0f172a", whiteSpace:"pre-line", paddingRight:"8px" }}>{r.gstin}</div>
                  <div style={{ fontWeight:600, color:"#64748b", fontSize:"0.76rem" }}>{r.year}</div>
                  <div style={{ color:"#4f46e5", fontWeight:800, fontSize:"0.76rem", paddingRight:"8px" }}>{r.mismatch}</div>
                  <div style={{ fontWeight:900, color:r.amountColor, fontSize:"0.88rem" }}>{r.amount}</div>
                  <button className="btn-blue" onClick={()=>{setHighRiskMaximized(false);const c=allClients.find(x=>x.status==="active");if(c&&setSelectedClient)setSelectedClient({...c,showFullDashboard:true,initialSection:"liability"});}} style={{ padding:"6px 12px", fontSize:"0.70rem" }}>View →</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ ADD CLIENT MODAL (DashboardHome) — renders via shared state ══ */}
      {null /* Shared modal rendered at root level in UserDashboard */}

      {/* ══ IMPORTANT PORTALS POPUP — opens from the "Imp. Portals" top card ══ */}
      {showPortalPanel && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
          onClick={() => setShowPortalPanel(false)}
        >
          <div
            style={{ background: "#fff", width: "440px", maxWidth: "92vw", borderRadius: "22px", overflow: "hidden", boxShadow: "0 28px 80px rgba(0,0,0,0.22)", animation: "scaleIn 0.2s ease" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              background: "#f8fafc",
              padding: "14px 20px 14px",
              position: "relative",
              borderBottom: "1px solid #e2e8f0",
              boxShadow: `
                0 10px 24px rgba(148,163,184,0.16),
                0 2px 6px rgba(0,0,0,0.04),
                inset 0 1px 0 rgba(255,255,255,0.9)
              `
            }}>
              <button
                onClick={() => setShowPortalPanel(false)}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "#ffffff",
                  border: "1px solid #cffafe",
                  borderRadius: "8px",
                  color: "#0891b2",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  boxShadow: "0 3px 8px rgba(148,163,184,0.12)"
                }}
              >
                ✕
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg,#0891b2,#0e7490)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.3rem",
                  color: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.7)",
                  boxShadow: `0 8px 18px rgba(8,145,178,0.28), inset 0 1px 0 rgba(255,255,255,0.25)`
                }}>
                  🌐
                </div>

                <div>
                  <h3 style={{ margin: 0, color: "#0e7490", fontSize: "1.08rem", fontWeight: 800 }}>
                    Important Portals
                  </h3>
                  <p style={{ margin: "3px 0 0", color: "#0891b2", fontSize: "0.79rem", fontWeight: 500 }}>
                    Quick access to {importantPortals.length} govt. portals
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "18px 20px 22px", background: "#f8fafc" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {importantPortals.map((p) => (
                  <a
                    key={p.id}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowPortalPanel(false)}
                    style={{
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      padding: "12px 14px",
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "13px",
                      boxShadow: "0 4px 12px rgba(100,116,139,0.08)",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#a5f3fc";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(8,145,178,0.16)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(100,116,139,0.08)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "10px",
                        background: "#ecfeff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.05rem",
                        flexShrink: 0,
                      }}>
                        {p.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>{p.label}</div>
                        <div style={{ fontSize: "0.68rem", color: "#64748b", marginTop: "2px" }}>{p.url.replace("https://", "")}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#0891b2", whiteSpace: "nowrap" }}>Open ↗</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
  const GSTReturnsPage = () => {
  const [selectedReturn, setSelectedReturn] = useState("GSTR-1");
  const [filterView, setFilterView] = useState("all");
  const [selectedFY, setSelectedFY] = useState("2025-26");
  const [liveClients, setLiveClients] = useState(null);
  const [syncInfo, setSyncInfo] = useState("");

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await gstFilingStatus({ fy: selectedFY });
        if (!alive) return;
        const clients = (res && res.clients) || [];
        setSyncInfo(
          res && res.success
            ? `GSTN ${res.gstn === "connected" ? "Live" : "Offline"} · FY ${res.fy ?? selectedFY} · ${clients.length} clients · ${res.filed_total ?? 0} returns filed`
            : "GSTN feed unavailable — showing sample data."
        );
        setLiveClients(
          clients.map((c, i) => ({
            sl: i + 1,
            name: c.name || c.firm || "Client",
            gstin: c.gstin,
            filingType: c.filing_type || "—",
            turnover: "—",
            taxLiability: "—",
            status: "Not Filed",
            dateOfFiling: "",
            live: true,
          }))
        );
      } catch {
        if (alive) setSyncInfo("GSTN feed unavailable — showing sample data.");
      }
    })();
    return () => { alive = false; };
  }, [selectedFY]);

  // Realistic GST Filing Data
  const gstFilingData = [
    { sl: 1, name: "MODERN MASTER PUBLICATION", gstin: "09QACPS3544H1Z4", filingType: "Monthly", turnover: "₹45,20,000", taxLiability: "₹8,13,600", status: "Filed", dateOfFiling: "2025-11-20" },
    { sl: 2, name: "M/s BHARAT KHADI UDYOG", gstin: "09AYCPA3837B1ZX", filingType: "Monthly", turnover: "₹32,10,500", taxLiability: "₹5,77,890", status: "Not Filed", dateOfFiling: "" },
    { sl: 3, name: "N S TRADERS", gstin: "09BKBPS9165E1ZS", filingType: "Monthly", turnover: "₹68,45,000", taxLiability: "₹12,32,100", status: "Filed", dateOfFiling: "2025-11-18" },
    { sl: 4, name: "NEERAJ AGENCIES", gstin: "09BRXPR8342B1Z6", filingType: "Monthly", turnover: "₹19,80,000", taxLiability: "₹3,56,400", status: "Not Filed", dateOfFiling: "" },
    { sl: 5, name: "WOOD CRAFT FURNITURE", gstin: "09DILPS7916D1ZR", filingType: "Monthly", turnover: "₹55,30,000", taxLiability: "₹9,95,400", status: "Filed", dateOfFiling: "2025-11-21" },
    { sl: 6, name: "SHIFA HANDLOOM", gstin: "09COYPM9918R1ZA", filingType: "Quarterly", turnover: "₹28,70,000", taxLiability: "₹5,16,600", status: "Not Filed", dateOfFiling: "" },
    { sl: 7, name: "I R TEXTILES", gstin: "09ABBPI9410Q1Z9", filingType: "Monthly", turnover: "₹41,25,000", taxLiability: "₹7,42,500", status: "Filed", dateOfFiling: "2025-11-19" },
    { sl: 8, name: "META TRADING COMPANY", gstin: "09DQWPA8816B1ZL", filingType: "Monthly", turnover: "₹73,15,000", taxLiability: "₹13,16,700", status: "Not Filed", dateOfFiling: "" },
    { sl: 9, name: "KRISHNA ENTERPRISES", gstin: "09AXZPK5678L1Z2", filingType: "Monthly", turnover: "₹61,40,000", taxLiability: "₹11,05,200", status: "Filed", dateOfFiling: "2025-11-17" },
    { sl: 10, name: "SINGH BROTHERS", gstin: "09BHFPS4321M1Z5", filingType: "Quarterly", turnover: "₹22,50,000", taxLiability: "₹4,05,000", status: "Filed", dateOfFiling: "2025-11-15" },
  ];

  // Prefer the live GSTN/DB feed when available, otherwise fall back to sample rows.
  const gstRows = liveClients && liveClients.length ? liveClients : gstFilingData;

  // Filter data based on Filed / Not Filed / All
  const filteredData = gstRows.filter(item => {
    if (filterView === "filed") return item.status === "Filed";
    if (filterView === "not_filed") return item.status === "Not Filed";
    return true;
  });

  // Download as Excel using SheetJS (already popular & lightweight)
  const downloadExcel = () => {
    // We'll use a CDN version of SheetJS in index.html (add this once)
    if (typeof XLSX === "undefined") {
      toast.error("Excel library not loaded. Please refresh.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, selectedReturn);

    // Styling header
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1";
      if (!worksheet[address]) continue;
      worksheet[address].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "7c3aed" } },
        alignment: { horizontal: "center" }
      };
    }

    XLSX.writeFile(workbook, `${selectedReturn}_Filing_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast.success("Excel report downloaded successfully!");
  };

  return (
    <div className="full-width-page">
      <div className="card">
        <h2 style={{ color: "#4f46e5", marginBottom: "20px" }}>GST Returns Filing Status</h2>

        {/* FY selector + live banner */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
          <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#475569" }}>Financial Year</label>
          <select
            value={selectedFY}
            onChange={(e) => setSelectedFY(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.82rem", fontWeight: "600", background: "#fff", color: "#1e293b" }}
          >
            {["2025-26","2024-25","2023-24","2022-23","2021-22"].map((fy) => (
              <option key={fy} value={fy}>{fy}</option>
            ))}
          </select>
          {syncInfo && (
            <span style={{
              fontSize: "0.72rem", fontWeight: "700", padding: "5px 11px", borderRadius: "20px",
              color: (syncInfo.includes("Live") ? "#047857" : "#b45309"),
              background: (syncInfo.includes("Live") ? "#d1fae5" : "#fef3c7"),
              border: `1px solid ${syncInfo.includes("Live") ? "#6ee7b7" : "#fcd34d"}`,
            }}>{syncInfo}</span>
          )}
        </div>

        {/* Return Type Tabs */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "30px", flexWrap: "wrap" }}>
          {["GSTR-1", "GSTR-3B", "GSTR-7"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedReturn(type)}
              style={{
                padding: "14px 24px",
                background: selectedReturn === type ? "#4f46e5" : "#e0e0e0",
                color: selectedReturn === type ? "white" : "#333",
                border: "none",
                borderRadius: "12px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: selectedReturn === type ? "0 6px 20px rgba(124,58,237,0.3)" : "none",
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Filter Buttons */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <button onClick={() => setFilterView("all")} style={{ padding: "10px 20px", background: filterView === "all" ? "#4f46e5" : "#f0f0f0", color: filterView === "all" ? "white" : "#333", border: "none", borderRadius: "8px" }}>
            All ({gstRows.length})
          </button>
          <button onClick={() => setFilterView("filed")} style={{ padding: "10px 20px", background: filterView === "filed" ? "#22c55e" : "#f0f0f0", color: filterView === "filed" ? "white" : "#333", border: "none", borderRadius: "8px" }}>
            Filed ({gstRows.filter(i => i.status === "Filed").length})
          </button>
          <button onClick={() => setFilterView("not_filed")} style={{ padding: "10px 20px", background: filterView === "not_filed" ? "#ef4444" : "#f0f0f0", color: filterView === "not_filed" ? "white" : "#333", border: "none", borderRadius: "8px" }}>
            Not Filed ({gstRows.filter(i => i.status === "Not Filed").length})
          </button>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: "auto", marginBottom: "30px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#6D4AFF", color: "white" }}>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>Sl No</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>Client Name</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>GSTIN</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>Filing Type</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>Turnover</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>Tax Liability</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>Status</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>Filing Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.sl} style={{ background: item.status === "Filed" ? "#f0fdf4" : "#fef2f2", borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "14px" }}>{item.sl}</td>
                  <td style={{ padding: "8px 10px", fontWeight: "500" }}>
                    {item.name}{item.live && (
                      <span style={{ marginLeft: "8px", fontSize: "0.62rem", fontWeight: "800", color: "#047857", background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: "10px", padding: "2px 7px", verticalAlign: "middle" }}>LIVE</span>
                    )}
                  </td>
                  <td style={{ padding: "14px" }}>{item.gstin}</td>
                  <td style={{ padding: "14px" }}>{item.filingType}</td>
                  <td style={{ padding: "14px" }}>{item.turnover}</td>
                  <td style={{ padding: "14px" }}>{item.taxLiability}</td>
                  <td style={{ padding: "14px" }}>
                    <span style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "0.9rem",
                      background: item.status === "Filed" ? "#d4edda" : "#f8d7da",
                      color: item.status === "Filed" ? "#155724" : "#721c24",
                      fontWeight: "600"
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px" }}>{item.dateOfFiling || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Download Excel Button */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={downloadExcel}
            style={{
              background: "#10b981",
              color: "white",
              padding: "16px 40px",
              border: "none",
              borderRadius: "12px",
              fontSize: "1.2rem",
              fontWeight: "600",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: "0 8px 25px rgba(16,185,129,0.3)",
            }}
          >
            <HiDownload style={{ fontSize: "1.6rem" }} />
            Download Excel Report
          </button>
        </div>
      </div>
    </div>
  );
};

  const DocumentsPage = () => {
    const handleUpload = () => toast.success("Document uploaded successfully!");
    const handleDownload = () => toast.success("Document downloaded!");
    return (
      <div className="full-width-page">
        <div className="card">
          <h2>Documents</h2>
          <div style={{ marginBottom: "20px" }}>
            <label>Upload Document: </label>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              border: "1px solid #bfdbfe",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.08)",
              transition: "all 0.25s ease",
              gap: "12px",
              maxWidth: "400px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 10px 20px rgba(37, 99, 235, 0.15)";
              e.currentTarget.style.borderColor = "#818cf8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(37, 99, 235, 0.08)";
              e.currentTarget.style.borderColor = "#c4b5fd";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
              <div style={{
                height: "42px", width: "42px", borderRadius: "10px",
                background: "#ede9fe", color: "#4f46e5",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: "700", fontSize: "1rem", flexShrink: 0,
                boxShadow: "0 2px 6px rgba(79,70,229,0.15)",
              }}>1</div>
              <div style={{
                color: "#3730a3", fontSize: "0.75rem", fontWeight: 600,
                lineHeight: 1.35, overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%",
              }}>Download Sample Document</div>
            </div>
            <button
              onClick={handleDownload}
              title="Download"
              style={{
                height: "58px", width: "58px", minWidth: "58px",
                background: "linear-gradient(145deg, #e8f0fe 0%, #dbeafe 60%, #bfdbfe 100%)",
                border: "1.5px solid rgba(147,197,253,0.6)",
                borderRadius: "14px",
                cursor: "pointer", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 14px rgba(79,70,229,0.18), inset 0 1px 0 rgba(255,255,255,0.8)",
                transition: "all 0.22s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 22px rgba(79,70,229,0.32), inset 0 1px 0 rgba(255,255,255,0.8)";
                e.currentTarget.style.transform = "translateY(-2px) scale(1.04)";
                e.currentTarget.style.background = "linear-gradient(145deg, #dbeafe 0%, #bfdbfe 60%, #93c5fd 100%)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(79,70,229,0.18), inset 0 1px 0 rgba(255,255,255,0.8)";
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.background = "linear-gradient(145deg, #e8f0fe 0%, #dbeafe 60%, #bfdbfe 100%)";
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M12 3v13M7 11l5 5 5-5" stroke="#3730a3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 20h16" stroke="#3730a3" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const [selectedReport, setSelectedReport] = useState(null);
  const [reportFromDate, setReportFromDate] = useState("");
  const [reportToDate, setReportToDate] = useState("");
  const [generatedReport, setGeneratedReport] = useState(null);

  const handleGenerateReport = () => {
    if (!reportFromDate || !reportToDate) {
      toast.error("Please select from and to dates");
      return;
    }
    toast.success(`${selectedReport} report generated!`);
    setGeneratedReport({
      type: selectedReport,
      content: `Dummy data for ${selectedReport} from ${reportFromDate} to ${reportToDate}. Entries: 50, Total: ₹5 Cr.`,
    });
  };

 const ReportsPage = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportFromDate, setReportFromDate] = useState("");
  const [reportToDate, setReportToDate] = useState("");
  const [generatedReport, setGeneratedReport] = useState(null);
  const [filterView, setFilterView] = useState("all");

  const filteredFilingList = filingList.filter(item => {
    if (filterView === "filed") return item.status === "Filed";
    if (filterView === "not_filed") return item.status === "Not Filed";
    return true;
  });

  const filedCount = filingList.filter(item => item.status === "Filed").length;
  const notFiledCount = filingList.filter(item => item.status === "Not Filed").length;

  const handleGenerateReport = () => {
    if (!reportFromDate || !reportToDate) {
      toast.error("Please select both From and To dates");
      return;
    }
    if (new Date(reportFromDate) > new Date(reportToDate)) {
      toast.error("From date cannot be after To date");
      return;
    }

    let title = "";
    let content = "";

    switch (selectedReport) {
      case "GSTR-1 Summary Report":
        title = "GSTR-1 Outward Supplies Summary";
        content = `GSTR-1 Summary Report\nPeriod: ${reportFromDate} to ${reportToDate}\n\n`;
        content += `Total Taxable Value: ₹4,85,20,000\n`;
        content += `Total IGST: ₹87,33,600\n`;
        content += `Total CGST + SGST: ₹87,33,600\n`;
        content += `Total Invoices: 1,248\n`;
        content += `B2B: 892 | B2C: 356\n`;
        content += `Credit/Debit Notes: 48\n`;
        content += `Exports: ₹28,70,000\n`;
        content += `Nil Rated/Exempt: ₹12,50,000\n\n`;
        content += `Status: Ready for Filing`;
        break;

      case "GSTR-3B Summary Report":
        title = "GSTR-3B Monthly Return Summary";
        content = `GSTR-3B Summary Report\nPeriod: ${reportFromDate} to ${reportToDate}\n\n`;
        content += `Outward Supplies: ₹4,85,20,000\n`;
        content += `Tax Liability:\n`;
        content += `  • IGST: ₹87,33,600\n`;
        content += `  • CGST: ₹43,66,800\n`;
        content += `  • SGST: ₹43,66,800\n`;
        content += `Total Tax Payable: ₹1,74,67,200\n\n`;
        content += `ITC Claimed: ₹1,36,80,000\n`;
        content += `Net Tax Payable: ₹37,87,200\n`;
        content += `Cash Paid: ₹15,00,000\n`;
        content += `ITC Utilized: ₹22,87,200\n\n`;
        content += `Status: Draft Saved`;
        break;

      case "Input Tax Credit (ITC) Ledger":
        title = "Input Tax Credit (ITC) Ledger";
        content = `ITC Ledger Report\nPeriod: ${reportFromDate} to ${reportToDate}\n\n`;
        content += `Opening ITC Balance: ₹2,20,50,000\n`;
        content += `ITC Added This Period: ₹1,36,80,000\n`;
        content += `ITC Reversed: ₹8,40,000\n`;
        content += `ITC Utilized: ₹98,73,000\n\n`;
        content += `Closing Balance:\n`;
        content += `  • IGST: ₹1,28,50,000\n`;
        content += `  • CGST: ₹61,33,500\n`;
        content += `  • SGST: ₹61,33,500\n`;
        content += `Total Unutilized ITC: ₹2,51,17,000\n\n`;
        content += `Reconciliation: 98.7% Matched with 2A`;
        break;

      case "GSTR-7 Reconciliation Report":
        title = "GSTR-7 TDS Reconciliation";
        content = `GSTR-7 TDS Report\nPeriod: ${reportFromDate} to ${reportToDate}\n\n`;
        content += `Total TDS Deducted: ₹18,45,000\n`;
        content += `TDS Certificates Received: 142\n`;
        content += `TDS Paid to Govt: ₹18,45,000\n`;
        content += `TDS Credit Claimed: ₹18,45,000\n`;
        content += `Pending Credit: ₹0\n\n`;
        content += `Discrepancies: None\n`;
        content += `Compliance: 100% Filed`;
        break;

      case "Annual Return (GSTR-9) Preview":
        title = "GSTR-9 Annual Return Preview (FY 2024-25)";
        content = `GSTR-9 Annual Return Preview\nFinancial Year: 2024-25\n\n`;
        content += `Total Turnover: ₹58,22,40,000\n`;
        content += `Taxable Supplies: ₹52,10,50,000\n`;
        content += `Total Tax Paid: ₹10,48,03,200\n`;
        content += `ITC Claimed: ₹7,85,00,000\n`;
        content += `ITC Reversed: ₹45,00,000\n`;
        content += `Net Liability: ₹2,18,03,200\n\n`;
        content += `Reconciliation Status:\n`;
        content += `  • GSTR-1 vs Books: 99.8%\n`;
        content += `  • GSTR-3B vs Books: 99.6%\n`;
        content += `  • 2A vs Claimed ITC: 98.9%\n\n`;
        content += `Draft Ready for Final Review`;
        break;

      case "Sales & Purchase Register":
        title = "Sales & Purchase Register Summary";
        content = `Sales & Purchase Register\nPeriod: ${reportFromDate} to ${reportToDate}\n\n`;
        content += `SALES SUMMARY\n`;
        content += `Taxable Sales: ₹4,85,20,000\n`;
        content += `Exempt/Nil Rated: ₹12,50,000\n`;
        content += `Exports: ₹28,70,000\n`;
        content += `Total Sales: ₹5,26,40,000\n\n`;
        content += `PURCHASE SUMMARY\n`;
        content += `Taxable Purchases: ₹3,85,50,000\n`;
        content += `ITC Eligible: ₹69,39,000\n`;
        content += `RCM Purchases: ₹15,80,000\n`;
        content += `Imports: ₹22,40,000\n`;
        content += `Total Purchases: ₹4,23,70,000`;
        break;

      default:
        content = "Report data will appear here after generation.";
    }

    setGeneratedReport({
      type: title || selectedReport,
      content: content,
    });

    toast.success(`${selectedReport} generated successfully!`);
  };

  const handleDownloadReport = () => {
    if (!generatedReport) return;
    const blob = new Blob([generatedReport.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${generatedReport.type.replace(/[^a-z0-9]/gi, '_')}_${reportFromDate}_to_${reportToDate}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
  };

  const isGSTR1or3B = selectedReport && (selectedReport.includes("GSTR-1") || selectedReport.includes("GSTR-3B"));

  return (
    <div className="full-width-page">
      <div className="card">
        <h2 style={{ color: "#4f46e5", marginBottom: "30px", display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            <line x1="6" y1="8" x2="10" y2="8"/><line x1="6" y1="12" x2="14" y2="12"/>
          </svg>
          Reports
        </h2>

        {/* Report Buttons */}
       <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    background: "#ffffff",
    borderRadius: "14px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
    marginBottom: "14px",
    flexWrap: "wrap"
  }}
>
  {[
    "📄 GSTR1",
    "🧾 GSTR1A",
    "📊 GSTR3B",
    "📁 ITC04",
    "💳 TDS/TCS",
    "📑 Reports"
  ].map((item) => (
    <button
      key={item}
      style={{
        padding: "10px 18px",
        background:
          item === "📄 GSTR1"
            ? "linear-gradient(135deg,#4f46e5,#3730a3)"
            : "#ffffff",
        color:
          item === "📄 GSTR1"
            ? "#ffffff"
            : "#334155",
        border:
          item === "📄 GSTR1"
            ? "none"
            : "1px solid #e2e8f0",
        borderRadius: "10px",
        fontWeight: "600",
        fontSize: "0.9rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow:
          item === "📄 GSTR1"
            ? "0 4px 14px rgba(79,70,229,0.25)"
            : "none"
      }}
      onMouseOver={(e) => {
        if (item !== "📄 GSTR1") {
          e.currentTarget.style.background = "#f8fafc";
        }
      }}
      onMouseOut={(e) => {
        if (item !== "📄 GSTR1") {
          e.currentTarget.style.background = "#ffffff";
        }
      }}
    >
      {item}
    </button>
  ))}
</div>

        {/* Selected Report Section */}
        {selectedReport && (
          <div style={{
            padding: "35px",
            background: "#f8f9ff",
            borderRadius: "18px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
          }}>
            <h3 style={{ color: "#4f46e5", marginBottom: "30px", fontSize: "1.8rem" }}>
              {selectedReport}
            </h3>

            <div style={{ display: "flex", gap: "30px", marginBottom: "35px", flexWrap: "wrap" }}>
              <div>
                <label style={{ display: "block", marginBottom: "10px", fontWeight: "600" }}>From Date</label>
                <input
                  type="date"
                  value={reportFromDate}
                  onChange={(e) => setReportFromDate(e.target.value)}
                  style={{ padding: "8px 10px", border: "1px solid #ddd", borderRadius: "10px", width: "220px", fontSize: "1rem" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "10px", fontWeight: "600" }}>To Date</label>
                <input
                  type="date"
                  value={reportToDate}
                  onChange={(e) => setReportToDate(e.target.value)}
                  style={{ padding: "8px 10px", border: "1px solid #ddd", borderRadius: "10px", width: "220px", fontSize: "1rem" }}
                />
              </div>
            </div>

            {/* Filters for GSTR-1 & GSTR-3B */}
            {isGSTR1or3B && (
              <div style={{ marginBottom: "30px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button onClick={() => setFilterView("all")}
                  style={{ padding: "12px 20px", background: filterView === "all" ? "#4f46e5" : "#e0e0e0", color: filterView === "all" ? "white" : "#333", border: "none", borderRadius: "10px", fontWeight: "600" }}>
                  All ({filingList.length})
                </button>
                <button onClick={() => setFilterView("filed")}
                  style={{ padding: "12px 20px", background: filterView === "filed" ? "#22c55e" : "#e0e0e0", color: filterView === "filed" ? "white" : "#333", border: "none", borderRadius: "10px", fontWeight: "600" }}>
                  Filed ({filedCount})
                </button>
                <button onClick={() => setFilterView("not_filed")}
                  style={{ padding: "12px 20px", background: filterView === "not_filed" ? "#ef4444" : "#e0e0e0", color: filterView === "not_filed" ? "white" : "#333", border: "none", borderRadius: "10px", fontWeight: "600" }}>
                  Not Filed ({notFiledCount})
                </button>
              </div>
            )}

            <button
              onClick={handleGenerateReport}
              style={{
                background: "#6D4AFF",
                color: "white",
                padding: "16px 50px",
                border: "none",
                borderRadius: "12px",
                fontSize: "1.2rem",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 8px 25px rgba(124,58,237,0.3)",
                transition: "all 0.3s ease",
              }}
            >
              Generate Report
            </button>

            {/* Generated Report */}
            {generatedReport && (
              <div style={{ marginTop: "40px" }}>
                <h4 style={{ color: "#4f46e5", marginBottom: "20px", fontSize: "1.5rem" }}>
                  {generatedReport.type}
                </h4>
                <div style={{
                  background: "white",
                  padding: "35px",
                  borderRadius: "16px",
                  border: "1px solid #eee",
                  whiteSpace: "pre-wrap",
                  fontFamily: "monospace",
                  fontSize: "1rem",
                  lineHeight: "1.9",
                  maxHeight: "520px",
                  overflowY: "auto",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                }}>
                  {generatedReport.content}
                </div>

                <div style={{ textAlign: "center", marginTop: "35px" }}>
                  <button
                    onClick={handleDownloadReport}
                    style={{
                      background: "#10b981",
                      color: "white",
                      padding: "18px 50px",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "14px",
                      boxShadow: "0 8px 25px rgba(16,185,129,0.3)",
                    }}
                  >
                    <HiDownload style={{ fontSize: "1.8rem" }} />
                    Download Report
                  </button>
                </div>
              </div>
            )}

            {/* Live Preview Table */}
            {isGSTR1or3B && !generatedReport && (
              <div style={{ marginTop: "40px", overflowX: "auto" }}>
                <h4 style={{ marginBottom: "20px", color: "#4f46e5" }}>Live Client Filing Preview</h4>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f0f0ff" }}>
                      <th style={{ padding: "16px", textAlign: "left" }}>Client Name</th>
                      <th style={{ padding: "16px", textAlign: "left" }}>GSTIN</th>
                      <th style={{ padding: "16px", textAlign: "left" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFilingList.map((item) => (
                      <tr key={item.sl} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "16px" }}>{item.name}</td>
                        <td style={{ padding: "16px" }}>{item.gstin}</td>
                        <td style={{ padding: "16px" }}>
                          <span style={{
                            padding: "8px 16px",
                            borderRadius: "30px",
                            fontWeight: "600",
                            background: item.status === "Filed" ? "#d4edda" : "#f8d7da",
                            color: item.status === "Filed" ? "#155724" : "#721c24",
                          }}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
  const NotificationsPage = ({ notifications = [], onMarkRead, onMarkAllRead }) => {
    const [filter, setFilter] = React.useState("all");

    // Load reminders from localStorage (set from calendar)
    const [calReminders, setCalReminders] = React.useState(() => {
      try { return JSON.parse(localStorage.getItem("gst_cal_reminders") || "[]"); } catch { return []; }
    });

    // Reload reminders whenever this page is shown
    React.useEffect(() => {
      try {
        const saved = JSON.parse(localStorage.getItem("gst_cal_reminders") || "[]");
        setCalReminders(saved);
      } catch { setCalReminders([]); }
    }, []);

    const deleteCalReminder = (id) => {
      const updated = calReminders.filter(r => r.id !== id);
      setCalReminders(updated);
      localStorage.setItem("gst_cal_reminders", JSON.stringify(updated));
      toast.success("Reminder deleted!");
    };

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    const typeMeta = (type) => {
      const t = (type || "Info").toLowerCase();
      if (t === "deadline") return { icon: "⏰", color: "#ef4444", tag: "Urgent" };
      if (t === "success") return { icon: "✅", color: "#16a34a", tag: "Filed" };
      if (t === "upload") return { icon: "📁", color: "#4f46e5", tag: "Upload" };
      if (t === "warning") return { icon: "⚠️", color: "#f59e0b", tag: "Action Needed" };
      if (t === "info") return { icon: "📊", color: "#4f46e5", tag: "Info" };
      return { icon: "🔔", color: "#64748b", tag: type || "Info" };
    };

    const timeAgo = (iso) => {
      if (!iso) return "";
      const then = new Date(iso);
      if (Number.isNaN(then.getTime())) return "";
      const secs = Math.floor((Date.now() - then.getTime()) / 1000);
      if (secs < 60) return "Just now";
      if (secs < 3600) return `${Math.floor(secs / 60)} min ago`;
      if (secs < 86400) return `${Math.floor(secs / 3600)} ${secs >= 7200 ? "hours" : "hour"} ago`;
      const days = Math.floor(secs / 86400);
      if (days === 1) return "Yesterday";
      if (days < 30) return `${days} days ago`;
      return then.toLocaleDateString();
    };

    const NotifView = ({ n }) => {
      const meta = typeMeta(n.notification_type);
      const isRead = !!n.is_read;
      return (
        <div key={n.id} onClick={() => onMarkRead && onMarkRead(n.id)} style={{
          background: isRead ? "#fafafa" : "#ffffff",
          border: `1px solid ${isRead ? "#f1f5f9" : "#e8edf5"}`,
          borderRadius: "12px",
          padding: "11px 14px",
          display: "flex", gap: "12px", alignItems: "center",
          cursor: "pointer", transition: "all 0.18s",
          boxShadow: isRead
            ? "0 1px 3px rgba(0,0,0,0.03)"
            : "0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
          position: "relative",
          opacity: isRead ? 0.78 : 1,
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.09)"; e.currentTarget.style.borderColor = "#d1d9e8"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = isRead ? "0 1px 3px rgba(0,0,0,0.03)" : "0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)"; e.currentTarget.style.borderColor = isRead ? "#f1f5f9" : "#e8edf5"; }}
        >
          {!isRead && (
            <span style={{
              position: "absolute", top: "10px", right: "12px",
              width: "7px", height: "7px", borderRadius: "50%",
              background: meta.color,
              boxShadow: `0 0 5px ${meta.color}`,
            }} />
          )}
          {/* Icon */}
          <div style={{
            width: "36px", height: "36px", minWidth: "36px",
            borderRadius: "10px",
            background: meta.color + "14",
            border: `1.5px solid ${meta.color}22`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.05rem",
            boxShadow: `0 2px 0 ${meta.color}18`,
            flexShrink: 0,
          }}>
            {meta.icon}
          </div>
          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "2px", flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>{n.title}</span>
              <span style={{
                padding: "1px 7px", borderRadius: "999px",
                background: meta.color + "18",
                color: meta.color,
                fontSize: "0.66rem", fontWeight: 700,
                border: `1px solid ${meta.color}33`,
              }}>{meta.tag}</span>
            </div>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b", lineHeight: 1.45 }}>{n.message}</p>
            <div style={{ marginTop: "3px", fontSize: "0.68rem", color: "#94a3b8", fontWeight: 500 }}>{timeAgo(n.created_at)}</div>
          </div>
        </div>
      );
    };

    const filtered = filter === "all"
      ? notifications
      : filter === "unread"
        ? notifications.filter((n) => !n.is_read)
        : notifications.filter((n) => (n.notification_type || "").toLowerCase() === filter);
    const unread = notifications.filter((n) => !n.is_read).length;
    return (
      <div style={{ padding: "20px 24px", background: "#f0f2f7", minHeight: "100vh", fontFamily: "inherit" }}>

        {/* ── CONTAINER 1: Notification Navbar ── */}
        <div style={{
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          padding: "14px 22px",
          marginBottom: "14px",
          boxShadow: "0 8px 24px rgba(148,163,184,0.16), 0 2px 6px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.03)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          position: "relative",
          zIndex: 2,
        }}>
          {/* Left: Title */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
              <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
                Notifications
              </h1>
            </div>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.78rem", fontWeight: 500 }}>
              {unread} unread · {notifications.length} total
            </p>
          </div>

          {/* Right: Filter pills + Mark all read */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
            {["all","unread","deadline","success","warning","info"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "5px 13px", borderRadius: "20px", cursor: "pointer",
                fontWeight: 600, fontSize: "0.74rem", border: "1px solid",
                borderColor: filter === f ? "#0f172a" : "#e2e8f0",
                background: filter === f ? "#0f172a" : "#ffffff",
                color: filter === f ? "#fff" : "#475569",
                boxShadow: filter === f
                  ? "0 3px 8px rgba(15,23,42,0.22), 0 1px 0 rgba(255,255,255,0.1)"
                  : "0 1px 3px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
                transition: "all 0.15s", textTransform: "capitalize",
              }}>
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            {unread > 0 && (
              <button onClick={onMarkAllRead} style={{
                padding: "5px 13px", borderRadius: "10px", cursor: "pointer",
                background: "linear-gradient(135deg, #f3f0ff, #ede9fe)",
                color: "#4f46e5",
                border: "1px solid #c4b5fd", fontWeight: 700, fontSize: "0.74rem",
                boxShadow: "0 2px 6px rgba(79,70,229,0.12), 0 1px 0 #c4b5fd",
                transition: "all 0.15s",
              }}>
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* ── CONTAINER 2: Notification List ── */}
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 16px rgba(148,163,184,0.12), 0 1px 4px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}>
          {/* List inner padding */}
          <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                <div style={{ fontSize: "2.2rem", marginBottom: "10px" }}>🔔</div>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>No notifications here</div>
              </div>
            )}
            {filtered.map(n => <NotifView key={n.id} n={n} />)}
          </div>
        </div>

        {/* Calendar Reminders Section */}
        {calReminders.length > 0 && (
          <div style={{ marginTop: "14px" }}>
            <div style={{
              background: "linear-gradient(180deg, #fffdf5 0%, #fffbeb 100%)",
              borderRadius: "16px",
              border: "1px solid #fde68a",
              overflow: "hidden",
              boxShadow: "0 4px 16px rgba(245,158,11,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
            }}>
              {/* Reminder header */}
              <div style={{ padding: "12px 18px 10px", borderBottom: "1px solid #fde68a33", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.1rem" }}>📌</span>
                <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#92400e" }}>Calendar Reminders</h2>
                <span style={{ background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a", borderRadius: "999px", padding: "2px 9px", fontSize: "0.68rem", fontWeight: 700, marginLeft: "4px" }}>
                  {calReminders.length} reminder{calReminders.length > 1 ? "s" : ""}
                </span>
              </div>
              <div style={{ padding: "10px 16px", display: "flex", flexDirection: "column", gap: "7px" }}>
                {[...calReminders].sort((a, b) => {
                  const dateA = new Date(a.year, a.month, a.day);
                  const dateB = new Date(b.year, b.month, b.day);
                  return dateA - dateB;
                }).map(r => (
                  <div key={r.id} style={{
                    background: "#ffffff",
                    border: "1px solid #fde68a",
                    borderRadius: "10px",
                    padding: "9px 13px",
                    display: "flex", alignItems: "center", gap: "12px",
                    boxShadow: "0 1px 4px rgba(245,158,11,0.08)",
                  }}>
                    <div style={{
                      width: "36px", height: "36px", minWidth: "36px",
                      borderRadius: "9px", background: "#eff6ff",
                      border: "1.5px solid #fde68a",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: "0.58rem", fontWeight: 700, color: "#92400e", lineHeight: 1 }}>{monthNames[r.month]}</span>
                      <span style={{ fontSize: "1rem", fontWeight: 800, color: "#92400e", lineHeight: 1 }}>{r.day}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.83rem", color: "#0f172a" }}>{r.text}</div>
                      <div style={{ fontSize: "0.68rem", color: "#92400e", marginTop: "1px", fontWeight: 500 }}>
                        {r.day} {monthNames[r.month]} {r.year}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteCalReminder(r.id)}
                      style={{
                        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)",
                        borderRadius: "6px", color: "#ef4444", padding: "3px 9px",
                        cursor: "pointer", fontSize: "0.7rem", fontWeight: 700,
                        transition: "all 0.15s", flexShrink: 0,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.16)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };

  

  // Notification preferences state
  

  

  const [selectedSetting, setSelectedSetting] = useState("profile");

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

 

  const handleChangePassword = () => {
    if (!passwordForm.current || !passwordForm.newPass || !passwordForm.confirm) {
      toast.error("All fields are required!");
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast.error("New password and confirmation do not match!");
      return;
    }
    if (passwordForm.newPass.length < 6) {
      toast.error("New password must be at least 6 characters!");
      return;
    }
    toast.success("Password changed successfully!");
    setPasswordForm({ current: "", newPass: "", confirm: "" });
  };

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    whatsapp: true,
    dueReminders: true,
    voucherAlerts: true,
    reportAlerts: false,
  });

  const toggleNotification = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
    toast.success(`${key.replace(/([A-Z])/g, ' $1').trim()} notifications ${!notifications[key] ? "enabled" : "disabled"}`);
  };
const SettingsPage = ({ allClients = [] }) => {
  const [selectedSetting, setSelectedSetting] = React.useState('profile');
  const [profileForm, setProfileForm] = React.useState({
    name: user.name || user.first_name || '', dob: user.dob || user.date_of_birth || '', gender: user.gender || '', company: user.company || '', gstin: user.gstin || '', email: user.email || '', mobile: user.mobile || '', phone: user.phone || '', address: user.address || '', state: user.state || '', pincode: user.pincode || '',
  });
  const [passwordForm, setPasswordForm] = React.useState({ current: '', newPass: '', confirm: '' });
  const [showPass, setShowPass] = React.useState({ current: false, newPass: false, confirm: false });
  const [notifs, setNotifs] = React.useState({
    email: true, sms: false, whatsapp: true, dueReminders: true, voucherAlerts: true, reportAlerts: false, loginAlerts: true, paymentAlerts: true,
  });
  React.useEffect(() => {
    fetchNotificationPreferences().then((p) => {
      setNotifs({
        email: !!p.email, sms: !!p.sms, whatsapp: !!p.whatsapp, dueReminders: !!p.due_reminders,
        voucherAlerts: !!p.voucher_alerts, reportAlerts: !!p.report_alerts, loginAlerts: !!p.login_alerts, paymentAlerts: !!p.payment_alerts,
      });
    }).catch(() => {});
  }, []);
  const toggleNotif = (key) => {
    const map = {
      email: "email", sms: "sms", whatsapp: "whatsapp", dueReminders: "due_reminders",
      voucherAlerts: "voucher_alerts", reportAlerts: "report_alerts", loginAlerts: "login_alerts", paymentAlerts: "payment_alerts",
    };
    const next = !notifs[key];
    setNotifs(prev => ({ ...prev, [key]: next }));
    updateNotificationPreferences({ [map[key]]: next }).then(() => {
      toast.success(`${key.replace(/([A-Z])/g, ' $1').trim()} notifications ${next ? "enabled" : "disabled"}`);
    }).catch(() => {
      setNotifs(prev => ({ ...prev, [key]: !next }));
      toast.error("Failed to update preferences.");
    });
  };
  const [plans, setPlans] = React.useState([]);
  const [subscription, setSubscription] = React.useState(null);
  const [payments, setPayments] = React.useState([]);
  const [billingLoading, setBillingLoading] = React.useState(true);
  const planClientsCount = (() => {
    const raw = subscription?.plan?.clients;
    if (!raw) return null;
    const t = String(raw).trim().toLowerCase();
    if (["unlimited", "-", "n/a"].includes(t)) return Infinity;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : Infinity;
  })();
  const usedClients = allClients.filter(c => c.status === "active").length;
  const formatBillingDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return d;
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  const planPeriodLabel = (split = "/") => {
    const sub = subscription?.plan;
    if (!sub) return "";
    const price = `${sub.currency === "INR" ? "₹" : (sub.currency || "₹")}${Number(sub.price).toLocaleString("en-IN")}`;
    let per = sub.period;
    if (sub.period === "custom") per = `${sub.custom_days || "—"} days`;
    if (sub.period === "month") per = "month";
    if (sub.period === "year") per = "year";
    return `${price} ${split} ${per}`;
  };
  const refreshBilling = () => {
    setBillingLoading(true);
    Promise.all([fetchPlans(), fetchMySubscription(), fetchPayments()])
      .then(([p, s, pms]) => { setPlans(p); setSubscription(s); setPayments(pms); })
      .catch(() => {})
      .finally(() => setBillingLoading(false));
  };
  React.useEffect(() => { refreshBilling(); }, []);
  const saveProfile = async () => {
    const nameStr = (profileForm.name || "").trim();
    const parts = nameStr.split(/\s+/).filter(Boolean);
    const first = parts[0] || "";
    const last = parts.slice(1).join(" ") || "";
    const payload = {
      first_name: first,
      last_name: last,
      email: profileForm.email || "",
      gender: profileForm.gender || "",
      date_of_birth: profileForm.dob || null,
      mobile: profileForm.mobile || "",
      phone: profileForm.phone || "",
      company: profileForm.company || "",
      gstin: profileForm.gstin || "",
      address: profileForm.address || "",
      state: profileForm.state || "",
      pincode: profileForm.pincode || "",
    };
    try {
      const updated = await updateProfile(payload);
      const stored = getStoredUser();
      const fresh = { ...(stored || {}), ...updated, name: updated.name || nameStr };
      setUser(fresh);
      saveSession({ user: fresh });
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to save profile. Please try again.');
    }
  };
  const changePassword = async () => {
    if (!passwordForm.current || !passwordForm.newPass || !passwordForm.confirm) { toast.error('All fields required!'); return; }
    if (passwordForm.newPass !== passwordForm.confirm) { toast.error('Passwords do not match!'); return; }
    if (passwordForm.newPass.length < 8) { toast.error('Min 8 characters required!'); return; }
    try {
      const res = await changeUserPassword({
        current_password: passwordForm.current,
        new_password: passwordForm.newPass,
        confirm_password: passwordForm.confirm,
      });
      toast.success(res.detail || 'Password changed successfully!');
      setPasswordForm({ current: '', newPass: '', confirm: '' });
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || 'Failed to change password.';
      toast.error(msg);
    }
  };
  const tabs = [
    { key: 'profile', label: 'Profile', emoji: '👤' },
    { key: 'security', label: 'Security', emoji: '🔒' },
    { key: 'notifications', label: 'Notifications', emoji: '🔔' },
    { key: 'billing', label: 'Billing', emoji: '💳' },
  ];
  const iSt = {
    width: "100%", padding: "10px 13px", borderRadius: "10px",
    border: "1.5px solid #e2e8f0", fontSize: "0.875rem", background: "#f8fafc",
    outline: "none", fontFamily: "inherit", color: "#0f172a",
    boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s",
  };
  const lSt = {
    display: "block", marginBottom: "5px", fontWeight: 600,
    fontSize: "0.72rem", color: "#64748b", letterSpacing: "0.04em", textTransform: "uppercase",
  };
  const fSt = { marginBottom: "14px" };
  const focusStyle = (e) => { e.target.style.borderColor = "#4f46e5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.12)"; };
  const blurStyle = (e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f7", padding: "20px 24px", fontFamily: "inherit" }}>

      {/* ── CONTAINER 1: Settings Navbar ── */}
      <div style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        padding: "14px 22px",
        marginBottom: "14px",
        boxShadow: "0 8px 24px rgba(148,163,184,0.16), 0 2px 6px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.03)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        position: "relative",
        zIndex: 2,
      }}>
        {/* Left: Title */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
            <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
              Settings
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}>
            Manage your account, security &amp; billing preferences
          </p>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={() => {
            toast.success("Logged out!");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
          }}
          style={{
            display: "flex", alignItems: "center", gap: "7px",
            padding: "7px 15px",
            background: "linear-gradient(180deg, #ffffff 0%, #fef2f2 100%)",
            color: "#991b1b",
            border: "1px solid #fecaca",
            borderRadius: "10px",
            fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 10px rgba(239,68,68,0.12), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -2px 0 rgba(0,0,0,0.04)",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(180deg, #fff1f2 0%, #fee2e2 100%)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(180deg, #ffffff 0%, #fef2f2 100%)"; }}
        >
          <HiLogout style={{ fontSize: "0.95rem" }} />
          Sign Out
        </button>
      </div>

      {/* ── CONTAINER 2: Tab Nav Bar ── */}
      <div style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
        borderRadius: "14px",
        border: "1px solid #e2e8f0",
        padding: "6px 16px",
        marginBottom: "14px",
        boxShadow: "0 4px 14px rgba(148,163,184,0.12), 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
        display: "flex",
        gap: "2px",
        alignItems: "center",
        flexWrap: "wrap",
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedSetting(tab.key)}
            style={{
              padding: "9px 18px",
              background: selectedSetting === tab.key
                ? "linear-gradient(135deg, #f3f0ff, #ede9fe)"
                : "none",
              border: "none",
              borderBottom: selectedSetting === tab.key ? "2.5px solid #4f46e5" : "2.5px solid transparent",
              borderRadius: selectedSetting === tab.key ? "8px 8px 0 0" : "0",
              color: selectedSetting === tab.key ? "#4f46e5" : "#64748b",
              fontWeight: selectedSetting === tab.key ? 700 : 500,
              fontSize: "0.84rem",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: "6px",
              transition: "all 0.15s",
              outline: "none",
              boxShadow: selectedSetting === tab.key
                ? "0 2px 8px rgba(79,70,229,0.10)"
                : "none",
            }}
            onMouseEnter={e => {
              if (selectedSetting !== tab.key) {
                e.currentTarget.style.color = "#0f172a";
                e.currentTarget.style.background = "#f8fafc";
              }
            }}
            onMouseLeave={e => {
              if (selectedSetting !== tab.key) {
                e.currentTarget.style.color = "#64748b";
                e.currentTarget.style.background = "none";
              }
            }}
            onFocus={e => { e.currentTarget.style.outline = "none"; e.currentTarget.style.boxShadow = selectedSetting === tab.key ? "0 2px 8px rgba(79,70,229,0.10)" : "none"; }}
          >
            <span>{tab.emoji}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* ── CONTAINER 3: Settings Content ── */}
      <div style={{ padding: "0" }}>

        {/* ── PROFILE ── */}
        {selectedSetting === "profile" && (
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            {/* Profile banner */}
           <div style={{ 
  background: "#ffffff",
  padding: "9px 20px",
  position: "relative",
  boxShadow: "2px 14px 25px rgba(0,0,0,0.08)",
  borderBottom: "1px solid rgba(0,0,0,0.06)",
  height: "70px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between"
}}>
  
  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
    <div style={{
  width: "42px",
  height: "42px",
  borderRadius: "12px",
  background: "#6D4AFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontWeight: 800,
  fontSize: "1.1rem",
  flexShrink: 0,

  // 3D EFFECT
  background: "#6D4AFF",
}}>
  {(profileForm.name || user.name || "U").charAt(0).toUpperCase()}
</div>
    <div>
      <div style={{ color: "#111827", fontWeight: 800, fontSize: "0.95rem" }}>
        {profileForm.name || user.name || "User"}
      </div>
      <div style={{ color: "#6b7280", fontSize: "0.72rem", marginTop: "2px" }}>
        {user.role || "Administrator"}
      </div>
    </div>
  </div>

  <div style={{
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "4px 10px",
  borderRadius: "999px",
  background: "#ffffff",
  border: "1px solid rgba(0,0,0,0.08)",
  fontSize: "0.7rem",
  fontWeight: 700,
  color: "#16a34a"
}}>
  
  <span
    style={{
      width: "7px",
      height: "7px",
      borderRadius: "50%",
      background: "#16a34a",
      animation: "blink 1s infinite"
    }}
  />

  ACTIVE ACCOUNT

  <style>
    {`
      @keyframes blink {
        0% { opacity: 1; }
        50% { opacity: 0.2; }
        100% { opacity: 1; }
      }
    `}
  </style>

</div>
</div>
            <div style={{ padding: "24px 28px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 20px" }}>
                {[
                  { name: "name", label: "Full Name", placeholder: "Your full name" },
                  { name: "email", label: "Email Address", placeholder: "email@example.com", type: "email" },
                  { name: "mobile", label: "Mobile Number", placeholder: "+91 XXXXX XXXXX" },
                  { name: "company", label: "Company / Firm Name", placeholder: "Firm name" },
                  { name: "gstin", label: "GSTIN", placeholder: "27AAACC1234A1Z5", mono: true },
                  { name: "phone", label: "Office Phone", placeholder: "080-XXXXXXXX" },
                  { name: "address", label: "Address", placeholder: "Street, area" },
                  { name: "state", label: "State", placeholder: "e.g. Maharashtra" },
                  { name: "pincode", label: "PIN Code", placeholder: "6-digit PIN" },
                ].map(f => (
                  <div key={f.name} style={fSt}>
                    <label style={lSt}>{f.label}</label>
                    <input name={f.name} type={f.type || "text"} value={profileForm[f.name] || ""} placeholder={f.placeholder}
                      onChange={e => setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                      style={{ ...iSt, fontFamily: f.mono ? "monospace" : "inherit", letterSpacing: f.mono ? "0.05em" : "normal" }}
                      onFocus={focusStyle} onBlur={blurStyle} />
                  </div>
                ))}
                <div style={fSt}>
                  <label style={lSt}>Date of Birth</label>
                  <input name="dob" type="date" value={profileForm.dob || ""} onChange={e => setProfileForm(prev => ({ ...prev, dob: e.target.value }))} style={iSt} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <div style={fSt}>
                  <label style={lSt}>Gender</label>
                  <select name="gender" value={profileForm.gender || ""} onChange={e => setProfileForm(prev => ({ ...prev, gender: e.target.value }))} style={{ ...iSt, cursor: "pointer" }}>
                    <option value="">Select gender</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </div>
              <button onClick={saveProfile}
                style={{ padding: "10px 28px", background: "linear-gradient(135deg, #4f46e5, #3730a3)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "0.87rem", cursor: "pointer", boxShadow: "0 4px 14px rgba(79,70,229,0.3)", transition: "all 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 20px rgba(79,70,229,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(79,70,229,0.3)"; }}
              >Save Profile</button>
            </div>
          </div>
        )}

       {/* ── SECURITY ── */}
{selectedSetting === "security" && (
  <div style={{
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 14px 25px rgba(0,0,0,0.08)",
    overflow: "hidden"
  }}>


  

    {/* Header */}
   <div
  style={{
    padding: "22px 28px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  }}
>
  <div
    style={{
      width: "44px",
      height: "44px",
      borderRadius: "12px",
      background: "#f3f0ff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#4f46e5",
      fontSize: "20px",
      fontWeight: 700,
    }}
  >
    🔒
  </div>

  <div>
    <h3
      style={{
        margin: 0,
        fontSize: "18px",
        fontWeight: 700,
        color: "#111827",
      }}
    >
      Change Password
    </h3>

    <p
      style={{
        margin: "4px 0 0",
        color: "#6b7280",
        fontSize: "13px",
      }}
    >
      Update your account password securely
    </p>
  </div>
</div>
    {/* Form */}
    <div
  style={{
    padding: "24px 28px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "20px",
    alignItems: "start",
  }}
>
      {[
        { key: "current", label: "Current Password", placeholder: "Enter current password" },
        { key: "newPass", label: "New Password", placeholder: "Minimum 6 characters" },
        { key: "confirm", label: "Confirm New Password", placeholder: "Repeat new password" },
      ].map(f => (
        <div key={f.key} style={fSt}>
          <label style={lSt}>{f.label}</label>

          <div style={{ position: "relative" }}>
            <input
              type={showPass[f.key] ? "text" : "password"}
              value={passwordForm[f.key]}
              onChange={e =>
                setPasswordForm(prev => ({ ...prev, [f.key]: e.target.value }))
              }
              placeholder={f.placeholder}
              style={{ ...iSt, paddingRight: "40px" }}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />

            <button
              onClick={() =>
                setShowPass(p => ({ ...p, [f.key]: !p[f.key] }))
              }
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b"
              }}
            >
              {showPass[f.key] }
            </button>
          </div>
        </div>
      ))}

</div>

<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    padding: "0 28px 24px",
  }}
>
  <button
    onClick={changePassword}
    style={{
      width: "180px",
      height: "46px",
      border: "none",
      borderRadius: "10px",
      background: "linear-gradient(135deg,#4f46e5,#3730a3)",
      color: "#fff",
      fontWeight: 700,
      cursor: "pointer"
    }}
  >
    Update Password
  </button>
</div>
    {/* 2FA BOX */}
   
  </div>
)}
        {/* ── NOTIFICATIONS ── */}
        {selectedSetting === "notifications" && (
  <div style={{
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    overflow: "hidden"
  }}>

    {/* Header */}
    <div style={{
      padding: "18px 24px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      background: "#ffffff",
      borderBottom: "1px solid rgba(0,0,0,0.06)",
      boxShadow: "0 6px 14px rgba(0,0,0,0.06)"
    }}>
      <div style={{
        width: "42px",
        height: "42px",
        borderRadius: "12px",
        background: "#f59e0b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: "1.1rem",
        
      }}>
        🔔
      </div>

      <div>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>
          Notification Preferences
        </h3>
        <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#64748b" }}>
          Control alerts, emails & updates
        </p>
      </div>
    </div>
            <div style={{ padding: "20px 28px" }}>
              {[
                { key: "email", label: "Email Notifications", desc: "Receive updates and alerts via email", icon: "📧" },
                { key: "sms", label: "SMS Alerts", desc: "Get SMS for urgent deadlines", icon: "💬" },
                { key: "whatsapp", label: "WhatsApp Messages", desc: "Notifications on WhatsApp", icon: "📱" },
                { key: "dueReminders", label: "Due Date Reminders", desc: "Alerts 3 days before filing deadlines", icon: "⏰" },
                { key: "voucherAlerts", label: "Voucher Alerts", desc: "Notify when vouchers are uploaded or created", icon: "📋" },
                { key: "reportAlerts", label: "Report Ready Alerts", desc: "When reports are generated or ready", icon: "📊" },
                { key: "loginAlerts", label: "Login Security Alerts", desc: "Alert on new login from unknown device", icon: "🛡️" },
                { key: "paymentAlerts", label: "Payment Notifications", desc: "Confirm billing and payment transactions", icon: "💳" },
              ].map(item => (
                <div key={item.key} onClick={() => toggleNotif(item.key)}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", marginBottom: "8px", background: notifs[item.key] ? "#f3f0ff" : "#f8fafc", border: `1.5px solid ${notifs[item.key] ? "#c4b5fd" : "#e2e8f0"}`, borderRadius: "12px", cursor: "pointer", transition: "all 0.2s", boxShadow: notifs[item.key] ? "0 2px 8px rgba(79,70,229,0.08)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: notifs[item.key] ? "#ede9fe" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#0f172a" }}>{item.label}</div>
                      <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: "1px" }}>{item.desc}</div>
                    </div>
                  </div>
                  <div style={{ width: "42px", height: "23px", borderRadius: "12px", background: notifs[item.key] ? "#4f46e5" : "#cbd5e1", position: "relative", transition: "background 0.25s", flexShrink: 0, boxShadow: notifs[item.key] ? "0 3px 10px rgba(79,70,229,0.4)" : "none" }}>
                    <div style={{ width: "17px", height: "17px", borderRadius: "50%", background: "#fff", position: "absolute", top: "3px", left: notifs[item.key] ? "22px" : "3px", transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BILLING ── */}
        {selectedSetting === "billing" && (
         <div>
  {/* PREMIUM WHITE 3D NAVBAR */}
  <div
    
  >
    

  </div>

  {/* Current Plan Card */}
 <div
  style={{
    background: "#ffffff",
    borderRadius: "18px",
    padding: "12px 18px",
    marginBottom: "18px",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 10px 24px rgba(148,163,184,0.16), 0 4px 10px rgba(148,163,184,0.08)",
    position: "relative",
    overflow: "hidden",
  }}
>
  {/* HEADER */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "14px",
      position: "relative",
      zIndex: 2,
    }}
  >
    {/* LEFT */}
    <div>
      <div
        style={{
          fontSize: "0.62rem",
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "2px",
          fontWeight: 700,
        }}
      >
        Current Active Plan
      </div>

      <div
        style={{
          fontSize: "1.45rem",
          fontWeight: 800,
          color: "#0f172a",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
        }}
      >
        {subscription?.plan?.name || (billingLoading ? "Loading..." : "No plan")}
      </div>

      <div
        style={{
          fontSize: "0.74rem",
          color: "#64748b",
          marginTop: "3px",
          fontWeight: 500,
        }}
      >
        {subscription?.plan
          ? `${planPeriodLabel("/")}`
          : (billingLoading ? "Loading..." : "Select a plan below")}
      </div>

      <div
        style={{
          fontSize: "0.7rem",
          color: subscription?.status === "expired" ? "#dc2626" : "#94a3b8",
          marginTop: "3px",
          fontWeight: 600,
        }}
      >
        {subscription?.status === "expired"
          ? `Expired on ${formatBillingDate(subscription.renews_at)}`
          : subscription?.renews_at
            ? `Renews on ${formatBillingDate(subscription.renews_at)}${
                subscription.days_left != null
                  ? ` · ${subscription.days_left} days left`
                  : ""
              }`
            : ""}
      </div>
    </div>

    {/* ACTIVE STATUS */}
    <span
      style={{
        background: "#ffffff",
        color: subscription?.status === "expired" ? "#dc2626" : "#16a34a",
        padding: "5px 14px",
        borderRadius: "999px",
        fontSize: "0.7rem",
        fontWeight: 800,
        border:
          subscription?.status === "expired"
            ? "1px solid #fecaca"
            : "1px solid #bbf7d0",
        boxShadow:
          subscription?.status === "expired"
            ? "0 4px 12px rgba(239,68,68,0.16)"
            : "0 4px 12px rgba(34,197,94,0.16), inset 0 1px 1px rgba(255,255,255,0.9)",
        animation: subscription?.status === "expired" ? "none" : "blink 1s infinite",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: subscription?.status === "expired" ? "#ef4444" : "#22c55e",
          boxShadow:
            subscription?.status === "expired"
              ? "0 0 10px #ef4444"
              : "0 0 10px #22c55e",
        }}
      />
      {subscription?.status === "expired" ? "EXPIRED" : "ACTIVE"}
    </span>
  </div>

  {/* 3D BOXES */}
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "12px",
      position: "relative",
      zIndex: 2,
    }}
  >
    {[
      [subscription?.plan?.clients || "0", "Clients"],
      [subscription?.plan?.users || "0", "Users"],
    ].map(([val, lbl]) => (
      <div
        key={lbl}
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          padding: "12px",
          textAlign: "center",
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 8px 18px rgba(148,163,184,0.16), 0 2px 8px rgba(148,163,184,0.08), inset 0 1px 1px rgba(255,255,255,0.9)",
          transition: "all 0.25s ease",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow =
            "0 14px 28px rgba(148,163,184,0.22)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow =
            "0 8px 18px rgba(148,163,184,0.16)";
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: "1.05rem",
            color: "#0f172a",
            lineHeight: 1.1,
          }}
        >
          {val}
        </div>

        <div
          style={{
            fontSize: "0.68rem",
            color: "#64748b",
            marginTop: "4px",
            fontWeight: 600,
          }}
        >
          {lbl}
          {lbl === "Clients" && (
            <span
              style={{
                fontSize: "0.68rem",
                color: "#94a3b8",
                fontWeight: 600,
              }}
            >
              {" "}
              · {usedClients} used
              {planClientsCount && planClientsCount !== Infinity
                ? ` / ${planClientsCount}`
                : ""}
            </span>
          )}
        </div>
      </div>
    ))}
  </div>

  {/* BLINK ANIMATION */}
  <style>
    {`
      @keyframes blink {
        0% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.45;
          transform: scale(1.04);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }
    `}
  </style>
</div>
  {/* Plan Comparison */}
  <div
    style={{
      background: "#ffffff",
      borderRadius: "22px",
      border: "1px solid #e2e8f0",
      overflow: "hidden",
      marginBottom: "20px",
      boxShadow:
        "0 16px 36px rgba(148,163,184,0.16), 0 6px 14px rgba(148,163,184,0.1)",
    }}
  >
    <div
      style={{
        padding: "18px 26px",
        borderBottom: "1px solid #f1f5f9",
        background: "#ffffff",
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: "1rem",
          fontWeight: 800,
          color: "#0f172a",
        }}
      >
        Available Plans
      </h3>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "20px",
        padding: "24px",
      }}
    >
      {(billingLoading ? [] : plans).map((plan) => (
        <div
          key={plan.name}
          style={{
            borderRadius: "20px",
            border: "1px solid #dbeafe",
            padding: "22px",
            position: "relative",
            background: "#f3f0ff",
            color: "#4f46e5",
            boxShadow: "0 20px 45px rgba(79,70,229,0.18)",
            transition: "all 0.3s ease",
            transform: (subscription?.plan?.id === plan.id) ? "translateY(-4px)" : "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 22px 44px ${plan.color}30`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = (subscription?.plan?.id === plan.id)
              ? "translateY(-4px)"
              : "translateY(0px)";
            e.currentTarget.style.boxShadow = (subscription?.plan?.id === plan.id)
              ? `0 18px 38px ${plan.color}25`
              : "0 10px 24px rgba(148,163,184,0.14)";
          }}
        >
          {(subscription?.plan?.id === plan.id) && (
            <span
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                background: plan.color,
                color: "#fff",
                fontSize: "0.65rem",
                fontWeight: 800,
                padding: "4px 10px",
                borderRadius: "999px",
                animation: "blink 1.2s infinite",
                boxShadow: `0 0 14px ${plan.color}`,
              }}
            >
              CURRENT
            </span>
          )}

          <div
            style={{
              fontWeight: 800,
              fontSize: "1.1rem",
              color: "#0f172a",
              marginBottom: "6px",
            }}
          >
            {plan.name}
          </div>

          <div
            style={{
              fontSize: "1.7rem",
              fontWeight: 800,
              color: plan.color,
            }}
          >
            {plan.currency === "INR" ? "₹" : (plan.currency || "₹")}{Number(plan.price).toLocaleString("en-IN")}
            <span
              style={{
                fontSize: "0.8rem",
                color: "#64748b",
                fontWeight: 600,
              }}
            >
              /{plan.period === "custom" ? `${plan.custom_days || "—"} days` : (plan.period === "year" ? "year" : "month")}
            </span>
          </div>

          <div
            style={{
              marginTop: "16px",
              fontSize: "0.8rem",
              color: "#475569",
            }}
          >
            {[
              ["Clients", plan.clients],
              
              ["Users", plan.users],
              
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <span style={{ color: "#94a3b8" }}>{k}</span>

                <span
                  style={{
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              if (subscription?.plan?.id === plan.id) {
                toast.info("You are already on this plan!");
              } else {
                selectPlan(plan.id)
                  .then((res) => {
                    toast.success(`Plan updated to ${res.name}!`);
                    refreshBilling();
                  })
                  .catch(() => toast.error("Failed to update plan."));
              }
            }}
            style={{
              marginTop: "18px",
              width: "100%",
              padding: "10px",
              borderRadius: "12px",
              background: (subscription?.plan?.id === plan.id) ? "#f3f0ff" : plan.color,
              color: (subscription?.plan?.id === plan.id) ? plan.color : "#fff",
              border: `1px solid ${
                (subscription?.plan?.id === plan.id) ? "#c4b5fd" : plan.color
              }`,
              fontWeight: 800,
              fontSize: "0.82rem",
              cursor: (subscription?.plan?.id === plan.id) ? "default" : "pointer",
              boxShadow: (subscription?.plan?.id === plan.id)
                ? "0 6px 14px rgba(79,70,229,0.12)"
                : `0 10px 20px ${plan.color}30`,
              transition: "all 0.25s ease",
            }}
          >
            {(subscription?.plan?.id === plan.id)
              ? "Current Plan"
              : `Upgrade to ${plan.name}`}
          </button>
        </div>
      ))}
    </div>
  </div>
            {/* Payment History */}
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Payment History</h3>
                <button onClick={refreshBilling} style={{ fontSize: "0.72rem", padding: "5px 12px", background: "#f3f0ff", color: "#4f46e5", border: "1px solid #c4b5fd", borderRadius: "7px", cursor: "pointer", fontWeight: 700 }}>↻ Refresh</button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Date", "Invoice #", "Plan", "Amount", "Status", "Action"].map(h => (
                        <th key={h} style={{ padding: "11px 18px", textAlign: "left", fontSize: "0.73rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {billingLoading ? (
                      <tr><td colSpan={6} style={{ padding: "22px 18px", textAlign: "center", fontSize: "0.85rem", color: "#94a3b8" }}>Loading payment history...</td></tr>
                    ) : payments.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: "22px 18px", textAlign: "center", fontSize: "0.85rem", color: "#94a3b8" }}>No payments yet. Upgrade a plan to create an invoice.</td></tr>
                    ) : payments.map((row, i) => {
                      const paid = row.status === "paid";
                      const amt = `${row.currency === "INR" ? "₹" : (row.currency || "₹")}${Number(row.amount).toLocaleString("en-IN")}`;
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ padding: "12px 18px", fontSize: "0.85rem", color: "#475569" }}>{row.paid_at || "—"}</td>
                          <td style={{ padding: "12px 18px", fontSize: "0.85rem", fontFamily: "monospace", color: "#0f172a", fontWeight: 600 }}>{row.invoice_no}</td>
                          <td style={{ padding: "12px 18px", fontSize: "0.85rem", color: "#0f172a" }}>{row.plan}</td>
                          <td style={{ padding: "12px 18px", fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>{amt}</td>
                          <td style={{ padding: "12px 18px" }}>
                            <span style={{ padding: "3px 10px", borderRadius: "999px", background: paid ? "#dcfce7" : "#fef3c7", color: paid ? "#15803d" : "#b45309", fontSize: "0.73rem", fontWeight: 700 }}>{paid ? "✓ Paid" : row.status}</span>
                          </td>
                          <td style={{ padding: "12px 18px" }}><button onClick={() => toast.success(`Invoice ${row.invoice_no} download initiated!`)} style={{ fontSize: "0.78rem", padding: "5px 12px", background: "#f3f0ff", color: "#4f46e5", border: "1px solid #bfdbfe", borderRadius: "7px", cursor: "pointer", fontWeight: 600 }}>Download</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

let pageContent;

switch (location.pathname) {
  case "/user":
    pageContent = (
      <DashboardHome
        allClients={allClients}
        addClient={addClient}
        navigate={navigate}
        setSelectedClient={setSelectedClient}
        openAddClientModal={openAddClientModal}
      />
    );
    break;

case "/user/clients":
  pageContent = (
    <ClientsPage
      allClients={allClients}
      clientViewMode={clientViewMode}
      setClientViewMode={setClientViewMode}
      selectedClient={selectedClient}
      setSelectedClient={setSelectedClient}
      activateClient={activateClient}
      deactivateClient={deactivateClient}
      deleteClient={deleteClient}
      setConfirmModal={setConfirmModal}
      addClient={addClient}
      openAddClientModal={openAddClientModal}
    />
  );
  break;

  
  case "/user/returns":
    pageContent = <GSTReturnsPage />;
    break;
case "/user/gst-return":
  pageContent = (
    <>
    

      {step === 'detail' ? (
        <DetailedGSTView
          formType={selectedForm}
          fy={selectedFY}
          period={selectedPeriod}
          onBack={() => setStep('summary')}
        />
      ) : step === 'summary' ? (
        <ReturnsSummaryScreen
          fy={selectedFY}
          quarter={selectedQuarter}
          period={selectedPeriod}
          onBack={() => setStep('selection')}
          onViewForm={(form) => {
            setSelectedForm(form);
            setStep('detail');
          }}
        />
      ) : (
        <GSTReturnPeriodSelection
          selectedFY={selectedFY}
          setSelectedFY={setSelectedFY}
          selectedQuarter={selectedQuarter}
          setSelectedQuarter={setSelectedQuarter}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          onSearch={() => setStep('summary')}
        />
      )}
    </>
  );
  break;
  
  case "/user/news-updates":                         // ← Yeh add karo
    pageContent = <NewsAndUpdates />;              // ← Tumhara naya component
    break;

  

  case "/user/notifications":
    pageContent = <NotificationsPage notifications={notificationsList} onMarkRead={handleMarkNotificationRead} onMarkAllRead={handleMarkAllRead} />;
    break;

  case "/user/settings":
    pageContent = <SettingsPage allClients={allClients} />;
    break;

  default:
    pageContent = (
      <DashboardHome
        allClients={allClients}
        addClient={addClient}
        navigate={navigate}
        setSelectedClient={setSelectedClient}
        openAddClientModal={openAddClientModal}
      />
    );
}

useEffect(() => {
    if (step === 'detail') {
      setIsModalOpen(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsModalOpen(false);
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [step]);


  return (
    <>
      {/* cursor-stable: will-change:transform only on elements that actually animate */}
      <style>{`
        button { cursor: pointer; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes deepBlink {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px 3px #16a34a, 0 0 16px 6px #16a34a88; }
          50% { opacity: 0.15; box-shadow: none; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.18); }
        }
        .nav-user-btn:hover { background: #e2e8f0 !important; }
        .nav-bell-btn:hover { background: #e2e8f0 !important; }
        .nav-drop-item:hover { background: rgba(79,70,229,0.07) !important; }
        /* Dot matrix glow on nav button hover */
        button:hover .dot-matrix-nav { opacity: 0.75 !important; filter: drop-shadow(0 0 2px rgba(165,180,252,0.8)); transition: opacity 0.2s, filter 0.2s; }
        @media (max-width: 768px) {
          .dot-matrix-nav { display: none !important; }
        }
      `}</style>
      <ToastContainer position="top-right" autoClose={3000} closeOnClick pauseOnHover theme="light" />
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
  {!sidebarCollapsed && (
    <img
      src="/tax.jpg"
      alt="SmartGST"
      style={{
        width: "110px",
        filter: "brightness(1.3)"
      }}
    />
  )}

<button
  className="toggle-sidebar-btn"
  onClick={toggleSidebar}
>
  {sidebarCollapsed ? "❯" : "❮"}
</button>
</div>
        
       <ul className="sidebar-menu">
  {menuItems.map((item) => (
    <li className="sidebar-item" key={item.link}>
      <Link to={item.link} className="sidebar-link">
        {item.icon && (
          <item.icon 
            style={{ 
              fontSize: '1.35rem', 
              minWidth: '22px',
              flexShrink: 0,
            }} 
          />
        )}
        <span className="sidebar-text" style={{display:"flex",alignItems:"center",gap:"6px",flex:1}}>
          {item.text}
          <span style={{display:"grid",gridTemplateColumns:"repeat(3,2.5px)",gap:"2.5px",opacity:0.4,marginLeft:"auto",pointerEvents:"none"}}>
            {Array.from({length:9}).map((_,i)=>(
              <span key={i} style={{width:"2.5px",height:"2.5px",borderRadius:"50%",background:"#a5b4fc",display:"block"}}/>
            ))}
          </span>
        </span>
      </Link>
    </li>
  ))}
</ul>

        {/* Support Card */}
        <div className="sidebar-support-card">
          <div className="support-icon">🎧</div>
          <h4>Need Help?</h4>
          <p>Check our documentation or contact support</p>
          <button
            className="sidebar-support-btn"
            onClick={() => setShowContactModal(true)}
          >
            <HiPhone style={{ fontSize: "0.95rem" }} />
            Contact Support
          </button>
        </div>

        <div className="sidebar-footer">
          © 2026 TaxMate. All rights reserved.
        </div>
      </aside>
     <main className={`dashboard-main ${sidebarCollapsed ? "collapsed" : ""}`}>

      <header
        className="dashboard-navbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 30px",
          height: "82px",
          background: "linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)",
          borderBottom: "1.5px solid #e2e8f0",
          boxShadow: "0 6px 24px rgba(100,116,139,0.18), 0 2px 6px rgba(100,116,139,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
          position: "sticky",
          top: 0,
          zIndex: 150,
          width: "100%",
          boxSizing: "border-box",
          transform: "perspective(800px) rotateX(1deg)",
          transformOrigin: "top center",
          borderRadius: "0 0 2px 2px",
        }}
      >
        {/* Left - Company Info */}

        
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

          {/* Company Icon Badge */}
          <div style={{
            background: "linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)",
            borderRadius: "12px",
            width: "40px", height: "40px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
            fontSize: "1.3rem",
            flexShrink: 0,
          }}>🏢</div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{
                margin: 0,
                fontWeight: 900,
                fontSize: "1.35rem",
                letterSpacing: "-0.03em",
                color: "#0f172a",
                lineHeight: 1.1,
                textShadow: "0 1px 2px rgba(255,255,255,0.8)",
              }}>
                {user.company}
              </h2>

              {/* Deep Blinking Active Badge */}
              <span style={{
                display: "flex", alignItems: "center", gap: "5px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "999px",
                padding: "3px 10px",
                fontSize: "0.7rem",
                fontWeight: 800,
                color: "#15803d",
                letterSpacing: "0.03em",
              }}>
                <span style={{
                  width: "7px", height: "7px",
                  background: "#16a34a",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "deepBlink 1.1s infinite",
                }} />
                ACTIVE
              </span>
            </div>

            {/* GSTIN + Mobile Row */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "6px" }}>
              {user.gstin ? (
                <span style={{ fontSize: "0.76rem", color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                  <HiCheckCircle style={{  color: "#4f46e5" }} />
                  GSTIN: {user.gstin}
                </span>
              ) : null}
              {user.mobile || user.phone ? (
                <>
                {user.gstin ? <span style={{ width: "4px", height: "4px", background: "#cbd5e1", borderRadius: "50%" }} /> : null}
                <span style={{ fontSize: "0.76rem", color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                  <HiPhone style={{ fontSize: "12px", color: "#4f46e5" }} />
                  {user.mobile || user.phone}
                </span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right - Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

          {/* Notification Bell */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", marginRight: "6px" }}>
            <button
              className="nav-bell-btn"
              onClick={() => navigate("/user/notifications")}
              style={{
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                width: "38px", height: "38px",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(100,116,139,0.15), inset 0 1px 0 rgba(255,255,255,0.8)",
                transition: "all 0.2s",
                padding: 0,
              }}
            >
              <span style={{ fontSize: "1.15rem", lineHeight: "1", animation: "pulse 2.2s infinite" }}>🔔</span>
            </button>
            <span style={{
              position: "absolute", top: "-5px", right: "-5px",
              background: "#ef4444",
              color: "#fff",
              fontSize: "0.58rem", fontWeight: 800,
              minWidth: "17px", height: "17px",
              padding: "0 3px",
              borderRadius: "9px",
              display: unreadCount > 0 ? "flex" : "none",
              alignItems: "center", justifyContent: "center",
              border: "2px solid #f8fafc",
              boxShadow: notifPulse
                ? "0 0 0 4px rgba(239,68,68,0.45), 0 1px 4px rgba(239,68,68,0.5)"
                : "0 1px 4px rgba(239,68,68,0.5)",
              transition: "box-shadow 0.25s",
            }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
          </div>

          {/* DotMatrix left of user profile */}
          <DotMatrix cols={3} rows={3} color="#a5b4fc" opacity={0.4} size={3} gap={3.5} />

          {/* User Dropdown Trigger */}
          <div ref={userDropdownRef} style={{ position: "relative" }}>
            <button
              className="nav-user-btn"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
                cursor: "pointer",
                padding: "5px 12px 5px 5px",
                borderRadius: "12px",
                transition: "background 0.2s",
                boxShadow: "0 2px 8px rgba(100,116,139,0.14), inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              {/* Avatar */}
              <div style={{
                width: "30px", height: "30px",
                background: "linear-gradient(135deg, #3730a3, #6D4AFF)",
                borderRadius: "8px",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: "0.9rem", fontWeight: 900,
                boxShadow: "0 2px 8px rgba(79,70,229,0.4)",
                flexShrink: 0,
              }}>
                {user.name?.charAt(0)}
              </div>

              {/* Name & Role */}
              <div style={{ textAlign: "left" }}>
                <div style={{ color: "#0f172a", fontWeight: 700, fontSize: "0.84rem", lineHeight: 1.2 }}>
                  {user.name}
                </div>
                <div style={{ color: "#64748b", fontSize: "0.69rem", fontWeight: 500 }}>
                  {user.role}
                </div>
              </div>

              <HiChevronDown style={{ color: "#94a3b8", fontSize: "0.85rem" }} />
            </button>

            {/* Dropdown */}
            {showUserDropdown && (
              <div style={{
                position: "absolute",
                top: "52px", right: 0,
                width: "224px",
                background: "#ffffff",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 16px 48px rgba(100,116,139,0.22), 0 4px 12px rgba(100,116,139,0.1)",
                overflow: "hidden",
                zIndex: 1000,
              }}>
                <div style={{ padding: "6px 0" }}>
                  <button
                    className="nav-drop-item"
                    onClick={() => {
                      setEditProfileForm({ ...user });
                      setShowEditProfileModal(true);
                      setShowUserDropdown(false);
                    }}
                    style={{
                      width: "100%", padding: "11px 18px",
                      textAlign: "left", background: "none", border: "none",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: "12px",
                      fontSize: "0.87rem", color: "#1e293b", transition: "background 0.15s",
                    }}
                  >
                    <HiUser style={{ fontSize: "1.1rem", color: "#4f46e5" }} /> Edit Profile
                  </button>

                  <Link
                    to="/user/settings"
                    className="nav-drop-item"
                    onClick={() => setShowUserDropdown(false)}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "11px 18px", textDecoration: "none",
                      color: "#1e293b", fontSize: "0.87rem", transition: "background 0.15s",
                    }}
                  >
                    <HiCog style={{ fontSize: "1.1rem", color: "#4f46e5" }} /> Settings
                  </Link>

                  <button
                    className="nav-drop-item"
                    onClick={() => { setShowContactModal(true); setShowUserDropdown(false); }}
                    style={{
                      width: "100%", padding: "11px 18px",
                      textAlign: "left", background: "none", border: "none",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: "12px",
                      fontSize: "0.87rem", color: "#1e293b", transition: "background 0.15s",
                    }}
                  >
                    <HiPhone style={{ fontSize: "1.1rem", color: "#4f46e5" }} /> Contact Us
                  </button>

                  <hr style={{ margin: "6px 0", border: "none", borderTop: "1px solid #f1f5f9" }} />

                  <button
                    className="nav-drop-item"
                    onClick={() => {
                      toast.success("Logged out successfully!");
                      setShowUserDropdown(false);
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      navigate("/login");
                    }}
                    style={{
                      width: "100%", padding: "11px 18px",
                      textAlign: "left", background: "none", border: "none",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: "12px",
                      fontSize: "0.87rem", color: "#ef4444", transition: "background 0.15s",
                    }}
                  >
                    <HiLogout style={{ fontSize: "1.1rem" }} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* DotMatrix right of user profile */}
          <DotMatrix cols={3} rows={3} color="#a5b4fc" opacity={0.4} size={3} gap={3.5} />
        </div>
      </header>


  <div className="dashboard-content" style={{ overflow: "visible" }}>
    {pageContent}
  </div>
</main>

{showContactModal && <ContactModal />}
{showEditProfileModal && <EditProfileModal />}
{confirmModal.open && <ConfirmModal />}
{selectedClient && selectedClient.showFullDashboard && (
  <ClientGSTDashboardModal
    client={selectedClient}
    onClose={() => setSelectedClient(null)}
    initialSection={selectedClient.initialSection || null}
  />
)}

{/* ══ UNIFIED ADD CLIENT MODAL — shared across Dashboard & My Clients ══ */}
{showAddClientModal && (
  <AddClientModal
    open={showAddClientModal}
    onClose={closeAddClientModal}
    checkLimit={clientLimitError}
    onLimitReached={() => navigate("/user/settings?tab=billing")}
    onSaved={(client) => {
      addClient(client);
      navigate("/user/clients");
    }}
  />)}

    </>
  );
};
export default UserDashboard;