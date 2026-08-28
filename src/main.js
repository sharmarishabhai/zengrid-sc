const API_BASE = "http://localhost:9191/api";

const app = document.querySelector("#app");

const state = {
  accessToken: localStorage.getItem("zg_access") || "",
  refreshToken: localStorage.getItem("zg_refresh") || "",
  user: JSON.parse(localStorage.getItem("zg_user") || "null"),
  leads: [],
  followUps: [],
  meetings: [],
  quotes: [],
  payments: [],
  gst: [],
  summary: null,
  view: "leads",
  loading: false,
  selectedLead: null,
};

const styles = `
  :root{
    --bg:#f6f1e8;
    --panel:#ffffff;
    --ink:#0b1220;
    --muted:#6b7280;
    --line:rgba(15,23,42,.10);
    --blue:#1f3a8a;
    --blue2:#3b5bfd;
    --purple:#6b4fd3;
    --beige:#f3e7d3;
    --soft:#eef2ff;
    --good:#139c67;
    --bad:#d64545;
    --warn:#d97706;
    --shadow:0 18px 50px rgba(15,23,42,.12);
    --radius:18px;
    font-family:'Plus Jakarta Sans',system-ui,sans-serif;
  }
  *{box-sizing:border-box}
  body{margin:0;background:linear-gradient(180deg,#eef3ff 0%,#f8f4ee 42%,#f6f1e8 100%);color:var(--ink);font-family:inherit}
  button,input,select,textarea{font:inherit}
  .shell{min-height:100vh;display:flex;flex-direction:column}
  .topbar{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.82);backdrop-filter:blur(18px);border-bottom:1px solid var(--line)}
  .topbar-inner{max-width:1400px;margin:0 auto;padding:18px 20px;display:flex;align-items:center;gap:14px}
  .brand{display:flex;align-items:center;gap:12px;font-weight:800}
  .brand-mark{width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,var(--blue),var(--purple));box-shadow:0 12px 30px rgba(31,58,138,.28)}
  .brand-title{font-size:18px;line-height:1}
  .brand-sub{font-size:12px;color:var(--muted);font-weight:600;margin-top:4px}
  .top-actions{margin-left:auto;display:flex;gap:10px;flex-wrap:wrap}
  .btn{border:none;border-radius:14px;padding:12px 16px;font-weight:700;cursor:pointer}
  .btn-primary{background:linear-gradient(135deg,var(--blue),var(--purple));color:#fff;box-shadow:0 10px 26px rgba(31,58,138,.22)}
  .btn-soft{background:#fff;border:1px solid var(--line);color:var(--ink)}
  .btn-danger{background:#fff0f0;border:1px solid rgba(214,69,69,.25);color:var(--bad)}
  .layout{max-width:1400px;margin:0 auto;width:100%;padding:20px;display:grid;grid-template-columns:280px 1fr;gap:20px;flex:1}
  .side,.maincard{background:rgba(255,255,255,.84);backdrop-filter:blur(16px);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow)}
  .side{padding:16px;display:flex;flex-direction:column;gap:14px;align-self:start;position:sticky;top:92px}
  .card{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:16px}
  .navbtn{width:100%;text-align:left;padding:14px 14px;border-radius:14px;border:1px solid transparent;background:#fff;cursor:pointer;font-weight:700;color:var(--ink)}
  .navbtn.active{background:linear-gradient(135deg,#eef2ff,#f5ecff);border-color:rgba(31,58,138,.12);color:var(--blue)}
  .navmeta{font-size:12px;color:var(--muted);margin-top:4px;font-weight:600}
  .maincard{padding:20px;min-height:calc(100vh - 120px)}
  .hero{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;padding:10px 0 20px}
  .hero h1{margin:0;font-size:28px}
  .hero p{margin:8px 0 0;color:var(--muted);max-width:780px;line-height:1.6}
  .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:18px 0}
  .stat{background:linear-gradient(180deg,#fff,#fbfaf7);border:1px solid var(--line);border-radius:18px;padding:16px}
  .stat .k{font-size:12px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em}
  .stat .v{font-size:28px;font-weight:800;margin-top:6px}
  .grid{display:grid;gap:14px}
  .grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}
  .grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}
  .field{display:flex;flex-direction:column;gap:8px}
  .field label{font-size:12px;color:var(--muted);font-weight:700}
  .field input,.field select,.field textarea{width:100%;padding:13px 14px;border-radius:14px;border:1px solid var(--line);background:#fff;outline:none}
  .field textarea{min-height:104px;resize:vertical}
  .toolbar{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
  .search{flex:1;min-width:220px}
  .table{width:100%;border-collapse:collapse;overflow:hidden;border-radius:16px}
  .table th,.table td{padding:12px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
  .table th{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
  .pill{display:inline-flex;align-items:center;padding:7px 10px;border-radius:999px;font-size:12px;font-weight:800}
  .pill.blue{background:#e8eeff;color:var(--blue)}
  .pill.purple{background:#f0eaff;color:var(--purple)}
  .pill.green{background:#e8f7ef;color:var(--good)}
  .pill.warn{background:#fff4e6;color:var(--warn)}
  .pill.red{background:#ffecec;color:var(--bad)}
  .empty{padding:34px;text-align:center;color:var(--muted)}
  .login{min-height:100vh;display:grid;place-items:center;padding:20px}
  .loginbox{width:min(440px,100%);background:rgba(255,255,255,.84);backdrop-filter:blur(20px);border:1px solid var(--line);border-radius:28px;box-shadow:var(--shadow);padding:28px}
  .receipt{background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px;box-shadow:var(--shadow)}
  .receipt-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;border-bottom:1px dashed var(--line);padding-bottom:14px;margin-bottom:14px}
  .receipt-title{font-weight:800;font-size:18px}
  .muted{color:var(--muted)}
  .hide{display:none !important}
  @media (max-width: 1000px){
    .layout{grid-template-columns:1fr}
    .side{position:static}
    .stats,.grid.two,.grid.three{grid-template-columns:1fr 1fr}
  }
  @media (max-width: 640px){
    .stats,.grid.two,.grid.three{grid-template-columns:1fr}
    .topbar-inner{padding:14px}
    .layout{padding:14px}
    .maincard{padding:16px}
    .hero h1{font-size:24px}
  }
`;

