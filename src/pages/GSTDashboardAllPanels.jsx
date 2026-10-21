import React, { useState, useCallback, useMemo } from "react";

const ROW1_H = "360px";
const ROW2_H = "240px";
const ROW2_LIABILITY_H = "280px";
const ROW3_H = "340px";
import {
  HiOutlineViewGrid,
  HiOutlineChartBar,
  HiOutlineDocumentReport
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { gstFilingStatus, gstFilingSync, gstCredentials, gstSendOtp, gstAuthenticate, gstLogout, gstLedger, gstPayment, gstFo, fetchNotifications } from "../api/services";

const errText = (e) =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.message)) ||
  (e && e.message) ||
  "Request failed";

const liveBody = (r) => (r && r.data) || {};

// ─── Return filing / FY helpers (real calendar math, no hardcoded statuses) ──
const RET_KEYS = { "GSTR-1": "GSTR1", "GSTR-1A": "GSTR1A", "GSTR-3B": "GSTR3B", "TDS/TCS": "TDS_TCS" };
// Due day of the *following* calendar month for each return.
const DUE_DAYS = { "GSTR-1": 11, "GSTR-1A": 11, "GSTR-3B": 20, "TDS/TCS": 7, IMS: 13 };

const fyStart = (label) => {
  const m = /^(\d{4})-(\d{2})$/.exec(String(label || ""));
  return m ? parseInt(m[1], 10) : null;
};

// MMYYYY periods of an FY, April -> March (e.g. 042026, ..., 032027).
const monthPeriods = (fy) => {
  const start = fyStart(fy);
  if (start == null) return [];
  return Array.from({ length: 12 }, (_, i) => {
    const mm = ((i + 3) % 12) + 1;
    return `${String(mm).padStart(2, "0")}${i < 9 ? start : start + 1}`;
  });
};

// Statutory due date (date in the following calendar month) for a FY's month.
const monthDueDate = (fy, monthIdx, dueDay) => {
  const start = fyStart(fy);
  if (start == null) return null;
  const d = new Date(Date.UTC(start, 3 + monthIdx, 15)); // April = month 3
  d.setUTCMonth(d.getUTCMonth() + 1);
  d.setUTCDate(dueDay);
  return d;
};

const daysUntil = (date) => Math.round((date.getTime() - Date.now()) / 86400000);

// True when the date is within [now - afterDays, now + beforeDays].
const inWindow = (date, beforeDays, afterDays) => {
  const d = daysUntil(date);
  return d >= -afterDays && d <= beforeDays;
};
const money = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "number") return v.toLocaleString("en-IN");
  return String(v);
};
const label = (k) => String(k).replace(/_/g, " ");
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

// GSTN often wraps the real payload in a single-key container (e.g.
// [{"Cash_Details": {...}}]) — unwrap it so tables show the inner fields.
const unwrapData = (d) => {
  if (!d || typeof d !== "object") return d;
  if (Array.isArray(d)) {
    if (d.length === 1 && isObj(d[0])) {
      const inner = unwrapData(d[0]);
      return inner !== d[0] ? inner : d;
    }
    return d;
  }
  const keys = Object.keys(d);
  if (keys.length === 1) {
    const v = d[keys[0]];
    if (Array.isArray(v) || isObj(v)) return unwrapData(v);
  }
  return d;
};

const unionKeys = (rows) => {
  const union = [];
  (rows || []).forEach((r) => Object.keys(r || {}).forEach((k) => {
    if (!union.includes(k)) union.push(k);
  }));
  return union.length ? union : [];
};

