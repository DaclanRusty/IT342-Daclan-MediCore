import { useState } from 'react';
import { C, SB } from './doctorConstants';

// ── Global Styles ─────────────────────────────────────────────────────────
export const GlobalStyles = () => (
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

// ── Cloud SVG ─────────────────────────────────────────────────────────────
export const Cloud = ({ style }) => (
  <svg viewBox="0 0 200 80" fill="none" style={style}>
    <path d="M170 60H45C28 60 15 47 15 30C15 15 26 4 40 4C42 4 44 4 46 5C50 -1 58 -2 65 2C70 -4 80 -5 88 1C93 -3 101 -3 107 2C114 -2 124 0 128 8C140 6 152 14 154 26C162 26 170 34 170 43V60Z" fill="white" fillOpacity="0.55"/>
  </svg>
);

// ── Icons ─────────────────────────────────────────────────────────────────
const Ico = ({size=16,ch}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} dangerouslySetInnerHTML={{__html:ch}}/>;
export const HomeIcon    = () => <Ico size={17} ch='<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'/>
export const CalIcon     = () => <Ico size={17} ch='<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'/>
export const UserIcon    = () => <Ico size={17} ch='<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'/>
export const UsersIcon   = () => <Ico size={17} ch='<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'/>
export const LogoutIcon  = () => <Ico size={15} ch='<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'/>
export const CheckIcon   = () => <Ico size={16} ch='<polyline points="20 6 9 17 4 12"/>'/>
export const XIcon       = () => <Ico size={16} ch='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'/>
export const PencilIcon  = () => <Ico size={15} ch='<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>'/>
export const SaveIcon    = () => <Ico size={15} ch='<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>'/>
export const EyeOnIcon   = () => <Ico size={15} ch='<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'/>
export const EyeOffIcon  = () => <Ico size={15} ch='<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'/>

export const DateIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={13} height={13} style={{flexShrink:0}}>
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
export const TimeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={13} height={13} style={{flexShrink:0}}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

// Stat icons
export const StatApptIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={20} height={20}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
export const StatCheckIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={20} height={20}><polyline points="20 6 9 17 4 12"/></svg>
export const StatClockIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={20} height={20}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
export const StatUserIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={20} height={20}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>

// ── Spinner ────────────────────────────────────────────────────────────────
export const Spinner = ({size=22, color=C.green}) => (
  <svg style={{animation:"spin 1s linear infinite",flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" width={size} height={size}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

// ── Toast ──────────────────────────────────────────────────────────────────
export const Toast = ({toast}) => {
  if (!toast) return null;
  const e = toast.type === "error";
  return (
    <div className="toast-in" style={{position:"fixed",top:78,right:24,zIndex:9999,background:e?C.redLt:C.greenLt,border:`1.5px solid ${e?C.redBdr:C.greenBdr}`,color:e?"#991b1b":"#166534",padding:"13px 20px",borderRadius:16,fontWeight:700,fontSize:13.5,boxShadow:"0 12px 40px rgba(0,0,0,.12)",display:"flex",alignItems:"center",gap:9,maxWidth:400}}>
      {e?"⚠️":"✅"} {toast.msg}
    </div>
  );
};

// ── ErrBanner ─────────────────────────────────────────────────────────────
export const ErrBanner = ({msg, onRetry}) => (
  <div style={{background:C.redLt,border:`1.5px solid ${C.redBdr}`,borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
    <span style={{fontSize:15}}>⚠️</span>
    <span style={{fontSize:13,color:"#991b1b",fontWeight:600,flex:1}}>{msg}</span>
    {onRetry && <button className="btn-ghost" onClick={onRetry} style={{fontSize:12,padding:"5px 12px",color:C.red,borderColor:C.redBdr}}>Retry</button>}
  </div>
);

// ── StatusBadge ───────────────────────────────────────────────────────────
export const StatusBadge = ({status=""}) => {
  const [bg, color, border] = SB[status?.toUpperCase()] || SB.PENDING;
  return (
    <span style={{background:bg,color,border:`1px solid ${border}`,borderRadius:100,padding:"3px 11px",fontSize:11.5,fontWeight:700,letterSpacing:".02em",whiteSpace:"nowrap"}}>
      {status}
    </span>
  );
};

// ── AvatarImg ─────────────────────────────────────────────────────────────
export const AvatarImg = ({ src, alt="", style={} }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return (
    <img src={src} alt={alt} style={{width:"100%",height:"100%",objectFit:"cover",...style}} onError={()=>setFailed(true)}/>
  );
};