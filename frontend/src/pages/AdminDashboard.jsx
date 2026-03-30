import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminApi } from "../services/api";

// ── Global Styles ─────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=Sora:wght@600;700;800;900&display=swap" rel="stylesheet" />
    <style>{`
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
      @keyframes shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
      @keyframes slideRight { from{transform:translateX(110%);opacity:0} to{transform:translateX(0);opacity:1} }
      @keyframes floatA   { 0%,100%{transform:translateY(0) translateX(0)} 33%{transform:translateY(-12px) translateX(5px)} 66%{transform:translateY(-5px) translateX(-3px)} }
      @keyframes floatB   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
      @keyframes cloudDrift { from{transform:translateX(-10px)} to{transform:translateX(10px)} }

      .au1 { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .04s both; }
      .au2 { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .12s both; }
      .au3 { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .20s both; }
      .au4 { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .28s both; }
      .au5 { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .36s both; }
      .au6 { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) .44s both; }

      .shimmer-text {
        background: linear-gradient(90deg,#2563eb,#7c3aed,#2563eb);
        background-size: 200% auto;
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: shimmer 4s linear infinite;
      }

      .cloud-a { animation: cloudDrift 9s ease-in-out infinite alternate; }
      .cloud-b { animation: cloudDrift 13s ease-in-out infinite alternate-reverse; }
      .cloud-c { animation: cloudDrift 17s ease-in-out infinite alternate; }
      .float-orb-a { animation: floatA 9s ease-in-out infinite; }
      .float-orb-b { animation: floatB 7s ease-in-out infinite; }

      .stat-card {
        background: rgba(255,255,255,0.82);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border-radius: 20px;
        border: 1.5px solid rgba(255,255,255,0.92);
        box-shadow: 0 4px 24px rgba(37,99,235,.07), 0 1px 4px rgba(0,0,0,.04);
        transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s;
        padding: 22px;
        cursor: default;
      }
      .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 48px rgba(37,99,235,.14), 0 4px 12px rgba(0,0,0,.06);
      }

      .glass-card {
        background: rgba(255,255,255,0.8);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1.5px solid rgba(255,255,255,0.92);
        border-radius: 20px;
        box-shadow: 0 4px 24px rgba(37,99,235,.06);
      }

      .tab-btn {
        display: flex; align-items: center; gap: 7px;
        padding: 9px 16px; border-radius: 12px;
        border: none; background: transparent;
        font-family: 'DM Sans', sans-serif;
        font-size: 13.5px; font-weight: 600;
        cursor: pointer;
        transition: all .2s cubic-bezier(.22,1,.36,1);
        white-space: nowrap;
      }
      .tab-btn:hover { background: rgba(255,255,255,0.65); }
      .tab-btn.active {
        background: #fff;
        color: #2563eb !important;
        box-shadow: 0 2px 12px rgba(37,99,235,.16), 0 1px 3px rgba(0,0,0,.06);
      }

      .action-btn { transition: all .2s cubic-bezier(.22,1,.36,1); cursor: pointer; outline: none; }
      .action-btn:hover { transform: translateY(-1px); }
      .action-btn:active { transform: scale(0.97); }

      .row-hover { transition: background .15s; }
      .row-hover:hover { background: rgba(37,99,235,.03) !important; }

      .doc-card {
        background: rgba(255,255,255,0.85);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-radius: 18px;
        border: 1.5px solid rgba(255,255,255,0.95);
        box-shadow: 0 2px 16px rgba(37,99,235,.05);
        transition: transform .2s, box-shadow .2s;
      }
      .doc-card:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(37,99,235,.1); }

      .filter-pill {
        padding: 7px 16px; border-radius: 100px;
        border: 1.5px solid; font-weight: 600; font-size: 13px;
        cursor: pointer; transition: all .18s;
        font-family: 'DM Sans', sans-serif;
      }
      .filter-pill:hover { transform: translateY(-1px); }

      .modal-backdrop { animation: fadeIn .18s ease both; }
      .modal-card     { animation: fadeUp .28s cubic-bezier(.22,1,.36,1) both; }
      .toast-slide    { animation: slideRight .35s cubic-bezier(.22,1,.36,1) both; }

      ::-webkit-scrollbar { width: 5px; height: 5px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(148,163,184,.4); border-radius: 5px; }

      @media (max-width: 860px) {
        .top-nav-tabs   { display: none !important; }
        .mobile-tab-bar { display: flex !important; }
        .stats-grid     { grid-template-columns: repeat(2,1fr) !important; }
        .preview-2col   { grid-template-columns: 1fr !important; }
        .users-col-email, .users-col-role { display: none !important; }
        .users-grid     { grid-template-columns: 1fr auto auto !important; }
      }
      @media (max-width: 500px) {
        .stats-grid   { grid-template-columns: 1fr 1fr !important; }
        .page-pad     { padding: 18px 16px 48px !important; }
        .banner-pad   { padding: 20px 16px 0 !important; }
      }
    `}</style>
  </>
);

// ── Cloud SVG (identical to landing page) ────────────────────────────────
const Cloud = ({ style }) => (
  <svg viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <path d="M170 60H45C28 60 15 47 15 30C15 15 26 4 40 4C42 4 44 4 46 5C50 -1 58 -2 65 2C70 -4 80 -5 88 1C93 -3 101 -3 107 2C114 -2 124 0 128 8C140 6 152 14 154 26C162 26 170 34 170 43V60Z" fill="white" fillOpacity="0.55"/>
  </svg>
);

