const API_BASE = import.meta.env.VITE_API_BASE || "https://zengridpwa-backend.onrender.com/api";
const app = document.querySelector("#app");
const statuses = ["New Lead", "Contacted", "Interested", "Follow Up", "Not Available", "Not Picking Call", "Rescheduled", "Not Interested", "Won", "Lost"];
const outcomes = ["Not Available", "Not Picking Call", "Rescheduled", "Follow Up", "Won", "Lost"];
const floors = ["G", "G+1", "G+2", "G+3", "G+4", "G+5"];

const state = {
  accessToken: localStorage.getItem("zg_access") || "",
  refreshToken: localStorage.getItem("zg_refresh") || "",
  user: JSON.parse(localStorage.getItem("zg_user") || "null"),
  view: "meetings",
  leads: [],
  meetings: [],
  followUps: [],
  quotes: [],
  payments: [],
  configs: [],
  scs: [],
  summary: {},
  reports: [],
  meetingDate: new Date().toISOString().slice(0, 10),
};

const css = `
:root{--ink:#241a30;--muted:#6c6675;--soft:#f4f2ee;--line:#ddd8e6;--bg:#f4f2ee;--panel:#fff;--nav:#4c118f;--brand:#4c118f;--solar:#a8b79a;--gold:#8fa57f;--green:#0f8f62;--mint:#e8f7ee;--red:#c93642;--purple:#4c118f;--shadow:0 18px 44px rgba(76,17,143,.12);font-family:Inter,Arial,sans-serif}
*{box-sizing:border-box}body{margin:0;background:linear-gradient(180deg,#f7f5f1 0%,#f1eef5 100%);color:var(--ink);font-family:inherit}button,input,select,textarea{font:inherit}button{cursor:pointer}.app{min-height:100vh;padding-bottom:96px}.content{width:min(1160px,100%);margin:0 auto;padding:18px}.toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.grid{display:grid;gap:12px}.two{grid-template-columns:repeat(2,minmax(0,1fr))}.muted{color:var(--muted);font-size:12px;line-height:1.45}
.bar{position:sticky;top:0;z-index:20;background:linear-gradient(180deg,#4c118f,#3b0f70);color:#fff;padding:20px 16px 24px;border-bottom:1px solid rgba(168,183,154,.28);box-shadow:0 20px 44px rgba(76,17,143,.30)}.bar-inner{width:min(1160px,100%);min-height:52px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:14px}.bar h1{margin:0;font-size:22px;line-height:1.08;font-weight:900;letter-spacing:0}.bar p{margin:6px 0 0;color:#d9e2d2;font-size:12px;max-width:640px}.brandline{display:flex;align-items:center;gap:13px;min-width:0}.mark{width:46px;height:46px;border-radius:10px;background:#0b0d14;box-shadow:0 12px 26px rgba(11,13,20,.2);position:relative;flex:0 0 46px}.mark:after{content:"";position:absolute;left:16px;top:10px;width:13px;height:23px;background:#f2c94c;clip-path:polygon(55% 0,0 53%,42% 53%,28% 100%,100% 40%,58% 40%)}.role-chip{display:inline-flex;align-items:center;gap:6px;margin-top:9px;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.1);border:1px solid rgba(168,183,154,.34);color:#fff;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.55px}.profile-link{display:inline-flex;align-items:center;gap:9px;color:#fff;text-decoration:none;font-size:12px;font-weight:900;padding:6px 8px 6px 6px;border-radius:999px;background:transparent;border:1px solid transparent;white-space:nowrap}.profile-link:hover,.profile-link.active{background:rgba(255,255,255,.1);border-color:rgba(168,183,154,.28)}.profile-avatar{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#a8b79a;color:#261044;font-size:12px;font-weight:900}.profile-card{background:linear-gradient(180deg,#fff,#f7f5f1);border:1px solid var(--line);border-radius:12px;padding:16px}.profile-title{display:flex;align-items:center;gap:12px}.profile-title .profile-avatar{width:44px;height:44px}.profile-logout{background:#fff1f1!important;border-color:#ffcaca!important;color:#c93642!important;box-shadow:none!important}
.tabs{position:fixed;left:10px;right:10px;bottom:10px;z-index:30;background:#fff;border:1px solid var(--line);border-radius:16px;box-shadow:0 -10px 36px rgba(76,17,143,.16);display:grid;grid-template-columns:repeat(auto-fit,minmax(58px,1fr));padding:8px}.tabs button{min-width:0;border:0;background:transparent;color:var(--muted);border-radius:10px;padding:10px 4px;font-size:11px;font-weight:900;letter-spacing:0}.tabs button.active{background:#4c118f;color:#fff;box-shadow:0 8px 20px rgba(76,17,143,.22)}
.btn.compact{min-height:30px;padding:6px 9px;font-size:11px;border-radius:7px;box-shadow:none}.btn.compact svg{width:13px;height:13px}.btn{min-height:40px;border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:8px;padding:10px 13px;font-weight:900;box-shadow:0 8px 18px rgba(76,17,143,.07);white-space:nowrap}.btn:hover{transform:translateY(-1px)}.primary{background:#a8b79a;border-color:#94a783;color:#261044}.blue{background:#4c118f;border-color:#4c118f;color:#fff}.green{background:var(--green);border-color:var(--green);color:#fff}.danger{background:rgba(255,255,255,.12);border-color:rgba(168,183,154,.38);color:#fff;box-shadow:none}
.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:-32px 0 16px;position:relative;z-index:21}.stat{position:relative;overflow:hidden;background:#fff;border:1px solid var(--line);border-radius:10px;padding:15px;box-shadow:var(--shadow)}.stat:before{content:"";position:absolute;left:0;top:0;right:0;height:4px;background:#4c118f}.stat:nth-child(2):before{background:#8fa57f}.stat:nth-child(3):before{background:#0f8f62}.stat:nth-child(4):before{background:#c93642}.k{font-size:10px;color:var(--muted);text-transform:uppercase;font-weight:900;letter-spacing:.7px}.v{font-size:26px;font-weight:900;margin-top:6px;color:#4c118f}
.card{background:#fff;border:1px solid var(--line);border-radius:10px;box-shadow:var(--shadow);padding:15px;margin-top:12px}.section-card{padding:0;overflow:hidden}.section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;border-bottom:1px solid var(--line);background:linear-gradient(180deg,#fff,#f7f5f1)}.section-head h3{margin:0;font-size:16px;color:#4c118f}.count-pill{display:inline-flex;min-width:34px;justify-content:center;padding:6px 10px;border-radius:999px;background:#4c118f;color:#fff;font-size:12px;font-weight:900}.list{display:grid;gap:12px;padding:14px}.doc-list{display:grid;gap:12px}.doc-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:12px}.doc-row{position:relative;overflow:hidden;border:1px solid var(--line);border-radius:12px;background:#fff;padding:14px;box-shadow:0 10px 22px rgba(76,17,143,.08)}.doc-row:before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:#a8b79a}.doc-row.latest{border-color:#8fa57f;box-shadow:inset 5px 0 0 #8fa57f,0 12px 26px rgba(76,17,143,.08)}.doc-row-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.doc-title{display:flex;gap:10px;align-items:flex-start;min-width:0}.doc-icon{width:38px;height:38px;border-radius:10px;background:#f1eafb;color:#4c118f;display:grid;place-items:center;font-size:13px;font-weight:950;flex:0 0 38px}.doc-row b{font-size:14px;color:#241a30;overflow-wrap:anywhere}.doc-row .actions{grid-template-columns:repeat(2,minmax(0,1fr))}.doc-amount{font-size:22px;font-weight:900;color:#4c118f;margin-top:10px}.doc-line{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}
.status-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(132px,1fr));gap:10px;margin:0 0 14px}.status-tile{position:relative;overflow:hidden;min-height:82px;background:#fff;border:1px solid var(--line);border-radius:12px;padding:13px 13px 13px 15px;box-shadow:0 12px 28px rgba(76,17,143,.09)}.status-tile:before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:#4c118f}.status-tile:after{content:"";position:absolute;right:-28px;top:-28px;width:72px;height:72px;border-radius:50%;background:rgba(168,183,154,.32)}.status-tile b{display:block;font-size:24px;line-height:1;color:#4c118f;position:relative;z-index:1}.status-tile span{display:block;margin-top:8px;color:var(--muted);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.55px;overflow-wrap:anywhere;position:relative;z-index:1}.status-tile small{display:block;margin-top:3px;color:#596a50;font-size:11px;font-weight:800;position:relative;z-index:1}.status-tile.new:before{background:#4c118f}.status-tile.interested:before{background:#7a3db8}.status-tile.follow:before{background:#8fa57f}.status-tile.won:before{background:#0f8f62}.status-tile.overdue:before{background:#c93642}.status-tile.live:before{background:#0f8f62}
.lead{position:relative;overflow:hidden;display:block;padding:0;background:#fff;border:1px solid var(--line);border-radius:12px;box-shadow:0 12px 30px rgba(76,17,143,.09)}.lead:before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:#a8b79a}.lead.live:before{background:var(--green)}.lead.done:before{background:var(--purple)}.lead.follow:before{background:#8fa57f}.lead-main{padding:15px 15px 15px 19px}.lead-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.avatar{width:42px;height:42px;border-radius:10px;background:#4c118f;color:#d9e2d2;display:flex;align-items:center;justify-content:center;font-weight:900;flex:0 0 auto}.lead.live .avatar{background:var(--green);color:#fff}.lead-title{min-width:0;display:flex;gap:10px;align-items:flex-start}.lead h3{margin:0;font-size:16px;line-height:1.25;word-break:break-word}.lead-id{font-size:11px;color:var(--muted);font-weight:800;margin-top:3px}.status-line{margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}.live-dot{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 0 5px rgba(15,143,98,.12)}.lead-meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}.meta{background:#f7f5f1;border:1px solid var(--line);border-radius:8px;padding:10px;min-width:0}.meta label{display:block;font-size:10px;color:var(--muted);font-weight:900;text-transform:uppercase;letter-spacing:.5px}.meta span{display:block;margin-top:3px;font-size:12px;font-weight:900;color:var(--ink);overflow-wrap:anywhere}.actions{display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid var(--line)}
.pill{display:inline-flex;align-items:center;justify-content:center;padding:6px 9px;border-radius:999px;font-size:11px;font-weight:900;line-height:1.1;white-space:nowrap}.pblue{background:#f1eafb;color:#4c118f}.pgreen{background:var(--mint);color:#075F41}.porange{background:#eef3ea;color:#58674e}.pred{background:#FFF1F1;color:var(--red)}.ppurple{background:#4c118f;color:#fff}
.field{display:flex;flex-direction:column;gap:7px}.field label{font-size:11px;color:var(--muted);font-weight:900;text-transform:uppercase;letter-spacing:.5px}.field input,.field select,.field textarea{border:1px solid var(--line);border-radius:8px;padding:12px;background:#fff;width:100%;color:var(--ink);outline:none}.field input:focus,.field select:focus,.field textarea:focus{border-color:#4c118f;box-shadow:0 0 0 3px rgba(76,17,143,.12)}.field textarea{min-height:82px;resize:vertical}
.login{min-height:100vh;display:grid;place-items:center;padding:20px;background:linear-gradient(145deg,#4c118f 0%,#4c118f 52%,#a8b79a 52%,#a8b79a 100%)}.loginbox{width:min(430px,100%);background:#fff;border:1px solid var(--line);border-radius:12px;padding:24px;box-shadow:0 24px 70px rgba(28,9,50,.28)}.loginbox h1{margin:22px 0 16px;font-size:27px;color:#4c118f}.loginbox .brand{display:flex;align-items:center;gap:12px;font-weight:900}
.modalback{position:fixed;inset:0;background:rgba(38,12,67,.72);display:grid;place-items:center;padding:14px;z-index:60}.modal{width:min(900px,calc(100vw - 28px));max-height:92vh;overflow:auto;background:#fff;border-radius:12px;padding:16px;box-shadow:0 24px 80px rgba(28,9,50,.35);border:1px solid rgba(168,183,154,.42)}.modalhead{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--line)}.modalhead h2{font-size:20px;margin:0;line-height:1.2;color:#4c118f}.icon-close{width:34px!important;height:34px!important;min-height:34px!important;flex:0 0 34px;border:1px solid var(--line);border-radius:50%;background:#f7f5f1;color:#4c118f;box-shadow:none;padding:0!important;font-size:20px;font-weight:900;line-height:1;display:inline-flex;align-items:center;justify-content:center}.icon-close:hover{background:#FFF2F2;border-color:#FFD6D6;color:var(--red);transform:none}.choice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.choice-grid input{position:absolute;opacity:0;pointer-events:none}.choice-grid span{display:flex;align-items:center;justify-content:center;min-height:42px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);font-size:13px;font-weight:900;text-align:center;padding:9px;line-height:1.2}.choice-grid input:checked+span{border-color:#4c118f;background:#f1eafb;color:#4c118f;box-shadow:inset 0 0 0 1px #4c118f}.choice-grid label:nth-child(5) input:checked+span{border-color:var(--green);background:var(--mint);color:#075F41}.choice-grid label:nth-child(6) input:checked+span{border-color:var(--red);background:#FFF1F1;color:var(--red)}.quote-paper{border:1px solid var(--line);border-radius:10px;background:#f7f5f1;padding:14px}.quote-head{display:flex;justify-content:space-between;border-bottom:3px solid #8fa57f;padding-bottom:10px;margin-bottom:12px;color:#4c118f}.empty{text-align:center;color:var(--muted);padding:28px 12px;border:1px dashed #a8b79a;border-radius:10px;background:#faf9f5}
@media(max-width:900px){.status-strip{grid-template-columns:repeat(2,minmax(0,1fr))}.lead-meta{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:760px){.content{padding:12px}.bar{padding:17px 12px 44px}.bar-inner{align-items:center}.brandline{gap:10px}.mark{width:38px;height:38px;border-radius:10px;flex-basis:38px}.bar h1{font-size:20px}.stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:-34px}.two{grid-template-columns:1fr}.actions{grid-template-columns:repeat(2,minmax(0,1fr))}.doc-summary{grid-template-columns:1fr}.doc-line{grid-template-columns:1fr}.btn.compact{min-height:30px;padding:6px 9px;font-size:11px;border-radius:7px;box-shadow:none}.btn.compact svg{width:13px;height:13px}.btn{width:100%;min-height:42px;padding-left:9px;padding-right:9px}.danger{width:auto}.section-head{padding:13px 14px;align-items:flex-start;flex-direction:column}.section-head .toolbar{width:100%}.section-head .toolbar .btn.compact{min-height:30px;padding:6px 9px;font-size:11px;border-radius:7px;box-shadow:none}.btn.compact svg{width:13px;height:13px}.btn{flex:1 1 120px}.status-tile{min-height:70px;padding:11px 11px 11px 13px}.status-tile b{font-size:20px}.profile-link{padding:5px}.profile-link span:last-child{display:none}}
@media(max-width:430px){.app{padding-bottom:104px}.stats{grid-template-columns:repeat(2,minmax(0,1fr))}.stat{padding:12px}.status-strip{grid-template-columns:1fr 1fr;gap:8px}.status-tile{min-height:66px;padding:10px 9px 10px 12px}.status-tile b{font-size:19px}.status-tile span{font-size:9px;letter-spacing:.35px}.lead-top{align-items:flex-start}.lead-title{gap:8px}.avatar{width:36px;height:36px;border-radius:10px}.lead-meta{grid-template-columns:1fr}.actions{grid-template-columns:1fr 1fr}.tabs{grid-template-columns:repeat(3,1fr);row-gap:5px}.tabs button{font-size:10px;padding:8px 2px}.bar p{font-size:11px}.v{font-size:23px}.modalback{place-items:start center;padding:10px}.modal{width:calc(100vw - 20px);max-height:calc(100vh - 20px);padding:13px}.modalhead{gap:10px}.icon-close{width:32px!important;height:32px!important;min-height:32px!important;flex-basis:32px;font-size:19px}.choice-grid{grid-template-columns:1fr}.role-chip{font-size:10px;line-height:1.25}}
.doc-preview-modal{width:min(1120px,calc(100vw - 24px));height:min(92vh,980px);padding:14px}.doc-preview-frame{width:100%;height:calc(92vh - 76px);border:1px solid var(--line);border-radius:10px;background:#fff}.doc-actions-inline,.doc-actions{display:flex;gap:7px;justify-content:flex-end;flex-wrap:wrap}@media(max-width:340px){.stats,.status-strip,.actions{grid-template-columns:1fr}.bar-inner{gap:8px}.danger{padding-left:9px;padding-right:9px}.lead-main{padding-right:10px}.pill{white-space:normal;text-align:center}}
`;
document.head.insertAdjacentHTML("beforeend", `<style>${css}</style>`);

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
const rupee = (n) => `Rs ${Number(n || 0).toLocaleString("en-IN")}`;
const today = () => new Date().toISOString().slice(0, 10);
const isLrm = () => state.user?.userType === "lrm" || state.user?.userType === "admin";
const isSc = () => state.user?.userType === "sc";
const canManageCommercialDocs = () => state.user?.userType === "sc" || state.user?.userType === "admin";
const active = (type) => state.configs.filter((x) => x.type === type && x.status === "active");
const badge = (s) => s === "Won" || s === "done" ? "pgreen" : s === "Lost" || s === "Not Interested" ? "pred" : s === "Interested" ? "ppurple" : s === "Follow Up" || s === "Rescheduled" ? "porange" : "pblue";
const quoteTaxDefaults = () => active("tax-subsidy")[0] || { gstPercent: 8.9, centralSubsidy: 78000, upnedaSubsidy: 30000 };
const leadKey = (leadId) => String(leadId?._id || leadId || "");
const isLiveMeeting = (l) => l.meetingStatus === "started";
const isDoneMeeting = (l) => l.meetingStatus === "done";
const cleanPhone = (v) => String(v || "").replace(/\D/g, "").slice(-10);
const docContactActions = (type, row) => {
  const subject = encodeURIComponent(`${type === "quote" ? "Quotation" : "Payment Receipt"} - ${row.quoteNo || row.paymentNo || ""}`);
  const body = encodeURIComponent(`Hello ${row.leadName || ""}, please find your ${type === "quote" ? "quotation" : "payment receipt"}.`);
  const email = row.email ? `<button class="btn compact" data-email="${esc(row.email)}" data-subject="${subject}" data-body="${body}">Email</button>` : "";
  const waNumber = cleanPhone(row.whatsappNumber || row.phone);
  const whatsapp = row.whatsappNumber ? `<button class="btn compact green" data-send-wa="${waNumber}" data-wa-msg="${body}">WhatsApp</button>` : "";
  return `<div class="actions doc-actions-inline"><button class="btn compact blue" data-doc="${type}:${row._id}">View</button>${email}${whatsapp}</div>`;
};

