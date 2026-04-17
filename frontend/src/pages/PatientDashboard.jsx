import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { patientApi, healthTipsApi } from "../services/api";

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
      @keyframes tipFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      .au1{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .04s both}
      .au2{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .12s both}
      .au3{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .20s both}
      .au4{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .28s both}
      .au5{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .36s both}
      .cloud-a{animation:cloudD 9s ease-in-out infinite alternate}
      .cloud-b{animation:cloudD 13s ease-in-out infinite alternate-reverse}
      .cloud-c{animation:cloudD 17s ease-in-out infinite alternate}
      .float-a{animation:floatA 9s ease-in-out infinite}
      .float-b{animation:floatB 7s ease-in-out infinite}
      .shimmer-text{background:linear-gradient(90deg,#2563eb,#7c3aed,#2563eb);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite;}
      .glass{background:rgba(255,255,255,.80);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1.5px solid rgba(255,255,255,.92);border-radius:20px;box-shadow:0 4px 24px rgba(37,99,235,.06);}
      .glass-sm{background:rgba(255,255,255,.82);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1.5px solid rgba(255,255,255,.9);border-radius:16px;box-shadow:0 2px 16px rgba(37,99,235,.05);}
      .stat-card{background:rgba(255,255,255,.82);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1.5px solid rgba(255,255,255,.92);border-radius:20px;padding:22px 16px;box-shadow:0 4px 24px rgba(37,99,235,.07);transition:transform .25s cubic-bezier(.22,1,.36,1),box-shadow .25s;display:flex;flex-direction:column;align-items:center;text-align:center;}
      .stat-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(37,99,235,.13)}
      .appt-card{background:rgba(255,255,255,.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1.5px solid rgba(255,255,255,.95);border-radius:18px;box-shadow:0 2px 16px rgba(37,99,235,.06);transition:transform .22s cubic-bezier(.22,1,.36,1),box-shadow .22s;}
      .appt-card:hover{transform:translateY(-3px);box-shadow:0 12px 36px rgba(37,99,235,.1)}
      .doc-card{background:rgba(255,255,255,.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1.5px solid rgba(255,255,255,.95);border-radius:18px;padding:18px 20px;box-shadow:0 2px 16px rgba(37,99,235,.05);transition:transform .22s,box-shadow .22s;display:flex;flex-direction:column;cursor:pointer;}
      .doc-card:hover{transform:translateY(-3px);box-shadow:0 12px 36px rgba(37,99,235,.1)}
      .tab-btn{display:flex;align-items:center;gap:7px;padding:9px 16px;border-radius:12px;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:600;cursor:pointer;transition:all .2s cubic-bezier(.22,1,.36,1);white-space:nowrap;}
      .tab-btn:hover{background:rgba(255,255,255,.65)}
      .tab-btn.active{background:#fff;color:#2563eb !important;box-shadow:0 2px 12px rgba(37,99,235,.16),0 1px 3px rgba(0,0,0,.06)}
      .btn-primary{display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:12px;border:none;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .22s cubic-bezier(.22,1,.36,1);box-shadow:0 4px 14px rgba(37,99,235,.3);}
      .btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(37,99,235,.4)}
      .btn-primary:active{transform:scale(.98)}
      .btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}
      .btn-ghost{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:11px;border:1.5px solid rgba(226,232,240,.85);background:rgba(255,255,255,.75);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;color:#334155;cursor:pointer;transition:all .2s;}
      .btn-ghost:hover{background:rgba(255,255,255,.95);transform:translateY(-1px)}
      .input-field{width:100%;padding:10px 14px;border-radius:11px;border:1.5px solid rgba(226,232,240,.85);background:rgba(255,255,255,.8);font-family:'DM Sans',sans-serif;font-size:14px;color:#0f172a;outline:none;transition:border-color .2s,box-shadow .2s;}
      .input-field:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.12)}
      select.input-field{cursor:pointer}
      textarea.input-field{resize:vertical}
      .filter-pill{padding:7px 16px;border-radius:100px;border:1.5px solid;font-weight:600;font-size:13px;cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif;}
      .filter-pill:hover{transform:translateY(-1px)}
      .modal-bg{animation:fadeIn .18s ease both}
      .modal-box{animation:fadeUp .28s cubic-bezier(.22,1,.36,1) both}
      .toast-in{animation:slideR .35s cubic-bezier(.22,1,.36,1) both}
      .tip-anim{animation:tipFade .3s ease both}
      .slot-btn{transition:background .15s,border-color .15s,color .15s;}
      .slot-btn:not(:disabled):hover{background:#dbeafe !important;border-color:#2563eb !important;color:#1d4ed8 !important;}
      ::-webkit-scrollbar{width:5px;height:5px}
      ::-webkit-scrollbar-track{background:transparent}
      ::-webkit-scrollbar-thumb{background:rgba(148,163,184,.4);border-radius:5px}
      @media(max-width:860px){
        .top-tabs{display:none !important}.mob-tabs{display:flex !important}
        .two-col{grid-template-columns:1fr !important}
        .four-col{grid-template-columns:repeat(2,1fr) !important}
        .doc-grid{grid-template-columns:repeat(2,1fr) !important}
      }
      @media(max-width:520px){
        .four-col{grid-template-columns:1fr 1fr !important}
        .doc-grid{grid-template-columns:1fr !important}
        .pw{padding:18px 16px 48px !important}
      }
    `}</style>
  </>
);

const Cloud = ({ style }) => (
  <svg viewBox="0 0 200 80" fill="none" style={style}>
    <path d="M170 60H45C28 60 15 47 15 30C15 15 26 4 40 4C42 4 44 4 46 5C50 -1 58 -2 65 2C70 -4 80 -5 88 1C93 -3 101 -3 107 2C114 -2 124 0 128 8C140 6 152 14 154 26C162 26 170 34 170 43V60Z" fill="white" fillOpacity="0.55"/>
  </svg>
);

const Ico = ({size=16,ch})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} dangerouslySetInnerHTML={{__html:ch}}/>;
const HomeIcon   =()=><Ico size={17} ch='<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'/>
const CalIcon    =()=><Ico size={17} ch='<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'/>
const DocIcon    =()=><Ico size={17} ch='<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>'/>
const UserIcon   =()=><Ico size={17} ch='<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'/>
const LogoutIcon =()=><Ico size={15} ch='<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'/>
const PlusIcon   =()=><Ico size={16} ch='<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'/>
const XIcon      =()=><Ico size={16} ch='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'/>
const CheckIcon  =()=><Ico size={14} ch='<polyline points="20 6 9 17 4 12"/>'/>
const LightIcon  =()=><Ico size={18} ch='<line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>'/>
const RefreshIcon=()=><Ico size={14} ch='<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>'/>
const PencilIcon =()=><Ico size={15} ch='<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>'/>
const SaveIcon   =()=><Ico size={15} ch='<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>'/>
const EyeOnIcon  =()=><Ico size={15} ch='<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'/>
const EyeOffIcon =()=><Ico size={15} ch='<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'/>

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
const NoteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={13} height={13} style={{flexShrink:0}}>
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>
  </svg>
);
const StatClipboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>
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
const StatFlagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
);

const C = {
  blue:"#2563eb",  blueDk:"#1d4ed8", blueLt:"#eff6ff", blueBdr:"#bfdbfe",
  amber:"#f59e0b", amberDk:"#d97706",amberLt:"#fffbeb",amberBdr:"#fde68a",
  green:"#059669", greenLt:"#f0fdf4",greenBdr:"#bbf7d0",
  purple:"#7c3aed",purpleLt:"#f5f3ff",purpleBdr:"#ddd6fe",
  red:"#ef4444",   redLt:"#fef2f2",  redBdr:"#fecaca",
  slate:"#0f172a", slateM:"#334155", slateL:"#64748b", slateXL:"#94a3b8",
};

const SB = {
  PENDING:   ["#fef9c3","#854d0e","#fde047"],
  CONFIRMED: [C.greenLt, C.green, C.greenBdr],
  APPROVED:  [C.greenLt, C.green, C.greenBdr],
  COMPLETED: [C.blueLt,  C.blue,  C.blueBdr],
  REJECTED:  [C.redLt,  "#991b1b",C.redBdr],
  CANCELLED: ["#f1f5f9", C.slateL,"#cbd5e1"],
};
const StatusBadge = ({status=""}) => {
  const [bg,color,border] = SB[status?.toUpperCase()] || SB.PENDING;
  return <span style={{background:bg,color,border:`1px solid ${border}`,borderRadius:100,padding:"3px 11px",fontSize:11.5,fontWeight:700,letterSpacing:".02em",whiteSpace:"nowrap"}}>{status}</span>;
};

const getInitials = (fn="",ln="") => `${fn[0]||""}${ln[0]||""}`.toUpperCase();
const DOC_COLORS = ["#2563eb","#7c3aed","#059669","#f59e0b","#ef4444","#0891b2","#db2777","#16a34a"];
const docColor = (id) => DOC_COLORS[(typeof id==="number"?id:0) % DOC_COLORS.length];
const docId = (doc) => doc?.doctorId ?? doc?.id ?? 0;

const DoctorAvatar = ({firstname="",lastname="",color="#2563eb",size=44,profilePicture}) => (
  <div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,background:profilePicture?"#f1f5f9":`linear-gradient(135deg,${color},${color}bb)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:size*.3,boxShadow:`0 3px 10px ${color}40`,overflow:"hidden"}}>
    {profilePicture ? <img src={profilePicture} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : getInitials(firstname,lastname)}
  </div>
);

