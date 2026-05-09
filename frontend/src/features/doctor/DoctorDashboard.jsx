import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { doctorApi } from '../shared/api';

// ── Global Styles ────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=Sora:wght@600;700;800;900&display=swap" rel="stylesheet"/>
    <style>{`
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
      @keyframes slideR{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}
      @keyframes floatA{0%,100%{transform:translateY(0) translateX(0)}33%{transform:translateY(-12px) translateX(5px)}66%{transform:translateY(-5px) translateX(-3px)}}
      @keyframes floatB{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
      @keyframes cloudD{from{transform:translateX(-10px)}to{transform:translateX(10px)}}
      @keyframes spin{to{transform:rotate(360deg)}}
      .au1{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .04s both}
      .au2{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .12s both}
      .au3{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .20s both}
      .au4{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .28s both}
      .cloud-a{animation:cloudD 9s ease-in-out infinite alternate}
      .cloud-b{animation:cloudD 13s ease-in-out infinite alternate-reverse}
      .cloud-c{animation:cloudD 17s ease-in-out infinite alternate}
      .float-a{animation:floatA 9s ease-in-out infinite}
      .float-b{animation:floatB 7s ease-in-out infinite}
      .shimmer-text{background:linear-gradient(90deg,#059669,#0891b2,#059669);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite;}
      .glass{background:rgba(255,255,255,.80);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1.5px solid rgba(255,255,255,.92);border-radius:20px;box-shadow:0 4px 24px rgba(5,150,105,.06);}
      .glass-sm{background:rgba(255,255,255,.82);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1.5px solid rgba(255,255,255,.9);border-radius:16px;box-shadow:0 2px 16px rgba(5,150,105,.05);}
      .stat-card{background:rgba(255,255,255,.82);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1.5px solid rgba(255,255,255,.92);border-radius:20px;padding:22px 16px;box-shadow:0 4px 24px rgba(5,150,105,.07);transition:transform .25s cubic-bezier(.22,1,.36,1),box-shadow .25s;display:flex;flex-direction:column;align-items:center;text-align:center;}
      .stat-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(5,150,105,.13)}
      .appt-card{background:rgba(255,255,255,.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1.5px solid rgba(255,255,255,.95);border-radius:18px;box-shadow:0 2px 16px rgba(5,150,105,.06);transition:transform .22s cubic-bezier(.22,1,.36,1),box-shadow .22s;}
      .appt-card:hover{transform:translateY(-3px);box-shadow:0 12px 36px rgba(5,150,105,.1)}
      .tab-btn{display:flex;align-items:center;gap:7px;padding:9px 16px;border-radius:12px;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:600;cursor:pointer;transition:all .2s cubic-bezier(.22,1,.36,1);white-space:nowrap;}
      .tab-btn:hover{background:rgba(255,255,255,.65)}
      .tab-btn.active{background:#fff;color:#059669 !important;box-shadow:0 2px 12px rgba(5,150,105,.16),0 1px 3px rgba(0,0,0,.06)}
      .btn-primary{display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:12px;border:none;background:linear-gradient(135deg,#059669,#047857);color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .22s cubic-bezier(.22,1,.36,1);box-shadow:0 4px 14px rgba(5,150,105,.3);}
      .btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(5,150,105,.4)}
      .btn-primary:active{transform:scale(.98)}
      .btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}
      .btn-danger{display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:12px;border:none;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .22s;box-shadow:0 4px 14px rgba(239,68,68,.3);}
      .btn-danger:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(239,68,68,.4)}
      .btn-danger:disabled{opacity:.5;cursor:not-allowed;transform:none}
      .btn-ghost{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:11px;border:1.5px solid rgba(226,232,240,.85);background:rgba(255,255,255,.75);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;color:#334155;cursor:pointer;transition:all .2s;}
      .btn-ghost:hover{background:rgba(255,255,255,.95);transform:translateY(-1px)}
      .input-field{width:100%;padding:10px 14px;border-radius:11px;border:1.5px solid rgba(226,232,240,.85);background:rgba(255,255,255,.8);font-family:'DM Sans',sans-serif;font-size:14px;color:#0f172a;outline:none;transition:border-color .2s,box-shadow .2s;}
      .input-field:focus{border-color:#059669;box-shadow:0 0 0 3px rgba(5,150,105,.12)}
      select.input-field{cursor:pointer}
      textarea.input-field{resize:vertical}
      .filter-pill{padding:7px 16px;border-radius:100px;border:1.5px solid;font-weight:600;font-size:13px;cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif;}
      .filter-pill:hover{transform:translateY(-1px)}
      .modal-bg{animation:fadeIn .18s ease both}
      .modal-box{animation:fadeUp .28s cubic-bezier(.22,1,.36,1) both}
      .toast-in{animation:slideR .35s cubic-bezier(.22,1,.36,1) both}
      ::-webkit-scrollbar{width:5px;height:5px}
      ::-webkit-scrollbar-track{background:transparent}
      ::-webkit-scrollbar-thumb{background:rgba(148,163,184,.4);border-radius:5px}
      @media(max-width:860px){
        .top-tabs{display:none !important}.mob-tabs{display:flex !important}
        .two-col{grid-template-columns:1fr !important}
        .four-col{grid-template-columns:repeat(2,1fr) !important}
      }
      @media(max-width:520px){
        .four-col{grid-template-columns:1fr 1fr !important}
        .pw{padding:18px 16px 48px !important}
      }
    `}</style>
  </>
);

// ── Cloud SVG ────────────────────────────────────────────────────────────
const Cloud = ({ style }) => (
  <svg viewBox="0 0 200 80" fill="none" style={style}>
    <path d="M170 60H45C28 60 15 47 15 30C15 15 26 4 40 4C42 4 44 4 46 5C50 -1 58 -2 65 2C70 -4 80 -5 88 1C93 -3 101 -3 107 2C114 -2 124 0 128 8C140 6 152 14 154 26C162 26 170 34 170 43V60Z" fill="white" fillOpacity="0.55"/>
  </svg>
);