async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (state.accessToken) headers.set("Authorization", `Bearer ${state.accessToken}`);
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

function toast(message) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    Object.assign(el.style, { position: "fixed", right: "14px", bottom: "84px", background: "#10243D", color: "#fff", padding: "12px 14px", borderRadius: "8px", zIndex: 80 });
    document.body.append(el);
  }
  el.textContent = message;
  clearTimeout(el.t);
  el.t = setTimeout(() => el.remove(), 2400);
}

async function loadData() {
  if (!state.accessToken) return renderLogin();
  try {
    const dateQuery = state.view === "meetings" ? `?meetingDate=${encodeURIComponent(state.meetingDate)}` : "";
    const meetingQuery = state.view === "meetings" ? `?date=${encodeURIComponent(state.meetingDate)}` : "";
    const leadJoin = dateQuery ? `${dateQuery}&limit=500` : "?limit=500";
    const meetingJoin = meetingQuery ? `${meetingQuery}&limit=500` : "?limit=500";
    const calls = [api("/auth/me"), api("/activities/summary"), api(`/leads/mine${leadJoin}`), api(`/activities/meetings${meetingJoin}`), api("/followups")];
    if (canManageCommercialDocs()) calls.push(api("/activities/quotes?limit=500"), api("/activities/payments?limit=500"));
    calls.push(api("/config"));
    const loadLrmResources = state.user?.userType === "lrm" || state.user?.userType === "admin";
    if (loadLrmResources) calls.push(api("/users/scs"), api("/activities/daily-reports"));
    const data = await Promise.all(calls);
    Object.assign(state, {
      user: data[0].user,
      summary: data[1].summary || {},
      leads: data[2].leads || [],
      meetings: data[3].meetings || [],
      followUps: data[4].followUps || [],
      quotes: canManageCommercialDocs() ? data[5].quotes || [] : [],
      payments: canManageCommercialDocs() ? data[6].payments || [] : [],
      configs: data[canManageCommercialDocs() ? 7 : 5].items || [],
      scs: loadLrmResources ? data[canManageCommercialDocs() ? 8 : 6]?.users || [] : [],
      reports: loadLrmResources ? data[canManageCommercialDocs() ? 9 : 7]?.reports || [] : [],
    });
    localStorage.setItem("zg_user", JSON.stringify(state.user));
  } catch (e) {
    toast(e.message);
  }
  render();
}