const Spinner = ({size=22,color=C.blue}) => (
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

const TABS=[
  {key:"home",         label:"Home",         icon:<HomeIcon/>},
  {key:"appointments", label:"Appointments", icon:<CalIcon/>},
  {key:"doctors",      label:"Doctors",      icon:<DocIcon/>},
  {key:"profile",      label:"Profile",      icon:<UserIcon/>},
];

const Navbar = ({active,onTab,onLogout,user}) => {
  const fn = user?.firstname||user?.firstName||"";
  const ln = user?.lastname||user?.lastName||"";
  return (
    <>
      <nav style={{position:"sticky",top:0,zIndex:100,height:64,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",background:"rgba(255,255,255,.72)",backdropFilter:"blur(22px)",WebkitBackdropFilter:"blur(22px)",borderBottom:"1px solid rgba(255,255,255,.78)",boxShadow:"0 1px 0 rgba(37,99,235,.06),0 4px 24px rgba(37,99,235,.05)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{width:36,height:36,borderRadius:11,background:`linear-gradient(135deg,${C.blue},${C.blueDk})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:900,fontSize:17,boxShadow:`0 4px 14px rgba(37,99,235,.32)`}}>M</div>
          <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:17,color:C.slate,letterSpacing:"-.3px"}}>Medi<span style={{color:C.blue}}>Core</span></span>
        </div>
        <div className="top-tabs" style={{display:"flex",gap:4}}>
          {TABS.map(t=>(
            <button key={t.key} className={`tab-btn ${active===t.key?"active":""}`} onClick={()=>onTab(t.key)} style={{color:active===t.key?C.blue:C.slateL}}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${C.blue},${C.blueDk})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:13,boxShadow:`0 3px 10px rgba(37,99,235,.3)`}}>
              {getInitials(fn,ln)||"P"}
            </div>
            <div style={{lineHeight:1.2}}>
              <div style={{fontSize:10.5,color:C.slateXL,fontWeight:600}}>Patient</div>
              <div style={{fontSize:13,fontWeight:700,color:C.slate}}>{fn?`${fn} ${ln}`.trim():"Loading…"}</div>
            </div>
          </div>
          <button className="btn-ghost" onClick={onLogout} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 13px",fontSize:13}}>
            <LogoutIcon/> Logout
          </button>
        </div>
      </nav>
      <div className="mob-tabs" style={{display:"none",gap:4,padding:"8px 12px",background:"rgba(255,255,255,.72)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.7)",overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.key} className={`tab-btn ${active===t.key?"active":""}`} onClick={()=>onTab(t.key)} style={{color:active===t.key?C.blue:C.slateL,fontSize:12,padding:"8px 12px",flexShrink:0}}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>
    </>
  );
};

const BANNER={
  doctors:{title:"Doctor Directory",sub:"Browse available healthcare professionals",emoji:"🩺"},
};
const PageBanner = ({tab}) => {
  const m=BANNER[tab]; if(!m) return null;
  return (
    <div className="au1" style={{padding:"28px 32px 0"}}>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:50,height:50,borderRadius:16,background:`linear-gradient(135deg,${C.blue},${C.blueDk})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:23,boxShadow:`0 6px 22px rgba(37,99,235,.26)`,flexShrink:0}}>{m.emoji}</div>
        <div>
          <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:900,color:C.slate,letterSpacing:"-.4px",lineHeight:1.1}}>{m.title}</h1>
          <p style={{fontSize:13.5,color:C.slateL,marginTop:3,fontWeight:500}}>{m.sub}</p>
        </div>
      </div>
    </div>
  );
};

// ── Time slot helpers ─────────────────────────────────────────────────────
const ALL_SLOTS = [
  "08:00 AM","09:00 AM","10:00 AM","11:00 AM",
  "01:00 PM","02:00 PM","03:00 PM","04:00 PM",
];

