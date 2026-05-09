import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { secretaryApi } from "../shared/api";

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
      .shimmer-text{background:linear-gradient(90deg,#7c3aed,#a855f7,#7c3aed);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite;}
      .glass{background:rgba(255,255,255,.80);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1.5px solid rgba(255,255,255,.92);border-radius:20px;box-shadow:0 4px 24px rgba(124,58,237,.06);}
      .glass-sm{background:rgba(255,255,255,.82);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1.5px solid rgba(255,255,255,.9);border-radius:16px;box-shadow:0 2px 16px rgba(124,58,237,.05);}
      .stat-card{background:rgba(255,255,255,.82);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1.5px solid rgba(255,255,255,.92);border-radius:20px;padding:22px 16px;box-shadow:0 4px 24px rgba(124,58,237,.07);transition:transform .25s cubic-bezier(.22,1,.36,1),box-shadow .25s;display:flex;flex-direction:column;align-items:center;text-align:center;}
      .stat-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(124,58,237,.13)}
      .appt-card{background:rgba(255,255,255,.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1.5px solid rgba(255,255,255,.95);border-radius:18px;box-shadow:0 2px 16px rgba(124,58,237,.06);transition:transform .22s cubic-bezier(.22,1,.36,1),box-shadow .22s;}
      .appt-card:hover{transform:translateY(-3px);box-shadow:0 12px 36px rgba(124,58,237,.1)}
      .tab-btn{display:flex;align-items:center;gap:7px;padding:9px 16px;border-radius:12px;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:600;cursor:pointer;transition:all .2s cubic-bezier(.22,1,.36,1);white-space:nowrap;}
      .tab-btn:hover{background:rgba(255,255,255,.65)}
      .tab-btn.active{background:#fff;color:#7c3aed !important;box-shadow:0 2px 12px rgba(124,58,237,.16),0 1px 3px rgba(0,0,0,.06)}
      .btn-primary{display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:12px;border:none;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .22s cubic-bezier(.22,1,.36,1);box-shadow:0 4px 14px rgba(124,58,237,.3);}
      .btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(124,58,237,.4)}
      .btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}
      .btn-confirm{display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:12px;border:none;background:linear-gradient(135deg,#059669,#047857);color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .22s;box-shadow:0 4px 14px rgba(5,150,105,.3);}
      .btn-confirm:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(5,150,105,.4)}
      .btn-confirm:disabled{opacity:.5;cursor:not-allowed;transform:none}
      .btn-danger{display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:12px;border:none;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .22s;box-shadow:0 4px 14px rgba(239,68,68,.3);}
      .btn-danger:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(239,68,68,.4)}
      .btn-danger:disabled{opacity:.5;cursor:not-allowed;transform:none}
      .btn-warning{display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:12px;border:none;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .22s;box-shadow:0 4px 14px rgba(245,158,11,.3);}
      .btn-warning:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(245,158,11,.4)}
      .btn-warning:disabled{opacity:.5;cursor:not-allowed;transform:none}
      .btn-ghost{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:11px;border:1.5px solid rgba(226,232,240,.85);background:rgba(255,255,255,.75);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;color:#334155;cursor:pointer;transition:all .2s;}
      .btn-ghost:hover{background:rgba(255,255,255,.95);transform:translateY(-1px)}
      .input-field{width:100%;padding:10px 14px;border-radius:11px;border:1.5px solid rgba(226,232,240,.85);background:rgba(255,255,255,.8);font-family:'DM Sans',sans-serif;font-size:14px;color:#0f172a;outline:none;transition:border-color .2s,box-shadow .2s;}
      .input-field:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.12)}
      select.input-field{cursor:pointer}
      textarea.input-field{resize:vertical}
      .filter-pill{padding:7px 16px;border-radius:100px;border:1.5px solid;font-weight:600;font-size:13px;cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif;}
      .filter-pill:hover{transform:translateY(-1px)}
      .toast-in{animation:slideR .35s cubic-bezier(.22,1,.36,1) both}
      .appt-row{transition:background .15s;}
      .appt-row:hover{background:rgba(124,58,237,.04) !important;}
      ::-webkit-scrollbar{width:5px;height:5px}
      ::-webkit-scrollbar-track{background:transparent}
      ::-webkit-scrollbar-thumb{background:rgba(148,163,184,.4);border-radius:5px}
      @media(max-width:860px){.top-tabs{display:none !important}.mob-tabs{display:flex !important}.four-col{grid-template-columns:repeat(2,1fr) !important}}
      @media(max-width:520px){.four-col{grid-template-columns:1fr 1fr !important}.pw{padding:18px 16px 48px !important}}
    `}</style>
  </>
);

const Cloud = ({ style }) => (
  <svg viewBox="0 0 200 80" fill="none" style={style}>
    <path d="M170 60H45C28 60 15 47 15 30C15 15 26 4 40 4C42 4 44 4 46 5C50 -1 58 -2 65 2C70 -4 80 -5 88 1C93 -3 101 -3 107 2C114 -2 124 0 128 8C140 6 152 14 154 26C162 26 170 34 170 43V60Z" fill="white" fillOpacity="0.55"/>
  </svg>
);

const C = {
  purple:"#7c3aed", purpleDk:"#6d28d9", purpleLt:"#f5f3ff", purpleBdr:"#ddd6fe",
  violet:"#a855f7", violetLt:"#faf5ff",  violetBdr:"#e9d5ff",
  green:"#059669",  greenLt:"#f0fdf4",   greenBdr:"#bbf7d0",
  amber:"#f59e0b",  amberDk:"#d97706",   amberLt:"#fffbeb",  amberBdr:"#fde68a",
  blue:"#2563eb",   blueLt:"#eff6ff",    blueBdr:"#bfdbfe",
  red:"#ef4444",    redLt:"#fef2f2",     redBdr:"#fecaca",
  slate:"#0f172a",  slateM:"#334155",    slateL:"#64748b",   slateXL:"#94a3b8",
};

const Ico = ({size=16,ch})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} dangerouslySetInnerHTML={{__html:ch}}/>;
const HomeIcon   = () => <Ico size={17} ch='<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'/>
const CalIcon    = () => <Ico size={17} ch='<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'/>
const UserIcon   = () => <Ico size={17} ch='<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'/>
const LogoutIcon = () => <Ico size={15} ch='<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'/>
const CheckIcon  = () => <Ico size={16} ch='<polyline points="20 6 9 17 4 12"/>'/>
const XIcon      = () => <Ico size={16} ch='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'/>
const SaveIcon   = () => <Ico size={15} ch='<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>'/>
const ArrowLeft  = () => <Ico size={16} ch='<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>'/>
const PencilIcon = () => <Ico size={15} ch='<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>'/>

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
const StatPendingIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={20} height={20}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const StatConfirmIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={20} height={20}><polyline points="20 6 9 17 4 12"/></svg>
const StatCompleteIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={20} height={20}><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
const StatCancelIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={20} height={20}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>

const getInitials = (fn="",ln="") => `${fn[0]||""}${ln[0]||""}`.toUpperCase();
const apptPatFn  = a => a?.patient?.firstName || a?.patient?.firstname || '';
const apptPatLn  = a => a?.patient?.lastName  || a?.patient?.lastname  || '';
const apptDocFn  = a => a?.doctor?.firstName  || a?.doctor?.firstname  || '';
const apptDocLn  = a => a?.doctor?.lastName   || a?.doctor?.lastname   || '';
const apptDocSpec= a => a?.doctor?.specialization || '';
const apptDocPic = a => a?.doctor?.profilePicture || null;
const apptDate   = a => a?.requestedDate || a?.requested_date || '';
const apptTime   = a => a?.requestedTime || a?.requested_time || '';
const apptReason = a => a?.reasonForVisit || a?.reason_for_visit || '';

const Spinner = ({size=22,color=C.purple}) => (
  <svg style={{animation:"spin 1s linear infinite",flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" width={size} height={size}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

const Toast = ({toast}) => {
  if (!toast) return null;
  const e = toast.type==="error";
  return (
    <div className="toast-in" style={{position:"fixed",top:78,right:24,zIndex:9999,background:e?C.redLt:C.purpleLt,border:`1.5px solid ${e?C.redBdr:C.purpleBdr}`,color:e?"#991b1b":"#5b21b6",padding:"13px 20px",borderRadius:16,fontWeight:700,fontSize:13.5,boxShadow:"0 12px 40px rgba(0,0,0,.12)",display:"flex",alignItems:"center",gap:9,maxWidth:400}}>
      {e?"⚠️":"✅"} {toast.msg}
    </div>
  );
};

const SB = {
  PENDING:   ["#fef9c3","#854d0e","#fde047"],
  CONFIRMED: [C.greenLt, C.green,   C.greenBdr],
  COMPLETED: [C.blueLt,  C.blue,    C.blueBdr],
  REJECTED:  [C.redLt,  "#991b1b",  C.redBdr],
  CANCELLED: [C.redLt,  C.red,      C.redBdr],
  APPROVED:  [C.greenLt, C.green,   C.greenBdr],
};
const StatusBadge = ({status=""}) => {
  const [bg,color,border] = SB[status?.toUpperCase()] || SB.PENDING;
  return <span style={{background:bg,color,border:`1px solid ${border}`,borderRadius:100,padding:"3px 11px",fontSize:11.5,fontWeight:700,letterSpacing:".02em",whiteSpace:"nowrap"}}>{status}</span>;
};

const TABS = [
  {key:"dashboard",    label:"Dashboard",       icon:<HomeIcon/>},
  {key:"appointments", label:"All Appointments", icon:<CalIcon/>},
  {key:"profile",      label:"Profile",          icon:<UserIcon/>},
];

// ── Navbar ───────────────────────────────────────────────────────────────
const Navbar = ({active, onTab, onLogout, profile}) => {
  const fn = profile?.firstName||"";
  const ln = profile?.lastName||"";
  return (
    <>
      <nav style={{position:"sticky",top:0,zIndex:100,height:64,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",background:"rgba(255,255,255,.72)",backdropFilter:"blur(22px)",WebkitBackdropFilter:"blur(22px)",borderBottom:"1px solid rgba(255,255,255,.78)",boxShadow:"0 1px 0 rgba(124,58,237,.06),0 4px 24px rgba(124,58,237,.05)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{width:36,height:36,borderRadius:11,background:`linear-gradient(135deg,${C.purple},${C.purpleDk})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:900,fontSize:17,boxShadow:`0 4px 14px rgba(124,58,237,.32)`}}>M</div>
          <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:17,color:C.slate,letterSpacing:"-.3px"}}>Medi<span style={{color:C.purple}}>Core</span></span>
        </div>
        <div className="top-tabs" style={{display:"flex",gap:4}}>
          {TABS.map(t=>(
            <button key={t.key} className={`tab-btn ${active===t.key?"active":""}`} onClick={()=>onTab(t.key)} style={{color:active===t.key?C.purple:C.slateL}}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            {/* Navbar avatar — displays picture but no upload here */}
            <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${C.purple},${C.purpleDk})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:13,boxShadow:`0 3px 10px rgba(124,58,237,.3)`,overflow:"hidden"}}>
              {profile?.profilePicture
                ? <img src={profile.profilePicture} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : getInitials(fn,ln)||"S"
              }
            </div>
            <div style={{lineHeight:1.2}}>
              <div style={{fontSize:10.5,color:C.slateXL,fontWeight:600}}>Secretary</div>
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
          <button key={t.key} className={`tab-btn ${active===t.key?"active":""}`} onClick={()=>onTab(t.key)} style={{color:active===t.key?C.purple:C.slateL,fontSize:12,padding:"8px 12px",flexShrink:0}}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>
    </>
  );
};