// ── Colors ───────────────────────────────────────────────────────────────
const C = {
  green:"#059669",  greenDk:"#047857", greenLt:"#f0fdf4", greenBdr:"#bbf7d0",
  teal:"#0891b2",   tealLt:"#ecfeff",  tealBdr:"#a5f3fc",
  amber:"#f59e0b",  amberDk:"#d97706", amberLt:"#fffbeb", amberBdr:"#fde68a",
  blue:"#2563eb",   blueLt:"#eff6ff",  blueBdr:"#bfdbfe",
  purple:"#7c3aed", purpleLt:"#f5f3ff",purpleBdr:"#ddd6fe",
  red:"#ef4444",    redLt:"#fef2f2",   redBdr:"#fecaca",
  slate:"#0f172a",  slateM:"#334155",  slateL:"#64748b",  slateXL:"#94a3b8",
};

// ── Icons ────────────────────────────────────────────────────────────────
const Ico = ({size=16,ch})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} dangerouslySetInnerHTML={{__html:ch}}/>;
const HomeIcon    = () => <Ico size={17} ch='<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'/>
const CalIcon     = () => <Ico size={17} ch='<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'/>
const UserIcon    = () => <Ico size={17} ch='<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'/>
const UsersIcon   = () => <Ico size={17} ch='<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'/>
const LogoutIcon  = () => <Ico size={15} ch='<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'/>
const CheckIcon   = () => <Ico size={16} ch='<polyline points="20 6 9 17 4 12"/>'/>
const XIcon       = () => <Ico size={16} ch='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'/>
const PencilIcon  = () => <Ico size={15} ch='<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>'/>
const SaveIcon    = () => <Ico size={15} ch='<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>'/>
const EyeOnIcon   = () => <Ico size={15} ch='<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'/>
const EyeOffIcon  = () => <Ico size={15} ch='<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'/>

const DateIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={13} height={13} style={{flexShrink:0}}>
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const TimeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={13} height={13} style={{flexShrink:0}}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const StatApptIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const StatCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const StatClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const StatUserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

// ── Helpers ──────────────────────────────────────────────────────────────
const getInitials = (fn="",ln="") => `${fn[0]||""}${ln[0]||""}`.toUpperCase();
const apptPatFn   = a => a?.patient?.firstName || a?.patient?.firstname || '';
const apptPatLn   = a => a?.patient?.lastName  || a?.patient?.lastname  || '';
const apptDate    = a => a?.requestedDate || a?.requested_date || '';
const apptTime    = a => a?.requestedTime || a?.requested_time || '';
const apptReason  = a => a?.reasonForVisit || a?.reason_for_visit || '';
const secFn       = s => s?.firstName || s?.firstname || '';
const secLn       = s => s?.lastName  || s?.lastname  || '';
const secEmail    = s => s?.email || '';