document.head.insertAdjacentHTML("beforeend", `<style>${styles}</style>`);

function h(tag, attrs = {}, children = "") {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (v !== null && v !== undefined) el.setAttribute(k, v);
  });
  if (Array.isArray(children)) children.forEach((c) => el.append(c));
  else if (children !== "") el.insertAdjacentHTML("beforeend", children);
  return el;
}

async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (state.accessToken) headers.set("Authorization", `Bearer ${state.accessToken}`);
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401 && state.refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return api(path, options);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

async function refreshAccessToken() {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: state.refreshToken }),
    });
    const data = await res.json();
    if (!res.ok) return false;
    state.accessToken = data.accessToken;
    localStorage.setItem("zg_access", data.accessToken);
    return true;
  } catch {
    return false;
  }
}

async function uploadFile(file, folder = "zengrid") {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  return api("/media/single", { method: "POST", body: form });
}

function printRecord(title, record) {
  const w = window.open("", "_blank", "width=900,height=1100");
  const amount = record.netEffectivePrice ?? record.paidAmount ?? record.taxableAmount ?? 0;
  w.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body{font-family:Arial,sans-serif;margin:0;padding:24px;background:#f6f1e8;color:#0f172a}
          .sheet{max-width:860px;margin:0 auto;background:#fff;border:1px solid #dbe1ea;border-radius:18px;padding:24px}
          .head{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #1f3a8a;padding-bottom:16px;margin-bottom:18px}
          .brand{font-size:22px;font-weight:800;color:#1f3a8a}
          .sub{color:#64748b;font-size:13px}
          .row{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px dashed #e5e7eb}
          .label{color:#64748b}
          .value{font-weight:700}
          .amount{font-size:24px;font-weight:800;color:#6b4fd3}
          @media print{body{background:#fff}.sheet{border:none;padding:0}}
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="head">
            <div>
              <div class="brand">ZenGrid ${title}</div>
              <div class="sub">${record.leadName || record.customerName || "Lead Record"}</div>
            </div>
            <div class="sub">${new Date().toLocaleString()}</div>
          </div>
          <div class="row"><div class="label">Record No</div><div class="value">${record.quoteNo || record.paymentNo || record.invoiceNo || record._id || "—"}</div></div>
          <div class="row"><div class="label">Lead</div><div class="value">${record.leadName || record.customerName || "—"}</div></div>
          <div class="row"><div class="label">Mobile</div><div class="value">${record.phone || record.mobile || "—"}</div></div>
          <div class="row"><div class="label">Amount</div><div class="amount">₹${Number(amount || 0).toLocaleString("en-IN")}</div></div>
          <div class="row"><div class="label">Notes</div><div class="value">${record.note || "—"}</div></div>
        </div>
        <script>window.print();</script>
      </body>
    </html>
  `);
  w.document.close();
}

async function loadData() {
  state.loading = true;
  render();
  try {
    const [me, summary, leads, followUps, meetings, quotes, payments, gst, audit] = await Promise.all([
      api("/auth/me"),
      api("/activities/summary"),
      api("/leads/mine"),
      api("/followups"),
      api("/activities/meetings"),
      api("/activities/quotes"),
      api("/activities/payments"),
      api("/activities/gst"),
      api("/audits/summary"),
    ]);
    state.user = me.user;
    state.summary = { ...summary.summary, ...audit.summary };
    state.leads = leads.leads || [];
    state.followUps = followUps.followUps || [];
    state.meetings = meetings.meetings || [];
    state.quotes = quotes.quotes || [];
    state.payments = payments.payments || [];
    state.gst = gst.invoices || [];
  } catch (error) {
    toast(error.message, "error");
  } finally {
    state.loading = false;
    render();
  }
}

function toast(message, type = "info") {
  let box = document.querySelector(".toast");
  if (!box) {
    box = h("div", { class: "toast" });
    Object.assign(box.style, {
      position: "fixed",
      right: "20px",
      bottom: "20px",
      zIndex: "50",
      padding: "14px 16px",
      borderRadius: "14px",
      background: "#111827",
      color: "#fff",
      boxShadow: "0 18px 40px rgba(0,0,0,.18)",
      maxWidth: "420px",
    });
    document.body.append(box);
  }
  box.textContent = message;
  box.style.background = type === "error" ? "#b42318" : type === "success" ? "#1f7a4f" : "#111827";
  box.style.display = "block";
  clearTimeout(box._t);
  box._t = setTimeout(() => (box.style.display = "none"), 2600);
}

function renderLogin() {
  app.innerHTML = `
    <div class="login">
      <div class="loginbox">
        <div class="brand" style="margin-bottom:20px">
          <div class="brand-mark"></div>
          <div>
            <div class="brand-title">ZenGrid SC</div>
            <div class="brand-sub">Solar consultant app</div>
          </div>
        </div>
        <h1 style="margin:0 0 8px">Login</h1>
        <p class="muted" style="margin:0 0 18px;line-height:1.6">Sign in to manage leads, meetings, follow-ups, quotes and payments.</p>
        <div class="grid" style="gap:12px">
          <div class="field"><label>Email</label><input id="email" placeholder="name@company.com" /></div>
          <div class="field"><label>Password</label><input id="password" type="password" placeholder="••••••••" /></div>
          <button class="btn btn-primary" id="loginBtn">Login</button>
        </div>
      </div>
    </div>
  `;
  document.querySelector("#loginBtn").onclick = login;
}

async function login() {
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    state.accessToken = data.accessToken;
    state.refreshToken = data.refreshToken;
    state.user = data.user;
    localStorage.setItem("zg_access", data.accessToken);
    localStorage.setItem("zg_refresh", data.refreshToken);
    localStorage.setItem("zg_user", JSON.stringify(data.user));
    toast("Logged in", "success");
    loadData();
  } catch (error) {
    toast(error.message, "error");
  }
}

async function logout() {
  localStorage.removeItem("zg_access");
  localStorage.removeItem("zg_refresh");
  localStorage.removeItem("zg_user");
  state.accessToken = "";
  state.refreshToken = "";
  state.user = null;
  state.leads = [];
  state.followUps = [];
  state.meetings = [];
  state.summary = null;
  render();
}

function badgeFor(status) {
  const map = {
    "New Lead": "blue",
    Contacted: "warn",
    Interested: "purple",
    "Follow Up": "warn",
    "Not Interested": "red",
    Won: "green",
    Lost: "red",
    assigned: "blue",
    started: "warn",
    done: "green",
  };
  return map[status] || "blue";
}

function renderSummaryCards() {
  const s = state.summary || {};
  return `
    <div class="stats">
      <div class="stat"><div class="k">Total Leads</div><div class="v">${s.totalLeads ?? 0}</div></div>
      <div class="stat"><div class="k">Follow Ups</div><div class="v">${s.totalFollowUps ?? 0}</div></div>
      <div class="stat"><div class="k">Meetings Done</div><div class="v">${s.meetingsDone ?? 0}</div></div>
      <div class="stat"><div class="k">Won</div><div class="v">${s.won ?? 0}</div></div>
    </div>
  `;
}

function renderLeadsTable() {
  const rows = state.leads.map((l) => `
    <tr>
      <td>
        <div style="font-weight:800">${l.customerName}</div>
        <div class="muted" style="font-size:12px">${l.area || "—"} ${l.locality ? "• " + l.locality : ""}</div>
      </td>
      <td>${l.phone}</td>
      <td>₹${Number(l.monthlyBill || 0).toLocaleString("en-IN")}</td>
      <td><span class="pill ${badgeFor(l.leadStatus)}">${l.leadStatus}</span></td>
      <td><span class="pill ${badgeFor(l.meetingStatus)}">${l.meetingStatus || "assigned"}</span></td>
      <td>${l.assignedTo || "—"}</td>
      <td><button class="btn btn-soft" data-lead="${l._id}">Open</button></td>
    </tr>
  `).join("");
  return rows || `<tr><td colspan="7"><div class="empty">No leads found.</div></td></tr>`;
}

function renderFollowupsTable() {
  const rows = state.followUps.map((f) => `
    <tr>
      <td>${f.leadName}</td>
      <td>${f.phone}</td>
      <td>${f.followUpDate}</td>
      <td>${f.followUpTime || "—"}</td>
      <td><span class="pill ${badgeFor(f.status)}">${f.status}</span></td>
      <td>${f.assignedTo || "—"}</td>
    </tr>
  `).join("");
  return rows || `<tr><td colspan="6"><div class="empty">No follow-ups found.</div></td></tr>`;
}

function renderMeetingsTable() {
  const rows = state.meetings.map((m) => `
    <tr>
      <td>${m.leadName}</td>
      <td>${m.meetingDate}</td>
      <td>${m.meetingTime || "—"}</td>
      <td><span class="pill ${badgeFor(m.meetingStatus)}">${m.meetingStatus}</span></td>
      <td>${m.assignedTo || "—"}</td>
    </tr>
  `).join("");
  return rows || `<tr><td colspan="5"><div class="empty">No meetings found.</div></td></tr>`;
}

function leadDetail(lead) {
  const followUps = state.followUps.filter((f) => String(f.leadId) === String(lead._id));
  const meetings = state.meetings.filter((m) => String(m.leadId) === String(lead._id));
  return `
    <div class="card">
      <div class="hero" style="padding:0">
        <div>
          <h1 style="font-size:22px">${lead.customerName}</h1>
          <p>${lead.phone} • ${lead.area || "—"} ${lead.locality ? "• " + lead.locality : ""}</p>
        </div>
        <div class="toolbar">
          <button class="btn btn-soft" id="editLeadBtn">Edit Lead</button>
          <button class="btn btn-danger" id="deleteLeadBtn">Delete Lead</button>
          <button class="btn btn-soft" id="addFollowBtn">Add Follow Up</button>
          <button class="btn btn-primary" id="addMeetBtn">Add Meeting</button>
        </div>
      </div>
      <div class="grid two">
        <div class="card"><div class="muted">Lead Status</div><strong>${lead.leadStatus}</strong></div>
        <div class="card"><div class="muted">Assigned To</div><strong>${lead.assignedTo || "—"}</strong></div>
      </div>
      <div class="grid two" style="margin-top:14px">
        <div class="card"><div class="muted">Follow Up</div><strong>${lead.followUpDate || "—"}</strong></div>
        <div class="card"><div class="muted">Meeting</div><strong>${lead.meetingDate || "—"} ${lead.meetingTime ? `at ${lead.meetingTime}` : ""}</strong></div>
      </div>
      <div class="grid two" style="margin-top:14px">
        <div class="card">
          <h3 style="margin-top:0">Follow Up History</h3>
          <div class="grid" style="gap:10px">
            ${followUps.map((f) => `<div class="card" style="padding:12px"><strong>${f.followUpDate}</strong><div class="muted">${f.note || "—"}</div></div>`).join("") || "<div class='muted'>No follow-up records.</div>"}
          </div>
        </div>
        <div class="card">
          <h3 style="margin-top:0">Meeting History</h3>
          <div class="grid" style="gap:10px">
            ${meetings.map((m) => `<div class="card" style="padding:12px"><strong>${m.meetingDate}</strong><div class="muted">${m.note || "—"}</div></div>`).join("") || "<div class='muted'>No meeting records.</div>"}
          </div>
        </div>
      </div>
      <div class="grid three" style="margin-top:14px">
        <div class="card">
          <h3 style="margin-top:0">Quotes</h3>
          ${state.quotes.filter((q) => String(q.leadId) === String(lead._id)).map((q) => `<div class="card" style="padding:12px;margin-top:10px"><strong>${q.quoteNo || "Quote"}</strong><div class="muted">₹${Number(q.netEffectivePrice || 0).toLocaleString("en-IN")}</div><button class="btn btn-soft" data-print-quote="${q._id}" style="margin-top:10px">Print Quote</button></div>`).join("") || "<div class='muted'>No quote records.</div>"}
        </div>
        <div class="card">
          <h3 style="margin-top:0">Payments</h3>
          ${state.payments.filter((p) => String(p.leadId) === String(lead._id)).map((p) => `<div class="card" style="padding:12px;margin-top:10px"><strong>${p.paymentNo || "Payment"}</strong><div class="muted">₹${Number(p.paidAmount || 0).toLocaleString("en-IN")}</div><button class="btn btn-soft" data-print-payment="${p._id}" style="margin-top:10px">Print Receipt</button></div>`).join("") || "<div class='muted'>No payment records.</div>"}
        </div>
        <div class="card">
          <h3 style="margin-top:0">GST</h3>
          ${state.gst.filter((g) => String(g.leadId) === String(lead._id)).map((g) => `<div class="card" style="padding:12px;margin-top:10px"><strong>${g.invoiceNo || "Invoice"}</strong><div class="muted">₹${Number(g.taxableAmount || 0).toLocaleString("en-IN")}</div><button class="btn btn-soft" data-print-gst="${g._id}" style="margin-top:10px">Print GST</button></div>`).join("") || "<div class='muted'>No GST records.</div>"}
        </div>
      </div>
    </div>
  `;
}

function render() {
  if (!state.accessToken || !state.user) {
    renderLogin();
    return;
  }

  const nav = [
    ["leads", "Leads", "All assigned leads and current status"],
    ["followups", "Follow Ups", "History and upcoming follow-up dates"],
    ["meetings", "Meetings", "Meeting schedule and done state"],
    ["records", "Records", "Quotes, payments and GST"],
  ];

  app.innerHTML = `
    <div class="shell">
      <div class="topbar">
        <div class="topbar-inner">
          <div class="brand">
            <div class="brand-mark"></div>
            <div>
              <div class="brand-title">ZenGrid SC</div>
              <div class="brand-sub">${state.user.firstName || ""} ${state.user.lastName || ""} • ${state.user.userType}</div>
            </div>
          </div>
          <div class="top-actions">
            <button class="btn btn-soft" id="refreshBtn">Refresh</button>
            <button class="btn btn-danger" id="logoutBtn">Logout</button>
          </div>
        </div>
      </div>
      <div class="layout">
        <aside class="side">
          ${nav.map(([id, title, meta]) => `
            <button class="navbtn ${state.view === id ? "active" : ""}" data-view="${id}">
              ${title}
              <div class="navmeta">${meta}</div>
            </button>
          `).join("")}
        </aside>
        <main class="maincard">
          ${renderSummaryCards()}
          ${state.view === "leads" ? `
            <div class="toolbar">
              <input class="field search" id="search" placeholder="Search leads by name, phone, area, locality" />
              <button class="btn btn-primary" id="openLeadBtn">Add Lead</button>
            </div>
            <div class="card" style="margin-top:16px;overflow:auto">
              <table class="table">
                <thead>
                  <tr><th>Lead</th><th>Phone</th><th>Monthly Bill</th><th>Status</th><th>Meeting</th><th>Assigned To</th><th>Action</th></tr>
                </thead>
                <tbody>${renderLeadsTable()}</tbody>
              </table>
            </div>
          ` : ""}
          ${state.view === "followups" ? `
            <div class="card" style="margin-top:16px;overflow:auto">
              <table class="table">
                <thead><tr><th>Lead</th><th>Phone</th><th>Date</th><th>Time</th><th>Status</th><th>Assigned To</th></tr></thead>
                <tbody>${renderFollowupsTable()}</tbody>
              </table>
            </div>
          ` : ""}
          ${state.view === "meetings" ? `
            <div class="card" style="margin-top:16px;overflow:auto">
              <table class="table">
                <thead><tr><th>Lead</th><th>Date</th><th>Time</th><th>Status</th><th>Assigned To</th></tr></thead>
                <tbody>${renderMeetingsTable()}</tbody>
              </table>
            </div>
          ` : ""}
          ${state.view === "records" ? `
            <div class="grid two" style="margin-top:16px">
              <div class="card"><h3 style="margin-top:0">Quotes</h3><button class="btn btn-soft" id="loadQuotesBtn">Load Quotes</button><div id="quotesBox" class="grid" style="margin-top:12px"></div></div>
              <div class="card"><h3 style="margin-top:0">Payments & GST</h3><button class="btn btn-soft" id="loadPaymentsBtn">Load Payments</button><button class="btn btn-soft" id="loadGstBtn" style="margin-left:8px">Load GST</button><div id="recordsBox" class="grid" style="margin-top:12px"></div></div>
            </div>
          ` : ""}
          ${state.selectedLead ? `<div style="margin-top:16px">${leadDetail(state.selectedLead)}</div>` : ""}
        </main>
      </div>
    </div>
  `;

  document.querySelector("#refreshBtn").onclick = loadData;
  document.querySelector("#logoutBtn").onclick = logout;
  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.onclick = () => { state.view = btn.dataset.view; state.selectedLead = null; render(); };
  });

  if (state.view === "leads") {
    const search = document.querySelector("#search");
    search.oninput = async () => {
      const q = search.value.trim();
      if (!q) return loadData();
      try {
        const res = await api(`/leads/search?q=${encodeURIComponent(q)}`);
        state.leads = res.leads || [];
        render();
      } catch (e) {
        toast(e.message, "error");
      }
    };
    document.querySelector("#openLeadBtn").onclick = openLeadForm;
    document.querySelectorAll("[data-lead]").forEach((btn) => {
      btn.onclick = async () => {
        const res = await api(`/leads/${btn.dataset.lead}`);
        state.selectedLead = res.lead;
        render();
        bindLeadDetailActions();
      };
    });
  }

  if (state.view === "records") {
    document.querySelector("#loadQuotesBtn").onclick = async () => {
      const data = await api("/activities/quotes");
      document.querySelector("#quotesBox").innerHTML = data.quotes.map((q) => `<div class="card"><strong>${q.quoteNo}</strong><div class="muted">${q.leadName} • ₹${Number(q.netEffectivePrice || 0).toLocaleString("en-IN")}</div></div>`).join("") || "<div class='muted'>No quotes</div>";
    };
    document.querySelector("#loadPaymentsBtn").onclick = async () => {
      const data = await api("/activities/payments");
      document.querySelector("#recordsBox").innerHTML = data.payments.map((p) => `<div class="card"><strong>${p.paymentNo}</strong><div class="muted">${p.leadName} • ₹${Number(p.paidAmount || 0).toLocaleString("en-IN")} received</div></div>`).join("");
    };
    document.querySelector("#loadGstBtn").onclick = async () => {
      const data = await api("/activities/gst");
      document.querySelector("#recordsBox").innerHTML = data.invoices.map((g) => `<div class="card"><strong>${g.invoiceNo}</strong><div class="muted">${g.leadName} • ₹${Number(g.taxableAmount || 0).toLocaleString("en-IN")} taxable</div></div>`).join("");
    };
  }
}

function openLeadForm(lead = null) {
  const isEdit = Boolean(lead);
  const overlay = h("div", { class: "login", id: "modal" }, `
    <div class="loginbox" style="width:min(920px,100%)">
      <div class="toolbar" style="justify-content:space-between">
        <h2 style="margin:0">${isEdit ? "Edit Lead" : "Add Lead"}</h2>
        <button class="btn btn-soft" id="closeModal">Close</button>
      </div>
      <div class="grid two" style="margin-top:16px">
        <div class="field"><label>Customer Name</label><input id="l_name" value="${lead?.customerName || ""}"/></div>
        <div class="field"><label>Phone</label><input id="l_phone" value="${lead?.phone || ""}"/></div>
        <div class="field"><label>Area</label><input id="l_area" value="${lead?.area || ""}"/></div>
        <div class="field"><label>Locality</label><input id="l_locality" value="${lead?.locality || ""}"/></div>
        <div class="field"><label>Monthly Bill</label><input id="l_bill" type="number" value="${lead?.monthlyBill || ""}"/></div>
        <div class="field"><label>Source</label><select id="l_source"><option ${lead?.source === "Website" ? "selected" : ""}>Website</option><option ${lead?.source === "Social Media" ? "selected" : ""}>Social Media</option><option ${lead?.source === "Field Visit" ? "selected" : ""}>Field Visit</option><option ${lead?.source === "Import" ? "selected" : ""}>Import</option></select></div>
        <div class="field"><label>Status</label><select id="l_status"><option ${lead?.leadStatus === "New Lead" ? "selected" : ""}>New Lead</option><option ${lead?.leadStatus === "Contacted" ? "selected" : ""}>Contacted</option><option ${lead?.leadStatus === "Interested" ? "selected" : ""}>Interested</option><option ${lead?.leadStatus === "Follow Up" ? "selected" : ""}>Follow Up</option><option ${lead?.leadStatus === "Not Interested" ? "selected" : ""}>Not Interested</option><option ${lead?.leadStatus === "Won" ? "selected" : ""}>Won</option><option ${lead?.leadStatus === "Lost" ? "selected" : ""}>Lost</option></select></div>
        <div class="field"><label>Follow Up Date</label><input id="l_fu" type="date" value="${lead?.followUpDate || ""}"/></div>
        <div class="field"><label>Assigned To (SC name)</label><input id="l_assignedto" value="${lead?.assignedTo || ""}"/></div>
        <div class="field"><label>Meeting Date</label><input id="l_meetdate" type="date" value="${lead?.meetingDate || ""}"/></div>
        <div class="field"><label>Meeting Time</label><input id="l_meettime" type="time" value="${lead?.meetingTime || ""}"/></div>
        <div class="field" style="grid-column:1/-1"><label>Attachment / Photo / PDF</label><input id="l_file" type="file" accept="image/*,.pdf" /></div>
        <div class="field"><label>Notes</label><textarea id="l_note">${lead?.note || ""}</textarea></div>
      </div>
      <div class="toolbar" style="margin-top:16px;justify-content:flex-end">
        <button class="btn btn-primary" id="saveLeadBtn">${isEdit ? "Update Lead" : "Save Lead"}</button>
      </div>
    </div>
  `);
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(9,14,31,.55)";
  overlay.style.zIndex = "40";
  overlay.style.display = "grid";
  overlay.style.placeItems = "center";
  document.body.append(overlay);
  overlay.querySelector("#closeModal").onclick = () => overlay.remove();
  overlay.querySelector("#saveLeadBtn").onclick = async () => {
    let attachmentText = "";
    const file = overlay.querySelector("#l_file").files?.[0];
    if (file) {
      try {
        toast("Uploading attachment...");
        const uploaded = await uploadFile(file, "zengrid/leads");
        attachmentText = `\nAttachment: ${uploaded.file.url}`;
      } catch (e) {
        toast(e.message, "error");
        return;
      }
    }
    const body = {
      customerName: overlay.querySelector("#l_name").value,
      phone: overlay.querySelector("#l_phone").value,
      area: overlay.querySelector("#l_area").value,
      locality: overlay.querySelector("#l_locality").value,
      monthlyBill: overlay.querySelector("#l_bill").value,
      source: overlay.querySelector("#l_source").value,
      leadStatus: overlay.querySelector("#l_status").value,
      followUpDate: overlay.querySelector("#l_fu").value,
      assignedTo: overlay.querySelector("#l_assignedto").value,
      meetingDate: overlay.querySelector("#l_meetdate").value,
      meetingTime: overlay.querySelector("#l_meettime").value,
      note: `${overlay.querySelector("#l_note").value}${attachmentText}`.trim(),
    };
    try {
      await api(isEdit ? `/leads/${lead._id}` : "/leads", { method: isEdit ? "PATCH" : "POST", body: JSON.stringify(body) });
      overlay.remove();
      toast(isEdit ? "Lead updated" : "Lead saved", "success");
      loadData();
    } catch (e) {
      toast(e.message, "error");
    }
  };
}

function bindLeadDetailActions() {
  const editLeadBtn = document.querySelector("#editLeadBtn");
  const deleteLeadBtn = document.querySelector("#deleteLeadBtn");
  const addFollowBtn = document.querySelector("#addFollowBtn");
  const addMeetBtn = document.querySelector("#addMeetBtn");
  if (!addFollowBtn || !addMeetBtn) return;
  if (editLeadBtn) {
    editLeadBtn.onclick = () => openLeadForm(state.selectedLead);
  }
  if (deleteLeadBtn) {
    deleteLeadBtn.onclick = async () => {
      if (!confirm("Delete this lead and its follow-up records?")) return;
      await api(`/leads/${state.selectedLead._id}`, { method: "DELETE" });
      toast("Lead deleted", "success");
      state.selectedLead = null;
      loadData();
    };
  }
  addFollowBtn.onclick = async () => {
    const followUpDate = prompt("Follow-up date (YYYY-MM-DD):");
    if (!followUpDate) return;
    const note = prompt("Follow-up note:");
    await api(`/followups/${state.selectedLead._id}`, { method: "POST", body: JSON.stringify({ followUpDate, note }) });
    toast("Follow-up added", "success");
    loadData();
  };
  addMeetBtn.onclick = async () => {
    const meetingDate = prompt("Meeting date (YYYY-MM-DD):");
    if (!meetingDate) return;
    const meetingTime = prompt("Meeting time (HH:MM):") || "";
    const note = prompt("Meeting note:") || "";
    await api(`/activities/meetings/${state.selectedLead._id}`, { method: "POST", body: JSON.stringify({ meetingDate, meetingTime, note }) });
    toast("Meeting added", "success");
    loadData();
  };
  document.querySelectorAll("[data-print-quote]").forEach((btn) => {
    btn.onclick = () => {
      const quote = state.quotes.find((q) => String(q._id) === String(btn.dataset.printQuote));
      if (quote) printRecord("Quote", quote);
    };
  });
  document.querySelectorAll("[data-print-payment]").forEach((btn) => {
    btn.onclick = () => {
      const payment = state.payments.find((p) => String(p._id) === String(btn.dataset.printPayment));
      if (payment) printRecord("Receipt", payment);
    };
  });
  document.querySelectorAll("[data-print-gst]").forEach((btn) => {
    btn.onclick = () => {
      const gst = state.gst.find((g) => String(g._id) === String(btn.dataset.printGst));
      if (gst) printRecord("GST Invoice", gst);
    };
  });
}

async function bootstrap() {
  if (state.accessToken && state.refreshToken) {
    const ok = await refreshAccessToken();
    if (ok) {
      state.user = JSON.parse(localStorage.getItem("zg_user") || "null");
      await loadData();
      return;
    }
  }
  render();
}

bootstrap();