// ── Icons ─────────────────────────────────────────────────────────────────
const Ico = ({ size = 16, children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>{children}</svg>
);
const CheckIcon   = () => <Ico><polyline points="20 6 9 17 4 12"/></Ico>;
const XIcon       = () => <Ico><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Ico>;
const LogoutIcon  = () => <Ico size={15}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Ico>;
const UserIcon    = () => <Ico size={15}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Ico>;
const DoctorIcon  = () => <Ico size={15}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></Ico>;
const TrashIcon   = () => <Ico size={14}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></Ico>;
const ShieldIcon  = () => <Ico size={15}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Ico>;
const BlockIcon   = () => <Ico size={14}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></Ico>;
const UnblockIcon = () => <Ico size={14}><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></Ico>;
const GridIcon    = () => <Ico size={17}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></Ico>;
const ClipIcon    = () => <Ico size={17}><path d="M9 12h6M9 16h6M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></Ico>;
const LinkIcon    = () => <Ico size={17}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></Ico>;
const PeopleIcon  = () => <Ico size={17}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Ico>;
const ChartIcon   = () => <Ico size={17}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></Ico>;

// ── Design tokens ─────────────────────────────────────────────────────────
const C = {
  blue:"#2563eb",  blueDk:"#1d4ed8", blueLt:"#eff6ff", blueBdr:"#bfdbfe",
  amber:"#f59e0b", amberDk:"#d97706",amberLt:"#fffbeb",amberBdr:"#fde68a",
  green:"#059669", greenLt:"#f0fdf4",greenBdr:"#bbf7d0",
  purple:"#7c3aed",purpleLt:"#f5f3ff",purpleBdr:"#ddd6fe",
  red:"#ef4444",   redLt:"#fef2f2",  redBdr:"#fecaca",
  slate:"#0f172a", slateM:"#334155", slateL:"#64748b", slateXL:"#94a3b8",
};

const TABS = [
  { key:"dashboard",   label:"Dashboard",             icon:<GridIcon />  },
  { key:"doctors",     label:"Doctor Registrations",  icon:<ClipIcon />  },
  { key:"secretaries", label:"Secretary Assignments", icon:<LinkIcon />  },
  { key:"users",       label:"Manage Users",           icon:<PeopleIcon />},
  { key:"analytics",   label:"Analytics",             icon:<ChartIcon /> },
];

// ── Status Badge ──────────────────────────────────────────────────────────
const BS = {
  PENDING:  ["#fef9c3","#854d0e","#fde047"],
  APPROVED: [C.greenLt,  C.green,   C.greenBdr],
  REJECTED: [C.redLt,   "#991b1b",  C.redBdr],
  ACTIVE:   [C.greenLt,  C.green,   C.greenBdr],
  BLOCKED:  [C.redLt,   "#991b1b",  C.redBdr],
  INACTIVE: ["#f1f5f9",  C.slateL, "#cbd5e1"],
  ADMIN:    ["#fff7ed",  "#c2410c", "#fdba74"],
  DOCTOR:   [C.greenLt,  C.green,   C.greenBdr],
  SECRETARY:[C.purpleLt, C.purple,  C.purpleBdr],
  PATIENT:  [C.blueLt,   C.blue,    C.blueBdr],
};
const StatusBadge = ({ status }) => {
  const [bg, color, border] = BS[status] || BS.INACTIVE;
  return <span style={{ background:bg, color, border:`1px solid ${border}`, borderRadius:100, padding:"3px 11px", fontSize:11.5, fontWeight:700, letterSpacing:".02em", whiteSpace:"nowrap" }}>{status}</span>;
};

// ── Avatar ────────────────────────────────────────────────────────────────
const Avatar = ({ gradient, size=36, img, children }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", flexShrink:0, background:gradient, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,.12)" }}>
    {img ? <img src={img} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/> : children}
  </div>
);

// ── Toast ─────────────────────────────────────────────────────────────────
const Toast = ({ toast }) => {
  if (!toast) return null;
  const e = toast.type === "error";
  return (
    <div className="toast-slide" style={{ position:"fixed", top:80, right:24, zIndex:9999, background:e?C.redLt:C.greenLt, border:`1.5px solid ${e?C.redBdr:C.greenBdr}`, color:e?"#991b1b":"#166534", padding:"13px 20px", borderRadius:16, fontWeight:700, fontSize:13.5, boxShadow:"0 12px 40px rgba(0,0,0,.12)", display:"flex", alignItems:"center", gap:9, maxWidth:360 }}>
      <span style={{ fontSize:17 }}>{e?"⚠️":"✅"}</span>{toast.msg}
    </div>
  );
};

