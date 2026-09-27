import React, { useState, useCallback } from "react";

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
import { gstFilingStatus, gstCredentials, gstSendOtp, gstAuthenticate, gstLogout } from "../api/services";

const errText = (e) =>
  (e && e.response && e.response.data && (e.response.data.detail || e.response.data.message)) ||
  (e && e.message) ||
  "Request failed";


const FINANCIAL_YEARS = [
  "2025-26","2024-25","2023-24","2022-23","2021-22",
  "2020-21","2019-20","2018-19","2017-18"
];

const outstandingDemands = [
  { sr: 1, date: "20/02/2026", demandId: "ZD090126214512Q", integrated: 0, central: 50620, state: 50620, cess: 0, total: 101240 },
  { sr: 2, date: "28/08/2025", demandId: "ZD09015202548IR", integrated: 0, central: 125320, state: 18340, cess: 1850, total: 145510 },
];

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

function DuePills({ small = false }) {
  const items = [{ label: "GSTR-9 Due" }, { label: "GSTR-9C Due" }, { label: "IMS Due" }];
  return (
    <div style={{ display: "flex", gap: "5px", alignItems: "center", flexWrap: "nowrap" }}>
      {items.map(item => (
        <div key={item.label} style={{
          display: "flex", alignItems: "center", gap: "4px",
          border: "1px solid #fca5a540", background: "#fef2f2", color: "#dc2626",
          padding: small ? "2px 7px" : "4px 10px", borderRadius: "999px",
          fontSize: small ? "0.62rem" : "0.72rem", fontWeight: "700", whiteSpace: "nowrap",
        }}>
          <span style={{ color: "#dc2626", fontSize: small ? "0.58rem" : "0.68rem" }}>⚠</span>
          {item.label}
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

function ReturnStatusContent({ expanded = false, fy = "2025-26", filed = {}, gstn = "disconnected" }) {
  const staticCounts = { "GSTR-1": 9, "GSTR-1A": 0, "GSTR-3B": 8, "TDS/TCS": 8 };
  const liveCounts = {
    "GSTR-1": filed.GSTR1,
    "GSTR-1A": filed.GSTR1A,
    "GSTR-3B": filed.GSTR3B,
    "TDS/TCS": filed.TDS_TCS,
  };
  const returns = ["GSTR-1", "GSTR-1A", "GSTR-3B", "TDS/TCS"].map((name) => ({
    name,
    filed: typeof liveCounts[name] === "number" ? (liveCounts[name] || 0) : staticCounts[name],
  }));
  const months = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const live = gstn === "connected";

  if (!expanded) {
    return (
      <div style={{ padding: "8px 12px 10px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
          <span style={{
            fontSize: "0.68rem", fontWeight: "700", borderRadius: "12px", padding: "3px 9px",
            color: live ? "#047857" : "#b45309",
            background: live ? "#d1fae5" : "#fef3c7",
          }}>
            {live ? `● GSTN Connected · FY ${fy}` : `○ GSTN Disconnected · FY ${fy}`}
          </span>
          <DuePills small />
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
                </div>
                {Array.from({ length: 12 }, (_, i) => {
                  const filed = i < ret.filed;
                  const isDue = i >= 9;
                  return (
                    <div key={i} style={{
                      background: filed ? "#f0fdf4" : isDue ? "#fff1f2" : "#fffbeb",
                      borderRadius: "7px", padding: "4px 2px", textAlign: "center",
                      minHeight: "48px", border: `1px solid ${filed ? "#bbf7d0" : isDue ? "#fecdd3" : "#fde68a"}`,
                      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                    }}>
                      {filed ? (
                        <div style={{ color: "#059669", fontWeight: "800", fontSize: "0.60rem" }}>✅ Filed</div>
                      ) : isDue ? (
                        <div style={{ color: "#dc2626", fontWeight: "800", fontSize: "0.60rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "3px" }}>
                          ⚠️ Due <FaWhatsapp style={{ color: "#25D366", fontSize: "0.75rem", flexShrink: 0 }} />
                        </div>
                      ) : (
                        <div style={{ color: "#d97706", fontWeight: "800", fontSize: "0.60rem" }}>🕒 Pending</div>
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
            FY {fy} · All Return Types ·{" "}
            <span style={{ color: live ? "#059669" : "#b45309", fontWeight: "700" }}>
              {live ? "Live" : "Sample"}
            </span>
          </div>
        </div>
        <DuePills />
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
            {/* <a href="#" style={{ fontSize: "0.72rem", color: "#4f46e5", textDecoration: "none", fontWeight: "600" }}>View All →</a> */}
            <button style={{
              marginTop: "6px", border: "none", alignSelf: "flex-start",
              background: "linear-gradient(135deg,#4f46e5,#6D4AFF)", color: "#fff",
              borderRadius: "6px", padding: "4px 10px", fontSize: "0.68rem", fontWeight: "700",
              cursor: "pointer", boxShadow: "0 2px 6px rgba(79,70,229,0.35)", whiteSpace: "nowrap",
            }}>⬇ Download All</button>
          </div>
          {Array.from({ length: 12 }, (_, i) => {
            const filed = i < ret.filed;
            const isDue = i >= 9;
            return (
              <div key={i} style={{
                background: filed ? "#f0fdf4" : isDue ? "#fff1f2" : "#fffbeb",
                borderRadius: "10px", padding: "8px 3px", textAlign: "center",
                minHeight: "76px", border: `1px solid ${filed ? "#bbf7d0" : isDue ? "#fecdd3" : "#fde68a"}`,
                cursor: "pointer", display: "flex", flexDirection: "column",
                justifyContent: "center", alignItems: "center", gap: "4px",
                boxShadow: filed ? "0 1px 4px rgba(5,150,105,0.10)" : isDue ? "0 1px 4px rgba(220,38,38,0.10)" : "0 1px 4px rgba(217,119,6,0.10)",
              }}>
                {filed ? (
                  <>
                    <div style={{ color: "#059669", fontWeight: "800", fontSize: "0.76rem" }}>✅ Filed</div>
                    <div style={{ color: "#64748b", fontSize: "0.65rem" }}>ARN: {String(i+1).padStart(3,"0")}</div>
                    <button style={{ border: "none", background: "linear-gradient(135deg,#4f46e5,#6D4AFF)", color: "white", borderRadius: "5px", padding: "3px 8px", fontSize: "0.65rem", fontWeight: "700", cursor: "pointer" }}>Download</button>
                  </>
                ) : isDue ? (
                  <div style={{ color: "#dc2626", fontWeight: "800", fontSize: "0.80rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                    ⚠️ Due <FaWhatsapp style={{ color: "#25D366", fontSize: "0.95rem", flexShrink: 0 }} />
                  </div>
                ) : (
                  <div style={{ color: "#d97706", fontWeight: "800", fontSize: "0.78rem" }}>🕒 Pending</div>
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

function ElectronicLedgerContent({ expanded = false }) {
  const ledgerRows = [
    { name: "Liability Register\n(Return Related)", igst: "1,000", cgst: "1,950", sgst: "1,950", cess: "—", total: "4,900" },
    { name: "Cash Balance", igst: "25,165", cgst: "12,324", sgst: "5,632", cess: "15,635", total: "58,756" },
    { name: "Credit Balance", igst: "30,560", cgst: "15,820", sgst: "5,340", cess: "1,525", total: "53,245" },
    { name: "Credit Reversal &\nRe-claimed", igst: "28,132", cgst: "52", sgst: "15,828", cess: "42", total: "44,054" },
    { name: "RCM Liability/\nITC Statement", igst: "—", cgst: "—", sgst: "—", cess: "—", total: "—" },
    { name: "Negative Liability\nStatement", igst: "—", cgst: "—", sgst: "—", cess: "—", total: "—" },
    { name: "Regular Taxpayers", igst: "—", cgst: "—", sgst: "—", cess: "—", total: "—" },
  ];

  if (!expanded) {
    const thStyle = { padding: "6px 7px", textAlign: "center", fontWeight: "700", fontSize: "0.70rem", background: "#f1f5f9", color: "#1e293b", borderBottom: "2px solid #e2e8f0", lineHeight: "1.1", whiteSpace: "nowrap" };
    const cellStyle = { padding: "5px 7px", textAlign: "center", fontSize: "0.72rem", borderBottom: "1px solid #f1f5f9", color: "#334155", verticalAlign: "middle", lineHeight: "1.15" };
    const nameCellStyle = { padding: "5px 7px", fontSize: "0.71rem", fontWeight: "600", color: "#0f172a", borderBottom: "1px solid #f1f5f9", whiteSpace: "pre-line", lineHeight: "1.2", verticalAlign: "middle", textAlign: "left" };
    return (
      <div style={{ padding: "10px 12px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "38%" }} /><col style={{ width: "12.4%" }} /><col style={{ width: "12.4%" }} />
              <col style={{ width: "12.4%" }} /><col style={{ width: "12.4%" }} /><col style={{ width: "12.4%" }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ ...thStyle, textAlign: "left", borderRadius: "4px 0 0 0" }}>Ledger Name</th>
                {["IGST","CGST","SGST","CESS","Total"].map((h, i, arr) => (
                  <th key={h} style={{ ...thStyle, borderRadius: i === arr.length - 1 ? "0 4px 0 0" : "0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ledgerRows.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafb" : "#fff" }}>
                  <td style={nameCellStyle}>{row.name}</td>
                  <td style={cellStyle}>{row.igst}</td>
                  <td style={cellStyle}>{row.cgst}</td>
                  <td style={cellStyle}>{row.sgst}</td>
                  <td style={cellStyle}>{row.cess}</td>
                  <td style={{ ...cellStyle, fontWeight: "700", color: "#1e293b" }}>{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── EXPANDED ──
  const headers = ["Ledger Name", "IGST", "CGST", "SGST", "CESS", "Total"];
  return (
    <ExpandedSection>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "#1e293b", marginBottom: "3px" }}>Electronic Ledger Balances</div>
        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>GSTIN: 09ACNPU2195H1ZY · All Ledger Types</div>
      </div>
      <ECard style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <colgroup>
            <col style={{ width: "34%" }} /><col style={{ width: "13.2%" }} /><col style={{ width: "13.2%" }} />
            <col style={{ width: "13.2%" }} /><col style={{ width: "13.2%" }} /><col style={{ width: "13.2%" }} />
          </colgroup>
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              {headers.map((h, i) => (
                <th key={h} style={{
                  padding: "13px 14px", fontWeight: "800", fontSize: "0.84rem",
                  color: "#334155", borderBottom: "2px solid #e2e8f0",
                  textAlign: i === 0 ? "left" : "center", whiteSpace: "nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ledgerRows.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafb" : "#fff" }}>
                <td style={{ padding: "13px 14px", fontSize: "0.88rem", fontWeight: "600", color: "#0f172a", whiteSpace: "pre-line", lineHeight: "1.4", borderBottom: "1px solid #f1f5f9" }}>{row.name}</td>
                {[row.igst, row.cgst, row.sgst, row.cess].map((v, j) => (
                  <td key={j} style={{ padding: "13px 14px", textAlign: "center", fontSize: "0.88rem", color: "#334155", borderBottom: "1px solid #f1f5f9" }}>{v}</td>
                ))}
                <td style={{ padding: "13px 14px", textAlign: "center", fontSize: "0.92rem", fontWeight: "800", color: "#065f46", borderBottom: "1px solid #f1f5f9" }}>{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ECard>
      <DlFooter>
        <DlBtn label="↓ Download PDF" color="#065f46" />
      </DlFooter>
    </ExpandedSection>
  );
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

function TurnoverContent({ expanded = false }) {
  const rows = [
    { label: "Turnover Estimated (GSTIN)", amount: "5,10,50,620.25" },
    { label: "Turnover Based on Returns filed (GSTIN)", amount: "8,25,30,680.03" },
    { label: "Aggregate Turnover Estimated (PAN)", amount: "10,25,80,685.89" },
    { label: "Aggregate Turnover Based on Returns filed (PAN)", amount: "8,25,30,680.83" },
  ];

  if (!expanded) {
    const th = { padding: "7px 9px", fontWeight: "700", fontSize: "0.74rem", background: "#f1f5f9", color: "#1e293b", borderBottom: "2px solid #e2e8f0" };
    return (
      <div style={{ padding: "10px 12px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...th, textAlign: "left", borderRadius: "4px 0 0 0" }}>Particulars</th>
                <th style={{ ...th, textAlign: "right", borderRadius: "0 4px 0 0" }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "8px 9px", fontSize: "0.77rem", color: "#1e293b", fontWeight: "500" }}>{row.label}</td>
                  <td style={{ padding: "8px 9px", textAlign: "right", fontSize: "0.80rem", fontWeight: "700", color: "#1e293b", fontFamily: "monospace" }}>{row.amount}</td>
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
        <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "#1e293b", marginBottom: "3px" }}>Turnover Summary</div>
        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Estimated & Filed Turnover · GSTIN & PAN Level</div>
      </div>
      <ECard style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              <th style={{ padding: "14px 16px", fontWeight: "800", fontSize: "0.88rem", color: "#334155", textAlign: "left", borderBottom: "2px solid #e2e8f0", borderRadius: "4px 0 0 0" }}>Particulars</th>
              <th style={{ padding: "14px 16px", fontWeight: "800", fontSize: "0.88rem", color: "#334155", textAlign: "right", borderBottom: "2px solid #e2e8f0", borderRadius: "0 4px 0 0" }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "14px 16px", fontSize: "0.92rem", color: "#1e293b", fontWeight: "500" }}>{row.label}</td>
                <td style={{ padding: "14px 16px", textAlign: "right", fontSize: "1rem", fontWeight: "800", color: "#0369a1", fontFamily: "monospace" }}>{row.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ECard>
      <DlFooter>
        <DlBtn label="↓ Download PDF" color="#0369a1" />
      </DlFooter>
    </ExpandedSection>
  );
}

function LiabilityContent({ expanded = false }) {
  const sections = [
    {
      title: "Liability Statement", accentColor: "#f97316",
      headers: ["Particulars","IGST","CGST","SGST","CESS","Total"],
      rows: [
        { label: "Liability (GSTR-3B)", vals: ["1,000","1,950","1,950","—","4,900"] },
        { label: "Liability (GSTR-1)",  vals: ["1,000","2,000","2,000","—","5,000"] },
        { label: "Difference", vals: ["—","50","50","—","100"], highlight: "#fee2e2", textColor: "#b91c1c" },
      ],
    },
    {
      title: "Input Tax Statement", accentColor: "#0369a1",
      headers: ["Particulars","IGST","CGST","SGST","CESS","Total"],
      rows: [
        { label: "ITC (GSTR-3B)", vals: ["5,320","8,450","8,450","—","22,220"] },
        { label: "ITC (GSTR-2B)", vals: ["3,320","9,000","9,000","1,580","24,320"] },
        { label: "Difference", vals: ["2,000","(550)","(550)","(1,529)","(2,100)"], highlight: "#fef3c7", textColor: "#b45309" },
      ],
    },
  ];

  if (!expanded) {
    const thStyle = { padding: "4px 5px", fontWeight: "700", fontSize: "0.66rem", textAlign: "center", color: "#475569", background: "#f8fafc", lineHeight: "1.05", whiteSpace: "nowrap", boxSizing: "border-box" };
    const tdStyle = { padding: "4px 5px", fontSize: "0.7rem", textAlign: "right", borderBottom: "1px solid #f1f5f9", lineHeight: "1.05", whiteSpace: "nowrap", boxSizing: "border-box" };
    const colgroup = <><col style={{ width: "34%" }} /><col style={{ width: "13.2%" }} /><col style={{ width: "13.2%" }} /><col style={{ width: "13.2%" }} /><col style={{ width: "13.2%" }} /><col style={{ width: "13.2%" }} /></>;
    return (
      <div style={{ padding: "5px 8px", height: "100%", boxSizing: "border-box", display: "grid", gridTemplateRows: "minmax(0, 1fr) minmax(0, 1fr)", gap: "4px", overflow: "hidden" }}>
        {sections.map(sec => (
          <div key={sec.title} style={{ flex: "1 1 0", minHeight: 0, display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" }}>
            <div style={{ fontWeight: "700", fontSize: "0.69rem", color: "#334155", paddingLeft: "8px", borderLeft: `3px solid ${sec.accentColor}`, lineHeight: "1.05", flexShrink: 0, whiteSpace: "nowrap" }}>{sec.title}</div>
            <div style={{ background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 5px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", flex: "1 1 auto", minHeight: 0 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                <colgroup>{colgroup}</colgroup>
                <thead>
                  <tr>{sec.headers.map(h => <th key={h} style={{ ...thStyle, textAlign: h === "Particulars" ? "left" : "center" }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {sec.rows.map((row, i) => (
                    <tr key={i} style={{ background: row.highlight || (i % 2 === 0 ? "#fff" : "#fafbfc") }}>
                      <td style={{ ...tdStyle, textAlign: "left", fontWeight: row.highlight ? "700" : "600", color: row.textColor || "#1e293b", whiteSpace: "normal", overflowWrap: "anywhere" }}>{row.label}</td>
                      {row.vals.map((v, j) => <td key={j} style={{ ...tdStyle, fontWeight: row.highlight ? "700" : "600", color: row.textColor || "#334155", textAlign: "center" }}>{v}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── EXPANDED ──
  return (
    <ExpandedSection>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "#1e293b", marginBottom: "3px" }}>Liability Ledger</div>
        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Liability & ITC Comparison · GSTR-3B vs GSTR-1/2B</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {sections.map(sec => (
          <ECard key={sec.title} style={{ padding: 0, overflow: "hidden", border: `1.5px solid ${sec.accentColor}25` }}>
            <div style={{ padding: "12px 16px", borderBottom: `2px solid ${sec.accentColor}30`, background: `${sec.accentColor}08`, display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "4px", height: "20px", background: sec.accentColor, borderRadius: "2px" }} />
              <span style={{ fontWeight: "800", fontSize: "0.95rem", color: "#1e293b" }}>{sec.title}</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <colgroup>
                <col style={{ width: "35%" }} />{[1,2,3,4,5].map(i => <col key={i} style={{ width: "13%" }} />)}
              </colgroup>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {sec.headers.map(h => (
                    <th key={h} style={{ padding: "11px 14px", fontWeight: "800", fontSize: "0.84rem", color: "#475569", borderBottom: "1px solid #e2e8f0", textAlign: h === "Particulars" ? "left" : "center" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sec.rows.map((row, i) => (
                  <tr key={row.label} style={{ background: row.highlight || (i % 2 === 0 ? "#fff" : "#fafbfc"), borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 14px", fontSize: "0.9rem", fontWeight: row.highlight ? "700" : "600", color: row.textColor || "#1e293b" }}>{row.label}</td>
                    {row.vals.map((v, j) => (
                      <td key={j} style={{ padding: "12px 14px", fontSize: "0.9rem", fontWeight: row.highlight ? "700" : "600", color: row.textColor || "#334155", textAlign: "center" }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </ECard>
        ))}
      </div>
      <DlFooter>
        <DlBtn label="↓ Download PDF" color="#9a3412" />
      </DlFooter>
    </ExpandedSection>
  );
}

function PaymentContent({ expanded = false }) {
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedDemand, setSelectedDemand] = useState(null);

  // NOTE: renderInfoBar and renderTable are plain functions returning JSX (NOT React components).
  // Defining components with const Foo = () => inside a function body causes React to treat them
  // as new components on every render → unmount+remount → state reset → Maximum update depth loop.
  const renderInfoBar = () => (
    <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "10px 14px", marginBottom: "12px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", fontSize: expanded ? "0.9rem" : "0.75rem", fontWeight: "600", flexShrink: 0, border: "1px solid #e2e8f0" }}>
      <div><div style={{ color: "#64748b", fontWeight: "500", fontSize: expanded ? "0.78rem" : "0.67rem", marginBottom: "2px" }}>GSTIN</div>09ACNPU2195H1ZY</div>
      <div><div style={{ color: "#64748b", fontWeight: "500", fontSize: expanded ? "0.78rem" : "0.67rem", marginBottom: "2px" }}>Legal Name</div>Mohd Umair</div>
      <div><div style={{ color: "#64748b", fontWeight: "500", fontSize: expanded ? "0.78rem" : "0.67rem", marginBottom: "2px" }}>Trade Name</div>U.A.F ENTERPRISE'S</div>
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
            {outstandingDemands.map(item => (
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
        {selectedDemand && <PaymentModal demand={selectedDemand} onClose={() => setSelectedDemand(null)} />}
      </div>
    );
  }

  return (
    <ExpandedSection>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "#1e293b", marginBottom: "3px" }}>Payment & Outstanding Demand</div>
        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>GSTIN: 09ACNPU2195H1ZY · Demand & Payment Records</div>
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
      {selectedDemand && <PaymentModal demand={selectedDemand} onClose={() => setSelectedDemand(null)} />}
    </ExpandedSection>
  );
}

function PaymentModal({ demand, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10000 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "380px", background: "#fff", borderRadius: "14px", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }}>
        <div style={{ background: "linear-gradient(135deg,#4f46e5,#6D4AFF)", color: "#fff", padding: "15px", textAlign: "center", fontWeight: "700", fontSize: "1rem" }}>Payment towards Demand</div>
        <div style={{ padding: "20px" }}>
          <div style={{ marginBottom: "8px", fontSize: "0.88rem" }}><strong>GSTIN:</strong> 09ACNPU2195H1ZY</div>
          <div style={{ marginBottom: "8px", fontSize: "0.88rem" }}><strong>Trade Name:</strong> U.A.F ENTERPRISE'S</div>
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

function NoticesContent({ expanded = false }) {
  const notices = [
    { id: "2009122566513017", type: "Rectification of order", desc: "Application Rejected",           date: "20/12/2025", due: "As Applicable" },
    { id: "20092251740164",   type: "Determination of Tax",   desc: "Order for Determination of Tax", date: "10/12/2025", due: "As Applicable" },
    { id: "ZD090925509429T",  type: "Determination of Tax",   desc: "Show Cause Notice (GST DRC-01)", date: "30/09/2025", due: "As Applicable" },
    { id: "2409031308824C",   type: "Notice",                  desc: "Notice to Return Defaulter",    date: "27/09/2021", due: "12/10/2021"    },
  ];

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
export default function GSTDashboard({ initialSection }) {
  const [maximized, setMaximized] = useState(null);

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
  const [selectedFY, setSelectedFY] = useState("2025-26");
  const [activeFY, setActiveFY]     = useState("2025-26");
  const [updating, setUpdating]     = useState(false);
  const [gstnStatus, setGstnStatus] = useState("disconnected");
  const [filedCounts, setFiledCounts] = useState({});
  const [retErr, setRetErr]         = useState("");
  const [creds, setCreds]           = useState([]);
  const [activeGstin, setActiveGstin] = useState("");
  const [connStep, setConnStep]     = useState("idle");
  const [otp, setOtp]               = useState("");
  const [connMsg, setConnMsg]       = useState("");
  const [busy, setBusy]             = useState(false);

  const loadFiling = useCallback(async (fy, gstin) => {
    try {
      const res = await gstFilingStatus({ fy, gstin: gstin || undefined });
      if (res && res.success) {
        setGstnStatus(res.gstn === "connected" ? "connected" : "disconnected");
        setFiledCounts(res.filed_counts || {});
        setRetErr(res.gstn === "connected" ? "" : "No active GSTN session — connect via the GSTN Session bar above.");
      }
    } catch {
      setRetErr("Could not reach GSTN. Showing sample data (Update All to retry).");
    }
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await gstCredentials();
        const list = (res && res.data && res.data.credentials) || [];
        setCreds(list);
        const first = list.find((c) => c.connected) || list[0];
        if (first) {
          setActiveGstin(first.gstin);
          loadFiling("2025-26", first.gstin);
        } else {
          setGstnStatus("disconnected");
        }
      } catch {
        setGstnStatus("disconnected");
      }
    })();
  }, [loadFiling]);

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
    await loadFiling(target, activeGstin);
    setUpdating(false);
  }, [updating, selectedFY, loadFiling, activeGstin]);

  const panelMap = Object.fromEntries(PANELS.map(p => [p.id, p]));
  const maximizedPanel = maximized ? panelMap[maximized] : null;

  const renderPanel = (id, rowHeight) => {
    const p = panelMap[id];
    return (
      <div key={id} id={`panel-${p.id}`} style={{ scrollMarginTop: "12px" }}>
        <Panel id={p.id} title={p.title} icon={p.icon} color={p.color} onMaximize={setMaximized} scrollX={p.scrollX} fixedHeight={rowHeight}>
          <p.ContentComp expanded={false} fy={activeFY} filed={filedCounts} gstn={gstnStatus} />
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

      {/* ── GSTN Session bar (login with a credential) ── */}
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
            {creds.map((c) => (
              <option key={c.gstin} value={c.gstin}>
                {c.username} · {c.gstin}{c.connected ? " · LIVE" : ""}
              </option>
            ))}
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
          <maximizedPanel.ContentComp expanded={true} fy={activeFY} filed={filedCounts} gstn={gstnStatus} />
        </MaximizedModal>
      )}
    </div>
  );
}