function slotToMinutes(slot) {
  const parts = slot.trim().split(" ");
  const meridiem = parts[1]?.toUpperCase();
  let [h, m] = parts[0].split(":").map(Number);
  if (meridiem === "PM" && h !== 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

// ── BookModal ─────────────────────────────────────────────────────────────
const BookModal = ({doctors, onSuccess, onClose, preselectedDoctor = null}) => {
  const [step,       setStep]       = useState(preselectedDoctor ? 2 : 1);
  const [sel,        setSel]        = useState(preselectedDoctor);
  const [date,       setDate]       = useState("");
  const [time,       setTime]       = useState("");
  const [reason,     setReason]     = useState("");
  const [busy,       setBusy]       = useState(false);
  const [err,        setErr]        = useState("");
  const [takenSlots, setTakenSlots] = useState([]);
  const [loadSlots,  setLoadSlots]  = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const normalize = (s) => s?.trim().replace(/\s+/g," ").toUpperCase() || "";

  // Fetch taken slots whenever doctor + date change
  useEffect(() => {
    if (!sel || !date) { setTakenSlots([]); return; }
    (async () => {
      setLoadSlots(true);
      try {
        const taken = await patientApi.getTakenSlots(docId(sel), date);
        setTakenSlots(Array.isArray(taken) ? taken : []);
      } catch {
        setTakenSlots([]);
      } finally {
        setLoadSlots(false);
      }
    })();
  }, [sel, date]);

  const getSlotState = (slot) => {
    const slotNorm = normalize(slot);
    if (takenSlots.some(t => normalize(t) === slotNorm)) return "taken";
    if (date === today) {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      if (slotToMinutes(slot) <= nowMinutes) return "past";
    }
    return "available";
  };

  // Clear selected time if it becomes unavailable
  useEffect(() => {
    if (time && getSlotState(time) !== "available") setTime("");
  }, [takenSlots, date]);

  const submit = async () => {
    if (!sel || !date || !time || !reason.trim()) {
      setErr("Please fill in all required fields."); return;
    }
    setBusy(true); setErr("");
    try {
      await patientApi.bookAppointment({
        doctor_id:        docId(sel),
        requested_date:   date,
        requested_time:   time,
        reason_for_visit: reason.trim(),
      });
      onSuccess("Appointment submitted! Status: Pending — awaiting secretary approval.");
    } catch(e) {
      setErr(e.message || "Failed to submit appointment. Please try again.");
    } finally { setBusy(false); }
  };

  return (
    <div className="modal-bg" style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(15,23,42,.48)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)",padding:16}}>
      <div className="modal-box" style={{background:"#fff",borderRadius:24,padding:32,maxWidth:540,width:"100%",boxShadow:"0 32px 80px rgba(0,0,0,.22)",maxHeight:"90vh",overflowY:"auto"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:900,color:C.slate}}>Book an Appointment</h2>
            <p style={{fontSize:12.5,color:C.slateL,marginTop:3}}>Fill in the details below to schedule your appointment</p>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{padding:"7px",flexShrink:0}}><XIcon/></button>
        </div>

        {/* Progress bar */}
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {[1,2].map(s=>(
            <div key={s} style={{flex:1,height:4,borderRadius:99,background:step>=s?`linear-gradient(90deg,${C.blue},${C.purple})`:"rgba(226,232,240,.7)",transition:"background .3s"}}/>
          ))}
        </div>

        {err && <ErrBanner msg={err}/>}

        {/* Step 1 — Select Doctor */}
        {step===1 && (
          <>
            <p style={{fontSize:13.5,fontWeight:700,color:C.slateM,marginBottom:12}}>Select a Doctor</p>
            {doctors.length===0
              ? <div style={{padding:24,textAlign:"center",color:C.slateXL,fontSize:13}}>No doctors available at the moment.</div>
              : <div style={{display:"flex",flexDirection:"column",gap:10,maxHeight:340,overflowY:"auto",paddingRight:4}}>
                  {doctors.map(doc=>{
                    const fn=doc.firstName||doc.firstname||"";
                    const ln=doc.lastName||doc.lastname||"";
                    const id=docId(doc);
                    const color=docColor(id);
                    const isSelected = sel && docId(sel)===id;
                    return (
                      <div key={id} onClick={()=>{setSel(doc);setDate("");setTime("");setTakenSlots([]);}}
                        style={{display:"flex",alignItems:"center",gap:14,padding:"13px 16px",borderRadius:14,border:`2px solid ${isSelected?C.blue:"rgba(226,232,240,.7)"}`,background:isSelected?C.blueLt:"rgba(248,250,252,.8)",cursor:"pointer",transition:"all .18s"}}>
                        <DoctorAvatar firstname={fn} lastname={ln} color={color} size={44} profilePicture={doc.profilePicture}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:14.5,color:C.slate}}>Dr. {fn} {ln}</div>
                          <div style={{fontSize:12.5,color:C.slateL,marginTop:2}}>{doc.specialization}</div>
                        </div>
                        {isSelected&&<div style={{width:22,height:22,borderRadius:"50%",background:`linear-gradient(135deg,${C.blue},${C.blueDk})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",flexShrink:0}}><CheckIcon/></div>}
                      </div>
                    );
                  })}
                </div>
            }
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button className="btn-ghost" onClick={onClose} style={{flex:1,justifyContent:"center",padding:"11px"}}>Cancel</button>
              <button className="btn-primary" onClick={()=>{setErr("");setStep(2);}} disabled={!sel} style={{flex:1,justifyContent:"center"}}>Next →</button>
            </div>
          </>
        )}

        {/* Step 2 — Date, Time, Reason */}
        {step===2 && (
          <>
            {sel && (
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:14,background:C.blueLt,border:`1px solid ${C.blueBdr}`,marginBottom:18}}>
                <DoctorAvatar firstname={sel.firstName||sel.firstname||""} lastname={sel.lastName||sel.lastname||""} color={docColor(docId(sel))} size={40} profilePicture={sel.profilePicture}/>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:14,color:C.slate}}>Dr. {sel.firstName||sel.firstname||""} {sel.lastName||sel.lastname||""}</div>
                  <div style={{fontSize:12,color:C.blue,fontWeight:600}}>{sel.specialization}</div>
                </div>
                <button onClick={()=>{setSel(null);setStep(1);setDate("");setTime("");setTakenSlots([]);}} style={{fontSize:12,color:C.blue,background:"none",border:"none",cursor:"pointer",fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Change</button>
              </div>
            )}

            <div style={{display:"flex",flexDirection:"column",gap:15}}>
              {/* Date */}
              <div>
                <label style={{fontSize:13,fontWeight:700,color:C.slateM,display:"block",marginBottom:6}}>
                  Requested Date <span style={{color:C.red}}>*</span>
                </label>
                <input type="date" className="input-field" min={today} value={date}
                  onChange={e=>{ setDate(e.target.value); setTime(""); }}/>
              </div>

              {/* Time slots */}
              <div>
                <label style={{fontSize:13,fontWeight:700,color:C.slateM,display:"block",marginBottom:8}}>
                  Requested Time <span style={{color:C.red}}>*</span>
                </label>
                {!date ? (
                  <div style={{fontSize:13,color:C.slateXL,padding:"8px 0",fontStyle:"italic"}}>
                    Please select a date first.
                  </div>
                ) : loadSlots ? (
                  <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 0",color:C.slateL,fontSize:13}}>
                    <Spinner size={16} color={C.blue}/> Checking availability…
                  </div>
                ) : (
                  <>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                      {ALL_SLOTS.map(slot=>{
                        const state      = getSlotState(slot);
                        const isSelected = time === slot;
                        const isUnavailable = state === "taken" || state === "past";

                        const bg     = isSelected     ? C.blue    : isUnavailable ? "#f1f5f9" : "#fff";
                        const border = isSelected     ? C.blue    : isUnavailable ? "#e2e8f0" : "#d1d5db";
                        const color  = isSelected     ? "#fff"    : isUnavailable ? "#cbd5e1" : C.slateM;
                        const cursor = isUnavailable  ? "not-allowed" : "pointer";

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isUnavailable}
                            onClick={()=>!isUnavailable && setTime(slot)}
                            className={isUnavailable ? "" : "slot-btn"}
                            style={{
                              padding:"11px 4px",
                              borderRadius:10,
                              border:`1.5px solid ${border}`,
                              background:bg,
                              color,
                              fontSize:12.5,
                              fontWeight:isSelected ? 700 : 500,
                              cursor,
                              fontFamily:"'DM Sans',sans-serif",
                              opacity:isUnavailable ? 0.45 : 1,
                              pointerEvents:isUnavailable ? "none" : "auto",
                            }}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                    {!time && (
                      <p style={{fontSize:12,color:C.amber,marginTop:8,fontWeight:600}}>
                        ⚠️ Please select an available time slot.
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Reason */}
              <div>
                <label style={{fontSize:13,fontWeight:700,color:C.slateM,display:"block",marginBottom:6}}>
                  Reason for Visit <span style={{color:C.red}}>*</span>
                </label>
                <textarea className="input-field" rows={4} maxLength={500}
                  placeholder="Please describe your symptoms or reason for visit…"
                  value={reason} onChange={e=>setReason(e.target.value)}/>
                <p style={{fontSize:11.5,color:reason.length>450?C.amber:C.slateXL,marginTop:4,textAlign:"right"}}>{reason.length}/500</p>
              </div>
            </div>

            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button className="btn-ghost" onClick={()=>{setErr("");setStep(1);}} style={{flex:1,justifyContent:"center",padding:"11px"}}>← Back</button>
              <button className="btn-primary" onClick={submit} disabled={busy||!date||!time||!reason.trim()} style={{flex:1,justifyContent:"center",gap:8}}>
                {busy?<><Spinner size={16} color="#fff"/> Submitting…</>:<>Submit Appointment ✓</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Doctor Profile Modal ──────────────────────────────────────────────────
const DoctorProfileModal = ({ doc, onClose, onBook }) => {
  if (!doc) return null;
  const fn    = doc.firstName || doc.firstname || "";
  const ln    = doc.lastName  || doc.lastname  || "";
  const id    = docId(doc);
  const color = docColor(id);
  const yoe   = doc.yearsOfExperience || doc.years_of_experience;
  const bio   = doc.bio || doc.biography;

  return (
    <div className="modal-bg" style={{position:"fixed",inset:0,zIndex:1001,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)",padding:16}}>
      <div className="modal-box" style={{background:"#fff",borderRadius:24,maxWidth:480,width:"100%",boxShadow:"0 32px 80px rgba(0,0,0,.22)",overflow:"hidden",maxHeight:"90vh",display:"flex",flexDirection:"column"}}>

        {/* Banner */}
        <div style={{background:`linear-gradient(135deg,${color},${color}cc)`,padding:"28px 28px 24px",position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,.2)",border:"none",borderRadius:"50%",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff"}}>
            <XIcon/>
          </button>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <DoctorAvatar firstname={fn} lastname={ln} color={color} size={68} profilePicture={doc.profilePicture}/>
            <div>
              <div style={{color:"rgba(255,255,255,.75)",fontSize:11,fontWeight:700,letterSpacing:.8,marginBottom:3}}>DOCTOR PROFILE</div>
              <div style={{color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:900,fontSize:20,lineHeight:1.2}}>Dr. {fn} {ln}</div>
              <div style={{color:"rgba(255,255,255,.85)",fontSize:13,marginTop:4,fontWeight:600}}>{doc.specialization || "General Practitioner"}</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{padding:"24px 28px",overflowY:"auto",flex:1}}>

          {/* Stats row */}
          {yoe && (
            <div style={{display:"flex",gap:12,marginBottom:20}}>
              <div style={{flex:1,background:C.blueLt,borderRadius:12,padding:"12px 16px",border:`1px solid ${C.blueBdr}`}}>
                <div style={{fontSize:11,fontWeight:700,color:C.blue,marginBottom:3}}>EXPERIENCE</div>
                <div style={{fontSize:18,fontWeight:800,color:C.slate}}>{yoe} <span style={{fontSize:13,fontWeight:500,color:C.slateL}}>years</span></div>
              </div>
              <div style={{flex:1,background:C.greenLt,borderRadius:12,padding:"12px 16px",border:`1px solid ${C.greenBdr}`}}>
                <div style={{fontSize:11,fontWeight:700,color:C.green,marginBottom:3}}>SPECIALIZATION</div>
                <div style={{fontSize:13,fontWeight:700,color:C.slate,lineHeight:1.3}}>{doc.specialization || "—"}</div>
              </div>
            </div>
          )}

          {/* Bio */}
          {bio ? (
            <div style={{marginBottom:20}}>
              <div style={{fontSize:11.5,fontWeight:700,color:C.slateXL,letterSpacing:.6,marginBottom:8}}>ABOUT</div>
              <p style={{fontSize:14,color:C.slateM,lineHeight:1.75,fontWeight:400}}>{bio}</p>
            </div>
          ) : (
            <div style={{marginBottom:20,padding:"16px",background:"#f8fafc",borderRadius:12,textAlign:"center"}}>
              <p style={{fontSize:13.5,color:C.slateXL,fontStyle:"italic"}}>No biography provided.</p>
            </div>
          )}

          {/* Book button */}
          <button
            className="btn-primary"
            onClick={()=>{ onClose(); onBook(doc); }}
            style={{width:"100%",justifyContent:"center",padding:"13px",fontSize:15}}
          >
            <PlusIcon/> Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

const apptDate     = a => a.requested_date  || a.requestedDate  || "";
const apptTime     = a => a.requested_time  || a.requestedTime  || "";
const apptReason   = a => a.reason_for_visit|| a.reasonForVisit || "";
const apptStatus   = a => (a.status||"").toUpperCase();
const apptDoctorFn   = a => a.doctor?.firstName || a.doctor?.firstname || "";
const apptDoctorLn   = a => a.doctor?.lastName  || a.doctor?.lastname  || "";
const apptDoctorSpec = a => a.doctor?.specialization || "";
const apptDoctorPic  = a => a.doctor?.profilePicture || null;

const HomeTab = ({user,appts,apptLoad,apptErr,onBook,onGoTo,onRetryAppts,tips,tipsLoad,tipsErr,onRetryTips}) => {
  const [tipIdx,setTipIdx] = useState(0);
  const [tipKey,setTipKey] = useState(0);
  const nextTip = () => { setTipIdx(i=>(i+1)%(tips.length||1)); setTipKey(k=>k+1); };
  const upcoming = appts.filter(a=>["PENDING","CONFIRMED"].includes(apptStatus(a))).slice(0,4);
  const counts = {
    total:     appts.length,
    confirmed: appts.filter(a=>apptStatus(a)==="CONFIRMED").length,
    pending:   appts.filter(a=>apptStatus(a)==="PENDING").length,
    completed: appts.filter(a=>apptStatus(a)==="COMPLETED").length,
  };
  const name = user?.firstname||user?.firstName||"there";
  const statCards = [
    { label:"Total Appointments",     val:counts.total,     grad:`linear-gradient(135deg,${C.blue},${C.blueDk})`,  icon:<StatClipboardIcon/> },
    { label:"Confirmed Appointments", val:counts.confirmed, grad:`linear-gradient(135deg,${C.green},#047857)`,      icon:<StatCheckIcon/>     },
    { label:"Pending Appointments",   val:counts.pending,   grad:`linear-gradient(135deg,${C.amber},${C.amberDk})`, icon:<StatClockIcon/>     },
    { label:"Completed Appointments", val:counts.completed, grad:`linear-gradient(135deg,${C.purple},#7e22ce)`,     icon:<StatFlagIcon/>      },
  ];
  return (
    <div className="pw" style={{padding:"0 32px 56px",maxWidth:1120,margin:"0 auto"}}>
      <div className="au1" style={{padding:"36px 0 26px"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:20}}>
          <div>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:"clamp(1.6rem,4vw,2.2rem)",fontWeight:900,color:C.slate,lineHeight:1.15,marginBottom:8}}>
              Welcome back, <span className="shimmer-text">{name}!</span>
            </h1>
            <p style={{fontSize:15,color:C.slateL,fontWeight:500,maxWidth:480}}>Manage your appointments and explore our network of healthcare professionals.</p>
          </div>
          <button className="btn-primary" onClick={()=>onBook(null)} style={{fontSize:15,padding:"13px 26px",flexShrink:0}}><PlusIcon/> Book New Appointment</button>
        </div>
      </div>
      <div className="four-col au2" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
        {statCards.map((s,i)=>(
          <div key={i} className="stat-card" style={{animationDelay:`${i*.06}s`}}>
            <div style={{width:44,height:44,borderRadius:13,background:s.grad,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14,boxShadow:"0 3px 12px rgba(0,0,0,.12)"}}>
              {s.icon}
            </div>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:32,fontWeight:900,color:C.slate,lineHeight:1,marginBottom:6}}>
              {apptLoad ? <Spinner size={22}/> : s.val}
            </div>
            <div style={{fontSize:12.5,color:C.slateL,fontWeight:600}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="au3" style={{marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:17,fontWeight:900,color:C.slate}}>Appointments</h2>
            <p style={{fontSize:12.5,color:C.slateL,marginTop:2}}>Track and manage your scheduled appointments</p>
          </div>
          <button onClick={()=>onGoTo("appointments")} style={{fontSize:12,color:C.amberDk,background:C.amberLt,border:`1px solid ${C.amberBdr}`,padding:"5px 14px",borderRadius:100,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>View all →</button>
        </div>
        {apptErr && <ErrBanner msg={apptErr} onRetry={onRetryAppts}/>}
        {apptLoad ? (
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:40,gap:10,color:C.slateL,fontSize:14,fontWeight:600}}><Spinner/> Loading appointments…</div>
        ) : upcoming.length===0 ? (
          <div className="glass" style={{padding:40,textAlign:"center",color:C.slateXL,fontSize:14}}>
            <div style={{fontSize:36,marginBottom:10}}>📭</div>
            No upcoming appointments.{" "}
            <button onClick={()=>onBook(null)} style={{color:C.blue,background:"none",border:"none",cursor:"pointer",fontWeight:700,fontSize:14,fontFamily:"'DM Sans',sans-serif"}}>Book one now →</button>
          </div>
        ) : (
          <div className="two-col" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
            {upcoming.map(a=>{
              const color=docColor(a.doctor?.doctorId??a.doctor?.id??0);
              return (
                <div key={a.id} className="appt-card" style={{padding:"18px 20px"}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:13,marginBottom:14}}>
                    <DoctorAvatar firstname={apptDoctorFn(a)} lastname={apptDoctorLn(a)} color={color} size={46} profilePicture={apptDoctorPic(a)}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,color:C.slate}}>Dr. {apptDoctorFn(a)} {apptDoctorLn(a)}</div>
                      <div style={{fontSize:12.5,color:C.slateL,marginTop:2}}>{apptDoctorSpec(a)}</div>
                    </div>
                    <StatusBadge status={a.status}/>
                  </div>
                  <div style={{display:"flex",gap:16,marginBottom:14,flexWrap:"wrap"}}>
                    <span style={{fontSize:13,color:C.slateM,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
                      <DateIcon/>{apptDate(a)?new Date(apptDate(a)).toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"}):"—"}
                    </span>
                    <span style={{fontSize:13,color:C.slateM,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
                      <TimeIcon/>{apptTime(a)||"—"}
                    </span>
                  </div>
                  <button className="btn-primary" onClick={()=>onGoTo("appointments")} style={{width:"100%",justifyContent:"center",padding:"9px",fontSize:13}}>View Details</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="au4">
        <div className="glass" style={{padding:"22px 24px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,borderRadius:14,background:`linear-gradient(135deg,${C.green},#047857)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",boxShadow:`0 4px 14px rgba(5,150,105,.28)`}}><LightIcon/></div>
              <div>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,color:C.slate}}>Health Tip of the Day</div>
                <div style={{fontSize:12,color:C.slateL}}>Daily nutrition and wellness advice</div>
              </div>
            </div>
            {tips.length>0&&<button className="btn-ghost" onClick={nextTip} disabled={tipsLoad} style={{display:"flex",alignItems:"center",gap:6,fontSize:12.5,color:C.green,background:C.greenLt,border:`1px solid ${C.greenBdr}`,padding:"7px 14px"}}><RefreshIcon/> New Tip</button>}
          </div>
          {tipsLoad ? (
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",color:C.slateL,fontSize:13}}><Spinner size={16} color={C.green}/> Loading health tips…</div>
          ) : tipsErr ? (
            <div style={{borderLeft:`3px solid ${C.amber}`,paddingLeft:16}}>
              <p style={{fontSize:13.5,color:C.slateL}}>Unable to load health tips right now.</p>
              <button className="btn-ghost" onClick={onRetryTips} style={{marginTop:8,fontSize:12,color:C.amber,borderColor:C.amberBdr,padding:"5px 12px"}}><RefreshIcon/> Retry</button>
            </div>
          ) : tips.length>0 ? (
            <>
              <div className="tip-anim" key={tipKey} style={{borderLeft:`3px solid ${C.green}`,paddingLeft:16}}>
                <p style={{fontSize:14.5,color:C.slateM,lineHeight:1.7,fontWeight:500}}>{tips[tipIdx]}</p>
              </div>
              <div style={{fontSize:11.5,color:C.slateXL,marginTop:10}}>Powered by external Health Tips API</div>
              <div style={{display:"flex",gap:5,marginTop:8}}>
                {tips.slice(0,8).map((_,i)=>(
                  <div key={i} onClick={()=>{setTipIdx(i);setTipKey(k=>k+1);}} style={{width:i===tipIdx?20:6,height:6,borderRadius:99,background:i===tipIdx?C.green:"rgba(5,150,105,.2)",cursor:"pointer",transition:"all .3s"}}/>
                ))}
              </div>
            </>
          ) : (
            <p style={{fontSize:13.5,color:C.slateXL,fontStyle:"italic"}}>No health tips available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const AppointmentsTab = ({appts,loading,error,onBook,onRetry}) => {
  const [filter,setFilter] = useState("ALL");
  const list = filter==="ALL" ? appts : appts.filter(a=>apptStatus(a)===filter);
  return (
    <div className="pw" style={{padding:"24px 32px 56px",maxWidth:1120,margin:"0 auto"}}>
      <div className="au2" style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
        {["ALL","PENDING","CONFIRMED","COMPLETED","CANCELLED","REJECTED"].map(f=>(
          <button key={f} className="filter-pill" onClick={()=>setFilter(f)} style={{borderColor:filter===f?C.blue:"rgba(226,232,240,.8)",background:filter===f?C.blueLt:"rgba(255,255,255,.72)",color:filter===f?C.blue:C.slateL}}>{f}</button>
        ))}
        <button className="btn-primary" onClick={()=>onBook(null)} style={{marginLeft:"auto",padding:"8px 18px",fontSize:13}}><PlusIcon/> Book New</button>
      </div>
      {error && <ErrBanner msg={error} onRetry={onRetry}/>}
      {loading ? (
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:60,gap:10,color:C.slateL,fontSize:14,fontWeight:600}}><Spinner/> Loading appointments…</div>
      ) : list.length===0 ? (
        <div className="glass" style={{padding:56,textAlign:"center",color:C.slateXL,fontSize:14}}><div style={{fontSize:36,marginBottom:10}}>📭</div>No {filter==="ALL"?"":filter.toLowerCase()} appointments found.</div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {list.map((a,i)=>{
            const color=docColor(a.doctor?.doctorId??a.doctor?.id??0);
            const st=apptStatus(a);
            return (
              <div key={a.id} className="appt-card au3" style={{padding:"18px 22px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",animationDelay:`${i*.05}s`}}>
                <DoctorAvatar firstname={apptDoctorFn(a)} lastname={apptDoctorLn(a)} color={color} size={50} profilePicture={apptDoctorPic(a)}/>
                <div style={{flex:1,minWidth:180}}>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15.5,color:C.slate}}>Dr. {apptDoctorFn(a)} {apptDoctorLn(a)}</div>
                  <div style={{fontSize:13,color:C.slateL,marginTop:2}}>{apptDoctorSpec(a)}</div>
                  <div style={{display:"flex",gap:16,marginTop:6,flexWrap:"wrap"}}>
                    <span style={{fontSize:12.5,color:C.slateM,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
                      <DateIcon/>{apptDate(a)?new Date(apptDate(a)).toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"}):"—"}
                    </span>
                    <span style={{fontSize:12.5,color:C.slateM,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
                      <TimeIcon/>{apptTime(a)||"—"}
                    </span>
                  </div>
                  {apptReason(a)&&(
                    <div style={{fontSize:12,color:C.slateXL,marginTop:5,display:"flex",gap:5,alignItems:"flex-start"}}>
                      <NoteIcon/>
                      <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:320}}>{apptReason(a)}</span>
                    </div>
                  )}
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
                  <StatusBadge status={a.status}/>
                  {st==="PENDING"   &&<span style={{fontSize:11.5,color:C.amber,fontWeight:600,background:C.amberLt,border:`1px solid ${C.amberBdr}`,padding:"4px 10px",borderRadius:8}}>⏳ Awaiting secretary approval</span>}
                  {st==="CONFIRMED" &&<span style={{fontSize:11.5,color:C.green,fontWeight:600,background:C.greenLt,border:`1px solid ${C.greenBdr}`,padding:"4px 10px",borderRadius:8}}>✓ Appointment confirmed</span>}
                  {st==="COMPLETED" &&<span style={{fontSize:11.5,color:C.blue,fontWeight:600,background:C.blueLt,border:`1px solid ${C.blueBdr}`,padding:"4px 10px",borderRadius:8}}>✓ Consultation completed</span>}
                  {st==="CANCELLED" &&<span style={{fontSize:11.5,color:C.slateL,fontWeight:600,background:"#f1f5f9",border:"1px solid #cbd5e1",padding:"4px 10px",borderRadius:8}}>✗ Appointment cancelled{a.cancelReason?` — ${a.cancelReason}`:""}</span>}
                  {st==="REJECTED"  &&<span style={{fontSize:11.5,color:"#991b1b",fontWeight:600,background:C.redLt,border:`1px solid ${C.redBdr}`,padding:"4px 10px",borderRadius:8}}>✗ Not approved{a.rejectedReason?` — ${a.rejectedReason}`:""}</span>}
                  {st==="COMPLETED"&&a.doctorNotes&&(
                    <div style={{fontSize:11.5,color:C.slateL,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"4px 10px",maxWidth:260}}>
                      📝 {a.doctorNotes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── UPDATED DoctorsTab: click card → open profile modal ──────────────────
const DoctorsTab = ({doctors,loading,error,onBook,onRetry}) => {
  const [search,   setSearch]   = useState("");
  const [spec,     setSpec]     = useState("All");
  const [viewDoc,  setViewDoc]  = useState(null);

  const specs = ["All",...new Set(doctors.map(d=>d.specialization).filter(Boolean))];
  const list  = doctors.filter(d=>{
    const fn=d.firstName||d.firstname||"";
    const ln=d.lastName||d.lastname||"";
    return (spec==="All"||d.specialization===spec) && `${fn} ${ln}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      {/* Doctor profile modal */}
      {viewDoc && (
        <DoctorProfileModal
          doc={viewDoc}
          onClose={()=>setViewDoc(null)}
          onBook={(doc)=>{ setViewDoc(null); onBook(doc); }}
        />
      )}

      <div className="pw" style={{padding:"24px 32px 56px",maxWidth:1120,margin:"0 auto"}}>
        <div className="au2" style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{position:"relative",flex:"1 1 220px",maxWidth:320}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:C.slateXL,pointerEvents:"none",fontSize:14}}>🔍</span>
            <input className="input-field" placeholder="Search doctors…" value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:36}}/>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {specs.map(s=>(
              <button key={s} className="filter-pill" onClick={()=>setSpec(s)} style={{borderColor:spec===s?C.blue:"rgba(226,232,240,.8)",background:spec===s?C.blueLt:"rgba(255,255,255,.72)",color:spec===s?C.blue:C.slateL,fontSize:12}}>{s}</button>
            ))}
          </div>
        </div>
        {error && <ErrBanner msg={error} onRetry={onRetry}/>}
        {loading ? (
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:60,gap:10,color:C.slateL,fontSize:14,fontWeight:600}}><Spinner/> Loading doctors…</div>
        ) : (
          <div className="doc-grid au3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {list.map((doc,i)=>{
              const fn=doc.firstName||doc.firstname||"";
              const ln=doc.lastName||doc.lastname||"";
              const id=docId(doc);
              const color=docColor(id);
              const yoe = doc.yearsOfExperience || doc.years_of_experience;
              const bio = doc.bio || doc.biography;
              return (
                <div key={id} className="doc-card" style={{animationDelay:`${i*.05}s`}}
                  onClick={()=>setViewDoc(doc)}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:13,marginBottom:12}}>
                    <DoctorAvatar firstname={fn} lastname={ln} color={color} size={50} profilePicture={doc.profilePicture}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:14.5,color:C.slate,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Dr. {fn} {ln}</div>
                      <div style={{fontSize:12.5,color:C.slateL,marginTop:2}}>{doc.specialization||"General Practitioner"}</div>
                      {yoe&&(
                        <div style={{fontSize:11.5,color:C.slateXL,marginTop:5,display:"flex",alignItems:"center",gap:5}}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={11} height={11}>
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                          </svg>
                          <span>{yoe} yr{yoe!==1?"s":""} experience</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {bio?(
                    <p style={{fontSize:12.5,color:C.slateM,lineHeight:1.65,marginBottom:14,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",flexGrow:1}}>{bio}</p>
                  ):(
                    <div style={{flexGrow:1}}/>
                  )}
                  {doc.status&&doc.status!=="APPROVED"&&<div style={{marginBottom:10}}><StatusBadge status={doc.status}/></div>}
                  <div style={{display:"flex",gap:8,marginTop:"auto"}}>
                    <button className="btn-ghost" onClick={e=>{e.stopPropagation();setViewDoc(doc);}} style={{flex:1,justifyContent:"center",padding:"9px",fontSize:13}}>
                      View Profile
                    </button>
                    <button className="btn-primary" onClick={e=>{e.stopPropagation();onBook(doc);}} style={{flex:1,justifyContent:"center",padding:"9px",fontSize:13}}>
                      Book
                    </button>
                  </div>
                </div>
              );
            })}
            {list.length===0&&!loading&&(
              <div className="glass" style={{gridColumn:"1/-1",padding:40,textAlign:"center",color:C.slateXL,fontSize:14}}>
                <div style={{fontSize:32,marginBottom:8}}>🔍</div>No doctors found.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

const ProfileTab = ({ user }) => {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [fetchErr, setFetchErr] = useState("");
  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [saveErr, setSaveErr]   = useState("");
  const [saveOk,  setSaveOk]    = useState(false);
  const [form, setForm] = useState({
    firstName:"", lastName:"", phoneNumber:"",
    dateOfBirth:"", gender:"", address:"",
    currentPassword:"", newPassword:"", confirmPassword:"",
  });
  const [showPw, setShowPw] = useState({ cur:false, new:false, con:false });

  useEffect(() => {
    (async () => {
      setLoading(true); setFetchErr("");
      try {
        const data = await patientApi.getProfile();
        setProfile(data);
        setForm({
          firstName: data.firstName||"", lastName: data.lastName||"",
          phoneNumber: data.phoneNumber||"", dateOfBirth: data.dateOfBirth||"",
          gender: data.gender||"", address: data.address||"",
          currentPassword:"", newPassword:"", confirmPassword:"",
        });
      } catch(e) { setFetchErr(e.message||"Failed to load profile."); }
      finally { setLoading(false); }
    })();
  }, []);

  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));
  const cancelEdit = () => {
    setSaveErr("");
    setForm(f=>({...f,firstName:profile.firstName||"",lastName:profile.lastName||"",phoneNumber:profile.phoneNumber||"",dateOfBirth:profile.dateOfBirth||"",gender:profile.gender||"",address:profile.address||"",currentPassword:"",newPassword:"",confirmPassword:""}));
    setEditing(false);
  };
  const handleSave = async () => {
    setSaveErr(""); setSaveOk(false);
    if (!form.firstName.trim()||!form.lastName.trim()){setSaveErr("First name and last name are required.");return;}
    if (form.newPassword&&form.newPassword!==form.confirmPassword){setSaveErr("New passwords do not match.");return;}
    if (form.newPassword&&form.newPassword.length<8){setSaveErr("New password must be at least 8 characters.");return;}
    if (form.newPassword&&!form.currentPassword){setSaveErr("Please enter your current password to set a new one.");return;}
    setSaving(true);
    try {
      const payload={firstName:form.firstName.trim(),lastName:form.lastName.trim(),phoneNumber:form.phoneNumber.trim(),dateOfBirth:form.dateOfBirth||null,gender:form.gender||null,address:form.address.trim()||null,...(form.newPassword?{currentPassword:form.currentPassword,newPassword:form.newPassword}:{})};
      const updated = await patientApi.updateProfile(payload);
      setProfile(updated); setEditing(false); setSaveOk(true);
      setTimeout(()=>setSaveOk(false),3500);
      setForm(f=>({...f,currentPassword:"",newPassword:"",confirmPassword:""}));
    } catch(e) { setSaveErr(e.message||"Failed to save changes."); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:80,gap:10,color:C.slateL,fontSize:14,fontWeight:600}}><Spinner/> Loading profile…</div>;
  if (fetchErr) return (
    <div style={{padding:"32px",maxWidth:760,margin:"0 auto"}}>
      <div style={{background:C.redLt,border:`1.5px solid ${C.redBdr}`,borderRadius:14,padding:"16px 20px",color:"#991b1b",fontWeight:600,fontSize:13.5,display:"flex",alignItems:"center",gap:10}}>
        ⚠️ {fetchErr}<button onClick={()=>window.location.reload()} style={{marginLeft:12,background:"none",border:"none",color:C.blue,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13}}>Retry</button>
      </div>
    </div>
  );

  const fn=profile?.firstName||""; const ln=profile?.lastName||"";
  const FieldRow=({label,value,last=false})=>(
    <div style={{padding:"13px 0",borderBottom:last?"none":"1px solid rgba(226,232,240,.5)"}}>
      <div style={{fontSize:11,fontWeight:700,color:C.slateXL,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>{label}</div>
      <div style={{fontSize:14.5,color:C.slateM,fontWeight:500}}>{value||<span style={{color:C.slateXL,fontStyle:"italic"}}>Not provided</span>}</div>
    </div>
  );
  const EditField=({label,children,hint})=>(
    <div>
      <label style={{fontSize:12.5,fontWeight:700,color:C.slateM,display:"block",marginBottom:6}}>{label}</label>
      {children}
      {hint&&<p style={{fontSize:11.5,color:C.slateXL,marginTop:4}}>{hint}</p>}
    </div>
  );

  return (
    <div className="pw" style={{padding:"24px 32px 56px",maxWidth:760,margin:"0 auto"}}>
      {saveOk&&<div className="au1" style={{background:C.greenLt,border:`1.5px solid ${C.greenBdr}`,borderRadius:14,padding:"12px 18px",display:"flex",alignItems:"center",gap:10,marginBottom:16,color:"#166534",fontWeight:700,fontSize:13.5}}>✅ Profile updated successfully!</div>}
      <div className="glass au2" style={{padding:"28px 32px",marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:24,flexWrap:"wrap"}}>
          <div style={{width:78,height:78,borderRadius:"50%",background:`linear-gradient(135deg,${C.blue},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:900,fontSize:26,boxShadow:`0 6px 20px rgba(37,99,235,.28)`,flexShrink:0}}>{getInitials(fn,ln)||"P"}</div>
          <div style={{flex:1,minWidth:160}}>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:21,fontWeight:900,color:C.slate}}>{fn} {ln}</div>
            <div style={{fontSize:13.5,color:C.slateL,marginTop:2}}>{profile?.email}</div>
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <span style={{background:C.blueLt,color:C.blue,border:`1px solid ${C.blueBdr}`,borderRadius:100,padding:"3px 11px",fontSize:11.5,fontWeight:700}}>Patient</span>
              <span style={{background:profile?.status==="ACTIVE"?C.greenLt:"#f1f5f9",color:profile?.status==="ACTIVE"?C.green:C.slateL,border:`1px solid ${profile?.status==="ACTIVE"?C.greenBdr:"#cbd5e1"}`,borderRadius:100,padding:"3px 11px",fontSize:11.5,fontWeight:700}}>{profile?.status||"ACTIVE"}</span>
            </div>
          </div>
          {!editing?(
            <button className="btn-primary" onClick={()=>{setSaveErr("");setEditing(true);}} style={{display:"flex",alignItems:"center",gap:7,padding:"10px 20px",fontSize:13.5}}><PencilIcon/> Edit Profile</button>
          ):(
            <div style={{display:"flex",gap:8}}>
              <button className="btn-ghost" onClick={cancelEdit} disabled={saving} style={{padding:"9px 16px",fontSize:13}}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving} style={{display:"flex",alignItems:"center",gap:7,padding:"10px 20px",fontSize:13.5}}>
                {saving?<><Spinner size={15} color="#fff"/> Saving…</>:<><SaveIcon/> Save Changes</>}
              </button>
            </div>
          )}
        </div>
        {saveErr&&<div style={{background:C.redLt,border:`1.5px solid ${C.redBdr}`,borderRadius:12,padding:"11px 16px",color:"#991b1b",fontWeight:600,fontSize:13,marginBottom:18,display:"flex",alignItems:"center",gap:8}}>⚠️ {saveErr}</div>}
        {!editing&&(
          <div style={{borderTop:"1.5px solid rgba(226,232,240,.6)",paddingTop:20,marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:700,color:C.slateM,marginBottom:16,display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>👤</span> Personal Information</div>
            <FieldRow label="Full Name" value={`${fn} ${ln}`.trim()}/>
            <FieldRow label="Email Address" value={profile?.email}/>
            <FieldRow label="Phone Number" value={profile?.phoneNumber}/>
            <FieldRow label="Member Since" value={profile?.createdAt?new Date(profile.createdAt).toLocaleDateString("en-PH",{year:"numeric",month:"long",day:"numeric"}):null}/>
            <FieldRow label="Date of Birth" value={profile?.dateOfBirth?new Date(profile.dateOfBirth).toLocaleDateString("en-PH",{year:"numeric",month:"long",day:"numeric"}):null}/>
            <FieldRow label="Gender" value={profile?.gender}/>
            <FieldRow label="Address" value={profile?.address} last/>
          </div>
        )}
        {editing&&(
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            <div style={{borderTop:"1.5px solid rgba(226,232,240,.6)",paddingTop:20,marginBottom:24}}>
              <div style={{fontSize:13,fontWeight:700,color:C.slateM,marginBottom:18,display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>👤</span> Personal Information</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <EditField label="First Name"><input className="input-field" value={form.firstName} onChange={set("firstName")} placeholder="First name"/></EditField>
                <EditField label="Last Name"><input className="input-field" value={form.lastName} onChange={set("lastName")} placeholder="Last name"/></EditField>
              </div>
              <div style={{marginBottom:14}}>
                <EditField label="Phone Number" hint="Optional — e.g. +63 000 000 0000">
                  <input className="input-field" value={form.phoneNumber} onChange={e=>{let d=e.target.value.replace(/\D/g,"");if(d.startsWith("0"))d="63"+d.slice(1);if(d.startsWith("63")){const l=d.slice(2,12);let f="+63";if(l.length>0)f+=" "+l.slice(0,3);if(l.length>3)f+=" "+l.slice(3,6);if(l.length>6)f+=" "+l.slice(6,10);set("phoneNumber")({target:{value:f}});}else set("phoneNumber")({target:{value:d?"+"+d:""}});}} placeholder="+63 000 000 0000" maxLength={16}/>
                </EditField>
              </div>
              <div>
                <label style={{fontSize:12.5,fontWeight:700,color:C.slateXL,display:"block",marginBottom:6}}>Email Address</label>
                <div style={{padding:"10px 14px",borderRadius:11,border:"1.5px solid rgba(226,232,240,.6)",background:"rgba(241,245,249,.6)",fontSize:14,color:C.slateXL,fontStyle:"italic"}}>{profile?.email} <span style={{fontSize:11.5}}>(cannot be changed)</span></div>
              </div>
            </div>
            <div style={{borderTop:"1.5px solid rgba(226,232,240,.6)",paddingTop:20,marginBottom:24}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <EditField label="Date of Birth"><input type="date" className="input-field" value={form.dateOfBirth} onChange={set("dateOfBirth")}/></EditField>
                <EditField label="Gender">
                  <select className="input-field" value={form.gender} onChange={set("gender")}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option><option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </EditField>
              </div>
              <EditField label="Address"><textarea className="input-field" rows={3} value={form.address} onChange={set("address")} placeholder="Street, City, Province"/></EditField>
            </div>
            <div style={{borderTop:"1.5px solid rgba(226,232,240,.6)",paddingTop:20}}>
              <div style={{fontSize:13,fontWeight:700,color:C.slateM,marginBottom:6,display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>🔒</span> Change Password</div>
              <p style={{fontSize:12.5,color:C.slateXL,marginBottom:16}}>Leave blank if you don't want to change your password.</p>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {[{label:"Current Password",key:"currentPassword",vis:"cur"},{label:"New Password",key:"newPassword",vis:"new",hint:"Minimum 8 characters"},{label:"Confirm New Password",key:"confirmPassword",vis:"con"}].map(({label,key,vis,hint})=>(
                  <EditField key={key} label={label} hint={hint}>
                    <div style={{position:"relative"}}>
                      <input type={showPw[vis]?"text":"password"} className="input-field" value={form[key]} onChange={set(key)} placeholder={label} style={{paddingRight:42}}/>
                      <button type="button" onClick={()=>setShowPw(p=>({...p,[vis]:!p[vis]}))} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.slateXL,display:"flex",alignItems:"center"}}>
                        {showPw[vis]?<EyeOnIcon/>:<EyeOffIcon/>}
                      </button>
                    </div>
                  </EditField>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {!editing&&(
        <div className="glass-sm au3" style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:38,height:38,borderRadius:12,background:C.blueLt,border:`1px solid ${C.blueBdr}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>🔒</div>
          <div>
            <div style={{fontSize:13.5,fontWeight:700,color:C.slate,marginBottom:2}}>Account Security</div>
            <div style={{fontSize:12.5,color:C.slateL}}>Your account is secured via Google OAuth or JWT authentication.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function PatientDashboard() {
  const navigate         = useNavigate();
  const { user, logout } = useAuth();

  const [tab,setTab]               = useState("home");
  const [toast,setToast]           = useState(null);
  const [bookDoctor,setBookDoctor] = useState(null);

  const [appts,setAppts]       = useState([]);
  const [apptLoad,setApptLoad] = useState(true);
  const [apptErr,setApptErr]   = useState("");

  const [doctors,setDoctors]   = useState([]);
  const [docLoad,setDocLoad]   = useState(true);
  const [docErr,setDocErr]     = useState("");

  const [tips,setTips]         = useState([]);
  const [tipsLoad,setTipsLoad] = useState(true);
  const [tipsErr,setTipsErr]   = useState("");

  const showToast = (msg,type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),4500); };

  const fetchAppts = useCallback(async () => {
    setApptLoad(true); setApptErr("");
    try { const d = await patientApi.getMyAppointments(); setAppts(Array.isArray(d)?d:[]); }
    catch(e) { setApptErr(e.message||"Failed to load appointments."); }
    finally { setApptLoad(false); }
  },[]);

  const fetchDoctors = useCallback(async () => {
    setDocLoad(true); setDocErr("");
    try { const d = await patientApi.getAllDoctors(); setDoctors(Array.isArray(d)?d:[]); }
    catch(e) { setDocErr(e.message||"Failed to load doctors."); }
    finally { setDocLoad(false); }
  },[]);

  const fetchTips = useCallback(async () => {
    setTipsLoad(true); setTipsErr("");
    try { setTips(await healthTipsApi.getTips()); }
    catch(e) { setTipsErr(e.message||"Failed to load health tips."); }
    finally { setTipsLoad(false); }
  },[]);

  useEffect(() => { fetchAppts(); fetchDoctors(); fetchTips(); },[fetchAppts,fetchDoctors,fetchTips]);

  const handleBookSuccess = (msg) => { setBookDoctor(null); showToast(msg); fetchAppts(); };
  const handleLogout = async () => { try { await logout(); } catch {} finally { navigate("/login"); } };
  const openBook  = (doc=null) => setBookDoctor(doc??true);
  const closeBook = ()         => setBookDoctor(null);

  return (
    <div style={{fontFamily:"'DM Sans','Segoe UI',sans-serif",minHeight:"100vh",background:"linear-gradient(160deg,#eef2ff 0%,#e0e7ff 35%,#dbeafe 65%,#ede9fe 100%)",position:"relative",overflow:"hidden"}}>
      <GlobalStyles/>
      <div aria-hidden style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        <div style={{position:"absolute",width:700,height:700,borderRadius:"50%",background:"rgba(37,99,235,.09)",filter:"blur(72px)",top:-220,right:-120}}/>
        <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"rgba(124,58,237,.07)",filter:"blur(62px)",bottom:-160,left:-100}}/>
        <div style={{position:"absolute",width:380,height:380,borderRadius:"50%",background:"rgba(16,185,129,.06)",filter:"blur(55px)",bottom:"22%",right:"17%"}}/>
        <div style={{position:"absolute",width:260,height:260,borderRadius:"50%",background:"rgba(245,158,11,.05)",filter:"blur(45px)",top:"38%",left:"8%"}}/>
        <div className="cloud-a" style={{position:"absolute",top:80,left:"6%",opacity:.45}}><Cloud style={{width:240,height:96}}/></div>
        <div className="cloud-b" style={{position:"absolute",top:160,right:"22%",opacity:.28}}><Cloud style={{width:180,height:72}}/></div>
        <div className="cloud-c" style={{position:"absolute",top:50,right:"5%",opacity:.22}}><Cloud style={{width:200,height:80}}/></div>
        <div className="cloud-a" style={{position:"absolute",bottom:"20%",left:"26%",opacity:.18}}><Cloud style={{width:220,height:88}}/></div>
        <div className="cloud-b" style={{position:"absolute",bottom:"6%",right:"9%",opacity:.15}}><Cloud style={{width:160,height:64}}/></div>
        <div className="float-a" style={{position:"absolute",width:90,height:90,borderRadius:"50%",background:"linear-gradient(135deg,rgba(37,99,235,.18),rgba(124,58,237,.12))",top:"22%",right:"12%",border:"1px solid rgba(255,255,255,.5)"}}/>
        <div className="float-b" style={{position:"absolute",width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,rgba(16,185,129,.2),rgba(37,99,235,.1))",top:"62%",right:"30%",border:"1px solid rgba(255,255,255,.4)"}}/>
        <div className="float-a" style={{position:"absolute",width:36,height:36,borderRadius:"50%",background:"rgba(124,58,237,.15)",top:"42%",left:"4%",border:"1px solid rgba(255,255,255,.35)",animationDelay:"3s"}}/>
      </div>
      <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
        <Navbar active={tab} onTab={setTab} onLogout={handleLogout} user={user}/>
        <Toast toast={toast}/>
        {bookDoctor!==null&&(
          <BookModal
            doctors={doctors}
            preselectedDoctor={bookDoctor===true?null:bookDoctor}
            onSuccess={handleBookSuccess}
            onClose={closeBook}
          />
        )}
        <div style={{flex:1}}>
          <PageBanner tab={tab}/>
          {tab==="home"&&<HomeTab user={user} appts={appts} apptLoad={apptLoad} apptErr={apptErr} onBook={openBook} onGoTo={setTab} onRetryAppts={fetchAppts} tips={tips} tipsLoad={tipsLoad} tipsErr={tipsErr} onRetryTips={fetchTips}/>}
          {tab==="appointments"&&<AppointmentsTab appts={appts} loading={apptLoad} error={apptErr} onBook={openBook} onRetry={fetchAppts}/>}
          {tab==="doctors"&&<DoctorsTab doctors={doctors} loading={docLoad} error={docErr} onBook={openBook} onRetry={fetchDoctors}/>}
          {tab==="profile"&&<ProfileTab user={user}/>}
        </div>
      </div>
    </div>
  );
}