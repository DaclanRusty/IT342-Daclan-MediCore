import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ROLES = [
  {
    key: 'patient',
    label: 'Patient',
    description: 'Book appointments and manage your health records',
    color: '#2563eb',
    grad: 'linear-gradient(135deg,#eff6ff,#dbeafe)',
    btnGrad: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
    border: '#bfdbfe',
    shadow: 'rgba(37,99,235,.2)',
    cardBg: 'linear-gradient(160deg,#eff6ff 0%,#dbeafe 100%)',
    path: '/register/patient',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="26" height="26">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    key: 'secretary',
    label: 'Secretary',
    description: 'Manage appointments and assist your assigned doctor',
    color: '#7c3aed',
    grad: 'linear-gradient(135deg,#f5f3ff,#ede9fe)',
    btnGrad: 'linear-gradient(135deg,#a855f7,#7c3aed)',
    border: '#ddd6fe',
    shadow: 'rgba(124,58,237,.2)',
    cardBg: 'linear-gradient(160deg,#f5f3ff 0%,#ede9fe 100%)',
    path: '/register/secretary',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="26" height="26">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    key: 'doctor',
    label: 'Doctor',
    description: 'Manage your patients, schedule, and appointments',
    color: '#059669',
    grad: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
    btnGrad: 'linear-gradient(135deg,#10b981,#059669)',
    border: '#bbf7d0',
    shadow: 'rgba(16,185,129,.2)',
    cardBg: 'linear-gradient(160deg,#f0fdf4 0%,#dcfce7 100%)',
    path: '/register/doctor',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="26" height="26">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
];

const cloudPath = "M170 60H45C28 60 15 47 15 30C15 15 26 4 40 4C42 4 44 4 46 5C50 -1 58 -2 65 2C70 -4 80 -5 88 1C93 -3 101 -3 107 2C114 -2 124 0 128 8C140 6 152 14 154 26C162 26 170 34 170 43V60Z";

export default function RegisterRolePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const el = document.createElement('style');
    el.id = 'mc-register-styles';
    el.innerHTML = `
      @keyframes mc-floatA { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-18px) rotate(5deg)} }
      @keyframes mc-floatB { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-14px)} }
      @keyframes mc-floatC { 0%,100%{transform:translateY(-6px)} 50%{transform:translateY(6px)} }
      @keyframes mc-driftL { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-12px)} }
      @keyframes mc-driftR { 0%,100%{transform:translateX(0)} 50%{transform:translateX(12px)} }
      @keyframes mc-spin   { to{transform:rotate(360deg)} }
      @keyframes mc-spinR  { to{transform:rotate(-360deg)} }
      @keyframes mc-pulse  { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.1);opacity:.85} }
      @keyframes mc-slideUp{ from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
      @keyframes mc-shimmer{ 0%{background-position:200% center} 100%{background-position:-200% center} }
      @keyframes mc-cardIn { from{opacity:0;transform:translateY(24px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }

      .mc-blob-1 { animation: mc-pulse 8s ease-in-out infinite; }
      .mc-blob-2 { animation: mc-pulse 10s ease-in-out infinite 2s; }
      .mc-blob-3 { animation: mc-pulse 12s ease-in-out infinite 4s; }
      .mc-ring-1 { animation: mc-spin 40s linear infinite; }
      .mc-ring-2 { animation: mc-spinR 26s linear infinite; }
      .mc-sq-1   { animation: mc-floatA 7s ease-in-out infinite; }
      .mc-sq-2   { animation: mc-floatB 9s ease-in-out infinite 1.5s; }
      .mc-sq-3   { animation: mc-floatC 11s ease-in-out infinite 3s; }
      .mc-sq-4   { animation: mc-floatA 8s ease-in-out infinite 2s; }
      .mc-dot-1  { animation: mc-floatC 6s ease-in-out infinite; }
      .mc-dot-2  { animation: mc-floatA 8s ease-in-out infinite 1s; }
      .mc-dot-3  { animation: mc-floatB 10s ease-in-out infinite 2s; }
      .mc-dot-4  { animation: mc-floatC 7s ease-in-out infinite 3s; }
      .mc-cl-1   { animation: mc-driftR 12s ease-in-out infinite; }
      .mc-cl-2   { animation: mc-driftL 15s ease-in-out infinite; }
      .mc-cl-3   { animation: mc-driftR 18s ease-in-out infinite 2s; }
      .mc-cl-4   { animation: mc-driftL 10s ease-in-out infinite 1s; }
      .mc-status { animation: mc-pulse 2s ease-in-out infinite; }
      .mc-header { animation: mc-slideUp .7s cubic-bezier(.22,1,.36,1) forwards; }
      .mc-shimmer {
        background: linear-gradient(90deg,#2563eb,#7c3aed,#2563eb);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: mc-shimmer 4s linear infinite;
      }
      .mc-card-1 { animation: mc-cardIn .6s cubic-bezier(.22,1,.36,1) .1s both; }
      .mc-card-2 { animation: mc-cardIn .6s cubic-bezier(.22,1,.36,1) .22s both; }
      .mc-card-3 { animation: mc-cardIn .6s cubic-bezier(.22,1,.36,1) .34s both; }
      .mc-role-card { transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s; cursor: pointer; }
      .mc-role-card:hover { transform: translateY(-8px) scale(1.02); }
      .mc-role-btn { transition: all .25s cubic-bezier(.22,1,.36,1); cursor: pointer; border: none; }
      .mc-role-btn:hover { transform: translateY(-2px); filter: brightness(1.08); }
    `;
    if (!document.getElementById('mc-register-styles')) {
      document.head.appendChild(el);
    }
    return () => {
      const existing = document.getElementById('mc-register-styles');
      if (existing) existing.remove();
    };
  }, []);

  return (
    <div style={{
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
      height: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden',
      background: 'linear-gradient(160deg,#eef2ff 0%,#e0e7ff 40%,#dbeafe 70%,#ede9fe 100%)',
      display: 'flex', flexDirection: 'column',
      position: 'relative',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800;900&display=swap" rel="stylesheet"/>

      {/* ── Animated blobs ── */}
      <div className="mc-blob-1" style={{position:'absolute',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(37,99,235,.12) 0%,transparent 70%)',top:-200,right:-120,pointerEvents:'none'}}/>
      <div className="mc-blob-2" style={{position:'absolute',width:450,height:450,borderRadius:'50%',background:'radial-gradient(circle,rgba(124,58,237,.09) 0%,transparent 70%)',bottom:-120,left:-80,pointerEvents:'none'}}/>
      <div className="mc-blob-3" style={{position:'absolute',width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(16,185,129,.07) 0%,transparent 70%)',bottom:60,right:'20%',pointerEvents:'none'}}/>

      {/* ── Spinning rings ── */}
      <div className="mc-ring-1" style={{position:'absolute',width:380,height:380,borderRadius:'50%',border:'1.5px solid rgba(37,99,235,.1)',top:'50%',right:'1%',marginTop:-190,pointerEvents:'none'}}/>
      <div className="mc-ring-2" style={{position:'absolute',width:240,height:240,borderRadius:'50%',border:'1px dashed rgba(124,58,237,.1)',top:'50%',right:'calc(1% + 70px)',marginTop:-120,pointerEvents:'none'}}/>

      {/* ── Floating squares ── */}
      <div className="mc-sq-1" style={{position:'absolute',width:48,height:48,borderRadius:14,background:'linear-gradient(135deg,rgba(37,99,235,.18),rgba(124,58,237,.12))',top:'8%',left:'3%',pointerEvents:'none',border:'1px solid rgba(255,255,255,.5)'}}/>
      <div className="mc-sq-2" style={{position:'absolute',width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,rgba(16,185,129,.2),rgba(37,99,235,.1))',top:'38%',left:'7%',pointerEvents:'none',border:'1px solid rgba(255,255,255,.4)'}}/>
      <div className="mc-sq-3" style={{position:'absolute',width:22,height:22,borderRadius:6,background:'rgba(124,58,237,.15)',top:'65%',left:'4%',pointerEvents:'none',border:'1px solid rgba(255,255,255,.3)'}}/>
      <div className="mc-sq-4" style={{position:'absolute',width:38,height:38,borderRadius:11,background:'linear-gradient(135deg,rgba(37,99,235,.15),rgba(16,185,129,.1))',bottom:'18%',left:'11%',pointerEvents:'none',border:'1px solid rgba(255,255,255,.4)'}}/>
      <div className="mc-sq-2" style={{position:'absolute',width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,rgba(124,58,237,.15),rgba(37,99,235,.1))',top:'12%',right:'5%',pointerEvents:'none',border:'1px solid rgba(255,255,255,.4)'}}/>
      <div className="mc-sq-3" style={{position:'absolute',width:24,height:24,borderRadius:7,background:'rgba(16,185,129,.14)',bottom:'28%',right:'8%',pointerEvents:'none',border:'1px solid rgba(255,255,255,.3)'}}/>

      {/* ── Floating dots ── */}
      <div className="mc-dot-1" style={{position:'absolute',width:9,height:9,borderRadius:'50%',background:'rgba(37,99,235,.35)',top:'18%',left:'14%',pointerEvents:'none'}}/>
      <div className="mc-dot-2" style={{position:'absolute',width:6,height:6,borderRadius:'50%',background:'rgba(124,58,237,.3)',top:'50%',left:'2%',pointerEvents:'none'}}/>
      <div className="mc-dot-3" style={{position:'absolute',width:11,height:11,borderRadius:'50%',background:'rgba(16,185,129,.3)',top:'78%',left:'16%',pointerEvents:'none'}}/>
      <div className="mc-dot-4" style={{position:'absolute',width:7,height:7,borderRadius:'50%',background:'rgba(37,99,235,.25)',bottom:'10%',left:'6%',pointerEvents:'none'}}/>
      <div className="mc-dot-1" style={{position:'absolute',width:8,height:8,borderRadius:'50%',background:'rgba(124,58,237,.25)',top:'20%',right:'13%',pointerEvents:'none'}}/>
      <div className="mc-dot-3" style={{position:'absolute',width:10,height:10,borderRadius:'50%',background:'rgba(37,99,235,.2)',bottom:'22%',right:'17%',pointerEvents:'none'}}/>

      {/* ── Floating clouds ── */}
      <div className="mc-cl-1" style={{position:'absolute',top:'5%',left:'18%',opacity:.45,pointerEvents:'none'}}>
        <svg viewBox="0 0 200 80" fill="none" style={{width:160,height:64}}><path d={cloudPath} fill="white" fillOpacity="0.8"/></svg>
      </div>
      <div className="mc-cl-2" style={{position:'absolute',top:'12%',right:'30%',opacity:.35,pointerEvents:'none'}}>
        <svg viewBox="0 0 200 80" fill="none" style={{width:120,height:48}}><path d={cloudPath} fill="white" fillOpacity="0.8"/></svg>
      </div>
      <div className="mc-cl-3" style={{position:'absolute',bottom:'12%',left:'22%',opacity:.25,pointerEvents:'none'}}>
        <svg viewBox="0 0 200 80" fill="none" style={{width:140,height:56}}><path d={cloudPath} fill="white" fillOpacity="0.8"/></svg>
      </div>
      <div className="mc-cl-4" style={{position:'absolute',top:'55%',right:'3%',opacity:.2,pointerEvents:'none'}}>
        <svg viewBox="0 0 200 80" fill="none" style={{width:110,height:44}}><path d={cloudPath} fill="white" fillOpacity="0.8"/></svg>
      </div>

      {/* ── Navbar ── */}
      <nav style={{padding:'0 5%',height:56,display:'flex',alignItems:'center',justifyContent:'space-between',position:'relative',zIndex:10,flexShrink:0}}>
        <div onClick={()=>navigate('/')} style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
          <div style={{width:34,height:34,borderRadius:10,background:'linear-gradient(135deg,#2563eb,#1d4ed8)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,boxShadow:'0 4px 12px rgba(37,99,235,.3)'}}>M</div>
          <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:17,color:'#0f172a',letterSpacing:'-0.3px'}}>Medi<span style={{color:'#2563eb'}}>Core</span></span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,.75)',backdropFilter:'blur(12px)',borderRadius:100,padding:'5px 14px',border:'1px solid rgba(255,255,255,.9)',boxShadow:'0 2px 12px rgba(37,99,235,.08)'}}>
          <div className="mc-status" style={{width:7,height:7,borderRadius:'50%',background:'#10b981'}}/>
          <span style={{fontSize:11,fontWeight:600,color:'#475569'}}>System Online</span>
        </div>
      </nav>

      {/* ── Main content ── */}
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 5% 16px',position:'relative',zIndex:10}}>

        {/* Header */}
        <div className="mc-header" style={{textAlign:'center',marginBottom:28}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(255,255,255,.8)',backdropFilter:'blur(8px)',borderRadius:100,padding:'5px 14px',marginBottom:14,border:'1px solid rgba(37,99,235,.15)',boxShadow:'0 2px 12px rgba(37,99,235,.08)'}}>
            <div className="mc-status" style={{width:6,height:6,borderRadius:'50%',background:'#2563eb'}}/>
            <span style={{fontSize:11,fontWeight:600,color:'#2563eb'}}>Create Account</span>
          </div>
          <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:'clamp(1.6rem,3.5vw,2.4rem)',fontWeight:900,color:'#0f172a',marginBottom:8,letterSpacing:'-0.8px',lineHeight:1.1}}>
            Who are you <span className="mc-shimmer">registering as?</span>
          </h1>
          <p style={{color:'#64748b',fontSize:14,maxWidth:420,margin:'0 auto',lineHeight:1.6}}>
            Select your role to get started. Each role has its own registration form and access level.
          </p>
        </div>

        {/* ── Role cards — always side by side, colored backgrounds ── */}
        <div style={{
          display:'flex',
          flexDirection:'row',
          gap:18,
          justifyContent:'center',
          width:'100%',
          maxWidth:920,
          flexWrap:'nowrap',
        }}>
          {ROLES.map((r, i) => (
            <div
              key={r.key}
              className={`mc-role-card mc-card-${i+1}`}
              onClick={() => navigate(r.path)}
              style={{
                flex:'1 1 0',
                minWidth:0,
                background: r.cardBg,
                borderRadius:22,
                border:`1.5px solid ${r.border}`,
                boxShadow:`0 8px 28px ${r.shadow}`,
                padding:'24px 20px 20px',
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
                textAlign:'center',
              }}
            >
              {/* Icon */}
              <div style={{
                width:56,height:56,borderRadius:16,
                background:'rgba(255,255,255,.7)',
                backdropFilter:'blur(8px)',
                border:`1.5px solid ${r.border}`,
                display:'flex',alignItems:'center',justifyContent:'center',
                color:r.color,marginBottom:14,
                boxShadow:`0 4px 14px ${r.shadow}`,
              }}>
                {r.icon}
              </div>

              <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:800,color:'#0f172a',marginBottom:8,letterSpacing:'-0.3px'}}>
                {r.label}
              </h2>
              <p style={{fontSize:13,color:'#475569',lineHeight:1.6,marginBottom:20,flexGrow:1}}>
                {r.description}
              </p>

              {/* Divider */}
              <div style={{width:'100%',height:1,background:`linear-gradient(90deg,transparent,${r.border},transparent)`,marginBottom:16}}/>

              <button
                className="mc-role-btn"
                onClick={e=>{e.stopPropagation();navigate(r.path);}}
                style={{
                  width:'100%',padding:'10px 0',borderRadius:11,
                  background:r.btnGrad,color:'#fff',
                  fontWeight:700,fontSize:13,cursor:'pointer',
                  boxShadow:`0 4px 14px ${r.shadow}`,
                }}
              >
                Register as {r.label} →
              </button>
            </div>
          ))}
        </div>

        {/* Sign in link */}
        <div style={{marginTop:20,display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,.7)',backdropFilter:'blur(8px)',borderRadius:100,padding:'7px 18px',border:'1px solid rgba(255,255,255,.9)',boxShadow:'0 2px 8px rgba(37,99,235,.06)'}}>
          <span style={{fontSize:12,color:'#64748b'}}>Already have an account?</span>
          <button onClick={()=>navigate('/login')} style={{background:'none',border:'none',color:'#2563eb',fontWeight:700,cursor:'pointer',fontSize:12}}>
            Sign in →
          </button>
        </div>
      </div>
    </div>
  );
}