// ─── Recursive generic live-data renderer ─────────────────────────────────────
function Gsheet({ data, depth = 0 }) {
  const d = unwrapData(data);
  const td = { padding: "6px 8px", borderBottom: "1px solid #eef2f7", fontSize: "0.74rem", whiteSpace: "nowrap", maxWidth: "280px", overflow: "hidden", textOverflow: "ellipsis" };
  const isEmpty = d === undefined || d === null || (isObj(d) && !Object.keys(d).length) || (Array.isArray(d) && !d.length);
  if (isEmpty) {
    return (
      <div style={{ padding: "10px 2px", fontSize: "0.74rem", color: "#94a3b8", textAlign: "center" }}>No data rows</div>
    );
  }
  if (Array.isArray(d)) {
    const first = d[0];
    if (isObj(first)) {
      const keys = unionKeys(d);
      return (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead>
            <tr>{keys.map((k) => <th key={k} style={{ ...td, textAlign: "left", background: "#f1f5f9", fontWeight: "800" }}>{label(k)}</th>)}</tr>
          </thead>
          <tbody>
            {d.map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafbfc" }}>
                {keys.map((k) => {
                  const v = r ? r[k] : undefined;
                  return (
                    <td key={k} style={td}>
                      {isObj(v) || Array.isArray(v) ? <Gsheet data={v} depth={depth + 1} /> : money(v)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return (
      <div>
        {d.map((v, i) => (
          <div key={i} style={{ padding: "4px 2px", borderBottom: "1px solid #f1f5f9", fontSize: "0.74rem" }}>{money(v)}</div>
        ))}
      </div>
    );
  }
  const entries = Object.entries(d);
  const arrays = entries.filter(([, v]) => Array.isArray(v));
  const objs = entries.filter(([, v]) => isObj(v));
  const scalars = entries.filter(([, v]) => !Array.isArray(v) && !isObj(v));
  if (arrays.length === 1 && !objs.length && !scalars.length) {
    return <Gsheet data={arrays[0][1]} depth={depth + 1} />;
  }
  if (!arrays.length && !scalars.length && objs.length === 1) {
    return <Gsheet data={objs[0][1]} depth={depth + 1} />;
  }
  if (arrays.length && (scalars.length || objs.length)) {
    return (
      <div>
        {scalars.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginBottom: "8px", fontSize: "0.74rem" }}>
            {scalars.map(([k, v]) => (
              <span key={k}><b>{label(k)}:</b> {money(v)}</span>
            ))}
          </div>
        )}
        {arrays.map(([k, arr]) => (
          <div key={k} style={{ marginBottom: "10px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: "800", color: "#475569", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label(k)}</div>
            <Gsheet data={arr} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div>
      {entries.map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "10px", padding: "5px 2px", borderBottom: "1px solid #f1f5f9", fontSize: "0.74rem" }}>
          <span style={{ color: "#475569", fontWeight: 600 }}>{label(k)}</span>
          <span style={{ color: "#0f172a", fontWeight: 700, textAlign: "right" }}>
            {isObj(v) || Array.isArray(v) ? <Gsheet data={v} depth={depth + 1} /> : money(v)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Generic live-data table (used when GSTN returns data for a panel) ────────
function LiveSheet({ body, gstin = "" }) {
  const data = body && body.data;
  if (data === undefined || data === null) {
    return (
      <div style={{ padding: "14px", fontSize: "0.78rem", color: "#94a3b8", textAlign: "center" }}>
        No live GSTN data yet — press <b>Update All</b> to refresh.
      </div>
    );
  }
  return (
    <div style={{ overflow: "auto", padding: "10px 12px", boxSizing: "border-box" }}>
      {body.status_cd && <div style={{ fontSize: "0.66rem", color: "#64748b", marginBottom: "6px" }}>status_cd: {body.status_cd}{gstin ? ` · ${gstin}` : ""}</div>}
      <Gsheet data={data} />
    </div>
  );
}

// ─── Empty state for panels with no backend data (no static/sample fallback) ───
function EmptyPanel({ message = "No data available", expanded = false }) {
  return (
    <div
      style={{
        padding: expanded ? "28px 14px" : "14px",
        fontSize: expanded ? "0.82rem" : "0.74rem",
        color: "#94a3b8",
        textAlign: "center",
      }}
    >
      {message}
    </div>
  );
}


const currentFYLabel = () => {
  const now = new Date();
  const y = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${y}-${String(y + 1).slice(-2)}`;
};
// GST started in 2017-18; list everything up to the current running FY (April–March)
const FINANCIAL_YEARS = (() => {
  const startYear = 2017;
  const now = new Date();
  const endYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const count = Math.max(endYear - startYear + 1, 1);
  return Array.from({ length: count }, (_, i) => {
    const y = endYear - i;
    return `${y}-${String(y + 1).slice(-2)}`;
  });
})();

function getAccentColor(colorStr) {
  const match = colorStr.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/);
  return match ? match[0] : colorStr;
}

// ─── Panel ────────────────────────────────────────────────────────────────────
function Panel({ id, title, icon = "", color, onMaximize, scrollX = false, fixedHeight = "340px", children }) {
  const accentColor = getAccentColor(color);
  return (
    <div style={{
      background: "#fff", borderRadius: "14px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.10)", display: "flex", flexDirection: "column",
      border: `1.5px solid ${accentColor}28`, overflow: "hidden",
      height: fixedHeight, minHeight: fixedHeight, maxHeight: fixedHeight, boxSizing: "border-box",
    }}>
      <div style={{
        background: `linear-gradient(135deg, #ffffff 0%, ${accentColor}0d 100%)`,
        borderBottom: `2px solid ${accentColor}30`, padding: "9px 14px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexShrink: 0, boxShadow: `0 2px 10px ${accentColor}12`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
          <div style={{
            background: `${accentColor}14`, border: `1.5px solid ${accentColor}28`,
            borderRadius: "8px", padding: "4px 7px", fontSize: "1rem", lineHeight: 1, flexShrink: 0,
          }}>{icon}</div>
          <span style={{
            color: accentColor, fontWeight: "800", fontSize: "0.87rem", letterSpacing: "0.2px",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{title}</span>
        </div>
        <button
          onClick={() => onMaximize(id)}
          style={{
            background: "#ffffff", border: `1.5px solid ${accentColor}40`, color: accentColor,
            borderRadius: "7px", cursor: "pointer", padding: "4px 11px", fontSize: "0.72rem",
            fontWeight: "700", flexShrink: 0, marginLeft: "8px",
            boxShadow: `0 1px 4px ${accentColor}18`, transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${accentColor}10`; e.currentTarget.style.borderColor = accentColor; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = `${accentColor}40`; }}
        >⛶ View All</button>
      </div>
      <div style={{ flex: 1, overflowY: "hidden", overflowX: scrollX ? "auto" : "hidden", minHeight: 0 }}>
        {children}
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function MaximizedModal({ title, icon = "", color, onClose, scrollX = false, children }) {
  const accentColor = getAccentColor(color);
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
      zIndex: 9000, display: "flex", justifyContent: "center", alignItems: "center", padding: "16px",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "96vw", height: "92vh", background: "#fff", borderRadius: "16px", overflow: "hidden",
        display: "flex", flexDirection: "column", boxShadow: "0 24px 60px rgba(0,0,0,0.30)",
        border: `1.5px solid ${accentColor}28`,
      }}>
        <div style={{
          background: `linear-gradient(135deg, #ffffff 0%, ${accentColor}0d 100%)`,
          borderBottom: `2px solid ${accentColor}30`, padding: "14px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexShrink: 0, boxShadow: `0 2px 10px ${accentColor}12`,
          
        }}>
        
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          
            <div style={{
              background: `${accentColor}14`, border: `1.5px solid ${accentColor}28`,
              borderRadius: "9px", padding: "6px 9px", fontSize: "1.25rem", lineHeight: 1,
            }}>{icon}</div>
            <span style={{ color: accentColor, fontWeight: "800", fontSize: "1.1rem", letterSpacing: "0.2px" }}>{title}</span>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button style={{
              background: "#ffffff", border: `1.5px solid ${accentColor}40`, color: accentColor,
              borderRadius: "8px", cursor: "pointer", padding: "6px 16px", fontWeight: "700", fontSize: "0.82rem",
              boxShadow: `0 1px 4px ${accentColor}15`,
            }}>🔄 Update</button>
            <button onClick={onClose} style={{
              background: "#ffffff", border: `1.5px solid ${accentColor}40`, color: accentColor,
              borderRadius: "8px", cursor: "pointer", padding: "7px 16px", fontWeight: "700", fontSize: "0.85rem",
              boxShadow: `0 1px 4px ${accentColor}15`,
            }}>✕ Close</button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", overflowX: scrollX ? "auto" : "hidden", background: "#f8fafc" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function DlBtn({ label = "↓ Download PDF", color = "#ef4444" }) {
  return (
    <button style={{
      padding: "9px 20px", borderRadius: "10px", border: "none",
      background: `linear-gradient(135deg,${color},${color}cc)`,
      color: "white", fontSize: "0.84rem", fontWeight: "700", cursor: "pointer",
      boxShadow: `0 2px 8px ${color}44`,
    }}>{label}</button>
  );
}

// ─── Sticky bottom-right action bar (used for Download PDF / Export Excel in maximized view) ──
function DlFooter({ children }) {
  return (
    <div style={{
      position: "sticky", bottom: "0", zIndex: 20,
      display: "flex", justifyContent: "flex-end", gap: "10px",
      marginTop: "32px", padding: "16px 0 4px",
      background: "linear-gradient(to top, rgba(248,250,252,0.98) 65%, rgba(248,250,252,0))",
    }}>
      {children}
    </div>
  );
}

function DuePills({ small = false, fy = "" }) {
  const pills = [];
  const endYear = fy ? fyStart(fy) + 1 : null;
  if (endYear) {
    // GSTR-9 / GSTR-9C (annual): due 31 Dec of the FY's starting year.
    const g9 = new Date(Date.UTC(endYear - 1, 11, 31));
    if (inWindow(g9, 45, 45)) pills.push("GSTR-9 Due");
    if (inWindow(g9, 45, 45)) pills.push("GSTR-9C Due");
  }
  // IMS (monthly statement): buyer actions due by the following month.
  const now = new Date();
  const ims = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, DUE_DAYS.IMS));
  if (inWindow(ims, 10, 2)) pills.push("IMS Due");

  if (!pills.length) return null;
  return (
    <div style={{ display: "flex", gap: "5px", alignItems: "center", flexWrap: "nowrap" }}>
      {pills.map(label => (
        <div key={label} style={{
          display: "flex", alignItems: "center", gap: "4px",
          border: "1px solid #fca5a540", background: "#fef2f2", color: "#dc2626",
          padding: small ? "2px 7px" : "4px 10px", borderRadius: "999px",
          fontSize: small ? "0.62rem" : "0.72rem", fontWeight: "700", whiteSpace: "nowrap",
        }}>
          <span style={{ color: "#dc2626", fontSize: small ? "0.58rem" : "0.68rem" }}>⚠</span>
          {label}
        </div>
      ))}
    </div>
  );
}

// ─── Custom Financial Year Dropdown ────────────────────────────────────────────
function FYDropdown({ value, onChange, years }) {
  const [open, setOpen] = useState(false);
  const wrapRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "relative", height: "36px", marginTop: "12px" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          height: "36px", minHeight: "36px", maxHeight: "36px", fontSize: "0.76rem", fontWeight: "800", color: "#1e293b",
          background: "#fff", border: "1px solid #cbd5e1", borderRadius: "8px", width: "96px", minWidth: "96px", maxWidth: "96px",
          padding: "0 10px", cursor: "pointer", outline: "none", boxSizing: "border-box",
          boxShadow: "0 1px 3px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        {value}
        <span style={{
          fontSize: "9px", color: "#64748b", marginLeft: "4px",
          display: "inline-block", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s",
        }}>▼</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, width: "110px",
          background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.14)", zIndex: 50, overflow: "hidden",
          maxHeight: "260px", overflowY: "auto",
        }}>
          {years.map(fy => {
            const isSelected = fy === value;
            return (
              <div
                key={fy}
                onClick={() => { onChange(fy); setOpen(false); }}
                style={{
                  padding: "8px 12px", fontSize: "0.78rem",
                  fontWeight: isSelected ? "800" : "600",
                  color: isSelected ? "#1d4ed8" : "#1e293b",
                  background: isSelected ? "#dbeafe" : "#ffffff",
                  cursor: "pointer", transition: "background 0.12s",
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#f1f5f9"; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "#ffffff"; }}
              >
                {fy}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Expanded Section Wrapper ─────────────────────────────────────────────────
function ExpandedSection({ children }) {
  return (
    <div style={{
      padding: "24px 28px",
      minHeight: "100%",
      boxSizing: "border-box",
    }}>
      {children}
    </div>
  );
}

// ─── Expanded Card ─────────────────────────────────────────────────────────────
function ECard({ children, style = {} }) {
  return (
    <div style={{
      background: "#ffffff",
      borderRadius: "14px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      border: "1px solid #e8ecf4",
      padding: "20px 24px",
      ...style,
    }}>
      {children}
    </div>
  );
}

function ReturnStatusContent({ expanded = false, fy = "", filed = {}, gstn = "disconnected", rows = [] }) {
  const months = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const periods = monthPeriods(fy);
  const live = gstn === "connected";
  const totalFiled = Object.values(filed || {}).reduce((a, b) => a + (Number(b) || 0), 0);
  const returns = ["GSTR-1", "GSTR-1A", "GSTR-3B", "TDS/TCS"].map((name) => ({
    name,
    filed: Number(filed[RET_KEYS[name]]) || 0,
  }));

  const byKey = useMemo(() => {
    const m = new Map();
    (rows || []).forEach((r) => m.set(`${r.return_type}|${r.period}`, r));
    return m;
  }, [rows]);

  const cellOf = (retName, i) => {
    const period = periods[i];
    const rec = byKey.get(`${RET_KEYS[retName]}|${period}`);
    const status = rec ? rec.status : "PENDING";
    const due = monthDueDate(fy, i, DUE_DAYS[retName]);
    return {
      period,
      status,
      due,
      overdue: !!(due && status !== "FILED" && due.getTime() < Date.now()),
      arn: (rec && rec.arn) || "",
    };
  };

  const cellStyle = (cell, sq) => ({
    background: cell.status === "FILED" ? "#f0fdf4" : cell.overdue ? "#fff1f2" : cell.status === "PREPARED" ? "#fefce8" : "#fffbeb",
    borderRadius: sq ? "7px" : "10px", padding: sq ? "4px 2px" : "8px 3px", textAlign: "center",
    minHeight: sq ? "48px" : "76px",
    border: `1px solid ${cell.status === "FILED" ? "#bbf7d0" : cell.overdue ? "#fecdd3" : "#fde68a"}`,
    display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "4px",
    ...(sq ? {} : { cursor: "pointer", boxShadow: cell.status === "FILED" ? "0 1px 4px rgba(5,150,105,0.10)" : cell.overdue ? "0 1px 4px rgba(220,38,38,0.10)" : "0 1px 4px rgba(217,119,6,0.10)" }),
  });

  const cellText = (cell) => {
    if (cell.status === "FILED") return { text: "✅ Filed", color: "#059669" };
    if (cell.overdue) return { text: "⚠️ Due", color: "#dc2626" };
    if (cell.status === "PREPARED") return { text: "🟡 Prepared", color: "#b45309" };
    return { text: "🕒 Pending", color: "#d97706" };
  };

  if (!expanded) {
    return (
      <div style={{ padding: "8px 12px 10px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "7px", gap: "6px" }}>
          <DuePills small fy={fy} />
        </div>
        <div style={{ overflowX: "auto", flex: 1 }}>
          <div style={{ minWidth: "860px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "88px repeat(12, 1fr)", gap: "3px", marginBottom: "4px" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: "700", color: "#475569", display: "flex", alignItems: "center", paddingLeft: "3px" }}>Return</div>
              {months.map(m => (
                <div key={m} style={{ textAlign: "center", padding: "4px 0", background: "linear-gradient(135deg,#4f46e5,#6D4AFF)", borderRadius: "5px", color: "white", fontSize: "0.65rem", fontWeight: "700" }}>{m}</div>
              ))}
            </div>
            {returns.map(ret => (
              <div key={ret.name} style={{ display: "grid", gridTemplateColumns: "88px repeat(12, 1fr)", gap: "3px", marginBottom: "3px" }}>
                <div style={{ background: "white", borderRadius: "7px", padding: "5px 6px", boxShadow: "0 1px 3px rgba(15,23,42,0.06)", border: "1px solid #eef2ff", display: "flex", alignItems: "center" }}>
                  <span style={{ fontWeight: "800", color: "#0f766e", fontSize: "0.74rem" }}>{ret.name}</span>
                  <span style={{ fontWeight: "700", color: "#64748b", fontSize: "0.62rem", marginLeft: "auto" }}>{ret.filed}</span>
                </div>
                {Array.from({ length: 12 }, (_, i) => {
                  const cell = cellOf(ret.name, i);
                  const t = cellText(cell);
                  return (
                    <div key={i} style={cellStyle(cell, true)}>
                      {cell.overdue ? (
                        <div style={{ color: t.color, fontWeight: "800", fontSize: "0.60rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "3px" }}>
                          {t.text} <FaWhatsapp style={{ color: "#25D366", fontSize: "0.75rem", flexShrink: 0 }} />
                        </div>
                      ) : (
                        <div style={{ color: t.color, fontWeight: "800", fontSize: "0.60rem" }}>{t.text}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── EXPANDED ──
  return (
    <ExpandedSection>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "#1e293b", marginBottom: "3px" }}>Return Filing Status</div>
          <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
            FY {fy} · {totalFiled} filed ·{" "}
            <span style={{ color: live ? "#059669" : "#b45309", fontWeight: "700" }}>
              {live ? "Live" : "Offline"}
            </span>
          </div>
        </div>
        <DuePills fy={fy} />
      </div>

      {/* Month header */}
      <div style={{ display: "grid", gridTemplateColumns: "140px repeat(12, 1fr)", gap: "6px", marginBottom: "8px" }}>
        <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#475569", display: "flex", alignItems: "center", paddingLeft: "6px" }}>Return Type</div>
        {months.map(m => (
          <div key={m} style={{
            textAlign: "center", padding: "7px 0",
            background: "linear-gradient(135deg,#4f46e5,#6D4AFF)",
            borderRadius: "7px", color: "white", fontSize: "0.76rem", fontWeight: "700",
            boxShadow: "0 2px 6px rgba(79,70,229,0.25)",
          }}>{m}</div>
        ))}
      </div>

      {returns.map(ret => (
        <div key={ret.name} style={{ display: "grid", gridTemplateColumns: "140px repeat(12, 1fr)", gap: "6px", marginBottom: "8px" }}>
          <div style={{
            background: "white", borderRadius: "10px", padding: "10px 10px",
            boxShadow: "0 2px 8px rgba(15,23,42,0.07)", border: "1px solid #eef2ff",
            display: "flex", flexDirection: "column", justifyContent: "center",
          }}>
            <div style={{ fontWeight: "800", color: "#0f766e", fontSize: "0.9rem", marginBottom: "4px" }}>{ret.name}</div>
            <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: "600" }}>
              {ret.filed} filed in {fy}
            </div>
            <button style={{
              marginTop: "6px", border: "none", alignSelf: "flex-start",
              background: "linear-gradient(135deg,#4f46e5,#6D4AFF)", color: "#fff",
              borderRadius: "6px", padding: "4px 10px", fontSize: "0.68rem", fontWeight: "700",
              cursor: "pointer", boxShadow: "0 2px 6px rgba(79,70,229,0.35)", whiteSpace: "nowrap",
            }}>⬇ Download All</button>
          </div>
          {Array.from({ length: 12 }, (_, i) => {
            const cell = cellOf(ret.name, i);
            const t = cellText(cell);
            return (
              <div key={i} style={cellStyle(cell, false)}>
                {cell.status === "FILED" ? (
                  <>
                    <div style={{ color: t.color, fontWeight: "800", fontSize: "0.76rem" }}>✅ Filed</div>
                    <button style={{ border: "none", background: "linear-gradient(135deg,#4f46e5,#6D4AFF)", color: "white", borderRadius: "5px", padding: "3px 8px", fontSize: "0.65rem", fontWeight: "700", cursor: "pointer" }}>Download</button>
                  </>
                ) : cell.overdue ? (
                  <div style={{ color: t.color, fontWeight: "800", fontSize: "0.80rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                    ⚠️ Due <FaWhatsapp style={{ color: "#25D366", fontSize: "0.95rem", flexShrink: 0 }} />
                  </div>
                ) : (
                  <div style={{ color: t.color, fontWeight: "800", fontSize: "0.78rem" }}>{t.text}</div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      <DlFooter>
        <DlBtn label="↓ Download Report" color="#6D4AFF" />
        <DlBtn label="↓ Export Excel" color="#16a34a" />
      </DlFooter>
    </ExpandedSection>
  );
}

function ElectronicLedgerContent({ expanded = false, gstin = "", live = null }) {
  const ledgerLive = liveBody(live);
  if (ledgerLive && ledgerLive.data !== undefined) {
    if (!expanded) {
      return (
        <div style={{ padding: "6px 4px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
            <LiveSheet body={ledgerLive} gstin={gstin} />
          </div>
        </div>
      );
    }
    return (
      <ExpandedSection>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "#1e293b", marginBottom: "3px" }}>Electronic Ledger Balances</div>
          <div style={{ fontSize: "0.85rem", color: "#64748b" }}>GSTIN: {gstin || "—"} · Live Ledger Data</div>
        </div>
        <ECard style={{ padding: 0, overflow: "auto" }}>
          <LiveSheet body={ledgerLive} gstin={gstin} />
        </ECard>
        <DlFooter><DlBtn label="↓ Download PDF" color="#065f46" /></DlFooter>
      </ExpandedSection>
    );
  }

  return <EmptyPanel message="No electronic ledger data available. Press Update All to fetch from GSTN." expanded={expanded} />;
}

function SummaryContent({ expanded = false }) {
  const items = [
    { label: "GST Certificate", tag: "GST REG-06", bg: "#f8fbff", tagColor: "#4f46e5", dlColor: "#4f46e5" },
    { label: "TDS Certificate", tag: "GSTR-7A",    bg: "#f7fff9", tagColor: "#16a34a", dlColor: "#16a34a" },
  ];

  if (!expanded) {
    return (
      <div style={{ width: "100%", height: "100%", padding: "8px 10px", boxSizing: "border-box" }}>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
          {items.map((item) => (
            <div key={item.label} style={{
              width: "100%", background: `linear-gradient(135deg, ${item.bg}, #ffffff)`,
              borderRadius: "12px", padding: "9px 12px", border: `1px solid ${item.tagColor}18`,
              boxShadow: "0 2px 8px rgba(15,23,42,0.05)", boxSizing: "border-box",
              display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "12px",
            }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", minWidth: 0 }}>
                <div style={{ fontWeight: "800", fontSize: "0.84rem", color: "#0f172a", lineHeight: "1.2" }}>{item.label}</div>
                <div style={{ marginTop: "4px", display: "inline-flex", alignItems: "center", background: `${item.tagColor}12`, color: item.tagColor, border: `1px solid ${item.tagColor}22`, padding: "3px 8px", borderRadius: "999px", fontSize: "0.62rem", fontWeight: "800", whiteSpace: "nowrap" }}>{item.tag}</div>
              </div>
              <button style={{ background: `linear-gradient(135deg, ${item.dlColor}, ${item.dlColor}cc)`, color: "#fff", border: "none", padding: "6px 12px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", fontSize: "0.7rem", whiteSpace: "nowrap", flexShrink: 0 }}>↓ PDF</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── EXPANDED ──
  return (
    <ExpandedSection>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "#1e293b", marginBottom: "3px" }}>Downloads</div>
        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Certificates & Forms available for download</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {items.map((item) => (
          <ECard key={item.label} style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "24px", background: `linear-gradient(135deg, ${item.bg} 0%, #ffffff 100%)`, border: `1.5px solid ${item.tagColor}20` }}>
            <div>
              <div style={{ fontWeight: "800", fontSize: "1.05rem", color: "#0f172a", marginBottom: "8px" }}>{item.label}</div>
              <div style={{ display: "inline-flex", alignItems: "center", background: `${item.tagColor}12`, color: item.tagColor, border: `1px solid ${item.tagColor}30`, padding: "5px 12px", borderRadius: "999px", fontSize: "0.78rem", fontWeight: "800" }}>{item.tag}</div>
            </div>
            <button style={{ background: `linear-gradient(135deg, ${item.dlColor}, ${item.dlColor}cc)`, color: "#fff", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "800", cursor: "pointer", fontSize: "0.88rem", whiteSpace: "nowrap", boxShadow: `0 3px 10px ${item.dlColor}44` }}>↓ Download PDF</button>
          </ECard>
        ))}
      </div>
    </ExpandedSection>
  );
}

function TurnoverContent({ expanded = false, gstin = "", live = null }) {
  const turnoverLive = liveBody(live);
  if (turnoverLive && turnoverLive.data !== undefined) {
    if (!expanded) {
      return (
        <div style={{ padding: "10px 12px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
            <LiveSheet body={turnoverLive} gstin={gstin} />
          </div>
        </div>
      );
    }
    return (
      <ExpandedSection>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "#1e293b", marginBottom: "3px" }}>Turnover Summary</div>
          <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Estimated & Filed Turnover · GSTIN & PAN Level</div>
        </div>
        <ECard style={{ padding: 0, overflow: "auto" }}>
          <LiveSheet body={turnoverLive} gstin={gstin} />
        </ECard>
        <DlFooter><DlBtn label="↓ Download PDF" color="#0369a1" /></DlFooter>
      </ExpandedSection>
    );
  }

  return <EmptyPanel message="No turnover data available. Press Update All to fetch from GSTN." expanded={expanded} />;
}

function LiabilityContent({ expanded = false, gstin = "", live = null }) {
  const liabilityLive = liveBody(live);
  if (liabilityLive && liabilityLive.data !== undefined) {
    if (!expanded) {
      return (
        <div style={{ padding: "5px 8px", height: "100%", boxSizing: "border-box", overflow: "auto" }}>
          <LiveSheet body={liabilityLive} gstin={gstin} />
        </div>
      );
    }
    return (
      <ExpandedSection>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "#1e293b", marginBottom: "3px" }}>Liability Ledger</div>
          <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Liability & ITC Comparison · GSTR-3B vs GSTR-1/2B</div>
        </div>
        <ECard style={{ padding: 0, overflow: "auto" }}>
          <LiveSheet body={liabilityLive} gstin={gstin} />
        </ECard>
        <DlFooter><DlBtn label="↓ Download PDF" color="#9a3412" /></DlFooter>
      </ExpandedSection>
    );
  }

  return <EmptyPanel message="No liability or ITC statement data available. Press Update All to fetch from GSTN." expanded={expanded} />;
}

function PaymentContent({ expanded = false, gstin = "", legalName = "", tradeName = "", live = null }) {
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedDemand, setSelectedDemand] = useState(null);

  const demands = (() => {
    const body = liveBody(live);
    const data = body && body.data;
    if (Array.isArray(data)) {
      return data.map((d, i) => ({
        sr: i + 1,
        date: money(d.date || d.dt || d.demandDate || "—"),
        demandId: String(d.demandid || d.dmdid || d.demandId || d.dmdId || d.id || `DEM-${String(i + 1).padStart(4, "0")}`),
        integrated: Number(d.igst || d.iGst || 0) || 0,
        central: Number(d.cgst || d.cGst || 0) || 0,
        state: Number(d.sgst || d.sGst || d.uT || 0) || 0,
        cess: Number(d.cess || d.cEs || 0) || 0,
        total: Number(d.total || 0) || 0,
      }));
    }
    if (data && typeof data === "object" && Array.isArray(data.demands)) {
      return data.demands.map((d, i) => ({
        sr: i + 1,
        date: money(d.date || d.dt || "—"),
        demandId: String(d.demandid || d.dmdid || d.demandId || d.id || `DEM-${String(i + 1).padStart(4, "0")}`),
        integrated: Number(d.igst || d.iGst || 0) || 0,
        central: Number(d.cgst || d.cGst || 0) || 0,
        state: Number(d.sgst || d.sGst || 0) || 0,
        cess: Number(d.cess || 0) || 0,
        total: Number(d.total || 0) || 0,
      }));
    }
    return [];
  })();

  if (!demands.length) {
    return <EmptyPanel message="No outstanding demands or payment records. Press Update All to fetch from GSTN." expanded={expanded} />;
  }

  // NOTE: renderInfoBar and renderTable are plain functions returning JSX (NOT React components).
  // Defining components with const Foo = () => inside a function body causes React to treat them
  // as new components on every render → unmount+remount → state reset → Maximum update depth loop.
  const renderInfoBar = () => (
    <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "10px 14px", marginBottom: "12px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", fontSize: expanded ? "0.9rem" : "0.75rem", fontWeight: "600", flexShrink: 0, border: "1px solid #e2e8f0" }}>
      <div><div style={{ color: "#64748b", fontWeight: "500", fontSize: expanded ? "0.78rem" : "0.67rem", marginBottom: "2px" }}>GSTIN</div>{gstin || "—"}</div>
      <div><div style={{ color: "#64748b", fontWeight: "500", fontSize: expanded ? "0.78rem" : "0.67rem", marginBottom: "2px" }}>Legal Name</div>{legalName || "—"}</div>
      <div><div style={{ color: "#64748b", fontWeight: "500", fontSize: expanded ? "0.78rem" : "0.67rem", marginBottom: "2px" }}>Trade Name</div>{tradeName || "—"}</div>
    </div>
  );

  const renderTable = () => (
    <>
      <div style={{ fontWeight: "700", fontSize: expanded ? "0.9rem" : "0.76rem", color: "#3730a3", marginBottom: "8px", padding: expanded ? "4px 10px" : "2px 8px", background: "#eff6ff", borderRadius: "6px", display: "inline-block", flexShrink: 0 }}>Outstanding Demand</div>
      <div style={{ flex: 1, overflowX: "auto", overflowY: "auto", minHeight: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: expanded ? "0.88rem" : "0.73rem", minWidth: "580px" }}>
          <thead>
            <tr style={{ background: "#f1f5f9", color: "#334155" }}>
              {["SL","Demand Date","Demand ID","IGST","CGST","SGST","CESS","Total",""].map(h => (
                <th key={h} style={{ padding: expanded ? "10px 10px" : "6px 6px", textAlign: "center", fontWeight: "700", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {demands.map(item => (
              <React.Fragment key={item.sr}>
                <tr style={{ borderBottom: expandedRow === item.sr ? "none" : "1px solid #e5e7eb", background: expandedRow === item.sr ? "#f0f9ff" : "white" }}>
                  <td align="center" style={{ padding: expanded ? "10px" : "6px" }}>{item.sr}.</td>
                  <td align="center" style={{ padding: expanded ? "10px" : "6px", whiteSpace: "nowrap" }}>{item.date}</td>
                  <td align="center" style={{ padding: expanded ? "10px" : "6px", fontFamily: "monospace", fontSize: expanded ? "0.82rem" : "0.67rem", color: "#4f46e5", fontWeight: "600" }}>{item.demandId}</td>
                  <td align="center" style={{ padding: expanded ? "10px" : "6px" }}>{item.integrated === 0 ? "—" : item.integrated.toLocaleString()}</td>
                  <td align="center" style={{ padding: expanded ? "10px" : "6px" }}>{item.central.toLocaleString()}</td>
                  <td align="center" style={{ padding: expanded ? "10px" : "6px" }}>{item.state.toLocaleString()}</td>
                  <td align="center" style={{ padding: expanded ? "10px" : "6px" }}>{item.cess === 0 ? "—" : item.cess.toLocaleString()}</td>
                  <td align="center" style={{ padding: expanded ? "10px" : "6px", fontWeight: "700", color: "#3730a3" }}>{item.total.toLocaleString()}</td>
                  <td align="center" style={{ padding: expanded ? "10px" : "6px" }}>
                    <button onClick={() => setExpandedRow(expandedRow === item.sr ? null : item.sr)} style={{ background: expandedRow === item.sr ? "linear-gradient(135deg,#475569,#64748b)" : "linear-gradient(135deg,#4f46e5,#6D4AFF)", color: "#fff", border: "none", padding: expanded ? "5px 14px" : "3px 9px", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: expanded ? "0.8rem" : "0.67rem" }}>{expandedRow === item.sr ? "▲ Hide" : "▼ Details"}</button>
                  </td>
                </tr>
                {expandedRow === item.sr && (
                  <tr key={`detail-${item.sr}`}>
                    <td colSpan={9} style={{ padding: "0 0 10px", borderBottom: "1px solid #e5e7eb" }}>
                      <div style={{ margin: "4px 10px 0", background: "#eff6ff", borderRadius: "10px", padding: expanded ? "16px" : "12px", border: "1px solid #bfdbfe" }}>
                        <div style={{ fontWeight: "700", fontSize: expanded ? "0.95rem" : "0.77rem", color: "#3730a3", marginBottom: "10px" }}>Demand Details — {item.demandId}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "12px" }}>
                          {[
                            { label: "IGST",      val: item.integrated === 0 ? "₹ —" : `₹ ${item.integrated.toLocaleString()}` },
                            { label: "CGST",      val: `₹ ${item.central.toLocaleString()}` },
                            { label: "SGST / UT", val: `₹ ${item.state.toLocaleString()}` },
                            { label: "CESS",      val: item.cess === 0 ? "₹ —" : `₹ ${item.cess.toLocaleString()}` },
                          ].map(d => (
                            <div key={d.label} style={{ background: "white", borderRadius: "8px", padding: expanded ? "12px 14px" : "8px 10px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                              <div style={{ fontSize: expanded ? "0.78rem" : "0.65rem", color: "#64748b", marginBottom: "3px" }}>{d.label}</div>
                              <div style={{ fontWeight: "700", fontSize: expanded ? "1rem" : "0.82rem", color: "#0f172a" }}>{d.val}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ background: "white", borderRadius: "8px", padding: expanded ? "10px 14px" : "7px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <div style={{ fontSize: expanded ? "0.9rem" : "0.77rem", color: "#475569" }}>Total Demand Amount</div>
                          <div style={{ fontWeight: "800", fontSize: expanded ? "1.15rem" : "0.96rem", color: "#3730a3" }}>₹ {item.total.toLocaleString()}</div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <button onClick={() => setSelectedDemand(item)} style={{ background: "linear-gradient(135deg,#4f46e5,#6D4AFF)", color: "#fff", border: "none", padding: expanded ? "9px 22px" : "7px 18px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: expanded ? "0.88rem" : "0.77rem" }}>💳 Pay Now</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  if (!expanded) {
    return (
      <div style={{ padding: "10px 12px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
{renderInfoBar()}
        {renderTable()}
        {selectedDemand && <PaymentModal demand={selectedDemand} onClose={() => setSelectedDemand(null)} gstin={gstin} tradeName={tradeName} />}
      </div>
    );
  }

  return (
    <ExpandedSection>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "#1e293b", marginBottom: "3px" }}>Payment & Outstanding Demand</div>
        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>GSTIN: {gstin || "—"} · Demand & Payment Records</div>
      </div>
      <ECard style={{ marginBottom: "16px" }}>
        {renderInfoBar()}
      </ECard>
      <ECard style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
          {renderTable()}
        </div>
      </ECard>
      {expanded && (
        <DlFooter>
          <DlBtn label="↓ Download PDF" color="#3730a3" />
        </DlFooter>
      )}
      {selectedDemand && <PaymentModal demand={selectedDemand} onClose={() => setSelectedDemand(null)} gstin={gstin} tradeName={tradeName} />}
    </ExpandedSection>
  );
}

function PaymentModal({ demand, onClose, gstin = "", tradeName = "" }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10000 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "380px", background: "#fff", borderRadius: "14px", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }}>
        <div style={{ background: "linear-gradient(135deg,#4f46e5,#6D4AFF)", color: "#fff", padding: "15px", textAlign: "center", fontWeight: "700", fontSize: "1rem" }}>Payment towards Demand</div>
        <div style={{ padding: "20px" }}>
          <div style={{ marginBottom: "8px", fontSize: "0.88rem" }}><strong>GSTIN:</strong> {gstin || "—"}</div>
          <div style={{ marginBottom: "8px", fontSize: "0.88rem" }}><strong>Trade Name:</strong> {tradeName || "—"}</div>
          <div style={{ marginBottom: "16px", fontSize: "0.88rem" }}><strong>Demand ID:</strong> <span style={{ color: "#4f46e5" }}>{demand.demandId}</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
            <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "10px" }}>
              <div style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: "3px" }}>CGST</div>
              <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>₹{demand.central.toLocaleString()}</div>
            </div>
            <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "10px" }}>
              <div style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: "3px" }}>SGST / UT Tax</div>
              <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>₹{demand.state.toLocaleString()}</div>
            </div>
          </div>
          <div style={{ background: "#eff6ff", borderRadius: "8px", padding: "12px", marginBottom: "18px", textAlign: "center" }}>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: "4px" }}>Total Amount</div>
            <div style={{ fontWeight: "800", fontSize: "1.2rem", color: "#3730a3" }}>₹{demand.total.toLocaleString()}</div>
          </div>
          <button onClick={() => { alert("Payment initiated!"); onClose(); }} style={{ width: "100%", background: "linear-gradient(135deg,#4f46e5,#6D4AFF)", color: "#fff", border: "none", padding: "12px", borderRadius: "9px", fontWeight: "700", cursor: "pointer", fontSize: "0.95rem" }}>Proceed to Pay</button>
        </div>
        <div style={{ borderTop: "1px solid #e5e7eb", padding: "10px", textAlign: "center" }}>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#4f46e5", fontWeight: "600", cursor: "pointer", fontSize: "0.88rem" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function NoticesContent({ expanded = false, live = null, gstin = "" }) {
  const noticesBody = liveBody(live);
  const rows = (noticesBody && Array.isArray(noticesBody.notifications))
    ? noticesBody.notifications.map((n, i) => {
        const created = n && (n.created_at || n.created || n.date || "");
        const due = (n && n.due_date) || "";
        return {
          id: String((n && (n.id !== undefined ? n.id : n.notice_id)) || `N-${String(i + 1).padStart(4, "0")}`),
          type: (n && (n.notification_type || n.type)) || "Notice",
          desc: (n && (n.message || n.title || n.desc)) || "—",
          date: created ? String(created).slice(0, 10) : "—",
          due,
        };
      })
    : [];
  const notices = rows;

  if (!notices.length) {
    return <EmptyPanel message="No notices available for this GSTIN." expanded={expanded} />;
  }

  if (!expanded) {
    return (
      <div style={{ padding: "10px 12px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflowX: "auto", overflowY: "auto", minHeight: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", minWidth: "460px" }}>
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                {["Order ID","Type","Description","Date","Due Date","Action"].map(h => (
                  <th key={h} style={{ padding: "6px 7px", fontWeight: "700", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notices.map(n => (
                <tr key={n.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "6px 7px", fontFamily: "monospace", fontSize: "0.68rem", color: "#4f46e5" }}>{n.id}</td>
                  <td style={{ padding: "6px 7px", fontWeight: "600", whiteSpace: "nowrap" }}>{n.type}</td>
                  <td style={{ padding: "6px 7px", color: "#475569" }}>{n.desc}</td>
                  <td style={{ padding: "6px 7px", whiteSpace: "nowrap" }}>{n.date}</td>
                  <td style={{ padding: "6px 7px", color: "#dc2626", fontWeight: "600", whiteSpace: "nowrap" }}>{n.due}</td>
                  <td style={{ padding: "6px 7px" }}>
                    <button style={{ background: "linear-gradient(135deg,#4f46e5,#6D4AFF)", color: "#fff", border: "none", padding: "3px 9px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "0.68rem" }}>Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── EXPANDED ──
  return (
    <ExpandedSection>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "#1e293b", marginBottom: "3px" }}>Notices & Orders</div>
        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>All GST Notices, Orders & Show Cause Notices</div>
      </div>
      <ECard style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              {["Order ID","Type","Description","Date","Due Date","Action"].map(h => (
                <th key={h} style={{ padding: "13px 14px", fontWeight: "800", fontSize: "0.86rem", color: "#334155", textAlign: "left", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {notices.map((n, i) => (
              <tr key={n.id} style={{ borderBottom: "1px solid #e5e7eb", background: i % 2 === 0 ? "#fff" : "#fafbfc" }}>
                <td style={{ padding: "13px 14px", fontFamily: "monospace", fontSize: "0.82rem", color: "#4f46e5", fontWeight: "600" }}>{n.id}</td>
                <td style={{ padding: "13px 14px", fontWeight: "700", fontSize: "0.88rem", whiteSpace: "nowrap", color: "#1e293b" }}>{n.type}</td>
                <td style={{ padding: "13px 14px", color: "#475569", fontSize: "0.88rem" }}>{n.desc}</td>
                <td style={{ padding: "13px 14px", whiteSpace: "nowrap", fontSize: "0.88rem", color: "#334155" }}>{n.date}</td>
                <td style={{ padding: "13px 14px", color: "#dc2626", fontWeight: "700", whiteSpace: "nowrap", fontSize: "0.88rem" }}>{n.due}</td>
                <td style={{ padding: "13px 14px" }}>
                  <button style={{ background: "linear-gradient(135deg,#4f46e5,#6D4AFF)", color: "#fff", border: "none", padding: "7px 16px", borderRadius: "7px", fontWeight: "600", cursor: "pointer", fontSize: "0.82rem", boxShadow: "0 2px 6px rgba(99,102,241,0.3)" }}>Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ECard>
      <DlFooter>
        <DlBtn label="↓ Download PDF" color="#be123c" />
      </DlFooter>
    </ExpandedSection>
  );
}

const PANELS = [
  { id: "returns",   title: "Return Filing Status",         icon: "📋", color: "linear-gradient(135deg,#4f46e5,#6D4AFF)", ContentComp: ReturnStatusContent,    scrollX: true  },
  { id: "ledger",    title: "Electronic Ledger Balances",   icon: "🏦", color: "linear-gradient(135deg,#065f46,#10b981)", ContentComp: ElectronicLedgerContent, scrollX: false },
  { id: "summary",   title: "Download",                     icon: "⬇️", color: "linear-gradient(135deg,#7c3aed,#a78bfa)", ContentComp: SummaryContent,          scrollX: false },
  { id: "turnover",  title: "Turnover",                     icon: "📊", color: "linear-gradient(135deg,#0369a1,#38bdf8)", ContentComp: TurnoverContent,         scrollX: false },
  { id: "liability", title: "Liability Ledger",             icon: "⚖️", color: "linear-gradient(135deg,#9a3412,#f97316)", ContentComp: LiabilityContent,        scrollX: false },
  { id: "payment",   title: "Payment / Outstanding Demand", icon: "💳", color: "linear-gradient(135deg,#3730a3,#6D4AFF)", ContentComp: PaymentContent,          scrollX: true  },
  { id: "notices",   title: "Notices & Orders",             icon: "🔔", color: "linear-gradient(135deg,#be123c,#f43f5e)", ContentComp: NoticesContent,          scrollX: false },
];

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function GSTDashboard({ initialSection, client }) {
  const [maximized, setMaximized] = useState(null);

  // Client-scoped identity: the GSTIN this dashboard's data belongs to.
  const clientGstin = (client && client.gstin) || "";
  const clientName = (client && (client.company || client.legal_name || client.name)) || "";
  const clientTradeName = (client && client.trade_name) || "";

  // Scroll to the target panel ONCE on mount only — never re-run on re-render
  // Using useRef to track if scroll has already fired for this initialSection value
  const scrolledRef = React.useRef(null);
  React.useEffect(() => {
    if (!initialSection) return;
    // If we already scrolled for this section value, do nothing
    if (scrolledRef.current === initialSection) return;
    scrolledRef.current = initialSection;

    const targetId = initialSection === "notices" ? "panel-notices"
                   : initialSection === "liability" ? "panel-liability"
                   : null;
    if (!targetId) return;

    // Two rAFs: first lets React finish painting, second fires after layout
    let raf1 = requestAnimationFrame(() => {
      let raf2 = requestAnimationFrame(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }); // intentionally no dependency array — the ref guard prevents repeated execution
  const [selectedFY, setSelectedFY] = useState(() => currentFYLabel());
  const [activeFY, setActiveFY]     = useState(() => currentFYLabel());
  const [updating, setUpdating]     = useState(false);
  const [gstnStatus, setGstnStatus] = useState("disconnected");
  const [filedCounts, setFiledCounts] = useState({});
  const [filingRows, setFilingRows]   = useState([]);
  const [retErr, setRetErr]           = useState("");
  const [live, setLive]             = useState({});
  const [creds, setCreds]           = useState([]);
  const [activeGstin, setActiveGstin] = useState("");
  const [connStep, setConnStep]     = useState("idle");
  const [otp, setOtp]               = useState("");
  const [connMsg, setConnMsg]       = useState("");
  const [busy, setBusy]             = useState(false);

  // Which GSTIN drives API calls: the client's own when provided, else the active session.
  const dataGstin = clientGstin || activeGstin;

  const loadFiling = useCallback(async (fy, gstin) => {
    try {
      const res = await gstFilingStatus({ fy, gstin: gstin || undefined });
      if (res && res.success) {
        setGstnStatus(res.gstn === "connected" ? "connected" : "disconnected");
        setFiledCounts(res.filed_counts || {});
        setFilingRows(res.rows || []);
        setRetErr(res.gstn === "connected" ? "" : "No active GSTN session — connect via the GSTN Session bar above.");
      }
    } catch {
      setRetErr("Could not reach GSTN. No filing data to show (press Update All to retry).");
    }
  }, []);

  const refreshPanels = useCallback(async (gstin) => {
    const q = gstin ? { gstin } : {};
    const tasks = [
      ["ledger",   () => gstLedger({ action: "GETITC", ...q })],
      ["ledgerCash", () => gstLedger({ action: "GETCASH", ...q })],
      ["turnover", () => gstFo({ action: "GetGivenMetrics", ...q })],
      ["returns",  () => gstFo({ action: "GetLatestReturns", ...q })],
      ["payment",  () => gstPayment({ action: "STATUS", ...q })],
      ["liability", () => gstPayment({ action: "LIAB_SYSTEM", ...q })],
      ["notices",  () => fetchNotifications().then((r) => ({ notifications: r.data, source: "app" }))],
    ];
    const results = await Promise.all(
      tasks.map(async ([k, fn]) => {
        try { return { k, v: (await fn()).data }; } catch { return { k, v: null }; }
      })
    );
    setLive((prev) => {
      const next = { ...prev };
      results.forEach(({ k, v }) => { if (v) next[k] = v; });
      return next;
    });
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await gstCredentials();
        const list = (res && res.data && res.data.credentials) || [];
        setCreds(list);
        const first = list.find((c) => c.connected) || list[0];
        const initial = clientGstin || (first && first.gstin);
        if (initial) {
          setActiveGstin(initial);
          loadFiling(activeFY, initial);
          refreshPanels(initial);
        } else {
          setGstnStatus("disconnected");
        }
      } catch {
        setGstnStatus("disconnected");
      }
    })();
  }, [loadFiling, refreshPanels]);

  const handleSendOtp = async () => {
    if (!activeGstin || busy) return;
    setBusy(true); setConnMsg("");
    try {
      await gstSendOtp({ gstin: activeGstin });
      setConnStep("otp"); setOtp(""); setConnMsg("OTP sent — read it from the backend terminal.");
    } catch (e) { setConnMsg(errText(e)); }
    setBusy(false);
  };

  const handleVerify = async () => {
    if (busy || !otp.trim()) return;
    setBusy(true);
    const cred = creds.find((c) => c.gstin === activeGstin) || {};
    try {
      const r = await gstAuthenticate({ gstin: activeGstin, username: cred.username || "", otp: otp.trim() });
      if (r && r.data && r.data.success) {
        setConnStep("idle"); setOtp(""); setConnMsg("GSTN connected.");
        await loadFiling(activeFY, activeGstin);
      } else {
        setConnMsg((r && r.data && r.data.detail) || "Verification failed");
      }
    } catch (e) { setConnMsg(errText(e)); }
    setBusy(false);
  };

  const handleGstnLogout = async () => {
    if (busy) return;
    setBusy(true);
    const cred = creds.find((c) => c.gstin === activeGstin) || {};
    try {
      await gstLogout({ gstin: activeGstin, username: cred.username || "" });
      setConnStep("idle"); setConnMsg("Session ended.");
      setGstnStatus("disconnected");
    } catch (e) { setConnMsg(errText(e)); }
    setBusy(false);
  };

  const handleUpdateAll = useCallback(async () => {
    if (updating) return;
    setUpdating(true);
    const target = selectedFY;
    setActiveFY(target);
    setRetErr("");
    try {
      if (dataGstin) {
        await gstFilingSync({ fy: target, gstin: dataGstin, client: client && client.id });
      }
    } catch {
      // Backend still refreshes the matrix from app data; show the grid anyway.
    }
    await Promise.all([loadFiling(target, dataGstin), refreshPanels(dataGstin)]);
    setUpdating(false);
  }, [updating, selectedFY, loadFiling, refreshPanels, dataGstin, client]);

  const panelMap = Object.fromEntries(PANELS.map(p => [p.id, p]));
  const maximizedPanel = maximized ? panelMap[maximized] : null;

  const LIVE_MAP = {
    ledger: "ledger",
    turnover: "turnover",
    liability: "liability",
    payment: "payment",
    notices: "notices",
  };

  const renderPanel = (id, rowHeight) => {
    const p = panelMap[id];
    const liveKey = LIVE_MAP[id];
    return (
      <div key={id} id={`panel-${p.id}`} style={{ scrollMarginTop: "12px" }}>
        <Panel id={p.id} title={p.title} icon={p.icon} color={p.color} onMaximize={setMaximized} scrollX={p.scrollX} fixedHeight={rowHeight}>
          <p.ContentComp
            expanded={false}
            fy={activeFY}
            filed={filedCounts}
            gstn={gstnStatus}
            rows={filingRows}
            client={client}
            gstin={dataGstin}
            legalName={clientName}
            tradeName={clientTradeName}
            live={liveKey ? live[liveKey] : null}
          />
        </Panel>
      </div>
    );
  };

  const rowStyle = (cols, pt = "16px", pb = "0") => ({
    padding: `${pt} 16px ${pb}`, display: "grid",
    gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "14px",
    maxWidth: "1800px", margin: "0 auto",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2ff", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── FY Selector strip ── */}
      <div style={{ maxWidth: "1800px", margin: "0 auto", padding: "12px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>

        {/* ── LEFT: Premium Dashboard Branding ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "11px", flexShrink: 0 }}>
          {/* 3D Icon Box */}
          <div style={{
            width: "42px", height: "42px", borderRadius: "12px",
            background: "linear-gradient(135deg, #3730a3 0%, #4f46e5 55%, #6D4AFF 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 0 rgba(255,255,255,0.18) inset, 0 4px 14px rgba(79,70,229,0.42), 0 8px 24px rgba(79,70,229,0.18)",
            flexShrink: 0, position: "relative", overflow: "hidden",
          }}>
            {/* Sheen overlay */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(180deg,rgba(255,255,255,0.15) 0%,transparent 100%)", borderRadius: "12px 12px 0 0", pointerEvents: "none" }} />
            <HiOutlineViewGrid style={{ fontSize: "20px", color: "#fff", position: "relative", zIndex: 1 }} />
          </div>

          {/* Text */}
          <div>
            <div style={{
              fontWeight: "800", fontSize: "0.95rem", color: "#0f172a", letterSpacing: "-0.2px", lineHeight: "1.15",
              fontFamily: "'Segoe UI', system-ui, sans-serif",
            }}>
              GST Dashboard
            </div>
           
          </div>

          {/* Divider */}
          <div style={{ width: "1px", height: "32px", background: "#e2e8f0", marginLeft: "4px" }} />

          {/* Stats pills */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
           
            <div style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "4px 10px", borderRadius: "20px",
              background: "#f3f0ff", border: "1px solid #c4b5fd",
              fontSize: "0.69rem", fontWeight: "700", color: "#5b21b6",
              boxShadow: "0 1px 3px rgba(22,163,74,0.1)",
            }}>
              <HiOutlineDocumentReport style={{ fontSize: "12px" }} />
              7 Panels
            </div>
          </div>
        </div>

        {/* ── RIGHT: FY + Refresh (original) ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/*
          GS T N Live/Offline status pill — hidden (commented) for the static UI.
        <div
          style={{
            height: "28px", padding: "0 11px", borderRadius: "20px",
            display: "flex", alignItems: "center", gap: "6px",
            fontSize: "0.71rem", fontWeight: "800", whiteSpace: "nowrap",
            color: gstnStatus === "connected" ? "#047857" : "#b45309",
            background: gstnStatus === "connected" ? "#d1fae5" : "#fef3c7",
            border: `1px solid ${gstnStatus === "connected" ? "#6ee7b7" : "#fcd34d"}`,
          }}
          title={retErr || "GSTN API session status"}
        >
          <span style={{ fontSize: "0.62rem", lineHeight: 1 }}>{gstnStatus === "connected" ? "●" : "○"}</span>
          GSTN {gstnStatus === "connected" ? "Live" : "Offline"}
        </div>
        */}
        <div style={{ height: "36px",margin:"12px", display: "flex", alignItems: "center", fontSize: "0.72rem", color: "#64748b", fontWeight: "900", letterSpacing: "0.2px", whiteSpace: "nowrap" }}>Financial Year</div>
        <FYDropdown value={selectedFY} onChange={setSelectedFY} years={FINANCIAL_YEARS} />
        <button onClick={handleUpdateAll} disabled={updating} style={{
          height: "36px", minHeight: "36px", maxHeight: "36px", fontSize: "0.75rem", fontWeight: "700",
          color: updating ? "#94a3b8" : "#fff",
          background: updating ? "#e2e8f0" : "linear-gradient(135deg,#4f46e5,#6D4AFF)",
          border: "none", borderRadius: "8px", padding: "0 13px",
          cursor: updating ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
          boxShadow: updating ? "none" : "0 2px 8px rgba(109,74,255,0.40)", transition: "all 0.2s", whiteSpace: "nowrap", boxSizing: "border-box",
        }}>
          <span style={{ display: "inline-block", animation: updating ? "spin 0.7s linear infinite" : "none", fontSize: "0.78rem", lineHeight: 1 }}>↻</span>
          {updating ? "Updating…" : "Update All"}
        </button>
        </div>{/* end right side */}
      </div>

      <div style={{ height: "10px" }} />

      {/*
      ── GSTN Session bar (login with a credential) — hidden (commented) for static UI.
      <div style={{ maxWidth: "1800px", margin: "0 auto", padding: "0 16px" }}>
        <div style={{
          background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0",
          padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px",
          flexWrap: "wrap", boxShadow: "0 2px 10px rgba(15,23,42,0.05)",
        }}>
          <span style={{ fontSize: "0.74rem", fontWeight: "800", color: "#334155", whiteSpace: "nowrap" }}>
            ⌁ GSTN Session
          </span>
          <select
            value={activeGstin}
            onChange={(e) => { setActiveGstin(e.target.value); loadFiling(activeFY, e.target.value); }}
            style={{ padding: "7px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.78rem", fontWeight: "600", background: "#fff", color: "#1e293b", maxWidth: "360px" }}
          >
            {creds.length === 0 ? (
              <option value="">No saved sessions</option>
            ) : (
              creds.map((c) => (
                <option key={c.gstin} value={c.gstin}>
                  {c.username} · {c.gstin}{c.connected ? " · LIVE" : ""}
                </option>
              ))
            )}
          </select>
          {connStep === "otp" ? (
            <>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter app OTP (see terminal)"
                style={{ padding: "7px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.78rem", width: "170px" }}
              />
              <button onClick={handleVerify} disabled={busy} style={{ height: "32px", fontSize: "0.74rem", fontWeight: "700", color: "#fff", background: "linear-gradient(135deg,#059669,#10b981)", border: "none", borderRadius: "8px", padding: "0 12px", cursor: busy ? "not-allowed" : "pointer" }}>
                {busy ? "…" : "Verify"}
              </button>
              <button onClick={() => setConnStep("idle")} style={{ height: "32px", fontSize: "0.74rem", fontWeight: "600", color: "#475569", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "0 10px", cursor: "pointer" }}>
                Cancel
              </button>
            </>
          ) : (
            <button onClick={handleSendOtp} disabled={busy} style={{ height: "32px", fontSize: "0.74rem", fontWeight: "700", color: "#fff", background: "linear-gradient(135deg,#4f46e5,#6D4AFF)", border: "none", borderRadius: "8px", padding: "0 13px", cursor: busy ? "not-allowed" : "pointer", boxShadow: "0 2px 8px rgba(109,74,255,0.35)" }}>
              {busy ? "…" : "Connect GSTN"}
            </button>
          )}
          <button onClick={handleGstnLogout} disabled={busy} style={{ height: "32px", fontSize: "0.74rem", fontWeight: "600", color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "0 12px", cursor: busy ? "not-allowed" : "pointer" }}>
            Logout
          </button>
          {connMsg && (
            <span style={{ fontSize: "0.74rem", fontWeight: "600", color: gstnStatus === "connected" ? "#047857" : "#b45309" }}>{connMsg}</span>
          )}
        </div>
      </div>
      */}

      {/* ── Row 1 ── Returns (2 cols) + Ledger (1 col) */}
      <div style={rowStyle(3, "0px", "0")}>
        <div style={{ gridColumn: "span 2" }}>{renderPanel("returns", ROW1_H)}</div>
        <div style={{ gridColumn: "span 1" }}>{renderPanel("ledger", ROW1_H)}</div>
      </div>

      {/* ── Row 2 ── Download + Turnover + Liability */}
      <div style={rowStyle(3, "14px", "0")}>
        {renderPanel("summary",   ROW2_LIABILITY_H)}
        {renderPanel("turnover",  ROW2_LIABILITY_H)}
        {renderPanel("liability", ROW2_LIABILITY_H)}
      </div>

      {/* ── Row 3 ── Payment + Notices */}
      <div style={rowStyle(2, "14px", "16px")}>
        {renderPanel("payment", ROW3_H)}
        {renderPanel("notices", ROW3_H)}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {maximizedPanel && (
        <MaximizedModal title={maximizedPanel.title} icon={maximizedPanel.icon} color={maximizedPanel.color} scrollX={maximizedPanel.scrollX} onClose={() => setMaximized(null)}>
          <maximizedPanel.ContentComp
            expanded={true}
            fy={activeFY}
            filed={filedCounts}
            gstn={gstnStatus}
            rows={filingRows}
            client={client}
            gstin={dataGstin}
            legalName={clientName}
            tradeName={clientTradeName}
            live={LIVE_MAP[maximizedPanel.id] ? live[LIVE_MAP[maximizedPanel.id]] : null}
          />
        </MaximizedModal>
      )}
    </div>
  );
}