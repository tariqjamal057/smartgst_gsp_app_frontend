import React, { useState, useRef, useEffect } from "react";
import { fetchNews } from "../api/services";
import {
  HiArchive,
  HiBell,
  HiSpeakerphone,
  HiTrendingUp,
  HiDocumentText,
  HiRefresh,
  HiNewspaper,
  HiX,
  HiChevronLeft,
  HiChevronRight,
  HiCalendar,
  HiDownload,
  HiExternalLink,
  HiFilter,
} from "react-icons/hi";

// ════════════════════════════════════════════════════════════════════
// DotMatrix — Premium SaaS dot grid
// ════════════════════════════════════════════════════════════════════
const DotMatrix = ({
  cols = 3,
  rows = 4,
  color = "#a5b4fc",
  opacity = 0.45,
  size = 3.5,
  gap = 4,
}) => (
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
    {Array.from({ length: cols * rows }).map((_, i) => (
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

// ════════════════════════════════════════════════════════════════════
// Static Data
// ════════════════════════════════════════════════════════════════════
const FILTER_TABS = [
  { label: "All Types",      value: "all" },
  { label: "Notification",   value: "Notification" },
  { label: "Advisory",       value: "Advisory" },
  { label: "Revenue Update", value: "Revenue Update" },
  { label: "Circular",       value: "Circular" },
  { label: "Update",         value: "Update" },
  { label: "Press Release",  value: "Press Release" },
];

const TYPE_META = {
  Notification:    { icon: HiBell,          color: "#4f46e5", bg: "#ede9fe", label: "Notification"   },
  Advisory:        { icon: HiSpeakerphone,  color: "#0891b2", bg: "#e0f2fe", label: "Advisory"       },
  "Revenue Update":{ icon: HiTrendingUp,    color: "#059669", bg: "#d1fae5", label: "Revenue Update" },
  Circular:        { icon: HiDocumentText,  color: "#d97706", bg: "#fef3c7", label: "Circular"       },
  Update:          { icon: HiRefresh,       color: "#7c3aed", bg: "#f3e8ff", label: "Update"         },
  "Press Release": { icon: HiNewspaper,     color: "#be185d", bg: "#fce7f3", label: "Press Release"  },
};

// ════════════════════════════════════════════════════════════════════
// Archive Modal — Full calendar 2017–2026
// ════════════════════════════════════════════════════════════════════
const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];
const YEARS = [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026];

const ArchiveModal = ({ onClose, onSelectArchive, newsData = [] }) => {
  const [selectedYear,  setSelectedYear]  = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedType,  setSelectedType]  = useState("all");

  const modalRef = useRef(null);

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // count how many items exist for a year+month combo
  const countFor = (yr, mo) =>
    newsData.filter(
      (n) =>
        n.year === yr &&
        n.month === mo &&
        (selectedType === "all" || n.type === selectedType)
    ).length;

  const handleApply = () => {
    onSelectArchive({ year: selectedYear, month: selectedMonth, type: selectedType });
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15,23,42,0.5)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        ref={modalRef}
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "720px",
          boxShadow:
            "0 40px 100px rgba(15,23,42,0.28), 0 8px 32px rgba(15,23,42,0.12)",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
        }}
      >

        {/* ── MODAL HEADER — white, 3D card style ── */}
        <div
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
            padding: "18px 22px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "2px solid #f1f5f9",
            boxShadow: "0 4px 16px rgba(15,23,42,0.07), inset 0 -2px 0 rgba(79,70,229,0.08)",
            position: "relative",
          }}
        >


          {/* Left: 3D icon + text */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", paddingLeft: "0" }}>
            {/* 3D icon box */}
            <div
              style={{
                width: "46px", height: "46px",
                borderRadius: "14px",
                background: "linear-gradient(145deg, #4f46e5 0%, #3730a3 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow:
                  "0 8px 20px rgba(79,70,229,0.32), 0 2px 6px rgba(79,70,229,0.18), inset 0 1px 0 rgba(255,255,255,0.2)",
                flexShrink: 0,
              }}
            >
              <HiCalendar style={{ color: "#fff", fontSize: "1.3rem" }} />
            </div>

            <div>
              <h2 style={{
                margin: 0,
                fontSize: "1.12rem", fontWeight: 800,
                color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1.2,
              }}>
                GST{" "}
                <span style={{ color: "#4f46e5" }}>Archives</span>
              </h2>
              <p style={{
                margin: "3px 0 0",
                fontSize: "0.74rem", fontWeight: 500, color: "#64748b",
              }}>
                Browse GST updates from 2017 to 2026
              </p>
            </div>
          </div>

          {/* Right: Close button — dark, turns red on hover */}
          <button
            onClick={onClose}
            style={{
              width: "36px", height: "36px",
              borderRadius: "10px",
              background: "#f1f5f9",
              border: "1.5px solid #e2e8f0",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1rem", fontWeight: 700,
              color: "#64748b",
              transition: "all 0.15s ease",
              boxShadow: "0 2px 6px rgba(15,23,42,0.07)",
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#ef4444";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.borderColor = "#ef4444";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(239,68,68,0.32)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#f1f5f9";
              e.currentTarget.style.color = "#64748b";
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(15,23,42,0.07)";
            }}
          >
            ✕
          </button>
        </div>

        {/* ── MODAL BODY ── */}
        <div style={{ padding: "20px 24px 22px" }}>

          {/* ── SECTION LABEL: Filter by Type ── */}
          <p style={{
            margin: "0 0 9px",
            fontSize: "0.72rem", fontWeight: 800,
            color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            Filter by Type
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginBottom: "20px" }}>
            {FILTER_TABS.map((tab) => {
              const isActive = selectedType === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setSelectedType(tab.value)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "999px",
                    border: isActive ? "none" : "1.5px solid #e2e8f0",
                    background: isActive
                      ? "linear-gradient(135deg, #4f46e5, #3730a3)"
                      : "#f8fafc",
                    color: isActive ? "#fff" : "#475569",
                    fontSize: "0.79rem",
                    fontWeight: isActive ? 700 : 600,
                    cursor: "pointer",
                    boxShadow: isActive
                      ? "0 3px 10px rgba(79,70,229,0.28)"
                      : "0 1px 3px rgba(15,23,42,0.05)",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = "#ede9fe";
                      e.currentTarget.style.color = "#4f46e5";
                      e.currentTarget.style.borderColor = "#c4b5fd";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.color = "#475569";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                    }
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── SECTION LABEL: Select Year ── */}
          <p style={{
            margin: "0 0 9px",
            fontSize: "0.72rem", fontWeight: 800,
            color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            Select Year
          </p>
          {/* Year grid — 5 per row so all 10 years fit perfectly in 2 rows */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "10px",
              marginBottom: "22px",
            }}
          >
            {YEARS.map((yr) => {
              const isActive = selectedYear === yr;
              const hasData = newsData.some(
                (n) => n.year === yr && (selectedType === "all" || n.type === selectedType)
              );
              return (
                <button
                  key={yr}
                  onClick={() => { if (hasData) { setSelectedYear(yr); setSelectedMonth(null); } }}
                  style={{
                    padding: "11px 6px",
                    borderRadius: "12px",
                    border: isActive
                      ? "none"
                      : hasData
                      ? "1.5px solid #e2e8f0"
                      : "1.5px solid #f1f5f9",
                    background: isActive
                      ? "linear-gradient(145deg, #4f46e5, #3730a3)"
                      : hasData
                      ? "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)"
                      : "#f8fafc",
                    color: isActive ? "#fff" : hasData ? "#0f172a" : "#cbd5e1",
                    fontSize: "0.92rem",
                    fontWeight: isActive ? 800 : hasData ? 700 : 400,
                    cursor: hasData ? "pointer" : "not-allowed",
                    boxShadow: isActive
                      ? "0 6px 16px rgba(79,70,229,0.32), inset 0 1px 0 rgba(255,255,255,0.18)"
                      : hasData
                      ? "0 2px 6px rgba(15,23,42,0.07), inset 0 1px 0 rgba(255,255,255,0.8)"
                      : "none",
                    transition: "all 0.15s",
                    opacity: hasData ? 1 : 0.4,
                    textAlign: "center",
                    width: "100%",
                  }}
                  onMouseEnter={e => {
                    if (hasData && !isActive) {
                      e.currentTarget.style.background = "linear-gradient(180deg, #ede9fe 0%, #ddd6fe 100%)";
                      e.currentTarget.style.color = "#4f46e5";
                      e.currentTarget.style.borderColor = "#c4b5fd";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (hasData && !isActive) {
                      e.currentTarget.style.background = "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)";
                      e.currentTarget.style.color = "#0f172a";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.transform = "translateY(0)";
                    }
                  }}
                >
                  {yr}
                </button>
              );
            })}
          </div>

          {/* ── SECTION LABEL: Select Month ── */}
          <p style={{
            margin: "0 0 9px",
            fontSize: "0.72rem", fontWeight: 800,
            color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            Select Month — <span style={{ color: "#4f46e5", fontWeight: 700, textTransform: "none", letterSpacing: 0 }}>{selectedYear}</span>
          </p>
          {/* Month grid — 4 columns × 3 rows, year jaisi same styling */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "10px",
              marginBottom: "22px",
            }}
          >
            {MONTHS.map((mo, idx) => {
              const monthNum = idx + 1;
              const count = countFor(selectedYear, monthNum);
              const isActive = selectedMonth === monthNum;
              const hasData = count > 0;
              return (
                <button
                  key={mo}
                  onClick={() => hasData && setSelectedMonth(isActive ? null : monthNum)}
                  style={{
                    padding: "11px 6px",
                    borderRadius: "12px",
                    border: isActive
                      ? "none"
                      : hasData
                      ? "1.5px solid #e2e8f0"
                      : "1.5px solid #f1f5f9",
                    background: isActive
                      ? "linear-gradient(145deg, #4f46e5, #3730a3)"
                      : hasData
                      ? "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)"
                      : "#f8fafc",
                    color: isActive ? "#fff" : hasData ? "#0f172a" : "#cbd5e1",
                    fontSize: "0.9rem",
                    fontWeight: isActive ? 800 : hasData ? 700 : 400,
                    cursor: hasData ? "pointer" : "not-allowed",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    transition: "all 0.15s",
                    boxShadow: isActive
                      ? "0 6px 16px rgba(79,70,229,0.32), inset 0 1px 0 rgba(255,255,255,0.18)"
                      : hasData
                      ? "0 2px 6px rgba(15,23,42,0.07), inset 0 1px 0 rgba(255,255,255,0.8)"
                      : "none",
                    opacity: 1,
                    textAlign: "center",
                    width: "100%",
                  }}
                  onMouseEnter={e => {
                    if (hasData && !isActive) {
                      e.currentTarget.style.background = "linear-gradient(180deg, #ede9fe 0%, #ddd6fe 100%)";
                      e.currentTarget.style.color = "#4f46e5";
                      e.currentTarget.style.borderColor = "#c4b5fd";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (hasData && !isActive) {
                      e.currentTarget.style.background = "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)";
                      e.currentTarget.style.color = "#0f172a";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.transform = "translateY(0)";
                    }
                  }}
                >
                  <span style={{ lineHeight: 1, fontWeight: isActive ? 800 : hasData ? 700 : 500, color: isActive ? "#fff" : hasData ? "#0f172a" : "#94a3b8" }}>{mo}</span>
                  <span
                    style={{
                      fontSize: "0.6rem",
                      fontWeight: 800,
                      background: isActive
                        ? "rgba(255,255,255,0.25)"
                        : hasData
                        ? "#4f46e5"
                        : "#e2e8f0",
                      color: isActive ? "#fff" : hasData ? "#fff" : "#94a3b8",
                      borderRadius: "20px",
                      padding: "1px 6px",
                      lineHeight: 1.6,
                      minWidth: "18px",
                      textAlign: "center",
                      display: "inline-block",
                    }}
                  >
                    {hasData ? count : "0"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── ACTION ROW ── */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end",
              paddingTop: "4px",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "10px 24px",
                borderRadius: "10px",
                border: "1.5px solid #e2e8f0",
                background: "#f8fafc",
                color: "#475569",
                fontSize: "0.86rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                boxShadow: "0 1px 3px rgba(15,23,42,0.05)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#f1f5f9";
                e.currentTarget.style.borderColor = "#cbd5e1";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#f8fafc";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              style={{
                padding: "10px 28px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #4f46e5, #3730a3)",
                color: "#fff",
                fontSize: "0.86rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 6px 16px rgba(79,70,229,0.32)",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: "7px",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 10px 24px rgba(79,70,229,0.4)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(79,70,229,0.32)";
              }}
            >
              <HiCalendar style={{ fontSize: "1rem" }} />
              View Archive
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// News Card
// ════════════════════════════════════════════════════════════════════
const NewsCard = ({ item }) => {
  const meta = TYPE_META[item.type] || TYPE_META["Update"];
  const Icon = meta.icon;

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #e8edf5",
        boxShadow: "0 2px 12px rgba(15,23,42,0.06)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        cursor: "pointer",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 10px 32px rgba(79,70,229,0.13)";
        e.currentTarget.style.borderColor = "#c7d2fe";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(15,23,42,0.06)";
        e.currentTarget.style.borderColor = "#e8edf5";
      }}
    >
      {/* ── Card Top Bar ── */}
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        {/* Type Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <div
            style={{
              width: "28px", height: "28px",
              borderRadius: "8px",
              background: meta.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon style={{ color: meta.color, fontSize: "0.95rem" }} />
          </div>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: meta.color }}>
            {item.type}
          </span>
        </div>

        {/* Date + dots handle */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontSize: "0.73rem", fontWeight: 600, color: "#64748b",
              background: "#f8fafc", border: "1px solid #e2e8f0",
              borderRadius: "20px", padding: "3px 10px",
            }}
          >
            {item.date}
          </span>
          <span style={{ color: "#cbd5e1", fontSize: "0.9rem", letterSpacing: "-1px" }}>⋮⋮</span>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div style={{ padding: "16px 18px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
        {item.featured && (
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px" }}>
            <span style={{ color: "#f59e0b", fontSize: "0.75rem" }}>★</span>
            <span
              style={{
                fontSize: "0.65rem", fontWeight: 800,
                color: "#92400e", letterSpacing: "0.08em", textTransform: "uppercase",
              }}
            >
              Featured
            </span>
          </div>
        )}

        <h3
          style={{
            margin: "0 0 8px",
            fontSize: "0.94rem", fontWeight: 700,
            color: "#0f172a", lineHeight: 1.45,
          }}
        >
          {item.title}
        </h3>

        <p
          style={{
            margin: 0, fontSize: "0.81rem", color: "#64748b",
            lineHeight: 1.65, flex: 1,
          }}
        >
          {item.summary}
        </p>
      </div>

      {/* ── Card Footer ── */}
      <div
        style={{
          padding: "10px 18px",
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "0.72rem", fontWeight: 600, color: "#475569",
              background: "#f1f5f9", border: "1px solid #e2e8f0",
              borderRadius: "20px", padding: "3px 10px",
            }}
          >
            {item.tag}
          </span>
          {item.pdf && (
            <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 500 }}>
              · PDF available
            </span>
          )}
        </div>

        {item.pdf && (
          <button
            style={{
              width: "30px", height: "30px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(239,68,68,0.28)",
              flexShrink: 0, transition: "all 0.15s",
            }}
            title="View PDF"
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <span style={{ color: "#fff", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.02em" }}>PDF</span>
          </button>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// Main Component
// ════════════════════════════════════════════════════════════════════
const NewsAndUpdates = () => {
  const [activeFilter,  setActiveFilter]  = useState("all");
  const [showArchive,   setShowArchive]   = useState(false);
  const [archiveFilter, setArchiveFilter] = useState(null);
  // archiveFilter = { year, month, type } | null

  // Live news fetched from the Django /gst-app/news/ API (no static fallback)
  const [liveNews, setLiveNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    fetchNews()
      .then((res) => { if (!cancelled) setLiveNews(res.results || res); })
      .catch(() => { if (!cancelled) setLiveNews([]); })
      .finally(() => { if (!cancelled) setNewsLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const newsList = liveNews;

  // Build visible list
  const getFiltered = () => {
    let data = [...newsList];

    // If archive mode active
    if (archiveFilter) {
      data = data.filter((n) => {
        const yearMatch = n.year === archiveFilter.year;
        const monthMatch = archiveFilter.month ? n.month === archiveFilter.month : true;
        const typeMatch =
          archiveFilter.type === "all" || n.type === archiveFilter.type;
        return yearMatch && monthMatch && typeMatch;
      });
    } else {
      // Normal filter tab
      if (activeFilter !== "all") {
        data = data.filter((n) => n.type === activeFilter);
      }
    }

    // Sort newest first
    data.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.month - a.month;
    });

    return data;
  };

  const filtered = getFiltered();

  // Count per tab for the strip
  const _countFor = (type) =>
    type === "all"
      ? newsList.length
      : newsList.filter((n) => n.type === type).length;

  const handleSelectArchive = (filter) => {
    setArchiveFilter(filter);
    setActiveFilter("all");
  };

  const clearArchive = () => {
    setArchiveFilter(null);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f1f5f9",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ══════════════════════════════════════════════════════════
          TOP NAVBAR — fixed at top, does not scroll
      ════════════════════════════════════════════════════════════ */}
      <div style={{ padding: "14px 20px 0", flexShrink: 0 }}>
        <div
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 20px rgba(15,23,42,0.07), 0 1px 3px rgba(15,23,42,0.05)",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Radial glow overlay */}
          <div
            style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse 55% 100% at 0% 50%, rgba(237,233,254,0.55) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* LEFT: Icon + Title */}
          <div
            style={{
              display: "flex", alignItems: "center", gap: "14px",
              position: "relative", zIndex: 1,
            }}
          >
            {/* Icon box */}
            <div
              style={{
                width: "46px", height: "46px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 6px 16px rgba(79,70,229,0.35)",
                flexShrink: 0,
              }}
            >
              <HiDocumentText style={{ color: "#fff", fontSize: "1.3rem" }} />
            </div>

            {/* Title block */}
            <div>
              <h1
                style={{
                  margin: 0, fontSize: "1.2rem", fontWeight: 800,
                  color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1.2,
                }}
              >
                GST News{" "}
                <span style={{ color: "#4f46e5" }}>&amp; Updates</span>
              </h1>
              <p style={{ margin: "2px 0 0", fontSize: "0.77rem", color: "#64748b", fontWeight: 500 }}>
                Latest notifications, advisories &amp; revenue updates
              </p>
            </div>

          </div>

          {/* RIGHT: Archives button */}
          <button
            onClick={() => setShowArchive(true)}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 20px",
              background: "linear-gradient(135deg, #4f46e5, #3730a3)",
              color: "#fff", border: "none",
              borderRadius: "12px",
              fontSize: "0.85rem", fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 18px rgba(79,70,229,0.32)",
              transition: "all 0.18s ease",
              position: "relative", zIndex: 1,
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 10px 26px rgba(79,70,229,0.42)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 6px 18px rgba(79,70,229,0.32)";
            }}
          >
            <HiArchive style={{ fontSize: "1rem" }} />
            Archives
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SCROLLABLE CONTENT AREA
      ════════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0" }}>
      <div style={{ padding: "14px 20px 28px" }}>

        {/* Archive banner — visible when archive filter applied */}
        {archiveFilter && (
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
              border: "1px solid #c4b5fd",
              borderRadius: "12px",
              padding: "10px 16px",
              marginBottom: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <HiCalendar style={{ color: "#4f46e5", fontSize: "1rem" }} />
              <span style={{ fontSize: "0.83rem", fontWeight: 700, color: "#3730a3" }}>
                Archive View:{" "}
                {archiveFilter.month ? MONTHS[archiveFilter.month - 1] + " " : "All months, "}
                {archiveFilter.year}
                {archiveFilter.type !== "all" ? ` · ${archiveFilter.type}` : ""}
              </span>
              <span
                style={{
                  background: "#4f46e5", color: "#fff",
                  fontSize: "0.65rem", fontWeight: 800,
                  borderRadius: "20px", padding: "2px 8px",
                }}
              >
                {filtered.length} results
              </span>
            </div>
            <button
              onClick={clearArchive}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "5px 12px", borderRadius: "8px",
                background: "#4f46e5", color: "#fff",
                border: "none", fontSize: "0.75rem", fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <HiX style={{ fontSize: "0.8rem" }} /> Clear
            </button>
          </div>
        )}

        {/* Filter Tab Pills */}
       

        {/* ── Rounded Cards Container ── */}
        <div
          style={{
            background: "linear-gradient(180deg, #eef2ff 0%, #f1f5f9 100%)",
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(15,23,42,0.04)",
          }}
        >
          {/* Inner nav strip — filter pills centered */}
          <div
  style={{
    padding: "20px 40px",
    borderBottom: "1px solid #e2e8f0",
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "18px",
    flexWrap: "wrap",
  }}
>
  {FILTER_TABS.map((tab) => {
    const isActive = activeFilter === tab.value;

    return (
      <button
        key={tab.value}
        onClick={() => setActiveFilter(tab.value)}
        style={{
          padding: "8px 16px",
          borderRadius: "999px",
          border: isActive ? "none" : "1.5px solid #e2e8f0",
          background: isActive
            ? "linear-gradient(135deg,#4f46e5,#3730a3)"
            : "#ffffff",
          color: isActive ? "#ffffff" : "#475569",
          fontSize: "0.82rem",
          fontWeight: isActive ? 700 : 600,
          cursor: "pointer",
          transition: "all 0.15s ease",
          boxShadow: isActive
            ? "0 4px 14px rgba(79,70,229,0.28)"
            : "0 1px 3px rgba(15,23,42,0.05)",
          whiteSpace: "nowrap",
        }}
      >
        {tab.label}
      </button>
    );
  })}
</div>
          {/* Cards Grid */}
          <div
            style={{
              padding: "18px 20px 22px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
              gap: "16px",
            }}
          >
            {filtered.length === 0 ? (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "64px 0",
                  color: "#94a3b8",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📋</div>
                {newsLoading
                  ? "Loading updates..."
                  : archiveFilter
                  ? "No updates found for the selected filter."
                  : "No news published yet. Check back soon."}
                {archiveFilter && (
                  <div style={{ marginTop: "10px" }}>
                    <button
                      onClick={clearArchive}
                      style={{
                        padding: "8px 20px", borderRadius: "8px",
                        background: "#4f46e5", color: "#fff",
                        border: "none", fontSize: "0.82rem",
                        fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      Back to All Updates
                    </button>
                  </div>
                )}
              </div>
            ) : (
              filtered.map((item) => <NewsCard key={item.id} item={item} />)
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Archive Modal */}
      {showArchive && (
        <ArchiveModal
          onClose={() => setShowArchive(false)}
          onSelectArchive={handleSelectArchive}
          newsData={newsList}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
};

export default NewsAndUpdates;