// ── Confirm Modal ─────────────────────────────────────────────────────────
const ConfirmModal = ({ icon, iconBg, title, body, note, noteBg, noteBdr, confirmLabel, confirmGrad, onConfirm, onCancel }) => (
  <div className="modal-backdrop" style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(15,23,42,.45)", display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(6px)" }}>
    <div className="modal-card" style={{ background:"#fff", borderRadius:24, padding:36, maxWidth:440, width:"90%", boxShadow:"0 32px 80px rgba(0,0,0,.22)" }}>
      <div style={{ width:60, height:60, borderRadius:"50%", background:iconBg, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>{icon}</div>
      <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:19, fontWeight:800, color:C.slate, textAlign:"center", marginBottom:10 }}>{title}</h3>
      <p style={{ fontSize:14, color:"#475569", textAlign:"center", lineHeight:1.65, marginBottom:12 }}>{body}</p>
      <p style={{ fontSize:13, color:C.slateL, textAlign:"center", lineHeight:1.6, marginBottom:28, background:noteBg, border:`1px solid ${noteBdr}`, borderRadius:12, padding:"11px 16px" }}>{note}</p>
      <div style={{ display:"flex", gap:10 }}>
        <button className="action-btn" onClick={onCancel} style={{ flex:1, padding:"12px", borderRadius:12, border:"1.5px solid #e2e8f0", background:"#fff", color:C.slateM, fontSize:14, fontWeight:700 }}>Cancel</button>
        <button className="action-btn" onClick={onConfirm} style={{ flex:1, padding:"12px", borderRadius:12, border:"none", background:confirmGrad, color:"#fff", fontSize:14, fontWeight:700 }}>{confirmLabel}</button>
      </div>
    </div>
  </div>
);
const BlockModal  = ({user,onConfirm,onCancel}) => <ConfirmModal icon={<svg viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" width="30" height="30"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>} iconBg="linear-gradient(135deg,#fef2f2,#fee2e2)" title="Block Account" body={<>Block <strong style={{color:C.slate}}>{user.firstName} {user.lastName}</strong>?</>} note={<><strong>Immediate access denied.</strong> User sees a formal suspension notice on next login.</>} noteBg={C.amberLt} noteBdr={C.amberBdr} confirmLabel="Yes, Block Account" confirmGrad={`linear-gradient(135deg,${C.red},#dc2626)`} onConfirm={onConfirm} onCancel={onCancel}/>;
const DeleteModal = ({user,onConfirm,onCancel}) => <ConfirmModal icon={<svg viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" width="30" height="30"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>} iconBg="linear-gradient(135deg,#fef2f2,#fee2e2)" title="Remove User" body={<>Permanently remove <strong style={{color:C.slate}}>{user.firstName} {user.lastName}</strong>?</>} note={<><strong>This cannot be undone.</strong> All account data will be permanently deleted.</>} noteBg="#fee2e2" noteBdr={C.redBdr} confirmLabel="Yes, Remove User" confirmGrad={`linear-gradient(135deg,${C.red},#dc2626)`} onConfirm={onConfirm} onCancel={onCancel}/>;

// ── Navbar ────────────────────────────────────────────────────────────────
const Navbar = ({ activeTab, onTabChange, onLogout, pendingCount }) => (
  <>
    <nav style={{ position:"sticky", top:0, zIndex:100, height:64, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", background:"rgba(255,255,255,0.72)", backdropFilter:"blur(22px)", WebkitBackdropFilter:"blur(22px)", borderBottom:"1px solid rgba(255,255,255,0.78)", boxShadow:"0 1px 0 rgba(37,99,235,.06), 0 4px 24px rgba(37,99,235,.05)" }}>

      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
        <div style={{ width:36, height:36, borderRadius:11, background:`linear-gradient(135deg,${C.blue},${C.blueDk})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:17, boxShadow:`0 4px 14px rgba(37,99,235,.32)` }}>M</div>
        <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:17, color:C.slate, letterSpacing:"-.3px" }}>Medi<span style={{color:C.blue}}>Core</span></span>
        <span style={{ background:`linear-gradient(135deg,${C.amberLt},#fff7ed)`, border:`1px solid ${C.amberBdr}`, color:C.amberDk, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:100, marginLeft:4, letterSpacing:".04em" }}>ADMIN</span>
      </div>

      {/* Tab pills — desktop */}
      <div className="top-nav-tabs" style={{ display:"flex", gap:4, alignItems:"center" }}>
        {TABS.map(t => (
          <button key={t.key} className={`tab-btn ${activeTab===t.key?"active":""}`} onClick={()=>onTabChange(t.key)} style={{ color:activeTab===t.key?C.blue:C.slateL }}>
            {t.icon} {t.label}
            {t.key==="doctors" && pendingCount>0 && (
              <span style={{ background:`linear-gradient(135deg,${C.amber},${C.amberDk})`, color:"#fff", fontSize:10, fontWeight:800, padding:"2px 7px", borderRadius:100, marginLeft:2 }}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Admin identity + logout */}
      <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:34, height:34, borderRadius:"50%", background:`linear-gradient(135deg,${C.amber},${C.amberDk})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", boxShadow:`0 3px 10px rgba(245,158,11,.3)` }}>
            <ShieldIcon />
          </div>
          <div style={{ lineHeight:1.2 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.slate }}>Administrator</div>
            <div style={{ fontSize:11, color:C.slateXL }}>Full access</div>
          </div>
        </div>
        <button className="action-btn" onClick={onLogout} style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 14px", borderRadius:10, border:"1.5px solid rgba(226,232,240,0.75)", background:"rgba(255,255,255,0.75)", color:C.slateM, fontSize:13, fontWeight:700, cursor:"pointer" }}>
          <LogoutIcon /> Sign out
        </button>
      </div>
    </nav>

    {/* Mobile tab bar */}
    <div className="mobile-tab-bar" style={{ display:"none", gap:4, padding:"8px 12px", background:"rgba(255,255,255,0.72)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.7)", overflowX:"auto" }}>
      {TABS.map(t => (
        <button key={t.key} className={`tab-btn ${activeTab===t.key?"active":""}`} onClick={()=>onTabChange(t.key)} style={{ color:activeTab===t.key?C.blue:C.slateL, fontSize:12, padding:"8px 12px", flexShrink:0 }}>
          {t.icon}{t.label}
        </button>
      ))}
    </div>
  </>
);

// ── Page Banner ───────────────────────────────────────────────────────────
const META = {
  dashboard:   { title:"Dashboard",             sub:"System overview at a glance",         emoji:"🏥" },
  doctors:     { title:"Doctor Registrations",  sub:"Review and approve pending requests", emoji:"🩺" },
  secretaries: { title:"Secretary Assignments", sub:"All secretary–doctor links",          emoji:"🔗" },
  users:       { title:"Manage Users",           sub:"Block, unblock, or remove accounts", emoji:"👥" },
  analytics:   { title:"Analytics & Reports",   sub:"Appointment trends and status breakdown", emoji:"📊" },
};
const PageBanner = ({ tab }) => {
  const m = META[tab];
  return (
    <div className="au1 banner-pad" style={{ padding:"28px 32px 0" }}>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ width:50, height:50, borderRadius:16, background:`linear-gradient(135deg,${C.blue},${C.blueDk})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:23, boxShadow:`0 6px 22px rgba(37,99,235,.26)`, flexShrink:0 }}>{m.emoji}</div>
        <div>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:900, color:C.slate, letterSpacing:"-.4px", lineHeight:1.1 }}>{m.title}</h1>
          <p style={{ fontSize:13.5, color:C.slateL, marginTop:3, fontWeight:500 }}>{m.sub}</p>
        </div>
      </div>
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({ label, value, gradient, border, icon, tag, delay="0s" }) => (
  <div className="stat-card au2" style={{ animationDelay:delay }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
      <div style={{ width:46, height:46, borderRadius:14, background:gradient, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 16px rgba(0,0,0,.12)" }}>{icon}</div>
      {tag && <span style={{ background:"rgba(255,255,255,0.7)", color:C.slateM, fontSize:10.5, fontWeight:700, padding:"3px 10px", borderRadius:100, border:`1px solid ${border}`, letterSpacing:".04em" }}>{tag}</span>}
    </div>
    <div style={{ fontFamily:"'Sora',sans-serif", fontSize:34, fontWeight:900, color:C.slate, lineHeight:1, marginBottom:6 }}>{value}</div>
    <div style={{ fontSize:13, color:C.slateL, fontWeight:500 }}>{label}</div>
  </div>
);

// ── Preview helpers ───────────────────────────────────────────────────────
const PreviewCard = ({ title, onViewAll, children, empty, emptyText }) => (
  <div className="glass-card">
    <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(226,232,240,0.55)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:14.5, color:C.slate }}>{title}</span>
      <button className="action-btn" onClick={onViewAll} style={{ fontSize:12, color:C.amberDk, background:C.amberLt, border:`1px solid ${C.amberBdr}`, fontWeight:700, cursor:"pointer", padding:"4px 13px", borderRadius:100 }}>View all →</button>
    </div>
    {empty ? <div style={{ padding:"28px 20px", textAlign:"center", color:C.slateXL, fontSize:13 }}>{emptyText}</div> : children}
  </div>
);
const PreviewRow = ({ grad, icon, title, sub, badge }) => (
  <div className="row-hover" style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 20px", borderBottom:"1px solid rgba(241,245,249,0.75)" }}>
    <Avatar gradient={grad} size={34}>{icon}</Avatar>
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ fontWeight:700, fontSize:13.5, color:C.slate, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{title}</div>
      <div style={{ fontSize:11.5, color:C.slateXL, marginTop:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{sub}</div>
    </div>
    {badge}
  </div>
);
const EmptyState = ({ text }) => (
  <div className="glass-card" style={{ padding:56, textAlign:"center", color:C.slateXL, fontSize:14 }}>
    <div style={{ fontSize:36, marginBottom:12 }}>📭</div>{text}
  </div>
);

// ── Dashboard Tab ─────────────────────────────────────────────────────────
const DashboardTab = ({ users, doctors, assignments, onGoTo }) => {
  const si = d => <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={22} height={22}><path d={d}/></svg>;
  return (
    <div className="page-pad" style={{ padding:"24px 32px 56px", maxWidth:1120, margin:"0 auto" }}>
      <div className="stats-grid au3" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:26 }}>
        <StatCard label="Total Users"      value={users.length}                            gradient={`linear-gradient(135deg,${C.blue},${C.blueDk})`}   border={C.blueBdr}   icon={<svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" width={22} height={22}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} delay=".04s"/>
        <StatCard label="Total Doctors"    value={doctors.length}                          gradient={`linear-gradient(135deg,${C.green},#047857)`}        border={C.greenBdr}  icon={si("M22 12h-4l-3 9L9 3l-3 9H2")} tag="All" delay=".1s"/>
        <StatCard label="Pending Review"   value={doctors.filter(d=>d.status==="PENDING").length} gradient={`linear-gradient(135deg,${C.amber},${C.amberDk})`} border={C.amberBdr}  icon={si("M9 12h6M9 16h6M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z")} tag="Review" delay=".16s"/>
        <StatCard label="Approved Doctors" value={doctors.filter(d=>d.status==="APPROVED").length} gradient={`linear-gradient(135deg,${C.purple},#7e22ce)`}  border={C.purpleBdr} icon={<svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" width={22} height={22}><polyline points="20 6 9 17 4 12"/></svg>} delay=".22s"/>
      </div>

      <div className="preview-2col au4" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
        <PreviewCard title="Pending Registrations" onViewAll={()=>onGoTo("doctors")} empty={doctors.filter(d=>d.status==="PENDING").length===0} emptyText="No pending registrations">
          {doctors.filter(d=>d.status==="PENDING").slice(0,3).map(doc=>(
            <PreviewRow key={doc.doctorId} grad={`linear-gradient(135deg,${C.green},#047857)`} icon={<DoctorIcon/>} title={`Dr. ${doc.firstName} ${doc.lastName}`} sub={doc.specialization} badge={<StatusBadge status="PENDING"/>}/>
          ))}
        </PreviewCard>
        <PreviewCard title="Secretary Assignments" onViewAll={()=>onGoTo("secretaries")} empty={assignments.length===0} emptyText="No assignments yet">
          {assignments.slice(0,3).map(a=>(
            <PreviewRow key={a.secretaryId} grad={`linear-gradient(135deg,${C.purple},#7e22ce)`} icon={<UserIcon/>} title={a.secretaryName} sub={a.doctorName} badge={<span style={{background:C.greenLt,color:C.green,border:`1px solid ${C.greenBdr}`,borderRadius:100,padding:"3px 10px",fontSize:11,fontWeight:700}}>● Assigned</span>}/>
          ))}
        </PreviewCard>
      </div>

      <div className="au5">
        <PreviewCard title="Recent Users" onViewAll={()=>onGoTo("users")} empty={users.length===0} emptyText="No users yet">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))" }}>
            {users.slice(0,6).map(u=>(
              <PreviewRow key={u.userId} grad={`linear-gradient(135deg,${C.blue},${C.blueDk})`} icon={<UserIcon/>} title={`${u.firstName} ${u.lastName}`} sub={u.email} badge={<StatusBadge status={(u.role||"PATIENT").toUpperCase()}/>}/>
            ))}
          </div>
        </PreviewCard>
      </div>
    </div>
  );
};

// ── Doctor Registrations Tab ──────────────────────────────────────────────
const DoctorRegistrationsTab = ({ doctors, onApprove, onReject, loading }) => {
  const [filter, setFilter] = useState("ALL");
  const filtered = filter==="ALL" ? doctors : doctors.filter(d=>d.status===filter);
  return (
    <div className="page-pad" style={{ padding:"24px 32px 56px", maxWidth:1120, margin:"0 auto" }}>
      <div className="au2" style={{ display:"flex", gap:8, marginBottom:22, flexWrap:"wrap", alignItems:"center" }}>
        {["ALL","PENDING","APPROVED","REJECTED"].map(f=>(
          <button key={f} className="filter-pill action-btn" onClick={()=>setFilter(f)} style={{ borderColor:filter===f?C.blue:"rgba(226,232,240,0.8)", background:filter===f?C.blueLt:"rgba(255,255,255,0.72)", color:filter===f?C.blue:C.slateL }}>{f}</button>
        ))}
        <span style={{ marginLeft:"auto", fontSize:13, color:C.slateL, fontWeight:500 }}>{filtered.length} result{filtered.length!==1?"s":""}</span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {filtered.length===0 ? <EmptyState text="No doctor registrations found"/> : filtered.map((doc,i)=>(
          <div key={doc.doctorId} className="doc-card au3" style={{ padding:"18px 22px", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap", animationDelay:`${i*.05}s` }}>
            <Avatar gradient={`linear-gradient(135deg,${C.green},#047857)`} size={50} img={doc.profilePicture}><DoctorIcon/></Avatar>
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:15.5, color:C.slate }}>Dr. {doc.firstName} {doc.lastName}</div>
              <div style={{ fontSize:13, color:C.slateL, marginTop:3 }}>{doc.specialization} · License: <span style={{color:C.slateM,fontWeight:600}}>{doc.licenseNumber}</span></div>
              <div style={{ fontSize:12, color:C.slateXL, marginTop:2 }}>{doc.email} · {doc.phoneNumber}</div>
            </div>
            <StatusBadge status={doc.status}/>
            {doc.status==="PENDING" && (
              <div style={{ display:"flex", gap:8 }}>
                <button className="action-btn" onClick={()=>onApprove(doc.doctorId)} disabled={loading} style={{ padding:"9px 18px", borderRadius:10, border:"none", background:`linear-gradient(135deg,${C.green},#047857)`, color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6, opacity:loading?.5:1, boxShadow:`0 4px 14px rgba(5,150,105,.28)` }}><CheckIcon/> Approve</button>
                <button className="action-btn" onClick={()=>onReject(doc.doctorId)}  disabled={loading} style={{ padding:"9px 18px", borderRadius:10, border:`1.5px solid ${C.redBdr}`, background:"rgba(255,255,255,0.85)", color:C.red, fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6, opacity:loading?.5:1 }}><XIcon/> Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Secretary Assignments Tab ─────────────────────────────────────────────
const SecretaryAssignmentsTab = ({ assignments }) => (
  <div className="page-pad" style={{ padding:"24px 32px 56px", maxWidth:1120, margin:"0 auto" }}>
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {assignments.length===0 ? <EmptyState text="No secretary assignments yet"/> : assignments.map((a,i)=>(
        <div key={a.secretaryId} className="doc-card au3" style={{ padding:"20px 24px", animationDelay:`${i*.05}s` }}>
          <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:13, flex:"1 1 180px" }}>
              <Avatar gradient={`linear-gradient(135deg,${C.purple},#7e22ce)`} size={46}><UserIcon/></Avatar>
              <div>
                <div style={{ fontSize:10.5, color:C.slateXL, fontWeight:700, letterSpacing:"1px", textTransform:"uppercase", marginBottom:3 }}>Secretary</div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:14.5, color:C.slate }}>{a.secretaryName}</div>
                <div style={{ fontSize:12, color:C.slateL }}>{a.secretaryEmail}</div>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"0 16px" }}>
              <div style={{ width:34, height:34, borderRadius:"50%", background:`linear-gradient(135deg,${C.amber},${C.amberDk})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 14px rgba(245,158,11,.25)` }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" width={16} height={16}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </div>
              <span style={{ fontSize:9.5, color:C.slateXL, fontWeight:700, letterSpacing:"1px", textTransform:"uppercase" }}>assigned</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:13, flex:"1 1 180px" }}>
              <Avatar gradient={`linear-gradient(135deg,${C.green},#047857)`} size={46}><DoctorIcon/></Avatar>
              <div>
                <div style={{ fontSize:10.5, color:C.slateXL, fontWeight:700, letterSpacing:"1px", textTransform:"uppercase", marginBottom:3 }}>Doctor</div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:14.5, color:C.slate }}>{a.doctorName}</div>
                <div style={{ fontSize:12, color:C.slateL }}>{a.specialization}</div>
                <div style={{ fontSize:11.5, color:C.slateXL }}>{a.doctorEmail}</div>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, marginLeft:"auto" }}>
              <span style={{ background:C.greenLt, color:C.green, border:`1px solid ${C.greenBdr}`, borderRadius:100, padding:"4px 14px", fontSize:12, fontWeight:700 }}>● Active</span>
              {a.assignedSince && <span style={{ fontSize:11.5, color:C.slateXL }}>Since {new Date(a.assignedSince).toLocaleDateString("en-PH",{year:"numeric",month:"short",day:"numeric"})}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Manage Users Tab ──────────────────────────────────────────────────────
const ManageUsersTab = ({ users, onDelete, onBlock, onUnblock, loading }) => {
  const [filter,setFilter]           = useState("ALL");
  const [blockTarget,setBlockTarget] = useState(null);
  const [delTarget,setDelTarget]     = useState(null);
  const filtered = filter==="ALL" ? users : users.filter(u=>(u.role||"").toUpperCase()===filter);
  return (
    <div className="page-pad" style={{ padding:"24px 32px 56px", maxWidth:1200, margin:"0 auto" }}>
      {blockTarget && <BlockModal  user={blockTarget} onConfirm={()=>{onBlock(blockTarget.userId);   setBlockTarget(null);}} onCancel={()=>setBlockTarget(null)}/>}
      {delTarget   && <DeleteModal user={delTarget}   onConfirm={()=>{onDelete(delTarget.userId);    setDelTarget(null);}}  onCancel={()=>setDelTarget(null)}/>}

      <div className="au2" style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
        {["ALL","ADMIN","DOCTOR","SECRETARY","PATIENT"].map(r=>(
          <button key={r} className="filter-pill action-btn" onClick={()=>setFilter(r)} style={{ borderColor:filter===r?C.blue:"rgba(226,232,240,0.8)", background:filter===r?C.blueLt:"rgba(255,255,255,0.72)", color:filter===r?C.blue:C.slateL }}>{r}</button>
        ))}
        <span style={{ marginLeft:"auto", fontSize:13, color:C.slateL, fontWeight:500 }}>{filtered.length} user{filtered.length!==1?"s":""}</span>
      </div>

      <div className="glass-card au3" style={{ overflow:"hidden" }}>
        <div className="users-grid" style={{ display:"grid", gridTemplateColumns:"2fr 2fr 1.2fr 1.1fr auto auto", padding:"11px 22px", background:"rgba(248,250,252,0.75)", borderBottom:"1px solid rgba(226,232,240,0.55)", gap:12 }}>
          {[["Name",""],["Email","users-col-email"],["Role","users-col-role"],["Status",""],["Access",""],["Remove",""]].map(([h,cls])=>(
            <div key={h} className={cls} style={{ fontSize:10.5, fontWeight:700, color:C.slateXL, textTransform:"uppercase", letterSpacing:".08em" }}>{h}</div>
          ))}
        </div>
        {filtered.length===0
          ? <div style={{ padding:40, textAlign:"center", color:C.slateXL, fontSize:14 }}>No users found</div>
          : filtered.map(user=>{
            const blocked=(user.status||"ACTIVE").toUpperCase()==="BLOCKED";
            return (
              <div key={user.userId} className="row-hover users-grid" style={{ display:"grid", gridTemplateColumns:"2fr 2fr 1.2fr 1.1fr auto auto", padding:"13px 22px", borderBottom:"1px solid rgba(241,245,249,0.65)", alignItems:"center", gap:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                  <Avatar gradient={blocked?`linear-gradient(135deg,${C.red},#dc2626)`:`linear-gradient(135deg,${C.blue},${C.blueDk})`} size={34}><UserIcon/></Avatar>
                  <div style={{ fontWeight:700, fontSize:13.5, color:C.slate, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.firstName} {user.lastName}</div>
                </div>
                <div className="users-col-email" style={{ fontSize:13, color:"#475569", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.email}</div>
                <div className="users-col-role"><StatusBadge status={(user.role||"PATIENT").toUpperCase()}/></div>
                <StatusBadge status={(user.status||"ACTIVE").toUpperCase()}/>
                {blocked
                  ? <button className="action-btn" onClick={()=>onUnblock(user.userId)} disabled={loading} style={{ padding:"7px 13px", borderRadius:9, border:`1.5px solid ${C.greenBdr}`, background:C.greenLt, color:C.green, cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontSize:12, fontWeight:700, opacity:loading?.5:1, whiteSpace:"nowrap" }}><UnblockIcon/> Unblock</button>
                  : <button className="action-btn" onClick={()=>setBlockTarget(user)} disabled={loading} style={{ padding:"7px 13px", borderRadius:9, border:"1.5px solid #fed7aa", background:"#fff7ed", color:"#ea580c", cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontSize:12, fontWeight:700, opacity:loading?.5:1, whiteSpace:"nowrap" }}><BlockIcon/> Block</button>
                }
                <button className="action-btn" onClick={()=>setDelTarget(user)} disabled={loading} style={{ padding:"7px 13px", borderRadius:9, border:`1.5px solid ${C.redBdr}`, background:C.redLt, color:C.red, cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontSize:12, fontWeight:700, opacity:loading?.5:1, whiteSpace:"nowrap" }}><TrashIcon/> Remove</button>
              </div>
            );
          })
        }
      </div>
    </div>
  );
};

// ── Analytics Tab ─────────────────────────────────────────────────────────
// Placeholder data — swap with real API calls when backend is ready
const APPT_PLACEHOLDER = {
  todayTotal: 24,
  todayDone:  14,   // completed so far today
  weekly: [8, 15, 22, 18, 24, 11, 6],   // Mon–Sun appointment counts
  weekLabels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
  statuses: [
    { key:"PENDING",   label:"Pending",   count:38, color:"#f59e0b", light:"#fffbeb", border:"#fde68a" },
    { key:"APPROVED",  label:"Approved",  count:121, color:"#059669", light:"#f0fdf4", border:"#bbf7d0" },
    { key:"REJECTED",  label:"Rejected",  count:14,  color:"#ef4444", light:"#fef2f2", border:"#fecaca" },
    { key:"COMPLETED", label:"Completed", count:284, color:"#2563eb", light:"#eff6ff", border:"#bfdbfe" },
  ],
  monthly: [42,58,71,65,88,74,91,103,96,87,112,108],
  monthLabels:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
};

// SVG Donut Chart (pure, no library)
const DonutChart = ({ data }) => {
  const total = data.reduce((s,d)=>s+d.count,0);
  const cx=110, cy=110, R=82, r=50;
  const circumference = 2 * Math.PI * R;
  let offset = 0;

  // Build segments
  const segments = data.map(d => {
    const pct   = d.count / total;
    const dash  = pct * circumference;
    const gap   = circumference - dash;
    const seg   = { ...d, dash, gap, offset, pct };
    offset += dash;
    return seg;
  });

  // rotation so first segment starts at top (−90°)
  const startRot = -90;

  return (
    <div style={{ display:"flex", alignItems:"center", gap:28, flexWrap:"wrap" }}>
      {/* Chart */}
      <div style={{ position:"relative", flexShrink:0 }}>
        <svg width={220} height={220} viewBox="0 0 220 220">
          {/* Track */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(226,232,240,0.6)" strokeWidth={32}/>
          {/* Segments */}
          {segments.map((s,i) => {
            const rotDeg = startRot + (s.offset / circumference) * 360;
            return (
              <circle key={i} cx={cx} cy={cy} r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={32}
                strokeDasharray={`${s.dash} ${s.gap}`}
                strokeDashoffset={0}
                transform={`rotate(${rotDeg} ${cx} ${cy})`}
                style={{ filter:`drop-shadow(0 2px 4px ${s.color}40)` }}
              />
            );
          })}
          {/* Centre hole overlay */}
          <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.85)"/>
          {/* Centre label */}
          <text x={cx} y={cy-8} textAnchor="middle" style={{ fontFamily:"'Sora',sans-serif", fontSize:26, fontWeight:900, fill:"#0f172a" }}>{total}</text>
          <text x={cx} y={cy+14} textAnchor="middle" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, fill:"#94a3b8", letterSpacing:"0.08em" }}>TOTAL</text>
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display:"flex", flexDirection:"column", gap:12, flex:1, minWidth:160 }}>
        {segments.map((s,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:12, height:12, borderRadius:3, background:s.color, flexShrink:0, boxShadow:`0 2px 6px ${s.color}50` }}/>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <span style={{ fontSize:13, fontWeight:600, color:"#334155" }}>{s.label}</span>
                <span style={{ fontSize:13, fontWeight:800, color:"#0f172a" }}>{s.count}</span>
              </div>
              <div style={{ height:5, borderRadius:99, background:"rgba(226,232,240,0.6)", overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${(s.pct*100).toFixed(1)}%`, borderRadius:99, background:s.color, transition:"width 1s cubic-bezier(.22,1,.36,1)" }}/>
              </div>
            </div>
            <span style={{ fontSize:11.5, color:"#94a3b8", fontWeight:600, minWidth:34, textAlign:"right" }}>{(s.pct*100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Bar Chart (weekly)
const BarChart = ({ values, labels, color, peak }) => {
  const max = Math.max(...values);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:100, paddingTop:8 }}>
      {values.map((v,i) => {
        const h = max > 0 ? (v/max)*88 : 4;
        const isToday = i === new Date().getDay() === 0 ? 6 : new Date().getDay()-1;
        const highlight = i === (new Date().getDay() === 0 ? 6 : new Date().getDay()-1);
        return (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
            <span style={{ fontSize:10, fontWeight:700, color: highlight ? color : "#94a3b8", marginBottom:2 }}>{v}</span>
            <div style={{ width:"100%", borderRadius:"6px 6px 0 0", height:h, background: highlight ? color : `${color}55`, transition:"height 1s cubic-bezier(.22,1,.36,1)", boxShadow: highlight ? `0 4px 12px ${color}40` : "none" }}/>
            <span style={{ fontSize:10, fontWeight: highlight ? 700 : 500, color: highlight ? color : "#94a3b8" }}>{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
};

// Monthly sparkline
const Sparkline = ({ values, color }) => {
  const max = Math.max(...values), min = Math.min(...values);
  const W=260, H=52, pad=4;
  const pts = values.map((v,i)=>{
    const x = pad + (i/(values.length-1))*(W-pad*2);
    const y = H-pad - ((v-min)/(max-min||1))*(H-pad*2);
    return `${x},${y}`;
  }).join(" ");
  const areaClose = `${W-pad},${H} ${pad},${H}`;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible" }}>
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      <polygon points={`${pts} ${areaClose}`} fill="url(#spark-grad)"/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* End dot */}
      {(() => { const last=pts.split(" ").pop().split(","); return <circle cx={last[0]} cy={last[1]} r="4" fill={color} stroke="#fff" strokeWidth="2"/>; })()}
    </svg>
  );
};

const AnalyticsTab = () => {
  const d = APPT_PLACEHOLDER;
  const todayPct = Math.round((d.todayDone/d.todayTotal)*100);

  // Mini stat tiles
  const tiles = [
    { label:"Today's Appointments", value:d.todayTotal, sub:`${d.todayDone} completed so far`, grad:`linear-gradient(135deg,${C.blue},${C.blueDk})`, border:C.blueBdr, icon:"📅" },
    { label:"Total This Month",     value:d.monthly.reduce((a,b)=>a+b,0), sub:"Across all statuses", grad:`linear-gradient(135deg,${C.purple},#7e22ce)`, border:C.purpleBdr, icon:"📆" },
    { label:"Completion Rate",      value:`${Math.round((d.statuses.find(s=>s.key==="COMPLETED").count / d.statuses.reduce((a,s)=>a+s.count,0))*100)}%`, sub:"Of all appointments", grad:`linear-gradient(135deg,${C.green},#047857)`, border:C.greenBdr, icon:"✅" },
    { label:"Pending Review",       value:d.statuses.find(s=>s.key==="PENDING").count, sub:"Awaiting action", grad:`linear-gradient(135deg,${C.amber},${C.amberDk})`, border:C.amberBdr, icon:"⏳" },
  ];

  return (
    <div className="page-pad" style={{ padding:"24px 32px 56px", maxWidth:1120, margin:"0 auto" }}>

      {/* ── Top stat tiles ── */}
      <div className="stats-grid au3" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {tiles.map((t,i) => (
          <div key={i} className="stat-card" style={{ animationDelay:`${i*.06}s` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div style={{ width:46, height:46, borderRadius:14, background:t.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, boxShadow:"0 4px 16px rgba(0,0,0,.12)" }}>{t.icon}</div>
              <span style={{ background:"rgba(255,255,255,0.7)", color:C.slateM, fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:100, border:`1px solid ${t.border}`, letterSpacing:".04em" }}>LIVE</span>
            </div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:32, fontWeight:900, color:C.slate, lineHeight:1, marginBottom:4 }}>{t.value}</div>
            <div style={{ fontSize:13, color:C.slateL, fontWeight:600, marginBottom:2 }}>{t.label}</div>
            <div style={{ fontSize:11.5, color:C.slateXL }}>{t.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Today's progress + donut row ── */}
      <div className="preview-2col au4" style={{ display:"grid", gridTemplateColumns:"1fr 1.5fr", gap:18, marginBottom:18 }}>

        {/* Today's appointments detail */}
        <div className="glass-card" style={{ padding:"22px 24px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:C.slate, marginBottom:3 }}>Today's Appointments</div>
              <div style={{ fontSize:12.5, color:C.slateL }}>
                {new Date().toLocaleDateString("en-PH",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:28, fontWeight:900, color:C.blue, lineHeight:1 }}>{d.todayTotal}</div>
              <div style={{ fontSize:11, color:C.slateXL, fontWeight:600 }}>scheduled</div>
            </div>
          </div>

          {/* Progress ring */}
          <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:22 }}>
            <div style={{ position:"relative", flexShrink:0 }}>
              <svg width={80} height={80} viewBox="0 0 80 80">
                <circle cx={40} cy={40} r={32} fill="none" stroke="rgba(226,232,240,0.6)" strokeWidth={10}/>
                <circle cx={40} cy={40} r={32} fill="none" stroke={C.blue} strokeWidth={10}
                  strokeDasharray={`${(todayPct/100)*201} 201`}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                  style={{ transition:"stroke-dasharray 1.2s cubic-bezier(.22,1,.36,1)" }}
                />
                <text x={40} y={44} textAnchor="middle" style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:900, fill:C.blue }}>{todayPct}%</text>
              </svg>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, color:C.slateL, marginBottom:8 }}>Progress today</div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:12.5, fontWeight:600, color:C.green }}>✓ {d.todayDone} completed</span>
                <span style={{ fontSize:12.5, fontWeight:600, color:C.amber }}>{d.todayTotal-d.todayDone} remaining</span>
              </div>
            </div>
          </div>

          {/* Per-status mini bars for today (simulated) */}
          {[
            { label:"Completed",  val:d.todayDone,             color:C.green },
            { label:"Pending",    val:Math.round(d.todayTotal*.17), color:C.amber },
            { label:"Approved",   val:Math.round(d.todayTotal*.21), color:C.blue },
            { label:"Rejected",   val:Math.round(d.todayTotal*.04), color:C.red },
          ].map((row,i) => (
            <div key={i} style={{ marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                <span style={{ fontSize:12, color:C.slateL, fontWeight:600 }}>{row.label}</span>
                <span style={{ fontSize:12, color:C.slateM, fontWeight:700 }}>{row.val}</span>
              </div>
              <div style={{ height:6, borderRadius:99, background:"rgba(226,232,240,0.6)", overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${(row.val/d.todayTotal*100).toFixed(0)}%`, borderRadius:99, background:row.color, boxShadow:`0 1px 4px ${row.color}50` }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Appointment Status Overview — donut */}
        <div className="glass-card" style={{ padding:"22px 24px" }}>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:C.slate, marginBottom:3 }}>Appointment Status Overview</div>
            <div style={{ fontSize:12.5, color:C.slateL }}>All-time breakdown across all statuses</div>
          </div>
          <DonutChart data={d.statuses}/>
        </div>
      </div>

      {/* ── Weekly bar chart + monthly trend ── */}
      <div className="preview-2col au5" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>

        {/* Weekly activity */}
        <div className="glass-card" style={{ padding:"22px 24px" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:18 }}>
            <div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:C.slate, marginBottom:3 }}>This Week's Activity</div>
              <div style={{ fontSize:12.5, color:C.slateL }}>Daily appointment count — current week</div>
            </div>
            <span style={{ background:C.blueLt, color:C.blue, border:`1px solid ${C.blueBdr}`, borderRadius:100, padding:"4px 12px", fontSize:11.5, fontWeight:700 }}>Weekly</span>
          </div>
          <BarChart values={d.weekly} labels={d.weekLabels} color={C.blue}/>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:16, paddingTop:14, borderTop:"1px solid rgba(226,232,240,0.55)" }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:900, color:C.slate }}>{Math.round(d.weekly.reduce((a,b)=>a+b,0)/d.weekly.length)}</div>
              <div style={{ fontSize:11, color:C.slateXL, fontWeight:600 }}>Daily avg</div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:900, color:C.slate }}>{Math.max(...d.weekly)}</div>
              <div style={{ fontSize:11, color:C.slateXL, fontWeight:600 }}>Peak day</div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:900, color:C.slate }}>{d.weekly.reduce((a,b)=>a+b,0)}</div>
              <div style={{ fontSize:11, color:C.slateXL, fontWeight:600 }}>This week</div>
            </div>
          </div>
        </div>

        {/* Monthly trend */}
        <div className="glass-card" style={{ padding:"22px 24px" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
            <div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:C.slate, marginBottom:3 }}>Monthly Trend</div>
              <div style={{ fontSize:12.5, color:C.slateL }}>Appointment volume across 12 months</div>
            </div>
            <span style={{ background:C.purpleLt, color:C.purple, border:`1px solid ${C.purpleBdr}`, borderRadius:100, padding:"4px 12px", fontSize:11.5, fontWeight:700 }}>2025</span>
          </div>
          <Sparkline values={d.monthly} color={C.purple}/>
          <div style={{ display:"flex", gap:6, marginTop:8, overflowX:"auto", paddingBottom:2 }}>
            {d.monthLabels.map((m,i)=>(
              <div key={i} style={{ flex:1, textAlign:"center" }}>
                <div style={{ fontSize:10, color:C.slateXL, fontWeight:500, marginBottom:2 }}>{m}</div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:700, color:i===new Date().getMonth()?C.purple:C.slateM }}>{d.monthly[i]}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:16, paddingTop:14, borderTop:"1px solid rgba(226,232,240,0.55)" }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:900, color:C.slate }}>{Math.round(d.monthly.reduce((a,b)=>a+b,0)/12)}</div>
              <div style={{ fontSize:11, color:C.slateXL, fontWeight:600 }}>Monthly avg</div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:900, color:C.slate }}>{Math.max(...d.monthly)}</div>
              <div style={{ fontSize:11, color:C.slateXL, fontWeight:600 }}>Best month</div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:900, color:C.slate }}>{d.monthly.reduce((a,b)=>a+b,0)}</div>
              <div style={{ fontSize:11, color:C.slateXL, fontWeight:600 }}>YTD total</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Status breakdown cards ── */}
      <div className="au5" style={{ marginTop:18 }}>
        <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:C.slate, marginBottom:14 }}>Status Breakdown</div>
        <div className="stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
          {d.statuses.map((s,i) => {
            const total = d.statuses.reduce((a,b)=>a+b.count,0);
            const pct = ((s.count/total)*100).toFixed(1);
            return (
              <div key={i} className="glass-card" style={{ padding:"20px 20px 16px", position:"relative", overflow:"hidden" }}>
                {/* Accent stripe */}
                <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:s.color, borderRadius:"20px 20px 0 0" }}/>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                  <div style={{ width:38, height:38, borderRadius:12, background:s.light, border:`1.5px solid ${s.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ width:12, height:12, borderRadius:3, background:s.color }}/>
                  </div>
                  <span style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:900, color:C.slate }}>{s.count}</span>
                </div>
                <div style={{ fontSize:13.5, fontWeight:700, color:C.slateM, marginBottom:10 }}>{s.label}</div>
                <div style={{ height:6, borderRadius:99, background:"rgba(226,232,240,0.6)", overflow:"hidden", marginBottom:6 }}>
                  <div style={{ height:"100%", width:`${pct}%`, borderRadius:99, background:s.color, boxShadow:`0 2px 6px ${s.color}50` }}/>
                </div>
                <div style={{ fontSize:11.5, color:C.slateXL, fontWeight:600 }}>{pct}% of total</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Placeholder note */}
      <div className="au5" style={{ marginTop:20, background:"rgba(37,99,235,.06)", border:"1.5px solid rgba(37,99,235,.12)", borderRadius:14, padding:"12px 18px", display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:16 }}>ℹ️</span>
        <span style={{ fontSize:13, color:C.blue, fontWeight:600 }}>This section currently displays placeholder data. Connect <code style={{background:"rgba(37,99,235,.1)",padding:"1px 6px",borderRadius:5,fontFamily:"monospace"}}>adminApi.getAppointmentStats()</code> to populate with live figures.</span>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [tab, setTab]                   = useState("dashboard");
  const [users, setUsers]               = useState([]);
  const [doctors, setDoctors]           = useState([]);
  const [assignments, setAssignments]   = useState([]);
  const [loadingAction, setLoading]     = useState(false);
  const [toast, setToast]               = useState(null);

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  const fetchUsers       = useCallback(async()=>{ try{const d=await adminApi.getAllUsers();            setUsers(Array.isArray(d)?d:[]);}      catch{setUsers([]);}       },[]);
  const fetchDoctors     = useCallback(async()=>{ try{const d=await adminApi.getAllDoctors();          setDoctors(Array.isArray(d)?d:[]);}    catch{setDoctors([]);}     },[]);
  const fetchAssignments = useCallback(async()=>{ try{const d=await adminApi.getSecretaryAssignments();setAssignments(Array.isArray(d)?d:[]);}catch{setAssignments([]);} },[]);

  useEffect(()=>{ fetchUsers(); fetchDoctors(); fetchAssignments(); },[fetchUsers,fetchDoctors,fetchAssignments]);

  const act = async(fn,msg)=>{ setLoading(true); try{await fn();showToast(msg);}catch(e){showToast(e.message,"error");}finally{setLoading(false);} };

  const handleApprove  = id => act(()=>adminApi.approveDoctor(id).then(fetchDoctors), "Doctor approved successfully!");
  const handleReject   = id => act(()=>adminApi.rejectDoctor(id).then(fetchDoctors),  "Doctor registration rejected.");
  const handleDelete   = id => act(()=>adminApi.deleteUser(id).then(fetchUsers),       "User removed successfully.");
  const handleBlock    = id => act(()=>adminApi.blockUser(id).then(fetchUsers),        "Account has been blocked.");
  const handleUnblock  = id => act(()=>adminApi.unblockUser(id).then(fetchUsers),      "User has been unblocked.");
  const handleLogout   = () => { logout(); navigate("/login"); };

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", minHeight:"100vh", background:"linear-gradient(160deg,#eef2ff 0%,#e0e7ff 35%,#dbeafe 65%,#ede9fe 100%)", position:"relative", overflow:"hidden" }}>
      <GlobalStyles/>

      {/* ── Background layer — mirrors landing page exactly ── */}
      <div aria-hidden style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
        {/* Blobs */}
        <div style={{ position:"absolute", width:700, height:700, borderRadius:"50%", background:"rgba(37,99,235,.09)", filter:"blur(72px)", top:-220, right:-120 }}/>
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"rgba(124,58,237,.07)", filter:"blur(62px)", bottom:-160, left:-100 }}/>
        <div style={{ position:"absolute", width:380, height:380, borderRadius:"50%", background:"rgba(16,185,129,.06)", filter:"blur(55px)", bottom:"22%", right:"17%" }}/>
        <div style={{ position:"absolute", width:260, height:260, borderRadius:"50%", background:"rgba(245,158,11,.05)", filter:"blur(45px)", top:"38%", left:"8%" }}/>

        {/* Clouds — identical props to landing page */}
        <div className="cloud-a" style={{ position:"absolute", top:80,  left:"6%",   opacity:.45 }}><Cloud style={{width:240,height:96}}/></div>
        <div className="cloud-b" style={{ position:"absolute", top:160, right:"22%", opacity:.28 }}><Cloud style={{width:180,height:72}}/></div>
        <div className="cloud-c" style={{ position:"absolute", top:50,  right:"5%",  opacity:.22 }}><Cloud style={{width:200,height:80}}/></div>
        <div className="cloud-a" style={{ position:"absolute", bottom:"20%", left:"26%",  opacity:.18 }}><Cloud style={{width:220,height:88}}/></div>
        <div className="cloud-b" style={{ position:"absolute", bottom:"6%",  right:"9%",  opacity:.15 }}><Cloud style={{width:160,height:64}}/></div>

        {/* Floating orbs */}
        <div className="float-orb-a" style={{ position:"absolute", width:90, height:90, borderRadius:"50%", background:"linear-gradient(135deg,rgba(37,99,235,.18),rgba(124,58,237,.12))", top:"22%", right:"12%", border:"1px solid rgba(255,255,255,.5)" }}/>
        <div className="float-orb-b" style={{ position:"absolute", width:56, height:56, borderRadius:"50%", background:"linear-gradient(135deg,rgba(16,185,129,.2),rgba(37,99,235,.1))", top:"62%", right:"30%", border:"1px solid rgba(255,255,255,.4)" }}/>
        <div className="float-orb-a" style={{ position:"absolute", width:36, height:36, borderRadius:"50%", background:"rgba(124,58,237,.15)", top:"42%", left:"4%", border:"1px solid rgba(255,255,255,.35)", animationDelay:"3s" }}/>
      </div>

      {/* ── App shell ── */}
      <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", minHeight:"100vh" }}>
        <Navbar activeTab={tab} onTabChange={setTab} onLogout={handleLogout} pendingCount={doctors.filter(d=>d.status==="PENDING").length}/>
        <Toast toast={toast}/>

        <div style={{ flex:1 }}>
          <PageBanner tab={tab}/>
          {tab==="dashboard"   && <DashboardTab users={users} doctors={doctors} assignments={assignments} onGoTo={setTab}/>}
          {tab==="doctors"     && <DoctorRegistrationsTab doctors={doctors} onApprove={handleApprove} onReject={handleReject} loading={loadingAction}/>}
          {tab==="secretaries" && <SecretaryAssignmentsTab assignments={assignments}/>}
          {tab==="users"       && <ManageUsersTab users={users} onDelete={handleDelete} onBlock={handleBlock} onUnblock={handleUnblock} loading={loadingAction}/>}
          {tab==="analytics"   && <AnalyticsTab/>}
        </div>
      </div>
    </div>
  );
}