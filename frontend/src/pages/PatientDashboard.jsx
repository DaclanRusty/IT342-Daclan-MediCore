import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { patientApi, healthTipsApi } from "../services/api";

// ─────────────────────────────────────────────────────────────────────────────
// Global Styles
// ─────────────────────────────────────────────────────────────────────────────
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
      .stat-card{background:rgba(255,255,255,.82);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1.5px solid rgba(255,255,255,.92);border-radius:20px;padding:20px;box-shadow:0 4px 24px rgba(37,99,235,.07);transition:transform .25s cubic-bezier(.22,1,.36,1),box-shadow .25s;}
      .stat-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(37,99,235,.13)}
      .appt-card{background:rgba(255,255,255,.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1.5px solid rgba(255,255,255,.95);border-radius:18px;box-shadow:0 2px 16px rgba(37,99,235,.06);transition:transform .22s cubic-bezier(.22,1,.36,1),box-shadow .22s;}
      .appt-card:hover{transform:translateY(-3px);box-shadow:0 12px 36px rgba(37,99,235,.1)}
      .doc-card{background:rgba(255,255,255,.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1.5px solid rgba(255,255,255,.95);border-radius:18px;padding:18px 20px;box-shadow:0 2px 16px rgba(37,99,235,.05);transition:transform .22s,box-shadow .22s;}
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

// SVG Cloud
const Cloud = ({ style }) => (
  <svg viewBox="0 0 200 80" fill="none" style={style}>
    <path d="M170 60H45C28 60 15 47 15 30C15 15 26 4 40 4C42 4 44 4 46 5C50 -1 58 -2 65 2C70 -4 80 -5 88 1C93 -3 101 -3 107 2C114 -2 124 0 128 8C140 6 152 14 154 26C162 26 170 34 170 43V60Z" fill="white" fillOpacity="0.55"/>
  </svg>
);

// Icons
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

// Design tokens
const C = {
  blue:"#2563eb",  blueDk:"#1d4ed8", blueLt:"#eff6ff", blueBdr:"#bfdbfe",
  amber:"#f59e0b", amberDk:"#d97706",amberLt:"#fffbeb",amberBdr:"#fde68a",
  green:"#059669", greenLt:"#f0fdf4",greenBdr:"#bbf7d0",
  purple:"#7c3aed",purpleLt:"#f5f3ff",purpleBdr:"#ddd6fe",
  red:"#ef4444",   redLt:"#fef2f2",  redBdr:"#fecaca",
  slate:"#0f172a", slateM:"#334155", slateL:"#64748b", slateXL:"#94a3b8",
};

// Status badge
const SB = {
  PENDING:  ["#fef9c3","#854d0e","#fde047"],
  APPROVED: [C.greenLt, C.green, C.greenBdr],
  COMPLETED:[C.blueLt,  C.blue,  C.blueBdr],
  REJECTED: [C.redLt,  "#991b1b",C.redBdr],
  CANCELLED:["#f1f5f9", C.slateL,"#cbd5e1"],
};
const StatusBadge = ({status=""}) => {
  const [bg,color,border] = SB[status?.toUpperCase()] || SB.PENDING;
  return <span style={{background:bg,color,border:`1px solid ${border}`,borderRadius:100,padding:"3px 11px",fontSize:11.5,fontWeight:700,letterSpacing:".02em",whiteSpace:"nowrap"}}>{status}</span>;
};

// Helpers
const getInitials = (fn="",ln="") => `${fn[0]||""}${ln[0]||""}`.toUpperCase();
const DOC_COLORS = ["#2563eb","#7c3aed","#059669","#f59e0b","#ef4444","#0891b2","#db2777","#16a34a"];
const docColor = (id) => DOC_COLORS[(typeof id==="number"?id:0) % DOC_COLORS.length];

// ── FIX: normalise doctor id — backend returns doctorId, not id ──────────────
const docId = (doc) => doc?.doctorId ?? doc?.id ?? 0;

// Doctor avatar
const DoctorAvatar = ({firstname="",lastname="",color="#2563eb",size=44,profilePicture}) => (
  <div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,background:profilePicture?"#f1f5f9":`linear-gradient(135deg,${color},${color}bb)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:size*.3,boxShadow:`0 3px 10px ${color}40`,overflow:"hidden"}}>
    {profilePicture ? <img src={profilePicture} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : getInitials(firstname,lastname)}
  </div>
);

// Spinner
const Spinner = ({size=22,color=C.blue}) => (
  <svg style={{animation:"spin 1s linear infinite",flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" width={size} height={size}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

// Toast
const Toast = ({toast}) => {
  if (!toast) return null;
  const e = toast.type==="error";
  return (
    <div className="toast-in" style={{position:"fixed",top:78,right:24,zIndex:9999,background:e?C.redLt:C.greenLt,border:`1.5px solid ${e?C.redBdr:C.greenBdr}`,color:e?"#991b1b":"#166534",padding:"13px 20px",borderRadius:16,fontWeight:700,fontSize:13.5,boxShadow:"0 12px 40px rgba(0,0,0,.12)",display:"flex",alignItems:"center",gap:9,maxWidth:400}}>
      {e?"⚠️":"✅"} {toast.msg}
    </div>
  );
};

// Error banner
const ErrBanner = ({msg,onRetry}) => (
  <div style={{background:C.redLt,border:`1.5px solid ${C.redBdr}`,borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
    <span style={{fontSize:15}}>⚠️</span>
    <span style={{fontSize:13,color:"#991b1b",fontWeight:600,flex:1}}>{msg}</span>
    {onRetry&&<button className="btn-ghost" onClick={onRetry} style={{fontSize:12,padding:"5px 12px",color:C.red,borderColor:C.redBdr}}>Retry</button>}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Navbar
// ─────────────────────────────────────────────────────────────────────────────
const TABS=[
  {key:"home",         label:"Home",           icon:<HomeIcon/>},
  {key:"appointments", label:"My Appointments", icon:<CalIcon/>},
  {key:"doctors",      label:"Doctors",         icon:<DocIcon/>},
  {key:"profile",      label:"My Profile",      icon:<UserIcon/>},
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

// Page banner
const BANNER={
  appointments:{title:"My Appointments",  sub:"Track, view, and manage your scheduled appointments",emoji:"📋"},
  doctors:     {title:"Doctor Directory", sub:"Browse available healthcare professionals",           emoji:"🩺"},
  profile:     {title:"My Profile",       sub:"View your personal information",                      emoji:"👤"},
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

// ─────────────────────────────────────────────────────────────────────────────
// Book Appointment Modal
// FIX: accepts preselectedDoctor — skips step 1 if a doctor is pre-selected
// ─────────────────────────────────────────────────────────────────────────────
const BookModal = ({doctors, onSuccess, onClose, preselectedDoctor = null}) => {
  // FIX: start at step 2 if a doctor was pre-selected from the Doctors tab
  const [step,setStep]     = useState(preselectedDoctor ? 2 : 1);
  const [sel,setSel]       = useState(preselectedDoctor);
  const [date,setDate]     = useState("");
  const [time,setTime]     = useState("");
  const [reason,setReason] = useState("");
  const [busy,setBusy]     = useState(false);
  const [err,setErr]       = useState("");
  const today = new Date().toISOString().split("T")[0];

  const submit = async () => {
    if (!sel||!date||!time||!reason.trim()){setErr("Please fill in all required fields.");return;}
    setBusy(true); setErr("");
    try {
      await patientApi.bookAppointment({
        // FIX: use docId() helper — backend returns doctorId not id
        doctor_id:        docId(sel),
        requested_date:   date,
        requested_time:   time,
        reason_for_visit: reason.trim(),
      });
      onSuccess("Appointment submitted successfully! Status: Pending — awaiting secretary approval.");
    } catch(e) {
      setErr(e.message?.includes("APPT-001")
        ? "That time slot is already booked. Please choose a different date or time."
        : e.message||"Failed to submit appointment. Please try again.");
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

        {/* Progress */}
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {[1,2].map(s=><div key={s} style={{flex:1,height:4,borderRadius:99,background:step>=s?`linear-gradient(90deg,${C.blue},${C.purple})`:"rgba(226,232,240,.7)",transition:"background .3s"}}/>)}
        </div>

        {err && <ErrBanner msg={err}/>}

        {step===1 ? (
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
                    return (
                      <div key={id} onClick={()=>setSel(doc)}
                        style={{display:"flex",alignItems:"center",gap:14,padding:"13px 16px",borderRadius:14,border:`2px solid ${sel&&docId(sel)===id?C.blue:"rgba(226,232,240,.7)"}`,background:sel&&docId(sel)===id?C.blueLt:"rgba(248,250,252,.8)",cursor:"pointer",transition:"all .18s"}}>
                        <DoctorAvatar firstname={fn} lastname={ln} color={color} size={44} profilePicture={doc.profilePicture}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:14.5,color:C.slate}}>Dr. {fn} {ln}</div>
                          <div style={{fontSize:12.5,color:C.slateL,marginTop:2}}>{doc.specialization}</div>
                        </div>
                        {sel&&docId(sel)===id&&<div style={{width:22,height:22,borderRadius:"50%",background:`linear-gradient(135deg,${C.blue},${C.blueDk})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",flexShrink:0}}><CheckIcon/></div>}
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
        ) : (
          <>
            {/* Doctor recap */}
            {sel && (
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:14,background:C.blueLt,border:`1px solid ${C.blueBdr}`,marginBottom:18}}>
                <DoctorAvatar
                  firstname={sel.firstName||sel.firstname||""}
                  lastname={sel.lastName||sel.lastname||""}
                  color={docColor(docId(sel))}
                  size={40}
                  profilePicture={sel.profilePicture}
                />
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:14,color:C.slate}}>
                    Dr. {sel.firstName||sel.firstname||""} {sel.lastName||sel.lastname||""}
                  </div>
                  <div style={{fontSize:12,color:C.blue,fontWeight:600}}>{sel.specialization}</div>
                </div>
                {/* Only show Change button if not forced from pre-selection */}
                <button onClick={()=>{setSel(null);setStep(1);}} style={{fontSize:12,color:C.blue,background:"none",border:"none",cursor:"pointer",fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Change</button>
              </div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:15}}>
              <div>
                <label style={{fontSize:13,fontWeight:700,color:C.slateM,display:"block",marginBottom:6}}>Requested Date <span style={{color:C.red}}>*</span></label>
                <input type="date" className="input-field" min={today} value={date} onChange={e=>setDate(e.target.value)}/>
              </div>
              <div>
                <label style={{fontSize:13,fontWeight:700,color:C.slateM,display:"block",marginBottom:6}}>Requested Time <span style={{color:C.red}}>*</span></label>
                <select className="input-field" value={time} onChange={e=>setTime(e.target.value)}>
                  <option value="">Select a time slot</option>
                  {["08:00 AM","09:00 AM","10:00 AM","11:00 AM","01:00 PM","02:00 PM","03:00 PM","04:00 PM"].map(t=><option key={t} value={t}>{t}</option>)}
                </select>
                <p style={{fontSize:11.5,color:C.slateXL,marginTop:4}}>Available time slots are displayed above</p>
              </div>
              <div>
                <label style={{fontSize:13,fontWeight:700,color:C.slateM,display:"block",marginBottom:6}}>Reason for Visit <span style={{color:C.red}}>*</span></label>
                <textarea className="input-field" rows={4} maxLength={500}
                  placeholder="Please describe your symptoms or reason for visit…"
                  value={reason} onChange={e=>setReason(e.target.value)}/>
                <p style={{fontSize:11.5,color:reason.length>450?C.amber:C.slateXL,marginTop:4,textAlign:"right"}}>{reason.length}/500</p>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button className="btn-ghost" onClick={()=>{setErr("");setStep(1);}} style={{flex:1,justifyContent:"center",padding:"11px"}}>← Back</button>
              <button className="btn-primary" onClick={submit}
                disabled={busy||!date||!time||!reason.trim()}
                style={{flex:1,justifyContent:"center",gap:8}}>
                {busy?<><Spinner size={16} color="#fff"/> Submitting…</>:<>Submit Appointment ✓</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Appointment field normalisers (snake_case OR camelCase from backend)
// ─────────────────────────────────────────────────────────────────────────────
const apptDate     = a => a.requested_date  || a.requestedDate  || "";
const apptTime     = a => a.requested_time  || a.requestedTime  || "";
const apptReason   = a => a.reason_for_visit|| a.reasonForVisit || "";
const apptStatus   = a => (a.status||"").toUpperCase();
const apptDoctorFn   = a => a.doctor?.firstName || a.doctor?.firstname || "";
const apptDoctorLn   = a => a.doctor?.lastName  || a.doctor?.lastname  || "";
const apptDoctorSpec = a => a.doctor?.specialization || "";
const apptDoctorPic  = a => a.doctor?.profilePicture || null;

// ─────────────────────────────────────────────────────────────────────────────
// HOME TAB
// ─────────────────────────────────────────────────────────────────────────────
const HomeTab = ({user,appts,apptLoad,apptErr,onBook,onGoTo,onRetryAppts,tips,tipsLoad,tipsErr,onRetryTips}) => {
  const [tipIdx,setTipIdx] = useState(0);
  const [tipKey,setTipKey] = useState(0);
  const nextTip = () => { setTipIdx(i=>(i+1)%(tips.length||1)); setTipKey(k=>k+1); };

  const upcoming = appts.filter(a=>["PENDING","APPROVED"].includes(apptStatus(a))).slice(0,4);
  const counts   = {
    total:     appts.length,
    approved:  appts.filter(a=>apptStatus(a)==="APPROVED").length,
    pending:   appts.filter(a=>apptStatus(a)==="PENDING").length,
    completed: appts.filter(a=>apptStatus(a)==="COMPLETED").length,
  };
  const name = user?.firstname||user?.firstName||"there";

  return (
    <div className="pw" style={{padding:"0 32px 56px",maxWidth:1120,margin:"0 auto"}}>
      {/* Hero */}
      <div className="au1" style={{padding:"36px 0 26px"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:20}}>
          <div>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:"clamp(1.6rem,4vw,2.2rem)",fontWeight:900,color:C.slate,lineHeight:1.15,marginBottom:8}}>
              Welcome back, <span className="shimmer-text">{name}!</span>
            </h1>
            <p style={{fontSize:15,color:C.slateL,fontWeight:500,maxWidth:480}}>
              Manage your appointments and explore our network of healthcare professionals.
            </p>
          </div>
          <button className="btn-primary" onClick={()=>onBook(null)} style={{fontSize:15,padding:"13px 26px",flexShrink:0}}>
            <PlusIcon/> Book New Appointment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="four-col au2" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
        {[
          {label:"Total",     val:counts.total,    grad:`linear-gradient(135deg,${C.blue},${C.blueDk})`,   e:"📋"},
          {label:"Approved",  val:counts.approved,  grad:`linear-gradient(135deg,${C.green},#047857)`,    e:"✅"},
          {label:"Pending",   val:counts.pending,   grad:`linear-gradient(135deg,${C.amber},${C.amberDk})`,e:"⏳"},
          {label:"Completed", val:counts.completed, grad:`linear-gradient(135deg,${C.purple},#7e22ce)`,   e:"🏁"},
        ].map((s,i)=>(
          <div key={i} className="stat-card" style={{animationDelay:`${i*.06}s`}}>
            <div style={{width:40,height:40,borderRadius:12,background:s.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,marginBottom:12,boxShadow:"0 3px 12px rgba(0,0,0,.1)"}}>{s.e}</div>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:28,fontWeight:900,color:C.slate,lineHeight:1,marginBottom:4}}>
              {apptLoad ? <Spinner size={22}/> : s.val}
            </div>
            <div style={{fontSize:12.5,color:C.slateL,fontWeight:600}}>{s.label} Appointments</div>
          </div>
        ))}
      </div>

      {/* Appointments */}
      <div className="au3" style={{marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:17,fontWeight:900,color:C.slate}}>Your Appointments</h2>
            <p style={{fontSize:12.5,color:C.slateL,marginTop:2}}>Track and manage your scheduled appointments</p>
          </div>
          <button onClick={()=>onGoTo("appointments")} style={{fontSize:12,color:C.amberDk,background:C.amberLt,border:`1px solid ${C.amberBdr}`,padding:"5px 14px",borderRadius:100,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            View all →
          </button>
        </div>
        {apptErr && <ErrBanner msg={apptErr} onRetry={onRetryAppts}/>}
        {apptLoad ? (
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:40,gap:10,color:C.slateL,fontSize:14,fontWeight:600}}>
            <Spinner/> Loading appointments…
          </div>
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
                      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,color:C.slate}}>
                        Dr. {apptDoctorFn(a)} {apptDoctorLn(a)}
                      </div>
                      <div style={{fontSize:12.5,color:C.slateL,marginTop:2}}>{apptDoctorSpec(a)}</div>
                    </div>
                    <StatusBadge status={a.status}/>
                  </div>
                  <div style={{display:"flex",gap:16,marginBottom:14,flexWrap:"wrap"}}>
                    <span style={{fontSize:13,color:C.slateM,fontWeight:600}}>
                      📅 {apptDate(a)?new Date(apptDate(a)).toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"}):"—"}
                    </span>
                    <span style={{fontSize:13,color:C.slateM,fontWeight:600}}>🕐 {apptTime(a)||"—"}</span>
                  </div>
                  <button className="btn-primary" onClick={()=>onGoTo("appointments")} style={{width:"100%",justifyContent:"center",padding:"9px",fontSize:13}}>
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Health Tips */}
      <div className="au4">
        <div className="glass" style={{padding:"22px 24px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,borderRadius:14,background:`linear-gradient(135deg,${C.green},#047857)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",boxShadow:`0 4px 14px rgba(5,150,105,.28)`}}>
                <LightIcon/>
              </div>
              <div>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,color:C.slate}}>Health Tip of the Day</div>
                <div style={{fontSize:12,color:C.slateL}}>Daily nutrition and wellness advice</div>
              </div>
            </div>
            {tips.length>0 && (
              <button className="btn-ghost" onClick={nextTip} disabled={tipsLoad}
                style={{display:"flex",alignItems:"center",gap:6,fontSize:12.5,color:C.green,background:C.greenLt,border:`1px solid ${C.greenBdr}`,padding:"7px 14px"}}>
                <RefreshIcon/> New Tip
              </button>
            )}
          </div>
          {tipsLoad ? (
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",color:C.slateL,fontSize:13}}>
              <Spinner size={16} color={C.green}/> Loading health tips…
            </div>
          ) : tipsErr ? (
            <div style={{borderLeft:`3px solid ${C.amber}`,paddingLeft:16}}>
              <p style={{fontSize:13.5,color:C.slateL}}>Unable to load health tips right now.</p>
              <button className="btn-ghost" onClick={onRetryTips} style={{marginTop:8,fontSize:12,color:C.amber,borderColor:C.amberBdr,padding:"5px 12px"}}>
                <RefreshIcon/> Retry
              </button>
            </div>
          ) : tips.length>0 ? (
            <>
              <div className="tip-anim" key={tipKey} style={{borderLeft:`3px solid ${C.green}`,paddingLeft:16}}>
                <p style={{fontSize:14.5,color:C.slateM,lineHeight:1.7,fontWeight:500}}>{tips[tipIdx]}</p>
              </div>
              <div style={{fontSize:11.5,color:C.slateXL,marginTop:10}}>Powered by external Health Tips API</div>
              <div style={{display:"flex",gap:5,marginTop:8}}>
                {tips.slice(0,8).map((_,i)=>(
                  <div key={i} onClick={()=>{setTipIdx(i);setTipKey(k=>k+1);}}
                    style={{width:i===tipIdx?20:6,height:6,borderRadius:99,background:i===tipIdx?C.green:"rgba(5,150,105,.2)",cursor:"pointer",transition:"all .3s"}}/>
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

// ─────────────────────────────────────────────────────────────────────────────
// MY APPOINTMENTS TAB
// ─────────────────────────────────────────────────────────────────────────────
const AppointmentsTab = ({appts,loading,error,onBook,onRetry}) => {
  const [filter,setFilter] = useState("ALL");
  const list = filter==="ALL" ? appts : appts.filter(a=>apptStatus(a)===filter);

  return (
    <div className="pw" style={{padding:"24px 32px 56px",maxWidth:1120,margin:"0 auto"}}>
      <div className="au2" style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
        {["ALL","PENDING","APPROVED","COMPLETED","REJECTED"].map(f=>(
          <button key={f} className="filter-pill" onClick={()=>setFilter(f)}
            style={{borderColor:filter===f?C.blue:"rgba(226,232,240,.8)",background:filter===f?C.blueLt:"rgba(255,255,255,.72)",color:filter===f?C.blue:C.slateL}}>
            {f}
          </button>
        ))}
        <button className="btn-primary" onClick={()=>onBook(null)} style={{marginLeft:"auto",padding:"8px 18px",fontSize:13}}>
          <PlusIcon/> Book New
        </button>
      </div>

      {error && <ErrBanner msg={error} onRetry={onRetry}/>}

      {loading ? (
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:60,gap:10,color:C.slateL,fontSize:14,fontWeight:600}}>
          <Spinner/> Loading appointments…
        </div>
      ) : list.length===0 ? (
        <div className="glass" style={{padding:56,textAlign:"center",color:C.slateXL,fontSize:14}}>
          <div style={{fontSize:36,marginBottom:10}}>📭</div>
          No {filter==="ALL"?"":filter.toLowerCase()} appointments found.
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {list.map((a,i)=>{
            const color=docColor(a.doctor?.doctorId??a.doctor?.id??0);
            const st=apptStatus(a);
            return (
              <div key={a.id} className="appt-card au3" style={{padding:"18px 22px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",animationDelay:`${i*.05}s`}}>
                <DoctorAvatar firstname={apptDoctorFn(a)} lastname={apptDoctorLn(a)} color={color} size={50} profilePicture={apptDoctorPic(a)}/>
                <div style={{flex:1,minWidth:180}}>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15.5,color:C.slate}}>
                    Dr. {apptDoctorFn(a)} {apptDoctorLn(a)}
                  </div>
                  <div style={{fontSize:13,color:C.slateL,marginTop:2}}>{apptDoctorSpec(a)}</div>
                  <div style={{display:"flex",gap:16,marginTop:6,flexWrap:"wrap"}}>
                    <span style={{fontSize:12.5,color:C.slateM,fontWeight:600}}>
                      📅 {apptDate(a)?new Date(apptDate(a)).toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"}):"—"}
                    </span>
                    <span style={{fontSize:12.5,color:C.slateM,fontWeight:600}}>🕐 {apptTime(a)||"—"}</span>
                  </div>
                  {apptReason(a) && (
                    <div style={{fontSize:12,color:C.slateXL,marginTop:5,display:"flex",gap:4,alignItems:"flex-start"}}>
                      <span>📝</span>
                      <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:320}}>{apptReason(a)}</span>
                    </div>
                  )}
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
                  <StatusBadge status={a.status}/>
                  {st==="PENDING" && (
                    <span style={{fontSize:11.5,color:C.amber,fontWeight:600,background:C.amberLt,border:`1px solid ${C.amberBdr}`,padding:"4px 10px",borderRadius:8}}>
                      ⏳ Awaiting secretary approval
                    </span>
                  )}
                  {st==="APPROVED" && (
                    <span style={{fontSize:11.5,color:C.green,fontWeight:600,background:C.greenLt,border:`1px solid ${C.greenBdr}`,padding:"4px 10px",borderRadius:8}}>
                      ✓ Appointment confirmed
                    </span>
                  )}
                  {st==="REJECTED" && (
                    <span style={{fontSize:11.5,color:"#991b1b",fontWeight:600,background:C.redLt,border:`1px solid ${C.redBdr}`,padding:"4px 10px",borderRadius:8}}>
                      ✗ Not approved
                    </span>
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

// ─────────────────────────────────────────────────────────────────────────────
// DOCTORS TAB
// FIX: uses doctorId, shows licenseNumber + phoneNumber, pre-selects on book
// ─────────────────────────────────────────────────────────────────────────────
const DoctorsTab = ({doctors,loading,error,onBook,onRetry}) => {
  const [search,setSearch] = useState("");
  const [spec,setSpec]     = useState("All");
  const specs = ["All",...new Set(doctors.map(d=>d.specialization).filter(Boolean))];
  const list  = doctors.filter(d=>{
    const fn=d.firstName||d.firstname||"";
    const ln=d.lastName||d.lastname||"";
    return (spec==="All"||d.specialization===spec)
      && `${fn} ${ln}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="pw" style={{padding:"24px 32px 56px",maxWidth:1120,margin:"0 auto"}}>
      <div className="au2" style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{position:"relative",flex:"1 1 220px",maxWidth:320}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:C.slateXL,pointerEvents:"none",fontSize:14}}>🔍</span>
          <input className="input-field" placeholder="Search doctors…" value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:36}}/>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {specs.map(s=>(
            <button key={s} className="filter-pill" onClick={()=>setSpec(s)}
              style={{borderColor:spec===s?C.blue:"rgba(226,232,240,.8)",background:spec===s?C.blueLt:"rgba(255,255,255,.72)",color:spec===s?C.blue:C.slateL,fontSize:12}}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrBanner msg={error} onRetry={onRetry}/>}

      {loading ? (
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:60,gap:10,color:C.slateL,fontSize:14,fontWeight:600}}>
          <Spinner/> Loading doctors…
        </div>
      ) : (
        <div className="doc-grid au3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          {list.map((doc,i)=>{
            const fn=doc.firstName||doc.firstname||"";
            const ln=doc.lastName||doc.lastname||"";
            // FIX: use docId() — DoctorSummaryResponse uses doctorId not id
            const id=docId(doc);
            const color=docColor(id);
            return (
              <div key={id} className="doc-card" style={{animationDelay:`${i*.05}s`}}>
                <div style={{display:"flex",alignItems:"center",gap:13,marginBottom:14}}>
                  <DoctorAvatar firstname={fn} lastname={ln} color={color} size={50} profilePicture={doc.profilePicture}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:14.5,color:C.slate,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      Dr. {fn} {ln}
                    </div>
                    <div style={{fontSize:12.5,color:C.slateL,marginTop:2}}>{doc.specialization||"General Practitioner"}</div>
                    {/* FIX: show licenseNumber from DoctorSummaryResponse */}
                    {doc.licenseNumber && (
                      <div style={{fontSize:11.5,color:C.slateXL,marginTop:3,display:"flex",alignItems:"center",gap:4}}>
                        <span>🪪</span>
                        <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          License: {doc.licenseNumber}
                        </span>
                      </div>
                    )}
                    {/* FIX: show phoneNumber from DoctorSummaryResponse */}
                    {doc.phoneNumber && (
                      <div style={{fontSize:11.5,color:C.slateXL,marginTop:2,display:"flex",alignItems:"center",gap:4}}>
                        <span>📞</span> {doc.phoneNumber}
                      </div>
                    )}
                  </div>
                </div>
                {/* Status badge — only show if not APPROVED to avoid visual noise */}
                {doc.status && doc.status !== "APPROVED" && (
                  <div style={{marginBottom:10}}>
                    <StatusBadge status={doc.status}/>
                  </div>
                )}
                {/* FIX: pass the full doc object so BookModal can pre-select it */}
                <button className="btn-primary" onClick={()=>onBook(doc)}
                  style={{width:"100%",justifyContent:"center",padding:"10px",fontSize:13}}>
                  Book Appointment
                </button>
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
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE TAB
// ─────────────────────────────────────────────────────────────────────────────
const ProfileTab = ({user}) => {
  const fn = user?.firstname||user?.firstName||"";
  const ln = user?.lastname||user?.lastName||"";
  return (
    <div className="pw" style={{padding:"24px 32px 56px",maxWidth:760,margin:"0 auto"}}>
      <div className="glass au2" style={{padding:"28px 32px",marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:28,flexWrap:"wrap"}}>
          <div style={{width:78,height:78,borderRadius:"50%",background:`linear-gradient(135deg,${C.blue},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:900,fontSize:26,boxShadow:`0 6px 20px rgba(37,99,235,.28)`}}>
            {getInitials(fn,ln)||"P"}
          </div>
          <div style={{flex:1,minWidth:160}}>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:21,fontWeight:900,color:C.slate}}>{fn} {ln}</div>
            <div style={{fontSize:13.5,color:C.slateL,marginTop:2}}>{user?.email}</div>
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <span style={{background:C.blueLt,color:C.blue,border:`1px solid ${C.blueBdr}`,borderRadius:100,padding:"3px 11px",fontSize:11.5,fontWeight:700}}>Patient</span>
            </div>
          </div>
        </div>
        <div style={{borderTop:"1.5px solid rgba(226,232,240,.6)",paddingTop:20}}>
          <div style={{fontSize:13,fontWeight:700,color:C.slateM,marginBottom:16,display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:15}}>👤</span> Personal Information
          </div>
          {[
            {label:"Full Name",    val:`${fn} ${ln}`.trim()},
            {label:"Email Address",val:user?.email},
            {label:"Role",         val:"Patient"},
          ].map(({label,val})=>(
            <div key={label} style={{padding:"13px 0",borderBottom:"1px solid rgba(226,232,240,.5)"}}>
              <div style={{fontSize:11,fontWeight:700,color:C.slateXL,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>{label}</div>
              <div style={{fontSize:14.5,color:C.slateM,fontWeight:500}}>{val||<span style={{color:C.slateXL,fontStyle:"italic"}}>Not provided</span>}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-sm au3" style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:38,height:38,borderRadius:12,background:C.blueLt,border:`1px solid ${C.blueBdr}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>🔒</div>
        <div>
          <div style={{fontSize:13.5,fontWeight:700,color:C.slate,marginBottom:2}}>Account Security</div>
          <div style={{fontSize:12.5,color:C.slateL}}>Your account is secured via Google OAuth or JWT authentication.</div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ROOT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function PatientDashboard() {
  const navigate         = useNavigate();
  const { user, logout } = useAuth();

  const [tab,setTab]   = useState("home");
  const [toast,setToast] = useState(null);

  // FIX: bookDoctor replaces the old boolean showBook state.
  //   null        → modal closed
  //   true        → modal open, no pre-selection (generic booking)
  //   <doc object> → modal open, doctor pre-selected (from Doctors tab)
  const [bookDoctor,setBookDoctor] = useState(null);

  // Appointments
  const [appts,setAppts]       = useState([]);
  const [apptLoad,setApptLoad] = useState(true);
  const [apptErr,setApptErr]   = useState("");

  // Doctors
  const [doctors,setDoctors]   = useState([]);
  const [docLoad,setDocLoad]   = useState(true);
  const [docErr,setDocErr]     = useState("");

  // Health tips
  const [tips,setTips]         = useState([]);
  const [tipsLoad,setTipsLoad] = useState(true);
  const [tipsErr,setTipsErr]   = useState("");

  const showToast = (msg,type="success") => {
    setToast({msg,type}); setTimeout(()=>setToast(null),4500);
  };

  // FIX: single API call per fetch — no more double invocation
  const fetchAppts = useCallback(async () => {
    setApptLoad(true); setApptErr("");
    try {
      const d = await patientApi.getMyAppointments();
      setAppts(Array.isArray(d) ? d : []);
    } catch(e) {
      setApptErr(e.message||"Failed to load appointments.");
    } finally { setApptLoad(false); }
  },[]);

  const fetchDoctors = useCallback(async () => {
    setDocLoad(true); setDocErr("");
    try {
      const d = await patientApi.getAllDoctors();
      setDoctors(Array.isArray(d) ? d : []);
    } catch(e) {
      setDocErr(e.message||"Failed to load doctors.");
    } finally { setDocLoad(false); }
  },[]);

  const fetchTips = useCallback(async () => {
    setTipsLoad(true); setTipsErr("");
    try {
      setTips(await healthTipsApi.getTips());
    } catch(e) {
      setTipsErr(e.message||"Failed to load health tips.");
    } finally { setTipsLoad(false); }
  },[]);

  // On mount — use the useCallback versions directly
  useEffect(() => {
    fetchAppts();
    fetchDoctors();
    fetchTips();
  },[fetchAppts, fetchDoctors, fetchTips]);

  const handleBookSuccess = (msg) => {
    setBookDoctor(null);
    showToast(msg);
    fetchAppts(); // refresh appointments list
  };

  const handleLogout = async () => {
    try { await logout(); } catch {} finally { navigate("/login"); }
  };

  // FIX: openBook accepts an optional doc object (or null for generic)
  // Called with a doc object from DoctorsTab, or null/undefined from other tabs
  const openBook  = (doc = null) => setBookDoctor(doc ?? true);
  const closeBook = ()           => setBookDoctor(null);

  return (
    <div style={{fontFamily:"'DM Sans','Segoe UI',sans-serif",minHeight:"100vh",background:"linear-gradient(160deg,#eef2ff 0%,#e0e7ff 35%,#dbeafe 65%,#ede9fe 100%)",position:"relative",overflow:"hidden"}}>
      <GlobalStyles/>

      {/* Background */}
      <div aria-hidden style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        <div style={{position:"absolute",width:700,height:700,borderRadius:"50%",background:"rgba(37,99,235,.09)",filter:"blur(72px)",top:-220,right:-120}}/>
        <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"rgba(124,58,237,.07)",filter:"blur(62px)",bottom:-160,left:-100}}/>
        <div style={{position:"absolute",width:380,height:380,borderRadius:"50%",background:"rgba(16,185,129,.06)",filter:"blur(55px)",bottom:"22%",right:"17%"}}/>
        <div style={{position:"absolute",width:260,height:260,borderRadius:"50%",background:"rgba(245,158,11,.05)",filter:"blur(45px)",top:"38%",left:"8%"}}/>
        <div className="cloud-a" style={{position:"absolute",top:80, left:"6%", opacity:.45}}><Cloud style={{width:240,height:96}}/></div>
        <div className="cloud-b" style={{position:"absolute",top:160,right:"22%",opacity:.28}}><Cloud style={{width:180,height:72}}/></div>
        <div className="cloud-c" style={{position:"absolute",top:50, right:"5%",opacity:.22}}><Cloud style={{width:200,height:80}}/></div>
        <div className="cloud-a" style={{position:"absolute",bottom:"20%",left:"26%",opacity:.18}}><Cloud style={{width:220,height:88}}/></div>
        <div className="cloud-b" style={{position:"absolute",bottom:"6%",right:"9%",opacity:.15}}><Cloud style={{width:160,height:64}}/></div>
        <div className="float-a" style={{position:"absolute",width:90,height:90,borderRadius:"50%",background:"linear-gradient(135deg,rgba(37,99,235,.18),rgba(124,58,237,.12))",top:"22%",right:"12%",border:"1px solid rgba(255,255,255,.5)"}}/>
        <div className="float-b" style={{position:"absolute",width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,rgba(16,185,129,.2),rgba(37,99,235,.1))",top:"62%",right:"30%",border:"1px solid rgba(255,255,255,.4)"}}/>
        <div className="float-a" style={{position:"absolute",width:36,height:36,borderRadius:"50%",background:"rgba(124,58,237,.15)",top:"42%",left:"4%",border:"1px solid rgba(255,255,255,.35)",animationDelay:"3s"}}/>
      </div>

      <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
        <Navbar active={tab} onTab={setTab} onLogout={handleLogout} user={user}/>
        <Toast toast={toast}/>

        {/* FIX: modal opens with pre-selected doctor when coming from DoctorsTab */}
        {bookDoctor !== null && (
          <BookModal
            doctors={doctors}
            preselectedDoctor={bookDoctor === true ? null : bookDoctor}
            onSuccess={handleBookSuccess}
            onClose={closeBook}
          />
        )}

        <div style={{flex:1}}>
          <PageBanner tab={tab}/>
          {tab==="home" && (
            <HomeTab
              user={user}
              appts={appts}     apptLoad={apptLoad} apptErr={apptErr}
              onBook={openBook}
              onGoTo={setTab}
              onRetryAppts={fetchAppts}
              tips={tips}       tipsLoad={tipsLoad} tipsErr={tipsErr}
              onRetryTips={fetchTips}
            />
          )}
          {tab==="appointments" && (
            <AppointmentsTab
              appts={appts} loading={apptLoad} error={apptErr}
              onBook={openBook}
              onRetry={fetchAppts}
            />
          )}
          {tab==="doctors" && (
            <DoctorsTab
              doctors={doctors} loading={docLoad} error={docErr}
              onBook={openBook}   // passes the full doc object → pre-selects in modal
              onRetry={fetchDoctors}
            />
          )}
          {tab==="profile" && <ProfileTab user={user}/>}
        </div>
      </div>
    </div>
  );
}