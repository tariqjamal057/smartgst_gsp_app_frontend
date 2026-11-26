// src/App.jsx - Updated: Removed Quick Bulk Actions, Filters, and sped up toast
import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import "../App.css";
import { fetchSuperDashboard, fetchClients, fetchApiLogs } from "../api/services";

export default function App() {
  const [audience, setAudience] = useState("All CA Firms");
  const [message, setMessage] = useState("");
  const [selectedFirm, setSelectedFirm] = useState(null);
  const [selectedStat, setSelectedStat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [addFirmModalOpen, setAddFirmModalOpen] = useState(false);
  const [manageFirmsModalOpen, setManageFirmsModalOpen] = useState(false);
  const [reportsModalOpen, setReportsModalOpen] = useState(false);
  const [apiMonitorModalOpen, setApiMonitorModalOpen] = useState(false);
  const [allFirmsModalOpen, setAllFirmsModalOpen] = useState(false);
  const [top10ModalOpen, setTop10ModalOpen] = useState(false);
  const [apiDetailsModalOpen, setApiDetailsModalOpen] = useState(false);
  const [newFirm, setNewFirm] = useState({ name: "", email: "", plan: "Basic", apiKey: "", password: "" });
  const [firmsPage, setFirmsPage] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const firmsPerPage = 10;

  const [firms, setFirms] = useState([]);
  const [clients, setClients] = useState([]);
  const [apiLogs, setApiLogs] = useState([]);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [reports, setReports] = useState([]);
  const [meta, setMeta] = useState({});

  // Load live super-admin data from the Django backend (no mock fallbacks).
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchSuperDashboard().catch(() => ({})),
      fetchClients().catch(() => []),
      fetchApiLogs().catch(() => []),
    ]).then(([d, clientsRes, logsRes]) => {
      if (cancelled) return;
      setMeta(d || {});

      setFirms(
        (d.firms || []).map((f) => ({
          id: f.id,
          name: f.name,
          regDate: f.reg_date || "",
          active: Boolean(f.is_active),
          clients: f.client_count ?? 0,
          activeSince: f.is_active ? (f.reg_date || "") : null,
          plan: f.plan || "—",
          apiUsage: "—",
          revenue: "—",
        }))
      );

      const clientRows = clientsRes.results || clientsRes || [];
      setClients(
        clientRows.map((c) => ({
          id: c.id,
          name: c.name || c.trade_name || "",
          regDate: c.reg_date || "",
          firm: c.firm_name || "",
        }))
      );

      const logRows = logsRes.results || logsRes || [];
      setApiLogs(
        logRows.map((l) => {
          const ms = l.response_time_ms ?? null;
          return {
            id: l.id,
            api: l.endpoint || l.api || "",
            timestamp: l.created_at || "",
            timeTaken: ms != null ? `${ms}ms` : "—",
            speed: ms == null ? "—" : ms < 400 ? "Fast" : ms < 800 ? "Medium" : "Slow",
            status: l.status || "—",
          };
        })
      );

      setSecurityAlerts(
        (d.security_alerts || []).map((a) => ({
          id: a.id,
          type: a.type,
          time: a.time,
          ip: a.ip || "—",
          description: a.description || "",
        }))
      );
      setReports([]);
    });
    return () => { cancelled = true; };
  }, []);

  const showToast = (text, type = "success") => {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerText = text;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  const sendMessage = () => {
    if (!message.trim()) {
      showToast("Message cannot be empty!", "error");
      return;
    }
    showToast(`Sending to ${audience}...`, "info");
    setTimeout(() => {
      showToast("Message sent successfully!", "success");
      setMessage("");
    }, 500); // Sped up from 1500 to 500ms
  };

  // Calculate stats from live data
  const totalFirms = meta.total_firms ?? firms.length;
  const activeFirms = meta.active_firms ?? firms.filter(f => f.active).length;
  const totalClients = meta.total_clients ?? firms.reduce((sum, f) => sum + (f.clients || 0), 0);

  const handleStatClick = (type) => {
    setSelectedStat(type);
    setSearchQuery("");
  };

  const getFilteredData = () => {
    let data = [];
    let columns = [];
    if (selectedStat === "totalFirms") {
      data = firms;
      columns = ["Name", "Registration Date"];
    } else if (selectedStat === "activeFirms") {
      data = firms.filter(f => f.active);
      columns = ["Name", "Active Since", "Clients"];
    } else if (selectedStat === "totalClients") {
      data = clients;
      columns = ["Name", "Firm", "Registration Date"];
    }

    if (searchQuery) {
      data = data.filter(item => 
        Object.values(item).some(val => 
          val?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    return { data, columns };
  };

  const { data: statData, columns: statColumns } = getFilteredData();

  // Add New Firm Handler
  const handleAddFirm = () => {
    if (!newFirm.name || !newFirm.email || !newFirm.plan || !newFirm.apiKey || !newFirm.password) {
      showToast("All fields are required!", "error");
      return;
    }
    showToast("New Firm Added Successfully!", "success");
    setAddFirmModalOpen(false);
    setNewFirm({ name: "", email: "", plan: "Basic", apiKey: "", password: "" });
  };

  // Pagination for All Firms Modal
  const paginatedFirms = firms.slice((firmsPage - 1) * firmsPerPage, firmsPage * firmsPerPage);
  const totalPages = Math.max(1, Math.ceil(firms.length / firmsPerPage));

  // Top 10 Firms - Sorted by clients descending
  const top10Firms = [...firms].sort((a, b) => b.clients - a.clients).slice(0, 10);

  // API Stats Calculations
  const successCount = apiLogs.filter(log => String(log.status).toLowerCase() === "success").length;
  const failureCount = apiLogs.length - successCount;
  const successRate = apiLogs.length ? ((successCount / apiLogs.length) * 100).toFixed(1) : "0.0";
  const failedApis = apiLogs.filter(log => String(log.status).toLowerCase() === "failed");
  const avgResponseMs = apiLogs.length
    ? Math.round(apiLogs.reduce((sum, log) => sum + (parseInt(log.timeTaken, 10) || 0), 0) / apiLogs.length)
    : 0;
  const avgResponse = apiLogs.length ? `${avgResponseMs}ms` : "—";

  // Pie Chart Data for Success Rate
  const pieData = [
    { name: 'Success', value: parseFloat(successRate) },
    { name: 'Failure', value: 100 - parseFloat(successRate) },
  ];
  const COLORS = ['#22c55e', '#ef4444'];

  return (
    <div className="main">
      {/* Header - Removed filters */}
      <div className="header admin-header">
        <div>
          <h1>SmartGST - Super Admin Panel</h1>
          <p className="firm-name">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="header-right">
          <div className="revenue">
            <strong>—</strong>
          </div>
        </div>
      </div>

      {/* Removed Quick Upload */}

      {/* Stats */}
      <div className="stats stats-admin">
        <div className="box clickable" onClick={() => handleStatClick("totalFirms")}>
          <h3>{totalFirms}</h3><p>Total CA Firms</p>
        </div>
        <div className="box clickable" onClick={() => handleStatClick("activeFirms")}>
          <h3>{activeFirms}</h3><p>Active</p>
        </div>
        <div className="box highlight clickable" onClick={() => handleStatClick("totalClients")}>
          <h3>{totalClients.toLocaleString()}</h3><p>Total Clients</p>
        </div>
        <div className="box clickable" onClick={() => setApiDetailsModalOpen(true)}>
          <h3>{meta.api_calls_today ?? 0}</h3><p>API Calls Today</p>
        </div>
      </div>

      <div className="grid">
        {/* Quick Actions + Notification */}
        <div className="card">
          <h3>Quick Actions</h3>
          <div className="btns">
            <button onClick={() => setAddFirmModalOpen(true)}>Add New CA Firm</button>
            <button onClick={() => setManageFirmsModalOpen(true)}>Manage Firms</button>
            <button onClick={() => setReportsModalOpen(true)}>View All Reports</button>
            <button onClick={() => setApiMonitorModalOpen(true)}>API Monitor</button>
          </div>
          <div className="notify">
            <h4>Send Global Notification</h4>
            <select value={audience} onChange={(e) => setAudience(e.target.value)}>
              <option>All CA Firms</option>
              <option>Active Only</option>
              <option>Expired Only</option>
              <option>Inactive Firms</option>
            </select>
            <textarea
              placeholder="Type message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
            />
            <div className="send-btns">
              <button className="wa" onClick={sendMessage}>Send WhatsApp</button>
              <button className="em" onClick={sendMessage}>Send Email</button>
            </div>
          </div>
        </div>

        {/* Firms Table (Top 5 shown) */}
        <div className="card wide">
          <div className="tophead">
            <h3>Firms</h3>
            <div>
              <button className="top10" onClick={() => setTop10ModalOpen(true)}>
                View Top 10 →
              </button>
              <button className="top10" style={{marginLeft: '10px'}} onClick={() => setAllFirmsModalOpen(true)}>
                All Firms →
              </button>
            </div>
          </div>
          <table className="recent-audits">
            <thead>
              <tr><th>#</th><th>Firm Name</th><th>Clients</th><th>Revenue/Mo</th></tr>
            </thead>
            <tbody>
              {firms.slice(0, 5).map((firm, index) => (
                <tr
                  key={firm.id}
                  className="clickable"
                  onClick={() => setSelectedFirm(firm)}
                >
                  <td>{index + 1}</td>
                  <td>{firm.name}</td>
                  <td>{firm.clients.toLocaleString()}</td>
                  <td>{firm.revenue}</td>
                </tr>
              ))}
              {firms.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: "center" }}>No firms available.</td></tr>
              )}
            </tbody>
          </table>

          {/* Selected Firm Drawer */}
          {selectedFirm && (
            <div className="drawer">
              <div className="drawer-header">
                <h3>{selectedFirm.name}</h3>
                <button className="close-drawer" onClick={() => setSelectedFirm(null)}>×</button>
              </div>
              <div className="drawer-content">
                <p><strong>Plan:</strong> <span style={{color: '#7c3aed', fontWeight: 'bold'}}>{selectedFirm.plan}</span></p>
                <p><strong>Clients:</strong> {selectedFirm.clients.toLocaleString()}</p>
                <p><strong>Monthly Revenue:</strong> {selectedFirm.revenue}</p>
                <p><strong>API Usage:</strong> {selectedFirm.apiUsage}</p>
                <p><strong>Reg Date:</strong> {selectedFirm.regDate}</p>
                <p><strong>Active:</strong> {selectedFirm.active ? 'Yes' : 'No'}</p>
              </div>
              <div className="drawer-btns">
                <button className="danger" onClick={() => showToast("Firm Disabled", "error")}>
                  Disable Firm
                </button>
                <button onClick={() => showToast("API Key Reset", "info")}>
                  Reset API Key
                </button>
                <button className="secondary" onClick={() => setSelectedFirm(null)}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add New Firm Modal */}
      {addFirmModalOpen && (
        <div className="modal-overlay" onClick={() => setAddFirmModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New CA Firm</h3>
              <button className="close-drawer" onClick={() => setAddFirmModalOpen(false)}>×</button>
            </div>
            <div className="form">
              <label>Firm Name</label>
              <input value={newFirm.name} onChange={(e) => setNewFirm({...newFirm, name: e.target.value})} />
              <label>Email</label>
              <input type="email" value={newFirm.email} onChange={(e) => setNewFirm({...newFirm, email: e.target.value})} />
              <label>Plan</label>
              <select value={newFirm.plan} onChange={(e) => setNewFirm({...newFirm, plan: e.target.value})}>
                <option>Basic</option>
                <option>Pro</option>
                <option>Enterprise</option>
              </select>
              
              <label>Password</label>
              <input type="password" value={newFirm.password} onChange={(e) => setNewFirm({...newFirm, password: e.target.value})} />
              <button onClick={handleAddFirm}>Add Firm</button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Firms Modal */}
      {manageFirmsModalOpen && (
        <div className="modal-overlay" onClick={() => setManageFirmsModalOpen(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Manage Firms</h3>
              <button className="close-drawer" onClick={() => setManageFirmsModalOpen(false)}>×</button>
            </div>
            
            <table className="recent-audits">
              <thead>
                <tr><th>Name</th><th>Plan</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {firms.map(firm => (
                  <tr key={firm.id}>
                    <td>{firm.name}</td>
                    <td>{firm.plan}</td>
                    <td>
                      <button onClick={() => showToast(`Edit ${firm.name}`)}>Edit</button>
                      <button className="danger" onClick={() => showToast(`Disable ${firm.name}`, "error")}>Disable</button>
                    </td>
                  </tr>
                ))}
                {firms.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: "center" }}>No firms available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View All Reports Modal */}
      {reportsModalOpen && (
        <div className="modal-overlay" onClick={() => setReportsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>View All Reports</h3>
              <button className="close-drawer" onClick={() => setReportsModalOpen(false)}>×</button>
            </div>
            <table className="recent-audits">
              <thead>
                <tr><th>Report Name</th><th>Date</th><th>Type</th><th>Action</th></tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id}>
                    <td>{report.name}</td>
                    <td>{report.date}</td>
                    <td>{report.type}</td>
                    <td><button onClick={() => showToast(`Downloading ${report.name}.pdf`)}>Download PDF</button></td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: "center" }}>No reports available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* API Monitor Modal with Chart */}
      {apiMonitorModalOpen && (
        <div className="modal-overlay" onClick={() => setApiMonitorModalOpen(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>API Monitor</h3>
              <button className="close-drawer" onClick={() => setApiMonitorModalOpen(false)}>×</button>
            </div>
            <div style={{ height: "300px", marginBottom: "20px" }}>
              {apiLogs.length === 0 ? (
                <p style={{ textAlign: "center", paddingTop: "120px" }}>No API activity available.</p>
              ) : (
                <>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        fill="#8884d8"
                        paddingAngle={0}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ textAlign: "center", marginTop: "-150px" }}>
                    <h2>{successRate}%</h2>
                    <p>Success Rate</p>
                  </div>
                </>
              )}
            </div>
            <p>Avg Response: {avgResponse} | Failures: {failureCount}</p>
            <h4>Failed APIs:</h4>
            <ul>
              {failedApis.map(log => (
                <li key={log.id}>{log.api} at {log.timestamp} ({log.timeTaken})</li>
              ))}
              {failedApis.length === 0 && <li>No failed API calls.</li>}
            </ul>
            <table className="recent-audits">
              <thead>
                <tr><th>API Endpoint</th><th>Timestamp</th><th>Time Taken</th><th>Speed</th><th>Status</th></tr>
              </thead>
              <tbody>
                {apiLogs.map(log => (
                  <tr key={log.id}>
                    <td>{log.api}</td>
                    <td>{log.timestamp}</td>
                    <td>{log.timeTaken}</td>
                    <td>{log.speed}</td>
                    <td>{log.status}</td>
                  </tr>
                ))}
                {apiLogs.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: "center" }}>No API logs available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Firms Modal with Pagination and Search */}
      {allFirmsModalOpen && (
        <div className="modal-overlay" onClick={() => setAllFirmsModalOpen(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>All Firms</h3>
              <button className="close-drawer" onClick={() => setAllFirmsModalOpen(false)}>×</button>
            </div>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search firms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <table className="recent-audits">
              <thead>
                <tr><th>ID</th><th>Name</th><th>Clients</th><th>Revenue</th><th>Plan</th></tr>
              </thead>
              <tbody>
                {paginatedFirms
                  .filter(firm => (firm.name || "").toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(firm => (
                    <tr key={firm.id} className="clickable" onClick={() => setSelectedFirm(firm)}>
                      <td>{firm.id}</td>
                      <td>{firm.name}</td>
                      <td>{firm.clients.toLocaleString()}</td>
                      <td>{firm.revenue}</td>
                      <td>{firm.plan}</td>
                    </tr>
                  ))}
                {paginatedFirms.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: "center" }}>No firms available.</td></tr>
                )}
              </tbody>
            </table>
            <div className="pagination">
              <button disabled={firmsPage === 1} onClick={() => setFirmsPage(p => p - 1)}>Prev</button>
              <span>Page {firmsPage} of {totalPages}</span>
              <button disabled={firmsPage === totalPages} onClick={() => setFirmsPage(p => p + 1)}>Next</button>
            </div>
          </div>
        </div>
      )}

      {/* Top 10 Firms Modal */}
      {top10ModalOpen && (
        <div className="modal-overlay" onClick={() => setTop10ModalOpen(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Top 10 Firms (by Clients)</h3>
              <button className="close-drawer" onClick={() => setTop10ModalOpen(false)}>×</button>
            </div>
            <table className="recent-audits">
              <thead>
                <tr><th>#</th><th>Name</th><th>Clients</th><th>Revenue</th><th>Plan</th></tr>
              </thead>
              <tbody>
                {top10Firms.map((firm, index) => (
                  <tr key={firm.id} className="clickable" onClick={() => setSelectedFirm(firm)}>
                    <td>{index + 1}</td>
                    <td>{firm.name}</td>
                    <td>{firm.clients.toLocaleString()}</td>
                    <td>{firm.revenue}</td>
                    <td>{firm.plan}</td>
                  </tr>
                ))}
                {top10Firms.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: "center" }}>No firms available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stat Details Modal */}
      {selectedStat && (
        <div className="modal-overlay" onClick={() => setSelectedStat(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {selectedStat === "totalFirms" ? "All CA Firms" :
                 selectedStat === "activeFirms" ? "Active Firms" :
                 "Total Clients"}
              </h3>
              <button className="close-drawer" onClick={() => setSelectedStat(null)}>×</button>
            </div>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <table className="recent-audits">
              <thead>
                <tr>
                  {statColumns.map((col, i) => <th key={i}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {statData.map((item, idx) => (
                  <tr key={idx}>
                    {selectedStat === "totalFirms" && (
                      <>
                        <td>{item.name}</td>
                        <td>{item.regDate}</td>
                      </>
                    )}
                    {selectedStat === "activeFirms" && (
                      <>
                        <td>{item.name}</td>
                        <td>{item.activeSince || "N/A"}</td>
                        <td>{item.clients}</td>
                      </>
                    )}
                    {selectedStat === "totalClients" && (
                      <>
                        <td>{item.name}</td>
                        <td>{item.firm}</td>
                        <td>{item.regDate}</td>
                      </>
                    )}
                  </tr>
                ))}
                {statData.length === 0 && (
                  <tr><td colSpan={statColumns.length}>No results found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}