import { useEffect, useState } from "react";
import LimitedInput from "./LimitedInput";
import { toast } from "react-toastify";
import { createClient, updateClient, verifyGstin } from "../api/services";

const today = () => new Date().toISOString().split("T")[0];

const emptyForm = () => ({
  gstin: "",
  tradeName: "",
  email: "",
  legalName: "",
  mobile: "",
  pan: "",
  address: "",
  city: "",
  pincode: "",
  state: "",
  taxpayerType: "",
  registrationDate: today(),
});

const stateMap = {
  "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
  "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana",
  "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
  "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
  "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
  "16": "Tripura", "17": "Meghalaya", "18": "Assam",
  "19": "West Bengal", "20": "Jharkhand", "21": "Odisha",
  "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
  "25": "Daman & Diu", "26": "Dadra & Nagar Haveli", "27": "Maharashtra",
  "28": "Andhra Pradesh", "29": "Karnataka", "30": "Goa",
  "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu",
  "34": "Puducherry", "35": "Andaman & Nicobar Islands", "36": "Telangana",
  "37": "Andhra Pradesh (New)", "38": "Ladakh",
};

const inputStyle = {
  width: "100%", padding: "11px 13px", borderRadius: "10px",
  border: "1.5px solid #d1d5db", fontSize: "0.88rem",
  background: "#f9fafb", boxSizing: "border-box", transition: "border 0.15s",
};

const labelStyle = {
  fontWeight: 700, display: "block", marginBottom: "6px",
  fontSize: "0.82rem", color: "#334155",
  textTransform: "uppercase", letterSpacing: "0.04em",
};

const focusIn = (e) => (e.target.style.border = "1.5px solid #4f46e5");
const focusOut = (e) => (e.target.style.border = "1.5px solid #d1d5db");