function renderLogin() {
  app.innerHTML = `<div class="login"><div class="loginbox"><div class="brand"><div class="mark"></div><div>Zen Grid Solar<div class="muted">Field operations</div></div></div><h1>Sign in</h1><div class="grid"><div class="field"><label>Email</label><input id="email" autocomplete="email"></div><div class="field"><label>Password</label><input id="password" type="password" autocomplete="current-password"></div><button class="btn primary" id="loginBtn">Continue</button></div></div></div>`;
  document.querySelector("#loginBtn").onclick = async () => {
    try {
      const data = await fetch(`${API_BASE}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.value.trim(), password: password.value }) }).then((r) => r.json().then((d) => r.ok ? d : Promise.reject(d)));
      Object.assign(state, { accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
      localStorage.setItem("zg_access", data.accessToken);
      localStorage.setItem("zg_refresh", data.refreshToken);
      localStorage.setItem("zg_user", JSON.stringify(data.user));
      state.view = isLrm() ? "leads" : "meetings";
      loadData();
    } catch (e) { toast(e.message || "Login failed"); }
  };
}

function modal(title, body, onSave) {
  const host = document.createElement("div");
  host.className = "modalback";
  host.innerHTML = `<form class="modal"><div class="modalhead"><h2>${title}</h2><button type="button" class="icon-close" data-close aria-label="Close">Ã—</button></div>${body}<div class="toolbar" style="justify-content:flex-end;margin-top:12px"><button type="button" class="btn" data-close>Cancel</button><button class="btn primary">Save</button></div></form>`;
  document.body.append(host);
  host.querySelectorAll("[data-close]").forEach((b) => b.onclick = () => host.remove());
  host.querySelector("form").onsubmit = async (e) => {
    e.preventDefault();
    try { await onSave(Object.fromEntries(new FormData(e.target).entries()), host); host.remove(); await loadData(); } catch (err) { toast(err.message); }
  };
}

function infoModal(title, body) {
  const host = document.createElement("div");
  host.className = "modalback";
  host.innerHTML = `<div class="modal"><div class="modalhead"><h2>${title}</h2><button type="button" class="icon-close" data-close aria-label="Close">Ã—</button></div>${body}</div>`;
  document.body.append(host);
  host.querySelectorAll("[data-close]").forEach((b) => b.onclick = () => host.remove());
  return host;
}

function layout(title, sub, body) {
  const tabs = isLrm() ? [["leads", "Leads"], ["meetings", "Meetings"], ["followups", "Follow-ups"]] : [["meetings", "Meetings"], ["followups", "Follow-ups"], ["leads", "Leads"]];
  const name = `${state.user?.firstName || ""} ${state.user?.lastName || ""}`.trim() || "Team";
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0]).join("").toUpperCase() || "ZG";
  const role = state.user?.userType === "lrm" ? "LRM workspace" : state.user?.userType === "admin" ? "Admin workspace" : "SC workspace";
  app.innerHTML = `<div class="app"><div class="bar"><div class="bar-inner"><div class="brandline"><div class="mark"></div><div><h1>Zen Grid Solar</h1><p>Field operations</p><div class="role-chip">${esc(name)} / ${role}</div></div></div><a class="profile-link ${state.view === "profile" ? "active" : ""}" href="#" id="profileLink"><span class="profile-avatar">${esc(initials)}</span><span>Profile</span></a></div></div><div class="content">${summaryCards()}${body}</div><div class="tabs">${tabs.map(([id, label]) => `<button class="${state.view === id ? "active" : ""}" data-view="${id}">${label}</button>`).join("")}</div></div>`;
  document.querySelector("#profileLink").onclick = (e) => { e.preventDefault(); state.view = "profile"; render(); };
  document.querySelectorAll("[data-view]").forEach((b) => b.onclick = () => { state.view = b.dataset.view; loadData(); });
}

function summaryCards() {
  const s = state.summary;
  if (isSc()) {
    const todayMeetings = state.leads.filter((l) => l.meetingDate === today() && !isDoneMeeting(l)).length;
    const liveMeetings = state.leads.filter(isLiveMeeting).length;
    const followUps = state.followUps.length || state.leads.filter((l) => l.followUpDate || l.leadStatus === "Follow Up").length;
    return `<div class="stats"><div class="stat"><div class="k">Today</div><div class="v">${todayMeetings}</div></div><div class="stat"><div class="k">Live</div><div class="v">${liveMeetings}</div></div><div class="stat"><div class="k">Follow-ups</div><div class="v">${followUps}</div></div><div class="stat"><div class="k">Closed</div><div class="v">${s.won || 0}</div></div></div>`;
  }
  const calls = state.reports.reduce((sum, r) => sum + Number(r.totalCalls || 0), 0);
  const connected = state.reports.reduce((sum, r) => sum + Number(r.connectedCalls || 0), 0);
  const conversion = connected ? Math.round(((s.won || 0) / connected) * 100) : 0;
  if (isLrm()) return `<div class="stats"><div class="stat"><div class="k">Leads</div><div class="v">${s.totalLeads || 0}</div></div><div class="stat"><div class="k">Calls</div><div class="v">${calls}</div></div><div class="stat"><div class="k">Connected</div><div class="v">${connected}</div></div><div class="stat"><div class="k">Conversion</div><div class="v">${conversion}%</div></div></div>`;
  return `<div class="stats"><div class="stat"><div class="k">Leads</div><div class="v">${s.totalLeads || 0}</div></div><div class="stat"><div class="k">Meetings</div><div class="v">${s.meetingsTotal || 0}</div></div><div class="stat"><div class="k">Done</div><div class="v">${s.meetingsDone || 0}</div></div><div class="stat"><div class="k">Closed</div><div class="v">${s.won || 0}</div></div></div>`;
}

function leadCard(l, context = "lead") {
  const canAddLeadActions = isLrm();
  const docActions = canManageCommercialDocs() ? `<button class="btn primary" data-quote="${l._id}">Quote</button><button class="btn green" data-pay="${l._id}">Receipt</button>` : "";
  const initials = String(l.customerName || "ZG").split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0]).join("").toUpperCase();
  const live = isLiveMeeting(l);
  const done = isDoneMeeting(l);
  const follow = l.followUpDate || l.leadStatus === "Follow Up" || context === "follow";
  const stateClass = live ? "live" : done ? "done" : follow ? "follow" : "";
  const stateText = live ? "Meeting live" : done ? "Meeting completed" : follow ? `Follow-up ${l.followUpDate || ""} ${l.followUpTime || ""}`.trim() : "Ready";
  const meetingActions = done ? `<button class="btn" data-follow="${l._id}">Follow-up</button>` : live ? `<button class="btn green" data-done="${l._id}">End Meeting</button><button class="btn" data-reschedule="${l._id}">Reschedule</button>` : `<button class="btn blue" data-start="${l._id}">Start Meeting</button><button class="btn" data-reschedule="${l._id}">Reschedule</button>`;
  const normalActions = `<button class="btn" data-follow="${l._id}">Follow-up</button>`;
  return `<div class="lead ${stateClass}"><div class="lead-main"><div class="lead-top"><div class="lead-title"><div class="avatar">${esc(initials || "ZG")}</div><div><h3>${esc(l.customerName)}</h3><div class="lead-id">${esc(l.leadId || "-")}</div><div class="status-line">${live ? `<span class="live-dot"></span>` : ""}<span class="muted">${esc(stateText)}</span></div></div></div><span class="pill ${badge(l.leadStatus)}">${esc(l.leadStatus)}</span></div><div class="lead-meta"><div class="meta"><label>Phone</label><span>${esc(l.phone)}</span></div><div class="meta"><label>WhatsApp</label><span>${esc(l.whatsappNumber || "-")}</span></div><div class="meta"><label>Email</label><span>${esc(l.email || "-")}</span></div><div class="meta"><label>Address</label><span>${esc([l.address, l.area, l.locality].filter(Boolean).join(", ") || "-")}</span></div><div class="meta"><label>Meeting</label><span>${esc(l.meetingDate || "-")} ${esc(l.meetingTime || "")}</span></div><div class="meta"><label>Bill</label><span>${rupee(l.monthlyBill)}</span></div></div><div class="actions"><button class="btn" data-call="${esc(l.phone)}">Call</button><button class="btn" data-wa="${esc(l.whatsappNumber || l.phone)}">WhatsApp</button><button class="btn" data-nav="${esc([l.address, l.area, l.locality].filter(Boolean).join(", "))}">Navigate</button>${canAddLeadActions ? `<button class="btn blue" data-assign="${l._id}">Assign SC</button><button class="btn" data-edit="${l._id}">Edit</button>` : ""}${docActions}${context === "meeting" ? meetingActions : normalActions}</div></div></div>`;
}

function meetingsView() {
  const selectedDate = state.meetingDate || today();
  const live = state.leads.filter(isLiveMeeting);
  const todays = state.leads.filter((l) => l.meetingDate === selectedDate && !isDoneMeeting(l) && !isLiveMeeting(l));
  const all = state.leads.filter((l) => l.meetingDate && !isDoneMeeting(l));
  const monthCount = all.filter((l) => String(l.meetingDate).slice(0, 7) === selectedDate.slice(0, 7)).length;
  const queue = [...live, ...(todays.length ? todays : all.filter((l) => !isLiveMeeting(l)))];
  return layout(selectedDate === today() ? "Today's Meetings" : "Meetings", live.length ? `${live.length} meeting is live now. ${todays.length} more scheduled for ${selectedDate}.` : `${todays.length} scheduled for ${selectedDate}.`, `<div class="card" style="margin-top:-6px;margin-bottom:14px"><div class="toolbar" style="margin:0"><div class="field" style="min-width:220px"><label>Meeting Date</label><input type="date" id="meetingDateFilter" value="${esc(selectedDate)}"></div><button class="btn" id="todayMeetings">Today</button><button class="btn" id="refresh">Refresh</button></div></div><div class="status-strip"><div class="status-tile live"><b>${live.length}</b><span>Live Now</span><small>in progress</small></div><div class="status-tile follow"><b>${todays.length}</b><span>Pending</span><small>${esc(selectedDate)}</small></div><div class="status-tile won"><b>${state.meetings.filter((m) => m.meetingStatus === "done").length}</b><span>Completed</span><small>selected date</small></div><div class="status-tile interested"><b>${monthCount}</b><span>This Month</span><small>scheduled</small></div></div><div class="card section-card"><div class="section-head"><h3>${live.length ? "Active Meeting" : todays.length ? "Meeting Queue" : "Scheduled Meetings"}</h3><span class="count-pill">${queue.length}</span></div><div class="list">${queue.map((l) => leadCard(l, "meeting")).join("") || `<div class="empty">No meetings scheduled for this date</div>`}</div></div>`);
}

function leadsView() {
  const add = isLrm() ? `<button class="btn primary" id="addLead">Add Lead</button>` : "";
  const statusTiles = [
    ["new", "New", state.leads.filter((l) => l.leadStatus === "New Lead").length, "fresh leads"],
    ["interested", "Interested", state.leads.filter((l) => l.leadStatus === "Interested").length, "active chances"],
    ["follow", "Follow-up", state.leads.filter((l) => l.leadStatus === "Follow Up" || l.followUpDate).length, "needs action"],
    ["won", "Won", state.leads.filter((l) => l.leadStatus === "Won").length, "closed orders"],
  ];
  return layout("Lead Management", isLrm() ? "Your added or assigned leads. Add, edit, assign and schedule." : "Assigned leads only. SC cannot add leads.", `<div class="status-strip">${statusTiles.map(([cls, label, value, hint]) => `<div class="status-tile ${cls}"><b>${value}</b><span>${label}</span><small>${hint}</small></div>`).join("")}</div><div class="card section-card"><div class="section-head"><h3>Lead Pipeline</h3><div class="toolbar">${add}<button class="btn" id="refresh">Refresh</button></div></div><div class="list">${state.leads.map((l) => leadCard(l)).join("") || `<div class="empty">No leads found</div>`}</div></div>`);
}

function followupsView() {
  const seen = new Set();
  const followUpLeads = state.followUps.map((f) => {
    const fromLead = state.leads.find((l) => leadKey(l._id) === leadKey(f.leadId));
    return { ...(fromLead || {}), _id: fromLead?._id || f.leadId, customerName: fromLead?.customerName || f.leadName, phone: fromLead?.phone || f.phone, leadStatus: fromLead?.leadStatus || f.status || "Follow Up", followUpDate: f.followUpDate || fromLead?.followUpDate, followUpTime: f.followUpTime || fromLead?.followUpTime, note: f.note || fromLead?.note };
  });
  const leads = [...followUpLeads, ...state.leads.filter((l) => l.leadStatus === "Follow Up" || l.followUpDate)].filter((l) => {
    const key = leadKey(l._id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const dueToday = leads.filter((l) => l.followUpDate === today()).length;
  const overdue = leads.filter((l) => l.followUpDate && l.followUpDate < today()).length;
  return layout("Follow-ups", "Reschedule, close or continue follow-ups assigned to you.", `<div class="status-strip"><div class="status-tile follow"><b>${dueToday}</b><span>Due Today</span><small>call back</small></div><div class="status-tile overdue"><b>${overdue}</b><span>Overdue</span><small>priority</small></div><div class="status-tile live"><b>${leads.length}</b><span>Total</span><small>assigned</small></div></div><div class="card section-card"><div class="section-head"><h3>Follow-up Queue</h3><span class="count-pill">${leads.length}</span></div><div class="list">${leads.map((l) => leadCard(l, "follow")).join("") || `<div class="empty">No follow-ups</div>`}</div></div>`);
}

function reportView() {
  const rows = state.reports.map((r) => `<div class="card"><div class="lead-top"><b>${esc(r.reportDate)}</b><span class="pill pblue">${r.ordersClosed || 0} closed</span></div><div class="lead-meta"><div class="meta"><label>Calls</label><span>${r.totalCalls || 0}</span></div><div class="meta"><label>Connected</label><span>${r.connectedCalls || 0}</span></div><div class="meta"><label>Scheduled</label><span>${r.meetingsScheduled || 0}</span></div><div class="meta"><label>Done</label><span>${r.meetingsDone || 0}</span></div></div></div>`).join("");
  return layout("LRM Day End", "Submit total calls, connected calls, meetings and closures.", `<div class="card section-card"><div class="section-head"><h3>Daily Report</h3><button class="btn primary" id="dailyReport">Enter Report</button></div><div class="list">${rows || `<div class="empty">No reports</div>`}</div></div>`);
}

function profileView() {
  const name = `${state.user?.firstName || ""} ${state.user?.lastName || ""}`.trim() || "Team";
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0]).join("").toUpperCase() || "ZG";
  const account = `<div class="profile-card" style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap"><div class="profile-title"><span class="profile-avatar">${esc(initials)}</span><div><h3 style="margin:0;color:#4c118f">${esc(name)}</h3><div class="muted">${esc(state.user?.email || state.user?.phoneNumber || "")}</div></div></div><button class="btn profile-logout" id="logoutProfile">Logout</button></div>`;
  if (isSc()) {
    const todayMeetings = state.leads.filter((l) => l.meetingDate === today()).length;
    const liveMeetings = state.leads.filter(isLiveMeeting).length;
    const followUps = state.followUps.length || state.leads.filter((l) => l.followUpDate || l.leadStatus === "Follow Up").length;
    return layout("Profile", `${esc(state.user?.firstName)} ${esc(state.user?.lastName)} / ${esc(state.user?.userType)}`, `${account}<div class="card section-card"><div class="section-head"><h3>SC Summary</h3><span class="count-pill">${state.summary.won || 0}</span></div><div class="list"><div class="grid two"><div class="meta"><label>Assigned Leads</label><span>${state.leads.length}</span></div><div class="meta"><label>Meetings Today</label><span>${todayMeetings}</span></div><div class="meta"><label>Live Meetings</label><span>${liveMeetings}</span></div><div class="meta"><label>Follow-ups</label><span>${followUps}</span></div></div></div></div>`);
  }
  const connected = state.reports.reduce((s, r) => s + Number(r.connectedCalls || 0), 0);
  const conversion = state.summary.totalLeads ? Math.round(((state.summary.won || 0) / state.summary.totalLeads) * 100) : 0;
  return layout("Profile", `${esc(state.user?.firstName)} ${esc(state.user?.lastName)} / ${esc(state.user?.userType)}`, `${account}<div class="card section-card"><div class="section-head"><h3>Workspace Summary</h3><span class="count-pill">${conversion}%</span></div><div class="list"><div class="grid two"><div class="meta"><label>Connected Calls</label><span>${connected}</span></div><div class="meta"><label>Conversion</label><span>${conversion}%</span></div><div class="meta"><label>Recent Leads</label><span>${state.leads.slice(0, 5).length}</span></div><div class="meta"><label>Available SCs</label><span>${state.scs.length}</span></div></div><div class="toolbar" style="justify-content:flex-end;margin-top:12px"><button class="btn primary" id="dailyReport">Day-End Report</button></div></div></div>`);
}

function leadForm(l = {}) {
  const assigneeFields = `<div class="field"><label>Assigned By (LRM)</label><input value="${esc(`${state.user?.firstName || ""} ${state.user?.lastName || ""}`.trim())}" disabled></div><div class="field"><label>Assigned To (SC optional)</label><select name="assignedToUserId"><option value="">No SC yet</option>${state.scs.map((u) => `<option value="${u._id}" ${String(l.assignedToUserId || "") === String(u._id) ? "selected" : ""}>${esc(u.firstName)} ${esc(u.lastName)}</option>`).join("")}</select></div>`;
  return `<div class="grid two"><div class="field"><label>Name</label><input name="customerName" required value="${esc(l.customerName)}"></div><div class="field"><label>Phone</label><input name="phone" required value="${esc(l.phone)}"></div><div class="field"><label>WhatsApp Number</label><input name="whatsappNumber" value="${esc(l.whatsappNumber)}"></div><div class="field"><label>Email</label><input type="email" name="email" value="${esc(l.email)}"></div><div class="field"><label>Address</label><input name="address" value="${esc(l.address)}"></div><div class="field"><label>Area</label><input name="area" value="${esc(l.area)}"></div><div class="field"><label>Locality</label><input name="locality" value="${esc(l.locality)}"></div>${assigneeFields}<div class="field"><label>Monthly Bill</label><input type="number" name="monthlyBill" value="${l.monthlyBill || ""}"></div><div class="field"><label>Source</label><select name="source"><option>Website</option><option>Social Media</option><option>Field Visit</option><option>Import</option></select></div><div class="field"><label>Status</label><select name="leadStatus">${statuses.map((s) => `<option ${l.leadStatus === s ? "selected" : ""}>${s}</option>`).join("")}</select></div><div class="field"><label>Meeting Date</label><input type="date" name="meetingDate" value="${esc(l.meetingDate)}"></div><div class="field"><label>Meeting Time</label><input type="time" name="meetingTime" value="${esc(l.meetingTime)}"></div><div class="field" style="grid-column:1/-1"><label>Notes</label><textarea name="note">${esc(l.note)}</textarea></div></div>`;
}

function openAssign(id) {
  modal("Assign SC", `<div class="field"><label>Solar Consultant</label><select name="assignedToUserId" required>${state.scs.map((u) => `<option value="${u._id}">${esc(u.firstName)} ${esc(u.lastName)}</option>`).join("")}</select></div><div class="grid two" style="margin-top:10px"><div class="field"><label>Meeting Date</label><input type="date" name="meetingDate"></div><div class="field"><label>Meeting Time</label><input type="time" name="meetingTime"></div></div>`, (data) => api(`/leads/${id}/assign`, { method: "PATCH", body: JSON.stringify(data) }));
}

function openNewQuote(id) {
  const l = state.leads.find((x) => x._id === id);
  const options = (type) => active(type).map((x) => `<option value="${x._id}" data-price="${x.systemPrice || 0}">${esc(x.name)}</option>`).join("");
  const tax = quoteTaxDefaults();
  modal("Quotation Generate", `<div class="quote-paper"><div class="quote-head"><div><b>Zen Grid Solar LLP</b><br>${esc(l?.customerName)} / ${esc(l?.phone)}</div><div>Quote</div></div><div class="grid two"><div class="field"><label>System Size</label><select name="systemSizeConfigId" id="systemPick" required>${options("system-size")}</select></div><div class="field"><label>Base Price</label><input type="number" name="price" id="qPrice"></div><div class="field"><label>Solar Panel</label><select name="panelConfigId">${options("solar-panel")}</select></div><div class="field"><label>Inverter</label><select name="inverterConfigId">${options("inverter")}</select></div><div class="field"><label>Floor</label><select name="floor">${floors.map((x) => `<option>${x}</option>`)}</select></div><div class="field"><label>Structure</label><select name="structureConfigId">${options("structure-type")}</select></div><div class="field"><label>Wiring</label><select name="wiringConfigId">${options("wiring")}</select></div><div class="field"><label>Cleaning</label><select name="cleaning"><option>Yes</option><option>No</option></select></div><div class="field"><label>Overhead Price</label><input type="number" name="overheadPrice" value="0"></div><div class="field"><label>Extra Discount</label><input type="number" name="extraDiscount" value="0"></div><div class="field"><label>GST %</label><input type="number" name="gstPercent" value="${tax.gstPercent || 0}"></div><div class="field"><label>Central Subsidy</label><input type="number" name="subsidy1" value="${tax.centralSubsidy || 0}"></div><div class="field"><label>UPNEDA Subsidy</label><input type="number" name="subsidy2" value="${tax.upnedaSubsidy || 0}"></div><div class="field"><label>Send</label><select><option>Email/WhatsApp buttons ready for integration</option></select></div></div></div>`, async (data) => { const res = await api(`/activities/quotes/${id}`, { method: "POST", body: JSON.stringify(data) }); viewQuotePdf(res.quote); });
  const pick = document.querySelector("#systemPick"), price = document.querySelector("#qPrice");
  const setPrice = () => { price.value = pick.selectedOptions[0]?.dataset.price || 0; };
  pick.onchange = setPrice; setPrice();
}

function openNewPayment(id) {
  modal("Payment Receipt", `<div class="grid two"><div class="field"><label>Total Amount</label><input type="number" name="totalAmount" required></div><div class="field"><label>Paid Amount</label><input type="number" name="paidAmount" required></div><div class="field"><label>Payment Mode</label><select name="paymentMode"><option>Cash</option><option>UPI</option><option>Bank Transfer</option><option>Cheque</option></select></div><div class="field"><label>Date</label><input type="date" name="paymentDate" value="${today()}"></div><div class="field" style="grid-column:1/-1"><label>Notes</label><textarea name="notes"></textarea></div></div>`, async (data) => { const res = await api(`/activities/payments/${id}`, { method: "POST", body: JSON.stringify(data) }); viewReceiptPdf(res.payment); });
}

function leadDocs(id, type) {
  const lead = state.leads.find((l) => l._id === id);
  const rows = (type === "quote"
    ? state.quotes.filter((q) => leadKey(q.leadId) === id)
    : state.payments.filter((p) => leadKey(p.leadId) === id))
    .sort((a, b) => new Date(b.createdAt || b.paymentDate || 0) - new Date(a.createdAt || a.paymentDate || 0));
  const title = type === "quote" ? "Quotations" : "Receipts";
  const addLabel = type === "quote" ? "Add New Quote" : "Add New Receipt";
  const addClass = type === "quote" ? "primary" : "green";
  const totalValue = rows.reduce((sum, row) => sum + Number(type === "quote" ? row.netEffectivePrice : row.paidAmount || 0), 0);
  const latestValue = Number(type === "quote" ? rows[0]?.netEffectivePrice : rows[0]?.paidAmount || 0);
  const summary = `<div class="doc-summary"><div class="meta"><label>Total ${title}</label><span>${rows.length}</span></div><div class="meta"><label>Latest</label><span>${rows.length ? rupee(latestValue) : "-"}</span></div><div class="meta"><label>${type === "quote" ? "Quote Value" : "Received"}</label><span>${rupee(totalValue)}</span></div></div>`;
  const withContact = (row) => ({ ...row, email: row.email || lead?.email || "", whatsappNumber: row.whatsappNumber || lead?.whatsappNumber || "", phone: row.phone || lead?.phone || "" });
  const cards = rows.map((rawRow, index) => {
    const row = withContact(rawRow);
    return type === "quote"
    ? `<div class="doc-row ${index === 0 ? "latest" : ""}"><div class="doc-row-top"><div class="doc-title"><div class="doc-icon">Q</div><div><b>${esc(row.quoteNo)}</b><div class="muted">${index === 0 ? "Latest quotation" : "Previous quotation"}</div></div></div><span class="pill porange">${fmtDocDate(row.createdAt)}</span></div><div class="doc-amount">${rupee(row.netEffectivePrice)}</div><div class="doc-line"><div class="meta"><label>System Size</label><span>${esc(row.systemSize || "-")}</span></div><div class="meta"><label>Panel</label><span>${esc(row.panel || "-")}</span></div><div class="meta"><label>Inverter</label><span>${esc(row.inverter || "-")}</span></div><div class="meta"><label>GST</label><span>${rupee(row.gstAmount)}</span></div></div>${docContactActions("quote", row)}</div>`
    : `<div class="doc-row ${index === 0 ? "latest" : ""}"><div class="doc-row-top"><div class="doc-title"><div class="doc-icon">R</div><div><b>${esc(row.paymentNo)}</b><div class="muted">${index === 0 ? "Latest receipt" : "Previous receipt"}</div></div></div><span class="pill pgreen">${fmtDocDate(row.paymentDate || row.createdAt)}</span></div><div class="doc-amount">${rupee(row.paidAmount)}</div><div class="doc-line"><div class="meta"><label>Total Amount</label><span>${rupee(row.totalAmount)}</span></div><div class="meta"><label>Mode</label><span>${esc(row.paymentMode || "-")}</span></div><div class="meta"><label>Balance Due</label><span>${rupee(row.remainingAmount)}</span></div><div class="meta"><label>Status</label><span>${Number(row.remainingAmount || 0) === 0 ? "Paid in full" : "Partial"}</span></div></div>${docContactActions("payment", row)}</div>`
  }).join("");
  const host = infoModal(`${title} - ${lead?.customerName || "Lead"}`, `<div class="section-head" style="margin:-2px 0 12px;padding:0 0 12px;background:#fff"><div><h3 style="margin:0">${title}</h3><div class="muted">${esc(lead?.customerName || "")} / ${esc(lead?.phone || "")}</div></div><button class="btn ${addClass}" data-add-doc>${addLabel}</button></div>${summary}<div class="doc-list">${cards || `<div class="empty">No previous ${title.toLowerCase()} for this lead</div>`}</div>`);
  host.querySelector("[data-add-doc]").onclick = () => {
    host.remove();
    if (type === "quote") openNewQuote(id);
    if (type === "payment") openNewPayment(id);
  };
  bindDocumentButtons();
  bindSendButtons();
}

function openQuote(id) {
  leadDocs(id, "quote");
}

function openPayment(id) {
  leadDocs(id, "payment");
}

function openOutcome(id) {
  modal("End Meeting", `<div class="field"><label>Final Status</label><div class="choice-grid">${outcomes.map((x, i) => `<label><input type="radio" name="outcome" value="${esc(x)}" ${i === 0 ? "checked" : ""}><span>${esc(x)}</span></label>`).join("")}</div></div><div class="grid two" style="margin-top:12px"><div class="field"><label>Next Follow-up Date</label><input type="date" name="followUpDate"></div><div class="field"><label>Next Follow-up Time</label><input type="time" name="followUpTime"></div></div><div class="field" style="margin-top:12px"><label>Meeting Remarks</label><textarea name="remarks"></textarea></div>`, (data) => api(`/activities/meetings/${id}/done`, { method: "PATCH", body: JSON.stringify(data) }));
}

function openFollow(id) {
  modal("Schedule Follow-up", `<div class="grid two"><div class="field"><label>Date</label><input type="date" name="followUpDate" required></div><div class="field"><label>Time</label><input type="time" name="followUpTime"></div><div class="field" style="grid-column:1/-1"><label>Note</label><textarea name="note"></textarea></div></div>`, (data) => api(`/followups/${id}`, { method: "POST", body: JSON.stringify({ ...data, status: "Follow Up" }) }));
}

function openReport() {
  modal("Day-End Report", `<div class="grid two"><div class="field"><label>Date</label><input type="date" name="reportDate" value="${today()}"></div><div class="field"><label>Total Calls</label><input type="number" name="totalCalls"></div><div class="field"><label>Connected Calls</label><input type="number" name="connectedCalls"></div><div class="field"><label>Meetings Scheduled</label><input type="number" name="meetingsScheduled"></div><div class="field"><label>Meetings Done</label><input type="number" name="meetingsDone"></div><div class="field"><label>Orders Closed</label><input type="number" name="ordersClosed"></div><div class="field" style="grid-column:1/-1"><label>Note</label><textarea name="note"></textarea></div></div>`, (data) => api("/activities/daily-reports", { method: "POST", body: JSON.stringify(data) }));
}

function fmtDocDate(value = new Date()) {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${["January","February","March","April","May","June","July","August","September","October","November","December"][d.getMonth()]} ${d.getFullYear()}`;
}

function zengridLogoMarkup(size = 34) {
  return `<div style="width:${size}px;height:${size}px;background:#F5A623;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900">Z</div>`;
}

function openDocument(html, width = 980, height = 1100) {
  const host = document.createElement("div");
  host.className = "modalback doc-preview-back";
  host.innerHTML = `<div class="modal doc-preview-modal"><div class="modalhead"><h2>Document Preview</h2><button type="button" class="icon-close" data-close aria-label="Close">x</button></div><iframe class="doc-preview-frame" title="Document Preview"></iframe></div>`;
  document.body.append(host);
  host.querySelectorAll("[data-close]").forEach((b) => b.onclick = () => host.remove());
  const frame = host.querySelector("iframe");
  frame.srcdoc = html;
}

function viewQuotePdf(q) {
  const price = Number(q.price || 0);
  const discounts = Number(q.discount1 || 0) + Number(q.discount2 || 0) + Number(q.extraDiscount || 0);
  const netPrice = Number(q.netPrice || price - discounts);
  const panelWatt = Number(String(q.panel || "").match(/\d{3}/)?.[0] || 540);
  const panels = Math.max(1, Math.round((Number(String(q.systemSize || "").replace(/[^\d.]/g, "")) || 3) * 1000 / panelWatt));
  const qNum = q.quoteNo || "ZGS-Q";
  const dateStr = fmtDocDate(q.createdAt);
  openDocument(`<!doctype html><html><head><meta charset="UTF-8"><title>Quote - ${esc(q.leadName)}</title><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:"Plus Jakarta Sans",sans-serif;background:#fff;color:#0A0F1A;font-size:14px}.page{width:210mm;min-height:297mm;margin:0 auto;background:#fff;position:relative;overflow:hidden}.no-print{position:fixed;top:16px;right:16px;z-index:999;display:flex;gap:8px}.no-print button{padding:.6rem 1.2rem;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px}.btn-print{background:#F5A623;color:#fff}.btn-close{background:#eee;color:#333}.cover{height:297mm;page-break-after:always;background:linear-gradient(135deg,#2D1B69 0%,#6B21A8 58%,#F5A623 58%,#F5A623 100%);color:#fff;padding:42mm 26mm}.cover h1{font-size:52px;line-height:1.05;margin-top:70mm;font-weight:800}.cover h1 span{color:#F5A623}.cover p{font-size:18px;color:rgba(255,255,255,.75);margin-top:14px}.cover-meta{position:absolute;left:26mm;right:26mm;bottom:28mm;display:flex;justify-content:space-between;color:rgba(255,255,255,.78);font-weight:700}.doc-page{padding:2.5rem;min-height:297mm;page-break-after:always}.page-header{display:flex;align-items:center;justify-content:space-between;padding-bottom:1.25rem;border-bottom:2px solid #F5A623;margin-bottom:2rem}.logo-sm{display:flex;align-items:center;gap:.6rem}.logo-sm-txt{font-weight:800;font-size:1rem;color:#0A0F1A}.logo-sm-txt span{color:#F5A623}.qnum{font-size:11px;color:#6B7A90;font-weight:600;text-align:right}h2.section-title{font-size:1.5rem;font-weight:800;color:#0A0F1A;margin-bottom:1rem}h2.section-title span{color:#F5A623}.customer-band{background:linear-gradient(90deg,#2D1B69,#6B21A8);border-radius:12px;padding:1.25rem 1.5rem;margin-bottom:1.5rem;color:#fff}.cust-name{font-size:1.3rem;font-weight:800;margin-bottom:.2rem}.cust-meta{font-size:13px;color:rgba(255,255,255,0.65)}.specs-grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1.5rem}.spec-card{background:#F4F6F9;border-radius:10px;padding:.85rem 1rem;display:flex;gap:.75rem;align-items:center}.spec-icon{width:36px;height:36px;background:#FFF8EC;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:.85rem;font-weight:800}.spec-label{font-size:10.5px;color:#6B7A90;font-weight:700;text-transform:uppercase;letter-spacing:.5px}.spec-val{font-size:13.5px;font-weight:800;color:#0A0F1A}.price-table,.comp-table{width:100%;border-collapse:collapse;border-radius:12px;overflow:hidden;border:1.5px solid #EEF1F6}.price-table th,.comp-table th{background:#F4F6F9;padding:.65rem 1rem;text-align:left;font-size:11px;font-weight:800;color:#6B7A90;text-transform:uppercase;letter-spacing:.6px}.price-table th:last-child,.price-table td:last-child{text-align:right}.price-table td,.comp-table td{padding:.75rem 1rem;font-size:13.5px;color:#1E2A3B;border-top:1px solid #EEF1F6}.disc{color:#E53935}.net-row td{background:#FFF8EC;font-weight:800}.final-row td{background:#F5A623;color:#fff;font-weight:900;font-size:1rem}.comp-table th{background:#4A0E80;color:#fff}.comp-sub{font-size:11.5px;color:#6B7A90}.terms{margin-top:1rem;background:#F4F6F9;border-radius:10px;padding:1rem 1.25rem;color:#6B7A90;font-size:12px;line-height:1.7}.contact-band{background:linear-gradient(135deg,#2D1B69,#6B21A8);border-radius:16px;padding:2rem;color:#fff;margin:1rem 0 1.5rem;text-align:center}.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;text-align:left;margin-top:1rem}.contact-item{background:rgba(255,255,255,0.1);border-radius:10px;padding:.85rem 1rem}.contact-item-label{font-size:10.5px;color:rgba(255,255,255,0.55);font-weight:700;text-transform:uppercase;letter-spacing:.5px}.contact-item-val{font-size:13.5px;font-weight:800}.bank-card{background:#F4F6F9;border-radius:12px;padding:1.25rem 1.5rem;border:1.5px solid #EEF1F6}.bank-grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}.bank-item label{font-size:11px;color:#9AAABB;display:block}.bank-item span{font-size:13.5px;font-weight:800;color:#0A0F1A}.footer-bar{background:#0A1628;border-radius:10px;padding:1rem 1.5rem;display:flex;justify-content:space-between;color:rgba(255,255,255,.55);font-size:12px;margin-top:1.5rem}.footer-bar span{color:#F5A623;font-weight:700}@media print{.no-print{display:none!important}.page{margin:0}@page{margin:0;size:A4}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}</style></head><body><div class="no-print"><button class="btn-close" onclick="window.close()">Close</button><button class="btn-print" onclick="window.print()">Print / Save PDF</button></div><div class="page cover"><div class="logo-sm">${zengridLogoMarkup(50)}<div class="logo-sm-txt" style="color:#fff;font-size:22px">Zen Grid <span>Solar</span></div></div><h1>Solar Rooftop<br><span>Proposal</span></h1><p>Personalized quotation for ${esc(q.leadName)}</p><div class="cover-meta"><div>${esc(q.phone)}</div><div>${qNum}</div></div></div><div class="page doc-page"><div class="page-header"><div class="logo-sm">${zengridLogoMarkup()}<div class="logo-sm-txt">Zen Grid <span>Solar</span></div></div><div class="qnum"><div>${qNum}</div><div>${dateStr}</div></div></div><h2 class="section-title">Commercial <span>Offer</span></h2><div class="customer-band"><div class="cust-name">${esc(q.leadName)}</div><div class="cust-meta">${esc(q.phone)} | ${esc(q.address || q.area || "Lucknow")} | Monthly Bill: ${rupee(q.monthlyBill)}</div></div><div class="specs-grid"><div class="spec-card"><div class="spec-icon">kW</div><div><div class="spec-label">System Size</div><div class="spec-val">${esc(q.systemSize)}</div></div></div><div class="spec-card"><div class="spec-icon">PV</div><div><div class="spec-label">Solar Panel</div><div class="spec-val">${esc(q.panel)}</div></div></div><div class="spec-card"><div class="spec-icon">INV</div><div><div class="spec-label">Inverter</div><div class="spec-val">${esc(q.inverter)}</div></div></div><div class="spec-card"><div class="spec-icon">ST</div><div><div class="spec-label">Structure / Floor</div><div class="spec-val">${esc(q.structure)} / ${esc(q.floor)}</div></div></div></div><table class="price-table"><thead><tr><th>Description</th><th>Amount</th></tr></thead><tbody><tr><td>Solar Rooftop System Price</td><td>${rupee(price)}</td></tr><tr><td class="disc">Discount</td><td class="disc">-${rupee(discounts)}</td></tr><tr><td>GST @ ${q.gstPercent || 0}%</td><td>${rupee(q.gstAmount)}</td></tr><tr class="net-row"><td>Net Price</td><td>${rupee(netPrice)}</td></tr><tr><td class="disc">Central Govt Subsidy</td><td class="disc">-${rupee(q.subsidy1)}</td></tr><tr><td class="disc">UPNEDA Subsidy</td><td class="disc">-${rupee(q.subsidy2)}</td></tr><tr class="final-row"><td>Net Effective Price</td><td>${rupee(q.netEffectivePrice)}</td></tr></tbody></table></div><div class="page doc-page"><div class="page-header"><div class="logo-sm">${zengridLogoMarkup()}<div class="logo-sm-txt">Zen Grid <span>Solar</span></div></div><div class="qnum"><div>${qNum}</div><div>${dateStr}</div></div></div><h2 class="section-title">System <span>Components</span></h2><table class="comp-table"><thead><tr><th>Component</th><th>Specification</th><th>Qty</th></tr></thead><tbody><tr><td><b>Solar Panels</b><div class="comp-sub">High efficiency photovoltaic modules</div></td><td>${esc(q.panel)}</td><td>${panels}</td></tr><tr><td><b>Inverter</b><div class="comp-sub">Grid tied inverter</div></td><td>${esc(q.inverter)}</td><td>1</td></tr><tr><td><b>Mounting Structure</b><div class="comp-sub">Rooftop installation structure</div></td><td>${esc(q.structure)}</td><td>As required</td></tr><tr><td><b>Wiring</b><div class="comp-sub">DC/AC wiring and accessories</div></td><td>${esc(q.wiring || "Standard")}</td><td>Complete</td></tr><tr><td><b>Cleaning</b><div class="comp-sub">Panel cleaning option</div></td><td>${esc(q.cleaning)}</td><td>-</td></tr></tbody></table><div class="terms">Subsidy is subject to government approval and documentation. Final price may change after site survey if additional work is required. Payment terms are applicable as agreed before installation. ${esc(q.note || "")}</div></div><div class="page doc-page"><div class="page-header"><div class="logo-sm">${zengridLogoMarkup()}<div class="logo-sm-txt">Zen Grid <span>Solar</span></div></div><div class="qnum"><div>${qNum}</div><div>${dateStr}</div></div></div><h2 class="section-title" style="text-align:center"><span>Contact</span> Us</h2><div class="contact-band"><h2>ZENGRID SOLAR LLP</h2><div class="contact-grid"><div class="contact-item"><div class="contact-item-label">Phone</div><div class="contact-item-val">+91 91700 09300</div></div><div class="contact-item"><div class="contact-item-label">Website</div><div class="contact-item-val">www.zengridsolar.com</div></div><div class="contact-item"><div class="contact-item-label">Email</div><div class="contact-item-val">info@zengridsolar.com</div></div><div class="contact-item"><div class="contact-item-label">Address</div><div class="contact-item-val">Lucknow, Uttar Pradesh</div></div></div></div><div class="bank-card"><div class="bank-grid"><div class="bank-item"><label>Account Name</label><span>ZENGRID SOLAR LLP</span></div><div class="bank-item"><label>Bank Name</label><span>ICICI Bank</span></div><div class="bank-item"><label>Account Number</label><span>696105500279</span></div><div class="bank-item"><label>IFSC Code</label><span>ICIC0006961</span></div><div class="bank-item"><label>Branch</label><span>Lucknow</span></div><div class="bank-item"><label>GSTIN</label><span>09AAEFZ4969R1ZW</span></div></div></div><div class="footer-bar"><div>2026 Zengrid Solar LLP - All Rights Reserved</div><div>Quote: <span>${qNum}</span></div></div></div></body></html>`);
}

function viewReceiptPdf(p) {
  const isPaid = Number(p.remainingAmount || 0) === 0;
  openDocument(`<!doctype html><html><head><meta charset="UTF-8"><title>Receipt - ${esc(p.leadName)}</title><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:"Plus Jakarta Sans",sans-serif;background:#f0f4f8;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:2rem}.receipt{background:#fff;border-radius:16px;width:380px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12)}.receipt-head{background:linear-gradient(135deg,#2D1B69,#6B21A8);padding:1.5rem;text-align:center;color:#fff}.receipt-logo{margin:0 auto .75rem;display:flex;justify-content:center}.receipt-title{font-size:.85rem;opacity:.7;letter-spacing:1px;text-transform:uppercase;margin-bottom:.25rem}.receipt-id{font-size:.75rem;opacity:.5}.receipt-status{margin:.75rem auto 0;display:inline-block;padding:.35rem 1.25rem;border-radius:20px;font-size:.8rem;font-weight:800;letter-spacing:.5px}.status-partial{background:#FFF3CD;color:#856404}.status-full{background:#D1FAE5;color:#065F46}.receipt-cust{padding:1.25rem 1.5rem;border-bottom:1px dashed #E5E7EB}.cust-name{font-size:1rem;font-weight:800;color:#1F2937;margin-bottom:.2rem}.cust-meta{font-size:.8rem;color:#6B7280}.receipt-amounts{padding:1.25rem 1.5rem}.amt-row{display:flex;justify-content:space-between;align-items:center;padding:.5rem 0;border-bottom:1px solid #F3F4F6;font-size:.875rem}.amt-label{color:#6B7280}.amt-val{font-weight:700;color:#1F2937}.amt-row.received .amt-val{color:#059669;font-size:1rem}.amt-row.remaining .amt-val{color:#DC2626;font-size:1rem}.receipt-meta{padding:1rem 1.5rem;background:#F9FAFB;font-size:.78rem;color:#6B7280;display:grid;grid-template-columns:1fr 1fr;gap:.4rem}.meta-item label{display:block;font-size:.7rem;text-transform:uppercase;letter-spacing:.5px;color:#9CA3AF;margin-bottom:.1rem}.meta-item span{font-weight:700;color:#374151}.receipt-foot{padding:1rem 1.5rem;text-align:center;border-top:1px dashed #E5E7EB}.receipt-foot p{font-size:.75rem;color:#9CA3AF;margin-bottom:.5rem}.no-print{position:fixed;top:16px;right:16px;display:flex;gap:8px}.no-print button{padding:.5rem 1rem;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px}.btn-p{background:#6B21A8;color:#fff}.btn-c{background:#eee;color:#333}@media print{.no-print{display:none!important}body{background:#fff;padding:0}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}</style></head><body><div class="no-print"><button class="btn-c" onclick="window.close()">Close</button><button class="btn-p" onclick="window.print()">Print</button></div><div class="receipt"><div class="receipt-head"><div class="receipt-logo">${zengridLogoMarkup(50)}</div><div class="receipt-title">Payment Receipt</div><div class="receipt-id">${esc(p.paymentNo)}</div><div class="receipt-status ${isPaid ? "status-full" : "status-partial"}">${isPaid ? "PAID IN FULL" : "PARTIAL PAYMENT"}</div></div><div class="receipt-cust"><div class="cust-name">${esc(p.leadName)}</div><div class="cust-meta">Phone: ${esc(p.phone || "-")} | ${esc(p.address || "Lucknow, Uttar Pradesh")}</div></div><div class="receipt-amounts"><div class="amt-row"><span class="amt-label">Total Quote Amount</span><span class="amt-val">${rupee(p.totalAmount)}</span></div><div class="amt-row received"><span class="amt-label">Amount Received</span><span class="amt-val">${rupee(p.paidAmount)}</span></div><div class="amt-row remaining"><span class="amt-label">Remaining Balance</span><span class="amt-val">${rupee(p.remainingAmount)}</span></div></div><div class="receipt-meta"><div class="meta-item"><label>Payment Mode</label><span>${esc(p.paymentMode || "Cash")}</span></div><div class="meta-item"><label>Date</label><span>${fmtDocDate(p.paymentDate)}</span></div><div class="meta-item"><label>Received By</label><span>${esc(p.receivedBy || "-")}</span></div>${p.notes ? `<div class="meta-item" style="grid-column:1/-1"><label>Notes</label><span>${esc(p.notes)}</span></div>` : ""}</div><div class="receipt-foot"><p>Zengrid Solar LLP - Lucknow, UP<br>zengridsolar.com</p><div style="font-size:11px;color:#9CA3AF;font-style:italic">Digital Receipt - No Signature Required</div></div></div></body></html>`, 500, 700);
}

function bindDocumentButtons() {
  document.querySelectorAll("[data-doc]").forEach((b) => b.onclick = () => {
    const [type, id] = b.dataset.doc.split(":");
    const row = type === "quote" ? state.quotes.find((x) => x._id === id) : state.payments.find((x) => x._id === id);
    if (!row) return toast("Record not found");
    if (type === "quote") viewQuotePdf(row);
    if (type === "payment") viewReceiptPdf(row);
  });
}

function bindSendButtons() {
  document.querySelectorAll("[data-send-wa]").forEach((b) => b.onclick = () => { window.open(`https://wa.me/91${b.dataset.sendWa}?text=${b.dataset.waMsg || ""}`, "_blank"); });
  document.querySelectorAll("[data-email]").forEach((b) => b.onclick = () => { location.href = `mailto:${b.dataset.email}?subject=${b.dataset.subject || ""}&body=${b.dataset.body || ""}`; });
}

function bind() {
  document.querySelector("#refresh")?.addEventListener("click", loadData);
  document.querySelector("#meetingDateFilter")?.addEventListener("change", (e) => { state.meetingDate = e.target.value || today(); loadData(); });
  document.querySelector("#todayMeetings")?.addEventListener("click", () => { state.meetingDate = today(); loadData(); });
  document.querySelector("#addLead")?.addEventListener("click", () => modal("Add Lead", leadForm(), (data) => api("/leads", { method: "POST", body: JSON.stringify(data) })));
  document.querySelectorAll("[data-edit]").forEach((b) => b.onclick = () => { const l = state.leads.find((x) => x._id === b.dataset.edit); modal("Edit Lead", leadForm(l), (data) => api(`/leads/${l._id}`, { method: "PATCH", body: JSON.stringify(data) })); });
  document.querySelectorAll("[data-assign]").forEach((b) => b.onclick = () => openAssign(b.dataset.assign));
  document.querySelectorAll("[data-quote]").forEach((b) => b.onclick = () => openQuote(b.dataset.quote));
  document.querySelectorAll("[data-pay]").forEach((b) => b.onclick = () => openPayment(b.dataset.pay));
  document.querySelectorAll("[data-done]").forEach((b) => b.onclick = () => openOutcome(b.dataset.done));
  document.querySelectorAll("[data-reschedule]").forEach((b) => b.onclick = () => openFollow(b.dataset.reschedule));
  document.querySelectorAll("[data-follow]").forEach((b) => b.onclick = () => openFollow(b.dataset.follow));
  document.querySelectorAll("[data-start]").forEach((b) => b.onclick = async () => {
    const lead = state.leads.find((l) => l._id === b.dataset.start);
    if (lead) {
      lead.meetingStatus = "started";
      render();
    }
    try {
      await api(`/leads/${b.dataset.start}/status`, { method: "PATCH", body: JSON.stringify({ meetingStatus: "started" }) });
      await loadData();
    } catch (e) {
      toast(e.message);
      await loadData();
    }
  });
  document.querySelectorAll("[data-call]").forEach((b) => b.onclick = () => { location.href = `tel:${b.dataset.call}`; });
  document.querySelectorAll("[data-wa]").forEach((b) => b.onclick = () => { window.open(`https://wa.me/91${String(b.dataset.wa).replace(/\D/g, "").slice(-10)}`, "_blank"); });
  bindSendButtons();
  document.querySelectorAll("[data-nav]").forEach((b) => b.onclick = () => { window.open(`https://www.google.com/maps/search/${encodeURIComponent(b.dataset.nav || "")}`, "_blank"); });
  document.querySelector("#dailyReport")?.addEventListener("click", openReport);
  document.querySelector("#logoutProfile")?.addEventListener("click", () => { localStorage.clear(); Object.assign(state, { accessToken: "", user: null }); renderLogin(); });
  bindDocumentButtons();
  bindSendButtons();
}

function render() {
  if (!state.accessToken || !state.user) return renderLogin();
  if (!isLrm() && state.view === "report") state.view = "meetings";
  if (state.view === "records") state.view = "leads";
  const views = { meetings: meetingsView, leads: leadsView, followups: followupsView, report: reportView, profile: profileView };
  (views[state.view] || meetingsView)();
  bind();
}

if (state.accessToken) loadData(); else renderLogin();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