// ── Sub-components ───────────────────────────────────────────────────────
const Spinner = ({size=22,color=C.green}) => (
  <svg style={{animation:"spin 1s linear infinite",flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" width={size} height={size}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

const Toast = ({toast}) => {
  if (!toast) return null;
  const e = toast.type==="error";
  return (
    <div className="toast-in" style={{position:"fixed",top:78,right:24,zIndex:9999,background:e?C.redLt:C.greenLt,border:`1.5px solid ${e?C.redBdr:C.greenBdr}`,color:e?"#991b1b":"#166534",padding:"13px 20px",borderRadius:16,fontWeight:700,fontSize:13.5,boxShadow:"0 12px 40px rgba(0,0,0,.12)",display:"flex",alignItems:"center",gap:9,maxWidth:400}}>
      {e?"⚠️":"✅"} {toast.msg}
    </div>
  );
};

const ErrBanner = ({msg,onRetry}) => (
  <div style={{background:C.redLt,border:`1.5px solid ${C.redBdr}`,borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
    <span style={{fontSize:15}}>⚠️</span>
    <span style={{fontSize:13,color:"#991b1b",fontWeight:600,flex:1}}>{msg}</span>
    {onRetry&&<button className="btn-ghost" onClick={onRetry} style={{fontSize:12,padding:"5px 12px",color:C.red,borderColor:C.redBdr}}>Retry</button>}
  </div>
);

const SB = {
  PENDING:   ["#fef9c3","#854d0e","#fde047"],
  CONFIRMED: [C.greenLt, C.green, C.greenBdr],
  COMPLETED: [C.blueLt,  C.blue,  C.blueBdr],
  REJECTED:  [C.redLt,  "#991b1b",C.redBdr],
  CANCELLED: ["#f1f5f9", C.slateL,"#cbd5e1"],
  APPROVED:  [C.greenLt, C.green, C.greenBdr],
};
const StatusBadge = ({status=""}) => {
  const [bg,color,border] = SB[status?.toUpperCase()] || SB.PENDING;
  return <span style={{background:bg,color,border:`1px solid ${border}`,borderRadius:100,padding:"3px 11px",fontSize:11.5,fontWeight:700,letterSpacing:".02em",whiteSpace:"nowrap"}}>{status}</span>;
};

// ── Tabs ─────────────────────────────────────────────────────────────────
const TABS = [
  {key:"dashboard",   label:"Dashboard",   icon:<HomeIcon/>},
  {key:"appointments",label:"Appointments", icon:<CalIcon/>},
  {key:"secretary",   label:"Secretary",   icon:<UsersIcon/>},
  {key:"profile",     label:"My Profile",  icon:<UserIcon/>},
];

// ── Avatar Image helper (graceful fallback) ──────────────────────────────
const AvatarImg = ({ src, alt = "", style = {} }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return (
    <img
      src={src}
      alt={alt}
      style={{ width: "100%", height: "100%", objectFit: "cover", ...style }}
      onError={() => setFailed(true)}
    />
  );
};

// ── Navbar ───────────────────────────────────────────────────────────────
const Navbar = ({active, onTab, onLogout, user, pendingCount, profilePicture}) => {
  const fn = user?.firstname || user?.firstName || "";
  const ln = user?.lastname  || user?.lastName  || "";
  return (
    <>
      <nav style={{position:"sticky",top:0,zIndex:100,height:64,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",background:"rgba(255,255,255,.72)",backdropFilter:"blur(22px)",WebkitBackdropFilter:"blur(22px)",borderBottom:"1px solid rgba(255,255,255,.78)",boxShadow:"0 1px 0 rgba(5,150,105,.06),0 4px 24px rgba(5,150,105,.05)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{width:36,height:36,borderRadius:11,background:`linear-gradient(135deg,${C.green},${C.greenDk})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:900,fontSize:17,boxShadow:`0 4px 14px rgba(5,150,105,.32)`}}>M</div>
          <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:17,color:C.slate,letterSpacing:"-.3px"}}>Medi<span style={{color:C.green}}>Core</span></span>
        </div>
        <div className="top-tabs" style={{display:"flex",gap:4}}>
          {TABS.map(t=>(
            <button key={t.key} className={`tab-btn ${active===t.key?"active":""}`} onClick={()=>onTab(t.key)} style={{color:active===t.key?C.green:C.slateL,position:"relative"}}>
              {t.icon}{t.label}
              {t.key==="secretary"&&pendingCount>0&&(
                <span style={{position:"absolute",top:4,right:4,width:8,height:8,borderRadius:"50%",background:C.amber,border:"1.5px solid #fff"}}/>
              )}
            </button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            {/* ── Navbar avatar ── */}
            <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${C.green},${C.greenDk})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:13,boxShadow:`0 3px 10px rgba(5,150,105,.3)`,overflow:"hidden",position:"relative"}}>
              <AvatarImg src={profilePicture} alt="Doctor avatar" />
              {!profilePicture && (getInitials(fn, ln) || "D")}
            </div>
            <div style={{lineHeight:1.2}}>
              <div style={{fontSize:10.5,color:C.slateXL,fontWeight:600}}>Doctor</div>
              <div style={{fontSize:13,fontWeight:700,color:C.slate}}>{fn ? `Dr. ${fn} ${ln}`.trim() : "Loading…"}</div>
            </div>
          </div>
          <button className="btn-ghost" onClick={onLogout} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 13px",fontSize:13}}>
            <LogoutIcon/> Logout
          </button>
        </div>
      </nav>
      <div className="mob-tabs" style={{display:"none",gap:4,padding:"8px 12px",background:"rgba(255,255,255,.72)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.7)",overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.key} className={`tab-btn ${active===t.key?"active":""}`} onClick={()=>onTab(t.key)} style={{color:active===t.key?C.green:C.slateL,fontSize:12,padding:"8px 12px",flexShrink:0,position:"relative"}}>
            {t.icon}{t.label}
            {t.key==="secretary"&&pendingCount>0&&<span style={{position:"absolute",top:4,right:4,width:7,height:7,borderRadius:"50%",background:C.amber}}/>}
          </button>
        ))}
      </div>
    </>
  );
};

// ── Dashboard Tab ────────────────────────────────────────────────────────
const DashboardTab = ({user, appointments, secretaryRequests, onGoTo}) => {
  const fn = user?.firstname || user?.firstName || "there";
  const ln = user?.lastname  || user?.lastName  || "";
  const todayStr    = new Date().toISOString().split('T')[0];
  const todayAppts  = appointments.filter(a => apptDate(a) === todayStr).length;
  const assignedSec = secretaryRequests.find(r => r.status === 'APPROVED');
  const pendingSec  = secretaryRequests.filter(r => r.status === 'PENDING').length;

  const statCards = [
    {label:"Today's Appointments", val:todayAppts,                                                    grad:`linear-gradient(135deg,${C.green},${C.greenDk})`,    icon:<StatApptIcon/>},
    {label:"Total Appointments",   val:appointments.length,                                           grad:`linear-gradient(135deg,${C.teal},#0e7490)`,           icon:<StatClockIcon/>},
    {label:"Completed",            val:appointments.filter(a=>a.status==='COMPLETED').length,         grad:`linear-gradient(135deg,${C.blue},#1d4ed8)`,           icon:<StatCheckIcon/>},
    {label:"Confirmed",            val:appointments.filter(a=>a.status==='CONFIRMED').length,         grad:`linear-gradient(135deg,${C.purple},#6d28d9)`,         icon:<StatUserIcon/>},
  ];

  const recent = appointments.slice(0, 4);

  return (
    <div className="pw" style={{padding:"0 32px 56px",maxWidth:1120,margin:"0 auto"}}>
      <div className="au1" style={{padding:"36px 0 26px"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:20}}>
          <div>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:"clamp(1.6rem,4vw,2.2rem)",fontWeight:900,color:C.slate,lineHeight:1.15,marginBottom:8}}>
              Welcome, <span className="shimmer-text">Dr. {fn} {ln}!</span>
            </h1>
            <p style={{fontSize:15,color:C.slateL,fontWeight:500,maxWidth:480}}>Here's an overview of your appointments and secretary requests.</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="four-col au2" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
        {statCards.map((s,i)=>(
          <div key={i} className="stat-card" style={{animationDelay:`${i*.06}s`}}>
            <div style={{width:44,height:44,borderRadius:13,background:s.grad,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14,boxShadow:"0 3px 12px rgba(0,0,0,.12)"}}>
              {s.icon}
            </div>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:32,fontWeight:900,color:C.slate,lineHeight:1,marginBottom:6}}>{s.val}</div>
            <div style={{fontSize:12.5,color:C.slateL,fontWeight:600}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Secretary Card */}
      <div className="au3 glass" style={{padding:"20px 24px",marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:900,color:C.slate}}>My Secretary</h2>
            <p style={{fontSize:12.5,color:C.slateL,marginTop:2}}>Secretary assigned to manage your appointments</p>
          </div>
          {pendingSec > 0 && (
            <button onClick={()=>onGoTo("secretary")} style={{fontSize:12,color:C.amber,background:C.amberLt,border:`1px solid ${C.amberBdr}`,padding:"5px 14px",borderRadius:100,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              {pendingSec} pending request{pendingSec > 1 ? "s" : ""} →
            </button>
          )}
        </div>
        {assignedSec ? (
          <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:14,background:C.greenLt,border:`1px solid ${C.greenBdr}`}}>
            {/* ── Secretary avatar ── */}
            <div style={{width:46,height:46,borderRadius:"50%",background:`linear-gradient(135deg,${C.green},${C.greenDk})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:16,flexShrink:0,overflow:"hidden"}}>
              <AvatarImg src={assignedSec.profilePicture} alt="" />
              {!assignedSec.profilePicture && (getInitials(secFn(assignedSec), secLn(assignedSec)) || "S")}
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,color:C.slate}}>{secFn(assignedSec)} {secLn(assignedSec)}</div>
              <div style={{fontSize:12.5,color:C.slateL,marginTop:2}}>{secEmail(assignedSec)}</div>
            </div>
            <span style={{background:C.greenLt,color:C.green,border:`1px solid ${C.greenBdr}`,borderRadius:100,padding:"4px 12px",fontSize:12,fontWeight:700}}>● Assigned</span>
          </div>
        ) : (
          <div style={{padding:"20px",textAlign:"center",color:C.slateXL,fontSize:13.5}}>
            <div style={{fontSize:32,marginBottom:8}}>👤</div>
            No secretary assigned yet. Secretaries can request to be assigned during registration.
          </div>
        )}
      </div>

      {/* Recent Appointments */}
      <div className="au4">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:17,fontWeight:900,color:C.slate}}>Recent Appointments</h2>
            <p style={{fontSize:12.5,color:C.slateL,marginTop:2}}>Your latest patient appointments</p>
          </div>
          <button onClick={()=>onGoTo("appointments")} style={{fontSize:12,color:C.green,background:C.greenLt,border:`1px solid ${C.greenBdr}`,padding:"5px 14px",borderRadius:100,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>View all →</button>
        </div>
        {recent.length === 0 ? (
          <div className="glass" style={{padding:40,textAlign:"center",color:C.slateXL,fontSize:14}}>
            <div style={{fontSize:36,marginBottom:10}}>📭</div>No appointments yet.
          </div>
        ) : (
          <div className="two-col" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
            {recent.map(a => (
              <div key={a.id} className="appt-card" style={{padding:"18px 20px"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:13,marginBottom:12}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${C.green},${C.greenDk})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,flexShrink:0,overflow:"hidden"}}>
                    <AvatarImg src={a?.patient?.profilePicture} alt="" />
                    {!a?.patient?.profilePicture && (getInitials(apptPatFn(a), apptPatLn(a)) || "P")}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,color:C.slate}}>{apptPatFn(a)} {apptPatLn(a)}</div>
                    <div style={{fontSize:12.5,color:C.slateL,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{apptReason(a)||"—"}</div>
                  </div>
                  <StatusBadge status={a.status}/>
                </div>
                <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                  <span style={{fontSize:13,color:C.slateM,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
                    <DateIcon/>{apptDate(a) ? new Date(apptDate(a)).toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"}) : "—"}
                  </span>
                  <span style={{fontSize:13,color:C.slateM,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
                    <TimeIcon/>{apptTime(a)||"—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Appointments Tab ─────────────────────────────────────────────────────
const AppointmentsTab = ({appointments, onComplete, onCancel, loading}) => {
  const [filter,        setFilter]        = useState("ALL");
  const [cancelModal,   setCancelModal]   = useState(null);
  const [cancelReason,  setCancelReason]  = useState("");
  const [completeModal, setCompleteModal] = useState(null);
  const [doctorNotes,   setDoctorNotes]   = useState("");

  const filtered = filter === "ALL" ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div className="pw" style={{padding:"24px 32px 56px",maxWidth:1120,margin:"0 auto"}}>
      <div className="au1" style={{marginBottom:20}}>
        <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:900,color:C.slate,marginBottom:4}}>Appointments</h2>
        <p style={{fontSize:13,color:C.slateL}}>Manage your patient appointments ({appointments.length} total)</p>
      </div>
      <div className="au2" style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
        {["ALL","CONFIRMED","COMPLETED","CANCELLED"].map(f=>(
          <button key={f} className="filter-pill" onClick={()=>setFilter(f)} style={{borderColor:filter===f?C.green:"rgba(226,232,240,.8)",background:filter===f?C.greenLt:"rgba(255,255,255,.72)",color:filter===f?C.green:C.slateL}}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass au3" style={{padding:56,textAlign:"center",color:C.slateXL,fontSize:14}}>
          <div style={{fontSize:36,marginBottom:10}}>📭</div>No {filter==="ALL" ? "" : filter.toLowerCase()} appointments found.
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {filtered.map((a,i) => (
            <div key={a.id} className="appt-card au3" style={{padding:"18px 22px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",animationDelay:`${i*.05}s`}}>
              <div style={{width:48,height:48,borderRadius:"50%",background:`linear-gradient(135deg,${C.green},${C.greenDk})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:16,flexShrink:0,overflow:"hidden"}}>
                <AvatarImg src={a?.patient?.profilePicture} alt="" />
                {!a?.patient?.profilePicture && (getInitials(apptPatFn(a), apptPatLn(a)) || "P")}
              </div>
              <div style={{flex:1,minWidth:180}}>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15.5,color:C.slate}}>{apptPatFn(a)} {apptPatLn(a)}</div>
                <div style={{display:"flex",gap:16,marginTop:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:12.5,color:C.slateM,fontWeight:600,display:"flex",alignItems:"center",gap:5}}><DateIcon/>{apptDate(a) ? new Date(apptDate(a)).toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"}) : "—"}</span>
                  <span style={{fontSize:12.5,color:C.slateM,fontWeight:600,display:"flex",alignItems:"center",gap:5}}><TimeIcon/>{apptTime(a)||"—"}</span>
                </div>
                {apptReason(a) && <div style={{fontSize:12,color:C.slateXL,marginTop:4}}>{apptReason(a)}</div>}
                {a.status==="COMPLETED" && a.doctorNotes && (
                  <div style={{marginTop:6,fontSize:12,color:C.blue,background:C.blueLt,border:`1px solid ${C.blueBdr}`,borderRadius:8,padding:"4px 10px",display:"inline-block"}}>📝 {a.doctorNotes}</div>
                )}
                {a.status==="CANCELLED" && a.cancelReason && (
                  <div style={{marginTop:6,fontSize:12,color:C.slateL,background:"#f1f5f9",border:"1px solid #cbd5e1",borderRadius:8,padding:"4px 10px",display:"inline-block"}}>✗ {a.cancelReason}</div>
                )}
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
                <StatusBadge status={a.status}/>
                {a.status==="CONFIRMED" && (
                  <div style={{display:"flex",gap:6}}>
                    <button className="btn-primary" onClick={()=>{setCompleteModal(a);setDoctorNotes("");}} disabled={loading} style={{padding:"7px 14px",fontSize:12,gap:5}}>
                      <CheckIcon/> Complete
                    </button>
                    <button className="btn-danger" onClick={()=>{setCancelModal(a);setCancelReason("");}} disabled={loading} style={{padding:"7px 14px",fontSize:12,gap:5}}>
                      <XIcon/> Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complete Modal */}
      {completeModal && (
        <div className="modal-bg" style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(15,23,42,.48)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)",padding:16}}>
          <div className="modal-box" style={{background:"#fff",borderRadius:24,padding:32,maxWidth:480,width:"100%",boxShadow:"0 32px 80px rgba(0,0,0,.22)"}}>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:900,color:C.slate,marginBottom:6}}>Mark as Completed</h2>
            <p style={{fontSize:13,color:C.slateL,marginBottom:20}}>Patient: <strong>{apptPatFn(completeModal)} {apptPatLn(completeModal)}</strong></p>
            <label style={{fontSize:13,fontWeight:700,color:C.slateM,display:"block",marginBottom:6}}>Doctor Notes <span style={{color:C.slateXL,fontWeight:400}}>(optional)</span></label>
            <textarea className="input-field" rows={3} value={doctorNotes} onChange={e=>setDoctorNotes(e.target.value)} placeholder="e.g. Prescribed medication, follow-up in 2 weeks…"/>
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button className="btn-ghost" onClick={()=>setCompleteModal(null)} style={{flex:1,justifyContent:"center",padding:"11px"}}>Cancel</button>
              <button className="btn-primary" onClick={()=>{onComplete(completeModal.id,doctorNotes||null);setCompleteModal(null);}} disabled={loading} style={{flex:1,justifyContent:"center"}}>
                {loading ? <Spinner size={16} color="#fff"/> : <><CheckIcon/> Confirm Completed</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="modal-bg" style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(15,23,42,.48)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)",padding:16}}>
          <div className="modal-box" style={{background:"#fff",borderRadius:24,padding:32,maxWidth:480,width:"100%",boxShadow:"0 32px 80px rgba(0,0,0,.22)"}}>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:900,color:C.slate,marginBottom:6}}>Cancel Appointment</h2>
            <p style={{fontSize:13,color:C.slateL,marginBottom:20}}>Patient: <strong>{apptPatFn(cancelModal)} {apptPatLn(cancelModal)}</strong></p>
            <label style={{fontSize:13,fontWeight:700,color:C.slateM,display:"block",marginBottom:6}}>Reason <span style={{color:C.slateXL,fontWeight:400}}>(optional)</span></label>
            <select className="input-field" value={cancelReason} onChange={e=>setCancelReason(e.target.value)}>
              <option value="">Select a reason…</option>
              <option value="Doctor unavailable">Doctor unavailable</option>
              <option value="Patient no-show">Patient no-show</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Other">Other</option>
            </select>
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button className="btn-ghost" onClick={()=>setCancelModal(null)} style={{flex:1,justifyContent:"center",padding:"11px"}}>Back</button>
              <button className="btn-danger" onClick={()=>{onCancel(cancelModal.id,cancelReason||null);setCancelModal(null);}} disabled={loading} style={{flex:1,justifyContent:"center"}}>
                {loading ? <Spinner size={16} color="#fff"/> : <><XIcon/> Confirm Cancel</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Secretary Requests Tab ───────────────────────────────────────────────
const SecretaryTab = ({requests, onApprove, onReject, loading}) => {
  const hasApproved = requests.some(r => r.status === "APPROVED");
  return (
    <div className="pw" style={{padding:"24px 32px 56px",maxWidth:1120,margin:"0 auto"}}>
      <div className="au1" style={{marginBottom:20}}>
        <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:900,color:C.slate,marginBottom:4}}>Secretary Requests</h2>
        <p style={{fontSize:13,color:C.slateL}}>Secretaries who selected you during registration</p>
      </div>
      {hasApproved && (
        <div className="au2" style={{background:C.greenLt,border:`1px solid ${C.greenBdr}`,borderRadius:14,padding:"12px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
          <CheckIcon/><span style={{fontSize:13,color:C.green,fontWeight:700}}>You already have an assigned secretary.</span>
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {requests.length === 0 ? (
          <div className="glass au3" style={{padding:56,textAlign:"center",color:C.slateXL,fontSize:14}}>
            <div style={{fontSize:36,marginBottom:10}}>👤</div>No secretary requests yet.
          </div>
        ) : requests.map((req, i) => (
          <div key={req.secretaryId} className="appt-card au3" style={{padding:"20px 24px",display:"flex",alignItems:"center",gap:16,animationDelay:`${i*.05}s`}}>
            {/* ── Secretary avatar ── */}
            <div style={{width:52,height:52,borderRadius:"50%",background:`linear-gradient(135deg,${C.purple},#6d28d9)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,flexShrink:0,overflow:"hidden"}}>
              <AvatarImg src={req.profilePicture} alt="" />
              {!req.profilePicture && (getInitials(secFn(req), secLn(req)) || "S")}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15.5,color:C.slate}}>{secFn(req)} {secLn(req)}</div>
              <div style={{fontSize:13,color:C.slateL,marginTop:2}}>{secEmail(req)}</div>
              {req.phoneNumber && <div style={{fontSize:12,color:C.slateXL,marginTop:2}}>{req.phoneNumber}</div>}
              {req.requestedAt && <div style={{fontSize:12,color:C.slateXL,marginTop:2}}>Requested: {new Date(req.requestedAt).toLocaleDateString("en-PH",{year:"numeric",month:"short",day:"numeric"})}</div>}
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
              <StatusBadge status={req.status}/>
              {req.status==="PENDING" && !hasApproved && (
                <div style={{display:"flex",gap:8}}>
                  <button className="btn-primary" onClick={()=>onApprove(req.secretaryId)} disabled={loading} style={{padding:"7px 14px",fontSize:12,gap:5}}>
                    <CheckIcon/> Approve
                  </button>
                  <button className="btn-danger" onClick={()=>onReject(req.secretaryId)} disabled={loading} style={{padding:"7px 14px",fontSize:12,gap:5}}>
                    <XIcon/> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Profile Tab ──────────────────────────────────────────────────────────
const SPECS = ['General Medicine','Cardiology','Dermatology','Endocrinology','Gastroenterology','Neurology','Obstetrics & Gynecology','Oncology','Ophthalmology','Orthopedics','Pediatrics','Psychiatry','Pulmonology','Radiology','Surgery','Urology','Other'];

const ProfileTab = ({onSaved}) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchErr,setFetchErr]= useState("");
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [form,    setForm]    = useState({firstName:"",lastName:"",phoneNumber:"",specialization:"",yearsOfExperience:"",bio:"",currentPassword:"",newPassword:"",confirmPassword:""});
  const [showPw,  setShowPw]  = useState({cur:false,new:false,con:false});

  useEffect(() => {
    (async () => {
      setLoading(true); setFetchErr("");
      try {
        const d = await doctorApi.getProfile();
        setProfile(d);
        setForm({
          firstName: d.firstName||"", lastName: d.lastName||"",
          phoneNumber: d.phoneNumber||"", specialization: d.specialization||"",
          yearsOfExperience: d.yearsOfExperience != null ? String(d.yearsOfExperience) : "",
          bio: d.bio||"", currentPassword:"", newPassword:"", confirmPassword:"",
        });
      } catch(e) { setFetchErr(e.message||"Failed to load profile."); }
      finally { setLoading(false); }
    })();
  }, []);

  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));

  const cancelEdit = () => {
    if (profile) setForm({
      firstName: profile.firstName||"", lastName: profile.lastName||"",
      phoneNumber: profile.phoneNumber||"", specialization: profile.specialization||"",
      yearsOfExperience: profile.yearsOfExperience != null ? String(profile.yearsOfExperience) : "",
      bio: profile.bio||"", currentPassword:"", newPassword:"", confirmPassword:"",
    });
    setSaveErr(""); setEditing(false);
  };

  const handleSave = async () => {
    setSaveErr("");
    if (form.newPassword && !form.currentPassword) { setSaveErr("Enter current password to change it."); return; }
    if (form.newPassword && form.newPassword.length < 8) { setSaveErr("New password must be at least 8 characters."); return; }
    if (form.newPassword && form.newPassword !== form.confirmPassword) { setSaveErr("New passwords do not match."); return; }
    setSaving(true);
    try {
      const payload = {
        firstName: form.firstName, lastName: form.lastName,
        phoneNumber: form.phoneNumber, specialization: form.specialization,
        yearsOfExperience: form.yearsOfExperience !== '' ? Number(form.yearsOfExperience) : null,
        bio: form.bio,
        ...(form.newPassword ? {currentPassword: form.currentPassword, newPassword: form.newPassword} : {}),
      };
      const updated = await doctorApi.updateProfile(payload);
      setProfile(updated);
      setEditing(false);
      setForm(f => ({...f, currentPassword:"", newPassword:"", confirmPassword:""}));
      onSaved("Profile updated successfully!", updated);
    } catch(e) { setSaveErr(e.message||"Failed to save changes."); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:80,gap:10,color:C.slateL,fontSize:14,fontWeight:600}}><Spinner/> Loading profile…</div>;
  if (fetchErr) return <div style={{padding:"32px",maxWidth:760,margin:"0 auto"}}><ErrBanner msg={fetchErr}/></div>;

  const fn = profile?.firstName || "";
  const ln = profile?.lastName  || "";

  const FieldRow = ({label, value, last=false}) => (
    <div style={{padding:"13px 0",borderBottom:last?"none":"1px solid rgba(226,232,240,.5)"}}>
      <div style={{fontSize:11,fontWeight:700,color:C.slateXL,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>{label}</div>
      <div style={{fontSize:14.5,color:C.slateM,fontWeight:500}}>{value||<span style={{color:C.slateXL,fontStyle:"italic"}}>Not provided</span>}</div>
    </div>
  );
  const EditField = ({label, children, hint}) => (
    <div>
      <label style={{fontSize:12.5,fontWeight:700,color:C.slateM,display:"block",marginBottom:6}}>{label}</label>
      {children}
      {hint && <p style={{fontSize:11.5,color:C.slateXL,marginTop:4}}>{hint}</p>}
    </div>
  );

  return (
    <div className="pw" style={{padding:"24px 32px 56px",maxWidth:760,margin:"0 auto"}}>
      <div className="glass au2" style={{padding:"28px 32px",marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:24,flexWrap:"wrap"}}>
          <div style={{position:"relative",flexShrink:0}}>
            {/* ── Large profile avatar ── */}
            <div style={{width:78,height:78,borderRadius:"50%",background:`linear-gradient(135deg,${C.green},${C.teal})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:900,fontSize:26,boxShadow:`0 6px 20px rgba(5,150,105,.28)`,overflow:"hidden"}}>
              <AvatarImg src={profile?.profilePicture} alt="Profile" />
              {!profile?.profilePicture && (getInitials(fn, ln) || "D")}
            </div>
            <label style={{position:"absolute",bottom:0,right:0,width:26,height:26,borderRadius:"50%",background:C.green,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,.2)",border:"2px solid #fff"}}>
              <input type="file" accept="image/*" style={{display:"none"}} onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 2 * 1024 * 1024) { setSaveErr("Image must be under 2MB."); return; }
                const reader = new FileReader();
                reader.onload = async (ev) => {
                  try {
                    await doctorApi.uploadProfilePicture(ev.target.result);
                    const updated = await doctorApi.getProfile();
                    setProfile(updated);
                    onSaved("Profile picture updated!", updated);
                  } catch(err) { setSaveErr(err.message || "Failed to upload picture."); }
                };
                reader.readAsDataURL(file);
              }}/>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" width={12} height={12}>
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
            </label>
          </div>
          <div style={{flex:1,minWidth:160}}>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:21,fontWeight:900,color:C.slate}}>Dr. {fn} {ln}</div>
            <div style={{fontSize:13.5,color:C.slateL,marginTop:2}}>{profile?.email}</div>
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <span style={{background:C.greenLt,color:C.green,border:`1px solid ${C.greenBdr}`,borderRadius:100,padding:"3px 11px",fontSize:11.5,fontWeight:700}}>Doctor</span>
              {profile?.specialization && <span style={{background:C.tealLt,color:C.teal,border:`1px solid ${C.tealBdr}`,borderRadius:100,padding:"3px 11px",fontSize:11.5,fontWeight:700}}>{profile.specialization}</span>}
            </div>
          </div>
          {!editing ? (
            <button className="btn-primary" onClick={()=>{setSaveErr("");setEditing(true);}} style={{display:"flex",alignItems:"center",gap:7,padding:"10px 20px",fontSize:13.5}}><PencilIcon/> Edit Profile</button>
          ) : (
            <div style={{display:"flex",gap:8}}>
              <button className="btn-ghost" onClick={cancelEdit} disabled={saving} style={{padding:"9px 16px",fontSize:13}}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving} style={{display:"flex",alignItems:"center",gap:7,padding:"10px 20px",fontSize:13.5}}>
                {saving ? <><Spinner size={15} color="#fff"/> Saving…</> : <><SaveIcon/> Save Changes</>}
              </button>
            </div>
          )}
        </div>
        {saveErr && <div style={{background:C.redLt,border:`1.5px solid ${C.redBdr}`,borderRadius:12,padding:"11px 16px",color:"#991b1b",fontWeight:600,fontSize:13,marginBottom:18,display:"flex",alignItems:"center",gap:8}}>⚠️ {saveErr}</div>}
        {!editing && (
          <>
            <div style={{borderTop:"1.5px solid rgba(226,232,240,.6)",paddingTop:20,marginBottom:24}}>
              <div style={{fontSize:13,fontWeight:700,color:C.slateM,marginBottom:16,display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>👤</span> Personal Information</div>
              <FieldRow label="Full Name" value={`Dr. ${fn} ${ln}`.trim()}/>
              <FieldRow label="Email Address" value={profile?.email}/>
              <FieldRow label="Phone Number" value={profile?.phoneNumber}/>
            </div>
            <div style={{borderTop:"1.5px solid rgba(226,232,240,.6)",paddingTop:20,marginBottom:24}}>
              <div style={{fontSize:13,fontWeight:700,color:C.slateM,marginBottom:16,display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>🩺</span> Professional Information</div>
              <FieldRow label="Specialization" value={profile?.specialization}/>
              <FieldRow label="Years of Experience" value={profile?.yearsOfExperience != null ? `${profile.yearsOfExperience} years` : null}/>
              <FieldRow label="Bio / Description" value={profile?.bio} last/>
            </div>
          </>
        )}
        {editing && (
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            <div style={{borderTop:"1.5px solid rgba(226,232,240,.6)",paddingTop:20,marginBottom:24}}>
              <div style={{fontSize:13,fontWeight:700,color:C.slateM,marginBottom:18,display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>👤</span> Personal Information</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <EditField label="First Name"><input className="input-field" value={form.firstName} onChange={set("firstName")} placeholder="First name"/></EditField>
                <EditField label="Last Name"><input className="input-field" value={form.lastName} onChange={set("lastName")} placeholder="Last name"/></EditField>
              </div>
              <EditField label="Phone Number" hint="Optional — e.g. +63 000 000 0000">
                <input className="input-field" value={form.phoneNumber} onChange={set("phoneNumber")} placeholder="+63 000 000 0000"/>
              </EditField>
            </div>
            <div style={{borderTop:"1.5px solid rgba(226,232,240,.6)",paddingTop:20,marginBottom:24}}>
              <div style={{fontSize:13,fontWeight:700,color:C.slateM,marginBottom:18,display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>🩺</span> Professional Information</div>
              <div style={{marginBottom:14}}>
                <EditField label="Specialization">
                  <select className="input-field" value={form.specialization} onChange={set("specialization")}>
                    <option value="">Select specialization</option>
                    {SPECS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </EditField>
              </div>
              <div style={{marginBottom:14}}>
                <EditField label="Years of Experience" hint="Optional">
                  <input type="number" min="0" max="70" className="input-field" value={form.yearsOfExperience} onChange={set("yearsOfExperience")} placeholder="e.g. 5"/>
                </EditField>
              </div>
              <EditField label="Bio / Description" hint="Optional">
                <textarea className="input-field" rows={3} value={form.bio} onChange={set("bio")} placeholder="e.g. Board-certified cardiologist…"/>
              </EditField>
            </div>
            <div style={{borderTop:"1.5px solid rgba(226,232,240,.6)",paddingTop:20}}>
              <div style={{fontSize:13,fontWeight:700,color:C.slateM,marginBottom:6,display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>🔒</span> Change Password</div>
              <p style={{fontSize:12.5,color:C.slateXL,marginBottom:16}}>Leave blank if you don't want to change your password.</p>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {[
                  {label:"Current Password",    key:"currentPassword", vis:"cur"},
                  {label:"New Password",         key:"newPassword",     vis:"new", hint:"Minimum 8 characters"},
                  {label:"Confirm New Password", key:"confirmPassword", vis:"con"},
                ].map(({label,key,vis,hint}) => (
                  <EditField key={key} label={label} hint={hint}>
                    <div style={{position:"relative"}}>
                      <input type={showPw[vis]?"text":"password"} className="input-field" value={form[key]} onChange={set(key)} placeholder={label} style={{paddingRight:42}}/>
                      <button type="button" onClick={()=>setShowPw(p=>({...p,[vis]:!p[vis]}))} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.slateXL,display:"flex",alignItems:"center"}}>
                        {showPw[vis] ? <EyeOnIcon/> : <EyeOffIcon/>}
                      </button>
                    </div>
                  </EditField>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {!editing && (
        <div className="glass-sm au3" style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:38,height:38,borderRadius:12,background:C.greenLt,border:`1px solid ${C.greenBdr}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>🔒</div>
          <div>
            <div style={{fontSize:13.5,fontWeight:700,color:C.slate,marginBottom:2}}>Account Security</div>
            <div style={{fontSize:12.5,color:C.slateL}}>Your account is secured via Google OAuth or JWT authentication.</div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Export ──────────────────────────────────────────────────────────
export default function DoctorDashboard() {
  const navigate = useNavigate();
  const {user, logout, updateUser} = useAuth();   // ← updateUser added

  const [tab,               setTab]               = useState("dashboard");
  const [toast,             setToast]             = useState(null);
  const [appointments,      setAppointments]      = useState([]);
  const [secretaryRequests, setSecretaryRequests] = useState([]);
  const [loadingAction,     setLoadingAction]     = useState(false);
  const [doctorProfile,     setDoctorProfile]     = useState(null);

  const showToast = (msg, type="success") => { setToast({msg, type}); setTimeout(() => setToast(null), 4500); };

  const fetchAppointments = useCallback(async () => {
    try { const d = await doctorApi.getAppointments(); setAppointments(Array.isArray(d) ? d : []); }
    catch { setAppointments([]); }
  }, []);

  const fetchSecretaryRequests = useCallback(async () => {
    try { const d = await doctorApi.getSecretaryRequests(); setSecretaryRequests(Array.isArray(d) ? d : []); }
    catch { setSecretaryRequests([]); }
  }, []);

  // ── On mount: load all data including the doctor's own profile ──────────
  useEffect(() => {
    fetchAppointments();
    fetchSecretaryRequests();
    doctorApi.getProfile()
      .then(d => {
        setDoctorProfile(d);
        // Sync profilePicture into AuthContext so navbar is correct on load
        if (d?.profilePicture !== undefined) {
          updateUser({ profilePicture: d.profilePicture });
        }
      })
      .catch(() => {});
  }, [fetchAppointments, fetchSecretaryRequests]);

  const handleComplete = async (id, doctorNotes) => {
    setLoadingAction(true);
    try { await doctorApi.completeAppointment(id, doctorNotes); showToast("Appointment marked as completed!"); fetchAppointments(); }
    catch(e) { showToast(e.message, "error"); }
    finally { setLoadingAction(false); }
  };

  const handleCancel = async (id, cancelReason) => {
    setLoadingAction(true);
    try { await doctorApi.cancelAppointment(id, cancelReason); showToast("Appointment cancelled."); fetchAppointments(); }
    catch(e) { showToast(e.message, "error"); }
    finally { setLoadingAction(false); }
  };

  const handleApproveSecretary = async (secretaryId) => {
    setLoadingAction(true);
    try { await doctorApi.approveSecretary(secretaryId); showToast("Secretary approved and assigned!"); fetchSecretaryRequests(); }
    catch(e) { showToast(e.message, "error"); }
    finally { setLoadingAction(false); }
  };

  const handleRejectSecretary = async (secretaryId) => {
    setLoadingAction(true);
    try { await doctorApi.rejectSecretary(secretaryId); showToast("Secretary request rejected."); fetchSecretaryRequests(); }
    catch(e) { showToast(e.message, "error"); }
    finally { setLoadingAction(false); }
  };

  const handleLogout = async () => { try { await logout(); } catch {} finally { navigate("/login"); } };

  const pendingCount = secretaryRequests.filter(r => r.status === "PENDING").length;

  // ── Refresh doctorProfile + AuthContext after any profile save ──────────
  const handleProfileSaved = (msg, updatedProfile) => {
    showToast(msg);
    doctorApi.getProfile()
      .then(d => {
        setDoctorProfile(d);
        if (d?.profilePicture !== undefined) {
          updateUser({ profilePicture: d.profilePicture });
        }
      })
      .catch(() => {});
  };

  return (
    <div style={{fontFamily:"'DM Sans','Segoe UI',sans-serif",minHeight:"100vh",background:"linear-gradient(160deg,#ecfdf5 0%,#d1fae5 30%,#ccfbf1 65%,#e0f2fe 100%)",position:"relative",overflow:"hidden"}}>
      <GlobalStyles/>

      {/* Background Decorations */}
      <div aria-hidden style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        <div style={{position:"absolute",width:700,height:700,borderRadius:"50%",background:"rgba(5,150,105,.09)",filter:"blur(72px)",top:-220,right:-120}}/>
        <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"rgba(8,145,178,.07)",filter:"blur(62px)",bottom:-160,left:-100}}/>
        <div style={{position:"absolute",width:380,height:380,borderRadius:"50%",background:"rgba(16,185,129,.06)",filter:"blur(55px)",bottom:"22%",right:"17%"}}/>
        <div style={{position:"absolute",width:260,height:260,borderRadius:"50%",background:"rgba(245,158,11,.05)",filter:"blur(45px)",top:"38%",left:"8%"}}/>
        <div className="cloud-a" style={{position:"absolute",top:80,left:"6%",opacity:.45}}><Cloud style={{width:240,height:96}}/></div>
        <div className="cloud-b" style={{position:"absolute",top:160,right:"22%",opacity:.28}}><Cloud style={{width:180,height:72}}/></div>
        <div className="cloud-c" style={{position:"absolute",top:50,right:"5%",opacity:.22}}><Cloud style={{width:200,height:80}}/></div>
        <div className="cloud-a" style={{position:"absolute",bottom:"20%",left:"26%",opacity:.18}}><Cloud style={{width:220,height:88}}/></div>
        <div className="float-a" style={{position:"absolute",width:90,height:90,borderRadius:"50%",background:"linear-gradient(135deg,rgba(5,150,105,.18),rgba(8,145,178,.12))",top:"22%",right:"12%",border:"1px solid rgba(255,255,255,.5)"}}/>
        <div className="float-b" style={{position:"absolute",width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,rgba(16,185,129,.2),rgba(5,150,105,.1))",top:"62%",right:"30%",border:"1px solid rgba(255,255,255,.4)"}}/>
        <div className="float-a" style={{position:"absolute",width:36,height:36,borderRadius:"50%",background:"rgba(8,145,178,.15)",top:"42%",left:"4%",border:"1px solid rgba(255,255,255,.35)",animationDelay:"3s"}}/>
      </div>

      <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
        <Navbar
          active={tab}
          onTab={setTab}
          onLogout={handleLogout}
          user={user}
          pendingCount={pendingCount}
          profilePicture={doctorProfile?.profilePicture}
        />
        <Toast toast={toast}/>
        <div style={{flex:1}}>
          {tab==="dashboard"    && <DashboardTab    user={user} appointments={appointments} secretaryRequests={secretaryRequests} onGoTo={setTab}/>}
          {tab==="appointments" && <AppointmentsTab appointments={appointments} onComplete={handleComplete} onCancel={handleCancel} loading={loadingAction}/>}
          {tab==="secretary"    && <SecretaryTab    requests={secretaryRequests} onApprove={handleApproveSecretary} onReject={handleRejectSecretary} loading={loadingAction}/>}
          {tab==="profile"      && <ProfileTab      onSaved={handleProfileSaved}/>}
        </div>
      </div>
    </div>
  );
}