// ── Appointment Detail ───────────────────────────────────────────────────
const AppointmentDetail = ({appt, onBack, onConfirm, onReject, onCancel, loading}) => {
  const [rejectReason, setRejectReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showReject,   setShowReject]   = useState(false);
  const [showCancel,   setShowCancel]   = useState(false);

  const InfoBox = ({label, value}) => (
    <div style={{background:"rgba(248,250,252,.8)",borderRadius:14,padding:"14px 16px",border:"1px solid rgba(226,232,240,.6)"}}>
      <div style={{fontSize:11,fontWeight:700,color:C.slateXL,textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>{label}</div>
      <div style={{fontSize:14.5,fontWeight:600,color:C.slateM}}>{value||<span style={{color:C.slateXL,fontStyle:"italic"}}>Not provided</span>}</div>
    </div>
  );

  return (
    <div className="pw" style={{padding:"24px 32px 56px",maxWidth:720,margin:"0 auto"}}>
      <button className="btn-ghost" onClick={onBack} style={{marginBottom:20,display:"flex",alignItems:"center",gap:6,fontSize:13}}>
        <ArrowLeft/> Back to Appointments
      </button>
      <div className="glass au1" style={{padding:"28px 32px",marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:12}}>
          <div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:900,color:C.slate,marginBottom:4}}>Appointment Details</h2>
            <p style={{fontSize:13,color:C.slateL}}>Review and manage this appointment</p>
          </div>
          <StatusBadge status={appt.status}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
          <div style={{background:C.purpleLt,borderRadius:14,padding:"14px 16px",border:`1px solid ${C.purpleBdr}`}}>
            <div style={{fontSize:11,fontWeight:700,color:C.purple,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Patient</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${C.purple},${C.purpleDk})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:13,flexShrink:0}}>
                {getInitials(apptPatFn(appt),apptPatLn(appt))||"P"}
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:14.5,color:C.slate}}>{apptPatFn(appt)} {apptPatLn(appt)}</div>
                <div style={{fontSize:12,color:C.slateL}}>{appt.patient?.email||""}</div>
              </div>
            </div>
          </div>
          <div style={{background:C.greenLt,borderRadius:14,padding:"14px 16px",border:`1px solid ${C.greenBdr}`}}>
            <div style={{fontSize:11,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Doctor</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,#059669,#047857)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:13,flexShrink:0,overflow:"hidden"}}>
                {apptDocPic(appt) ? <img src={apptDocPic(appt)} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : getInitials(apptDocFn(appt),apptDocLn(appt))||"D"}
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:14.5,color:C.slate}}>Dr. {apptDocFn(appt)} {apptDocLn(appt)}</div>
                <div style={{fontSize:12,color:C.green,fontWeight:600}}>{apptDocSpec(appt)}</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
          <InfoBox label="Date" value={apptDate(appt)?new Date(apptDate(appt)).toLocaleDateString("en-PH",{weekday:"long",month:"long",day:"numeric",year:"numeric"}):"—"}/>
          <InfoBox label="Time" value={apptTime(appt)||"—"}/>
        </div>
        {apptReason(appt)&&<div style={{background:"rgba(248,250,252,.8)",borderRadius:14,padding:"14px 16px",border:"1px solid rgba(226,232,240,.6)",marginBottom:12}}><div style={{fontSize:11,fontWeight:700,color:C.slateXL,textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>Reason for Visit</div><p style={{fontSize:14,color:C.slateM,lineHeight:1.7,margin:0}}>{apptReason(appt)}</p></div>}
        {appt.status==='CANCELLED'&&appt.cancelReason&&<div style={{background:C.redLt,borderRadius:14,padding:"14px 16px",border:`1px solid ${C.redBdr}`,marginBottom:12}}><div style={{fontSize:11,fontWeight:700,color:C.red,textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>Cancellation Reason</div><p style={{fontSize:14,color:C.slateM,margin:0}}>{appt.cancelReason}</p></div>}
        {appt.status==='REJECTED'&&appt.rejectedReason&&<div style={{background:C.redLt,borderRadius:14,padding:"14px 16px",border:`1px solid ${C.redBdr}`,marginBottom:12}}><div style={{fontSize:11,fontWeight:700,color:C.red,textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>Rejection Reason</div><p style={{fontSize:14,color:C.slateM,margin:0}}>{appt.rejectedReason}</p></div>}
        {appt.status==='COMPLETED'&&appt.doctorNotes&&<div style={{background:C.blueLt,borderRadius:14,padding:"14px 16px",border:`1px solid ${C.blueBdr}`,marginBottom:12}}><div style={{fontSize:11,fontWeight:700,color:C.blue,textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>Doctor Notes</div><p style={{fontSize:14,color:C.slateM,margin:0}}>{appt.doctorNotes}</p></div>}
        {appt.status==="PENDING"&&!showReject&&!showCancel&&(
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <button className="btn-confirm" onClick={()=>onConfirm(appt.id)} disabled={loading} style={{flex:1,justifyContent:"center",padding:"12px"}}>
              {loading?<Spinner size={16} color="#fff"/>:<><CheckIcon/> Confirm Appointment</>}
            </button>
            <button className="btn-danger" onClick={()=>setShowReject(true)} disabled={loading} style={{flex:1,justifyContent:"center",padding:"12px"}}>
              <XIcon/> Reject
            </button>
          </div>
        )}
        {showReject&&(
          <div style={{marginTop:8}}>
            <label style={{fontSize:13,fontWeight:700,color:C.slateM,display:"block",marginBottom:6}}>Reason for Rejection <span style={{color:C.slateXL,fontWeight:400}}>(optional)</span></label>
            <textarea className="input-field" rows={3} value={rejectReason} onChange={e=>setRejectReason(e.target.value)} placeholder="e.g. Slot unavailable, doctor on leave…"/>
            <div style={{display:"flex",gap:10,marginTop:12}}>
              <button className="btn-ghost" onClick={()=>setShowReject(false)} style={{flex:1,justifyContent:"center",padding:"11px"}}>Back</button>
              <button className="btn-danger" onClick={()=>onReject(appt.id,rejectReason||null)} disabled={loading} style={{flex:1,justifyContent:"center",padding:"11px"}}>
                {loading?<Spinner size={16} color="#fff"/>:<><XIcon/> Confirm Rejection</>}
              </button>
            </div>
          </div>
        )}
        {appt.status==="CONFIRMED"&&!showCancel&&(
          <div style={{marginTop:8}}>
            <button className="btn-warning" onClick={()=>setShowCancel(true)} disabled={loading} style={{width:"100%",justifyContent:"center",padding:"12px"}}>
              <XIcon/> Cancel Appointment
            </button>
          </div>
        )}
        {showCancel&&(
          <div style={{marginTop:8}}>
            <label style={{fontSize:13,fontWeight:700,color:C.slateM,display:"block",marginBottom:6}}>Reason for Cancellation <span style={{color:C.slateXL,fontWeight:400}}>(optional)</span></label>
            <select className="input-field" value={cancelReason} onChange={e=>setCancelReason(e.target.value)} style={{marginBottom:12}}>
              <option value="">Select a reason…</option>
              <option value="Doctor unavailable">Doctor unavailable</option>
              <option value="Patient no-show">Patient no-show</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Other">Other</option>
            </select>
            <div style={{display:"flex",gap:10}}>
              <button className="btn-ghost" onClick={()=>setShowCancel(false)} style={{flex:1,justifyContent:"center",padding:"11px"}}>Back</button>
              <button className="btn-warning" onClick={()=>onCancel(appt.id,cancelReason||null)} disabled={loading} style={{flex:1,justifyContent:"center",padding:"11px"}}>
                {loading?<Spinner size={16} color="#fff"/>:<><XIcon/> Confirm Cancellation</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Dashboard Tab ────────────────────────────────────────────────────────
const DashboardTab = ({profile, appointments, onGoTo, onSelectAppt}) => {
  const fn = profile?.firstName||"there";
  const doc = profile?.assignedDoctor;
  const pending   = appointments.filter(a=>a.status==="PENDING");
  const confirmed = appointments.filter(a=>a.status==="CONFIRMED").length;
  const completed = appointments.filter(a=>a.status==="COMPLETED").length;
  const cancelled = appointments.filter(a=>a.status==="CANCELLED").length;
  const statCards = [
    {label:"Pending",   val:pending.length, grad:`linear-gradient(135deg,${C.amber},${C.amberDk})`, icon:<StatPendingIcon/>},
    {label:"Confirmed", val:confirmed,       grad:`linear-gradient(135deg,${C.green},#047857)`,       icon:<StatConfirmIcon/>},
    {label:"Completed", val:completed,       grad:`linear-gradient(135deg,${C.blue},#1d4ed8)`,        icon:<StatCompleteIcon/>},
    {label:"Cancelled", val:cancelled,       grad:`linear-gradient(135deg,${C.red},#dc2626)`,         icon:<StatCancelIcon/>},
  ];
  return (
    <div className="pw" style={{padding:"0 32px 56px",maxWidth:1120,margin:"0 auto"}}>
      <div className="au1" style={{padding:"36px 0 26px"}}>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:"clamp(1.6rem,4vw,2.2rem)",fontWeight:900,color:C.slate,lineHeight:1.15,marginBottom:8}}>
          Welcome, <span className="shimmer-text">{fn}!</span>
        </h1>
        <p style={{fontSize:15,color:C.slateL,fontWeight:500,maxWidth:480}}>Manage appointments and coordinate with your assigned doctor.</p>
      </div>
      <div className="four-col au2" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
        {statCards.map((s,i)=>(
          <div key={i} className="stat-card" style={{animationDelay:`${i*.06}s`}}>
            <div style={{width:44,height:44,borderRadius:13,background:s.grad,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14,boxShadow:"0 3px 12px rgba(0,0,0,.12)"}}>{s.icon}</div>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:32,fontWeight:900,color:C.slate,lineHeight:1,marginBottom:6}}>{s.val}</div>
            <div style={{fontSize:12.5,color:C.slateL,fontWeight:600}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="au3 glass" style={{padding:"20px 24px",marginBottom:20}}>
        <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:900,color:C.slate,marginBottom:14}}>Assigned Doctor</h2>
        {doc ? (
          <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:14,background:C.purpleLt,border:`1px solid ${C.purpleBdr}`}}>
            <div style={{width:52,height:52,borderRadius:"50%",background:`linear-gradient(135deg,#059669,#047857)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,flexShrink:0,overflow:"hidden"}}>
              {doc.profilePicture ? <img src={doc.profilePicture} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : getInitials(doc.firstName||"",doc.lastName||"")||"D"}
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15.5,color:C.slate}}>Dr. {doc.firstName} {doc.lastName}</div>
              <div style={{fontSize:13,color:C.green,fontWeight:600,marginTop:2}}>{doc.specialization}</div>
            </div>
            <span style={{background:C.purpleLt,color:C.purple,border:`1px solid ${C.purpleBdr}`,borderRadius:100,padding:"4px 12px",fontSize:12,fontWeight:700}}>● Your Doctor</span>
          </div>
        ) : (
          <div style={{padding:"20px",textAlign:"center",color:C.slateXL,fontSize:13.5}}><div style={{fontSize:32,marginBottom:8}}>🩺</div>No doctor assigned yet.</div>
        )}
      </div>
      <div className="au4">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:17,fontWeight:900,color:C.slate}}>Pending Appointments</h2>
            <p style={{fontSize:12.5,color:C.slateL,marginTop:2}}>Appointments awaiting your confirmation</p>
          </div>
          <button onClick={()=>onGoTo("appointments")} style={{fontSize:12,color:C.purple,background:C.purpleLt,border:`1px solid ${C.purpleBdr}`,padding:"5px 14px",borderRadius:100,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>View all →</button>
        </div>
        {pending.length===0 ? (
          <div className="glass" style={{padding:40,textAlign:"center",color:C.slateXL,fontSize:14}}><div style={{fontSize:36,marginBottom:10}}>✅</div>No pending appointments!</div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {pending.slice(0,4).map((a,i)=>(
              <div key={a.id} className="appt-card appt-row" onClick={()=>onSelectAppt(a)} style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:14,cursor:"pointer",animationDelay:`${i*.05}s`}}>
                <div style={{width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${C.purple},${C.purpleDk})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:14,flexShrink:0}}>
                  {getInitials(apptPatFn(a),apptPatLn(a))||"P"}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:14.5,color:C.slate}}>{apptPatFn(a)} {apptPatLn(a)}</div>
                  <div style={{fontSize:12.5,color:C.slateL,marginTop:2,display:"flex",gap:12,flexWrap:"wrap"}}>
                    <span style={{display:"flex",alignItems:"center",gap:4}}><DateIcon/>{apptDate(a)?new Date(apptDate(a)).toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"}):"—"}</span>
                    <span style={{display:"flex",alignItems:"center",gap:4}}><TimeIcon/>{apptTime(a)||"—"}</span>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <StatusBadge status={a.status}/>
                  <span style={{fontSize:12,color:C.purple,fontWeight:700}}>Review →</span>
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
const AppointmentsTab = ({appointments, onSelect}) => {
  const [filter, setFilter] = useState("ALL");
  const filtered = filter==="ALL" ? appointments : appointments.filter(a=>a.status===filter);
  return (
    <div className="pw" style={{padding:"24px 32px 56px",maxWidth:1120,margin:"0 auto"}}>
      <div className="au1" style={{marginBottom:20}}>
        <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:900,color:C.slate,marginBottom:4}}>All Appointments</h2>
        <p style={{fontSize:13,color:C.slateL}}>{appointments.length} total appointment{appointments.length!==1?"s":""}</p>
      </div>
      <div className="au2" style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {["ALL","PENDING","CONFIRMED","COMPLETED","CANCELLED","REJECTED"].map(f=>(
          <button key={f} className="filter-pill" onClick={()=>setFilter(f)} style={{borderColor:filter===f?C.purple:"rgba(226,232,240,.8)",background:filter===f?C.purpleLt:"rgba(255,255,255,.72)",color:filter===f?C.purple:C.slateL}}>{f}</button>
        ))}
      </div>
      {filtered.length===0 ? (
        <div className="glass au3" style={{padding:56,textAlign:"center",color:C.slateXL,fontSize:14}}><div style={{fontSize:36,marginBottom:10}}>📭</div>No {filter==="ALL"?"":filter.toLowerCase()} appointments.</div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {filtered.map((a,i)=>(
            <div key={a.id} className="appt-card appt-row au3" onClick={()=>onSelect(a)} style={{padding:"16px 22px",display:"flex",alignItems:"center",gap:16,cursor:"pointer",flexWrap:"wrap",animationDelay:`${i*.04}s`}}>
              <div style={{display:"flex",alignItems:"center",gap:12,flex:1,minWidth:160}}>
                <div style={{width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${C.purple},${C.purpleDk})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:14,flexShrink:0}}>
                  {getInitials(apptPatFn(a),apptPatLn(a))||"P"}
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:11,color:C.slateXL,fontWeight:600,marginBottom:2}}>PATIENT</div>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:C.slate,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{apptPatFn(a)} {apptPatLn(a)}</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12,flex:1,minWidth:160}}>
                <div style={{width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,#059669,#047857)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:14,flexShrink:0,overflow:"hidden"}}>
                  {apptDocPic(a) ? <img src={apptDocPic(a)} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : getInitials(apptDocFn(a),apptDocLn(a))||"D"}
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:11,color:C.slateXL,fontWeight:600,marginBottom:2}}>DOCTOR</div>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:C.slate,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Dr. {apptDocFn(a)} {apptDocLn(a)}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:14,alignItems:"center",flexShrink:0}}>
                <span style={{fontSize:13,color:C.slateM,fontWeight:600,display:"flex",alignItems:"center",gap:5}}><DateIcon/>{apptDate(a)?new Date(apptDate(a)).toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"}):"—"}</span>
                <span style={{fontSize:13,color:C.slateM,fontWeight:600,display:"flex",alignItems:"center",gap:5}}><TimeIcon/>{apptTime(a)||"—"}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                <StatusBadge status={a.status}/>
                <span style={{fontSize:12,color:C.purple,fontWeight:700}}>View →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Profile Tab ──────────────────────────────────────────────────────────
const ProfileTab = ({profile, onSaved, showToast}) => {
  const [form,    setForm]    = useState({firstName:"",lastName:"",phoneNumber:""});
  const [loading, setLoading] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(()=>{
    if(profile) setForm({firstName:profile.firstName||"",lastName:profile.lastName||"",phoneNumber:profile.phoneNumber||""});
  },[profile]);

  const handleSave = async () => {
    setSaveErr(""); setLoading(true);
    try{await secretaryApi.updateProfile(form);showToast("Profile updated successfully!");onSaved();}
    catch(e){setSaveErr(e.message||"Failed to save.");showToast(e.message,"error");}
    finally{setLoading(false);}
  };

  const doc = profile?.assignedDoctor;
  const fn = profile?.firstName||"";
  const ln = profile?.lastName||"";

  const EditField = ({label,children,hint}) => (
    <div>
      <label style={{fontSize:12.5,fontWeight:700,color:C.slateM,display:"block",marginBottom:6}}>{label}</label>
      {children}
      {hint&&<p style={{fontSize:11.5,color:C.slateXL,marginTop:4}}>{hint}</p>}
    </div>
  );

  return (
    <div className="pw" style={{padding:"24px 32px 56px",maxWidth:760,margin:"0 auto"}}>
      <div className="glass au2" style={{padding:"28px 32px",marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:24,flexWrap:"wrap"}}>

          {/* ── Avatar with Camera Upload ── */}
          <div style={{position:"relative",flexShrink:0}}>
            <div style={{width:78,height:78,borderRadius:"50%",background:`linear-gradient(135deg,${C.purple},${C.violet})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:900,fontSize:26,boxShadow:`0 6px 20px rgba(124,58,237,.28)`,overflow:"hidden"}}>
              {profile?.profilePicture
                ? <img src={profile.profilePicture} alt="Profile" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : getInitials(fn,ln)||"S"
              }
            </div>
            <label style={{position:"absolute",bottom:0,right:0,width:26,height:26,borderRadius:"50%",background:C.purple,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,.2)",border:"2px solid #fff"}}>
              <input type="file" accept="image/*" style={{display:"none"}} onChange={async(e)=>{
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 2 * 1024 * 1024) { setSaveErr("Image must be under 2MB."); return; }
                const reader = new FileReader();
                reader.onload = async(ev) => {
                  try {
                    await secretaryApi.uploadProfilePicture(ev.target.result);
                    onSaved();
                    showToast("Profile picture updated!");
                  } catch(err) { setSaveErr(err.message||"Failed to upload picture."); }
                };
                reader.readAsDataURL(file);
              }}/>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" width={12} height={12}>
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
            </label>
          </div>

          <div style={{flex:1,minWidth:160}}>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:21,fontWeight:900,color:C.slate}}>{fn} {ln}</div>
            <div style={{fontSize:13.5,color:C.slateL,marginTop:2}}>{profile?.email}</div>
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <span style={{background:C.purpleLt,color:C.purple,border:`1px solid ${C.purpleBdr}`,borderRadius:100,padding:"3px 11px",fontSize:11.5,fontWeight:700}}>Secretary</span>
              <span style={{background:profile?.status==="APPROVED"?C.greenLt:"#fef9c3",color:profile?.status==="APPROVED"?C.green:"#854d0e",border:`1px solid ${profile?.status==="APPROVED"?C.greenBdr:"#fde047"}`,borderRadius:100,padding:"3px 11px",fontSize:11.5,fontWeight:700}}>{profile?.status||"PENDING"}</span>
            </div>
          </div>
          {!editing?(
            <button className="btn-primary" onClick={()=>{setSaveErr("");setEditing(true);}} style={{display:"flex",alignItems:"center",gap:7,padding:"10px 20px",fontSize:13.5}}>
              <PencilIcon/> Edit Profile
            </button>
          ):(
            <div style={{display:"flex",gap:8}}>
              <button className="btn-ghost" onClick={()=>{setEditing(false);setSaveErr("");if(profile)setForm({firstName:profile.firstName||"",lastName:profile.lastName||"",phoneNumber:profile.phoneNumber||""});}} disabled={loading} style={{padding:"9px 16px",fontSize:13}}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={loading} style={{display:"flex",alignItems:"center",gap:7,padding:"10px 20px",fontSize:13.5}}>
                {loading?<><Spinner size={15} color="#fff"/> Saving…</>:<><SaveIcon/> Save Changes</>}
              </button>
            </div>
          )}
        </div>

        {saveErr&&<div style={{background:C.redLt,border:`1.5px solid ${C.redBdr}`,borderRadius:12,padding:"11px 16px",color:"#991b1b",fontWeight:600,fontSize:13,marginBottom:18,display:"flex",alignItems:"center",gap:8}}>⚠️ {saveErr}</div>}

        {editing ? (
          <div style={{borderTop:"1.5px solid rgba(226,232,240,.6)",paddingTop:20,marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:700,color:C.slateM,marginBottom:18,display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>👤</span> Personal Information</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <EditField label="First Name"><input className="input-field" value={form.firstName} onChange={e=>setForm(p=>({...p,firstName:e.target.value}))} placeholder="First name"/></EditField>
              <EditField label="Last Name"><input className="input-field" value={form.lastName} onChange={e=>setForm(p=>({...p,lastName:e.target.value}))} placeholder="Last name"/></EditField>
            </div>
            <div style={{marginBottom:14}}>
              <EditField label="Phone Number" hint="Optional">
                <input className="input-field" value={form.phoneNumber} onChange={e=>setForm(p=>({...p,phoneNumber:e.target.value}))} placeholder="+63 000 000 0000"/>
              </EditField>
            </div>
            <div>
              <label style={{fontSize:12.5,fontWeight:700,color:C.slateXL,display:"block",marginBottom:6}}>Email Address</label>
              <div style={{padding:"10px 14px",borderRadius:11,border:"1.5px solid rgba(226,232,240,.6)",background:"rgba(241,245,249,.6)",fontSize:14,color:C.slateXL,fontStyle:"italic"}}>{profile?.email} <span style={{fontSize:11.5}}>(cannot be changed)</span></div>
            </div>
          </div>
        ) : (
          <div style={{borderTop:"1.5px solid rgba(226,232,240,.6)",paddingTop:20,marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:700,color:C.slateM,marginBottom:16,display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>👤</span> Personal Information</div>
            <div style={{padding:"13px 0",borderBottom:"1px solid rgba(226,232,240,.5)"}}>
              <div style={{fontSize:11,fontWeight:700,color:C.slateXL,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>Full Name</div>
              <div style={{fontSize:14.5,color:C.slateM,fontWeight:500}}>{`${fn} ${ln}`.trim()||<span style={{color:C.slateXL,fontStyle:"italic"}}>Not provided</span>}</div>
            </div>
            <div style={{padding:"13px 0",borderBottom:"1px solid rgba(226,232,240,.5)"}}>
              <div style={{fontSize:11,fontWeight:700,color:C.slateXL,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>Email Address</div>
              <div style={{fontSize:14.5,color:C.slateM,fontWeight:500}}>{profile?.email||<span style={{color:C.slateXL,fontStyle:"italic"}}>Not provided</span>}</div>
            </div>
            <div style={{padding:"13px 0"}}>
              <div style={{fontSize:11,fontWeight:700,color:C.slateXL,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>Phone Number</div>
              <div style={{fontSize:14.5,color:C.slateM,fontWeight:500}}>{profile?.phoneNumber||<span style={{color:C.slateXL,fontStyle:"italic"}}>Not provided</span>}</div>
            </div>
          </div>
        )}

        {doc&&(
          <div style={{borderTop:"1.5px solid rgba(226,232,240,.6)",paddingTop:20}}>
            <div style={{fontSize:13,fontWeight:700,color:C.slateM,marginBottom:14,display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>🩺</span> Assigned Doctor</div>
            <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:14,background:C.purpleLt,border:`1px solid ${C.purpleBdr}`}}>
              <div style={{width:50,height:50,borderRadius:"50%",background:`linear-gradient(135deg,#059669,#047857)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,flexShrink:0,overflow:"hidden"}}>
                {doc.profilePicture ? <img src={doc.profilePicture} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : getInitials(doc.firstName||"",doc.lastName||"")||"D"}
              </div>
              <div>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,color:C.slate}}>Dr. {doc.firstName} {doc.lastName}</div>
                <div style={{fontSize:13,color:C.green,fontWeight:600,marginTop:2}}>{doc.specialization}</div>
                <div style={{fontSize:12,color:C.slateXL,marginTop:2}}>{doc.email}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="glass-sm au3" style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:38,height:38,borderRadius:12,background:C.purpleLt,border:`1px solid ${C.purpleBdr}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>🔒</div>
        <div>
          <div style={{fontSize:13.5,fontWeight:700,color:C.slate,marginBottom:2}}>Account Security</div>
          <div style={{fontSize:12.5,color:C.slateL}}>Your account is secured via Google OAuth or JWT authentication.</div>
        </div>
      </div>
    </div>
  );
};

// ── Main Export ──────────────────────────────────────────────────────────
export default function SecretaryDashboard() {
  const navigate = useNavigate();
  const {logout} = useAuth();

  const [tab,           setTab]           = useState("dashboard");
  const [appointments,  setAppointments]  = useState([]);
  const [profile,       setProfile]       = useState(null);
  const [selectedAppt,  setSelectedAppt]  = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [toast,         setToast]         = useState(null);

  const showToast = (msg,type="success") => {setToast({msg,type});setTimeout(()=>setToast(null),4000);};

  const fetchAppointments = useCallback(async()=>{
    try{const d=await secretaryApi.getAppointments();setAppointments(Array.isArray(d)?d:[]);}
    catch(e){showToast(e.message,"error");setAppointments([]);}
  },[]);

  const fetchProfile = useCallback(async()=>{
    try{const d=await secretaryApi.getProfile();setProfile(d);}
    catch{setProfile(null);}
  },[]);

  useEffect(()=>{fetchProfile();fetchAppointments();},[fetchProfile,fetchAppointments]);

  const handleConfirm = async(id)=>{
    setLoadingAction(true);
    try{await secretaryApi.confirmAppointment(id);showToast("Appointment confirmed!");setSelectedAppt(null);fetchAppointments();}
    catch(e){showToast(e.message,"error");}
    finally{setLoadingAction(false);}
  };

  const handleReject = async(id,rejectedReason)=>{
    setLoadingAction(true);
    try{await secretaryApi.rejectAppointment(id,rejectedReason);showToast("Appointment rejected.");setSelectedAppt(null);fetchAppointments();}
    catch(e){showToast(e.message,"error");}
    finally{setLoadingAction(false);}
  };

  const handleCancel = async(id,cancelReason)=>{
    setLoadingAction(true);
    try{await secretaryApi.cancelAppointment(id,cancelReason);showToast("Appointment cancelled.");setSelectedAppt(null);fetchAppointments();}
    catch(e){showToast(e.message,"error");}
    finally{setLoadingAction(false);}
  };

  const handleLogout = ()=>{logout();navigate("/login");};

  return (
    <div style={{fontFamily:"'DM Sans','Segoe UI',sans-serif",minHeight:"100vh",background:"linear-gradient(160deg,#f5f3ff 0%,#ede9fe 30%,#e0e7ff 65%,#faf5ff 100%)",position:"relative",overflow:"hidden"}}>
      <GlobalStyles/>
      <div aria-hidden style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        <div style={{position:"absolute",width:700,height:700,borderRadius:"50%",background:"rgba(124,58,237,.09)",filter:"blur(72px)",top:-220,right:-120}}/>
        <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"rgba(168,85,247,.07)",filter:"blur(62px)",bottom:-160,left:-100}}/>
        <div style={{position:"absolute",width:380,height:380,borderRadius:"50%",background:"rgba(99,102,241,.06)",filter:"blur(55px)",bottom:"22%",right:"17%"}}/>
        <div style={{position:"absolute",width:260,height:260,borderRadius:"50%",background:"rgba(245,158,11,.05)",filter:"blur(45px)",top:"38%",left:"8%"}}/>
        <div className="cloud-a" style={{position:"absolute",top:80,left:"6%",opacity:.45}}><Cloud style={{width:240,height:96}}/></div>
        <div className="cloud-b" style={{position:"absolute",top:160,right:"22%",opacity:.28}}><Cloud style={{width:180,height:72}}/></div>
        <div className="cloud-c" style={{position:"absolute",top:50,right:"5%",opacity:.22}}><Cloud style={{width:200,height:80}}/></div>
        <div className="cloud-a" style={{position:"absolute",bottom:"20%",left:"26%",opacity:.18}}><Cloud style={{width:220,height:88}}/></div>
        <div className="float-a" style={{position:"absolute",width:90,height:90,borderRadius:"50%",background:"linear-gradient(135deg,rgba(124,58,237,.18),rgba(168,85,247,.12))",top:"22%",right:"12%",border:"1px solid rgba(255,255,255,.5)"}}/>
        <div className="float-b" style={{position:"absolute",width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,rgba(99,102,241,.2),rgba(124,58,237,.1))",top:"62%",right:"30%",border:"1px solid rgba(255,255,255,.4)"}}/>
        <div className="float-a" style={{position:"absolute",width:36,height:36,borderRadius:"50%",background:"rgba(168,85,247,.15)",top:"42%",left:"4%",border:"1px solid rgba(255,255,255,.35)",animationDelay:"3s"}}/>
      </div>
      <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
        <Navbar active={tab} onTab={t=>{setTab(t);setSelectedAppt(null);}} onLogout={handleLogout} profile={profile}/>
        <Toast toast={toast}/>
        <div style={{flex:1}}>
          {selectedAppt ? (
            <AppointmentDetail appt={selectedAppt} onBack={()=>setSelectedAppt(null)} onConfirm={handleConfirm} onReject={handleReject} onCancel={handleCancel} loading={loadingAction}/>
          ) : (
            <>
              {tab==="dashboard"    && <DashboardTab    profile={profile} appointments={appointments} onGoTo={setTab} onSelectAppt={setSelectedAppt}/>}
              {tab==="appointments" && <AppointmentsTab appointments={appointments} onSelect={setSelectedAppt}/>}
              {tab==="profile"      && <ProfileTab      profile={profile} onSaved={fetchProfile} showToast={showToast}/>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