export default function AddClientModal({
  open,
  initialClient = null,
  onClose,
  onSaved,
  checkLimit,
  onLimitReached,
}) {
  const isEdit = !!initialClient;
  const [form, setForm] = useState(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSubmitting(false);
    setLookupLoading(false);
    if (initialClient) {
      setForm({
        gstin: initialClient.gstin || "",
        tradeName: initialClient.tradeName || initialClient.name || "",
        legalName: initialClient.legalName || "",
        email: initialClient.email || "",
        mobile: initialClient.mobile || "",
        pan: initialClient.pan || "",
        address: initialClient.address || "",
        city: initialClient.city || "",
        pincode: initialClient.pincode || "",
        state: initialClient.state || "",
        taxpayerType: initialClient.taxpayerType || initialClient.registrationType || "",
        registrationDate: initialClient.registrationDate || today(),
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, initialClient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGSTINLookup = () => {
    const gstin = form.gstin.trim().toUpperCase();
    if (gstin.length !== 15) {
      toast.error("GSTIN 15 characters ka hona chahiye lookup ke liye!");
      return;
    }
    const derive = () => ({
      pan: gstin.substring(2, 12),
      state: stateMap[gstin.substring(0, 2)] || "",
    });
    setLookupLoading(true);
    verifyGstin(gstin)
      .then(({ data }) => {
        if (!data.success) throw new Error(data.detail || "GSTIN not found");
        const { pan, state } = derive();
        setForm((prev) => ({
          ...prev,
          gstin,
          pan: data.pan || pan,
          state: data.state || state,
          legalName: data.company_name || data.name || prev.legalName,
          tradeName: data.trade_name || data.company_name || prev.tradeName,
          address: data.address || prev.address,
          city: data.city || prev.city,
          pincode: data.pincode || prev.pincode,
          taxpayerType: prev.taxpayerType || "Regular",
        }));
        toast.success("GSTIN verified from live GSTN (Vanaya)! Remaining fields fill kar lein.");
      })
      .catch((err) => {
        const detail = err?.response?.data?.detail
          || (err?.response
            ? "GSTIN invalid hai — sandbox me ye GST number nahi mila. Sahi GSTIN daalein."
            : "Live GSTN lookup unavailable (network error). Dobara try karein.");
        setForm((prev) => ({ ...prev, gstin }));
        toast.error(`❌ ${detail}`);
      })
      .finally(() => setLookupLoading(false));
  };

  const submit = () => {
    const gstin = form.gstin.trim().toUpperCase();
    const mobile = form.mobile.trim();
    const tradeName = form.tradeName.trim();
    const legalName = form.legalName.trim();
    if (!gstin) { toast.error("GSTIN required hai!"); return; }
    if (gstin.length !== 15) { toast.error("GSTIN 15 characters ka hona chahiye!"); return; }
    if (!mobile) { toast.error("Mobile number required hai!"); return; }
    if (!/^\d{10}$/.test(mobile)) { toast.error("Mobile 10 digits ka hona chahiye!"); return; }
    if (!tradeName && !legalName) { toast.error("Trade Name ya Legal Name required hai!"); return; }

    if (!isEdit && checkLimit) {
      const limitMsg = checkLimit();
      if (limitMsg) {
        toast.error(limitMsg);
        if (onLimitReached) onLimitReached();
        return;
      }
    }

    const displayName = tradeName || legalName;
    const client = {
      id: initialClient ? initialClient.id : undefined,
      name: displayName,
      company: displayName,
      gstin,
      tradeName,
      legalName,
      email: form.email.trim(),
      mobile,
      pan: form.pan.trim().toUpperCase(),
      address: form.address.trim(),
      city: form.city.trim(),
      pincode: form.pincode.trim(),
      state: form.state.trim(),
      taxpayerType: form.taxpayerType,
      registrationDate: form.registrationDate || today(),
      registrationType: form.taxpayerType || "Regular",
      status: initialClient ? initialClient.status : "active",
    };

    setSubmitting(true);
    // Persist on Django backend (best effort – same as original behaviour)
    const payload = {
      name: displayName,
      gstin,
      mobile,
      email: form.email.trim(),
      state: form.state.trim(),
      address: form.address.trim(),
      notes: form.notes || "",
    };
    try {
      if (isEdit) {
        updateClient(initialClient.id, payload);
      } else {
        createClient(payload);
      }
    } catch (e) {}
    setTimeout(() => {
      if (onSaved) onSaved(client);
      toast.success(isEdit ? "Client updated successfully!" : "Client successfully added!");
      if (onClose) onClose();
      setSubmitting(false);
    }, 700);
  };

  return (
    open && (
      <div
        style={{
          position: "fixed", inset: 0,
          background: "rgba(15,23,42,0.68)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 99999,
          backdropFilter: "blur(3px)",
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "20px",
            width: "94%",
            maxWidth: "860px",
            maxHeight: "92vh",
            overflowY: "auto",
            boxShadow: "0 8px 0 #b8c4e8, 0 24px 72px rgba(15,23,42,0.28)",
            animation: "scaleIn 0.18s ease",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{
            background: "#fff",
            padding: "16px 28px 14px",
            borderBottom: "1px solid #e8edf5",
            borderRadius: "20px 20px 0 0",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(107,114,128,0.08), inset 0 1px 0 rgba(255,255,255,1)",
            position: "sticky", top: 0, zIndex: 2,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ width: "32px" }} />
              <div>
                <h2 style={{ margin: 0, fontSize: "1.28rem", fontWeight: 800, color: "#3730a3" }}>
                  {isEdit ? "✏️ Edit Client" : "➕ Add New Client"}
                </h2>
                <p style={{ margin: "3px 0 0", fontSize: "0.80rem", color: "#f97316", fontWeight: 600 }}>
                  {isEdit
                    ? "Client details update karen • GSTIN lookup se auto-fill bhi hota hai"
                    : "Client will be added with Active status • Fills automatically on GSTIN lookup"}
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  border: "1px solid #e2e8f0", background: "#f8fafc",
                  cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "1rem", color: "#64748b",
                  fontWeight: 700, flexShrink: 0,
                }}
              >✕</button>
            </div>
          </div>

          <div style={{ padding: "20px 28px 24px" }}>

            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>
                GSTIN <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
<LimitedInput kind="gstin"
                   name="gstin"
                  value={form.gstin}
                  onChange={handleChange}
                  maxLength={15}
                  placeholder="e.g. 27AAPFU0939F1ZV"
                  style={{
                    flex: 1, padding: "11px 14px",
                    borderRadius: "10px", border: "1.5px solid #d1d5db",
                    fontSize: "0.90rem", background: "#f9fafb",
                    fontFamily: "monospace", fontWeight: 600,
                    letterSpacing: "0.04em", boxSizing: "border-box",
                    transition: "border 0.15s", textTransform: "uppercase",
                  }}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
                <button
                  onClick={handleGSTINLookup}
                  disabled={lookupLoading}
                  style={{
                    padding: "11px 22px",
                    background: lookupLoading
                      ? "linear-gradient(135deg, #94a3b8, #64748b)"
                      : "linear-gradient(135deg, #0891b2, #0e7490)",
                    color: "#fff", border: "none", borderRadius: "10px",
                    fontWeight: 700, fontSize: "0.85rem", cursor: lookupLoading ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 12px rgba(8,145,178,0.28)",
                    transition: "all 0.18s",
                    display: "flex", alignItems: "center", gap: "7px",
                  }}
                >
                  {lookupLoading ? (
                    <>
                      <span style={{
                        width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.4)",
                        borderTop: "2px solid #fff", borderRadius: "50%",
                        display: "inline-block", animation: "spin 0.7s linear infinite",
                      }} />
                      Fetching…
                    </>
                  ) : "🔍 Get Data"}
                </button>
              </div>
              <div style={{ marginTop: "5px", fontSize: "0.75rem", color: "#64748b" }}>
                Enter 15-digit GSTIN and click "Get Data" to auto-fill taxpayer details
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>

              <div>
                <label style={labelStyle}>
                  Trade Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  name="tradeName"
                  value={form.tradeName}
                  onChange={handleChange}
                  placeholder="e.g. Raj Traders"
                  style={inputStyle}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>

              <div>
                <label style={labelStyle}>Legal Name</label>
                <input
                  name="legalName"
                  value={form.legalName}
                  onChange={handleChange}
                  placeholder="e.g. Raj Enterprises Pvt Ltd"
                  style={inputStyle}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>

              <div>
                <label style={labelStyle}>Email ID</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="e.g. raj@company.com"
                  style={inputStyle}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Mobile Number <span style={{ color: "#ef4444" }}>*</span>
                </label>
<LimitedInput kind="phone"
                   name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="10-digit mobile"
                  style={inputStyle}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>

              <div>
                <label style={labelStyle}>PAN</label>
                <input
                  name="pan"
                  value={form.pan}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="Auto-filled from GSTIN"
                  style={{
                    ...inputStyle, fontFamily: "monospace", fontWeight: 600, textTransform: "uppercase",
                  }}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>

              <div>
                <label style={labelStyle}>Type of Taxpayer</label>
                <select
                  name="taxpayerType"
                  value={form.taxpayerType}
                  onChange={handleChange}
                  style={{
                    width: "100%", padding: "11px 13px", borderRadius: "10px",
                    border: "1.5px solid #d1d5db", fontSize: "0.88rem",
                    background: "#f9fafb", boxSizing: "border-box",
                    transition: "border 0.15s", color: "#1e293b",
                    appearance: "auto",
                  }}
                  onFocus={focusIn}
                  onBlur={focusOut}
                >
                  <option value="">Select type…</option>
                  <option value="Regular">Regular</option>
                  <option value="Composition">Composition</option>
                  <option value="SEZ Unit">SEZ Unit</option>
                  <option value="SEZ Developer">SEZ Developer</option>
                  <option value="Casual Taxable Person">Casual Taxable Person</option>
                  <option value="Non-Resident Taxable Person">Non-Resident Taxable Person</option>
                  <option value="ISD">ISD (Input Service Distributor)</option>
                  <option value="TDS Deductor">TDS Deductor</option>
                  <option value="TCS Collector">TCS Collector</option>
                  <option value="UIN Holder">UIN Holder</option>
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Address</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Street / Building / Area"
                  style={inputStyle}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>

              <div>
                <label style={labelStyle}>City</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai"
                  style={inputStyle}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>

              <div>
                <label style={labelStyle}>PIN Code</label>
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  maxLength={6}
                  placeholder="6-digit PIN"
                  style={inputStyle}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>State</label>
                <select
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  style={{
                    width: "100%", padding: "11px 13px", borderRadius: "10px",
                    border: "1.5px solid #d1d5db", fontSize: "0.88rem",
                    background: "#f9fafb", boxSizing: "border-box",
                    transition: "border 0.15s", color: "#1e293b",
                  }}
                  onFocus={focusIn}
                  onBlur={focusOut}
                >
                  <option value="">Select State…</option>
                  {[
                    "Andaman & Nicobar Islands","Andhra Pradesh","Andhra Pradesh (New)","Arunachal Pradesh",
                    "Assam","Bihar","Chandigarh","Chhattisgarh","Dadra & Nagar Haveli","Daman & Diu",
                    "Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu & Kashmir","Jharkhand",
                    "Karnataka","Kerala","Ladakh","Lakshadweep","Madhya Pradesh","Maharashtra","Manipur",
                    "Meghalaya","Mizoram","Nagaland","Odisha","Puducherry","Punjab","Rajasthan","Sikkim",
                    "Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
                  ].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

            </div>

            <div style={{ marginTop: "22px", display: "flex", gap: "12px", justifyContent: "flex-end", alignItems: "center" }}>
              <button
                onClick={onClose}
                style={{
                  padding: "11px 24px", background: "#f1f5f9",
                  border: "1.5px solid #e2e8f0", borderRadius: "10px",
                  cursor: "pointer", fontWeight: 700, fontSize: "0.88rem",
                  color: "#475569", transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#e2e8f0"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                style={{
                  padding: "11px 40px",
                  background: submitting
                    ? "linear-gradient(135deg, #94a3b8, #64748b)"
                    : "linear-gradient(135deg, #1f2a70, #3b4cc0)",
                  color: "white", border: "none", borderRadius: "10px",
                  fontWeight: 800, cursor: submitting ? "not-allowed" : "pointer",
                  boxShadow: submitting ? "none" : "0 6px 18px rgba(31,42,112,0.32)",
                  fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "8px",
                  transition: "all 0.18s",
                }}
              >
                {submitting ? (
                  <>
                    <span style={{
                      width: "15px", height: "15px", border: "2px solid rgba(255,255,255,0.4)",
                      borderTop: "2px solid #fff", borderRadius: "50%",
                      display: "inline-block", animation: "spin 0.7s linear infinite",
                    }} />
                    {isEdit ? "Updating Client…" : "Adding Client…"}
                  </>
                ) : (isEdit ? "✓ Update Client" : "✓ Submit Client")}
              </button>
            </div>

          </div>
        </div>
      </div>
    )
  );
}