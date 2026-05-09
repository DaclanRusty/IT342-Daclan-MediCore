  import React, { useState, useEffect } from 'react';
  import { useNavigate, useLocation } from 'react-router-dom';
  import { authApi } from '../services/api';
  import { useAuth } from '../context/AuthContext';

  const BACKEND_URL = 'http://localhost:8081';

  export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [email, setEmail]               = useState('');
    const [password, setPassword]         = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe]     = useState(false);
    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState('');
    const [focused, setFocused]           = useState('');

    const registeredMessage = location.state?.message;

    useEffect(() => {
      const el = document.createElement('style');
      el.id = 'medicore-login-styles';
      el.innerHTML = `
        @keyframes mc-floatA { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-22px) rotate(6deg)} }
        @keyframes mc-floatB { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-16px)} }
        @keyframes mc-floatC { 0%,100%{transform:translateY(-8px)} 50%{transform:translateY(8px)} }
        @keyframes mc-driftL { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-14px)} }
        @keyframes mc-driftR { 0%,100%{transform:translateX(0)} 50%{transform:translateX(14px)} }
        @keyframes mc-spin   { to{transform:rotate(360deg)} }
        @keyframes mc-spinR  { to{transform:rotate(-360deg)} }
        @keyframes mc-pulse  { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.1);opacity:.85} }
        @keyframes mc-slideUp{ from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes mc-shimmer{ 0%{background-position:200% center} 100%{background-position:-200% center} }

        /* ── Animated border: rotates a conic-gradient behind the card ── */
        @keyframes mc-border-spin { to { --mc-angle: 360deg; } }
        @property --mc-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        .mc-border-wrap {
          --mc-angle: 0deg;
          animation: mc-border-spin 4s linear infinite;
          padding: 2.5px;
          border-radius: 26px;
          background: conic-gradient(
            from var(--mc-angle),
            #2563eb, #7c3aed, #ec4899, #7c3aed, #2563eb
          );
          box-shadow: 0 0 20px rgba(37,99,235,.2), 0 0 40px rgba(124,58,237,.12);
        }

        .mc-card-inner {
          background: #f0f4ff;
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 28px 28px;
        }

        .mc-card   { animation: mc-slideUp .7s cubic-bezier(.22,1,.36,1) forwards; }
        .mc-input  { transition:all .25s; border:1.5px solid #e2e8f0 !important; background:#fff; }
        .mc-input:focus { border-color:#2563eb !important; box-shadow:0 0 0 3px rgba(37,99,235,.1) !important; outline:none !important; }
        .mc-btn-p  { transition:all .25s cubic-bezier(.22,1,.36,1); }
        .mc-btn-p:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 32px rgba(37,99,235,.45) !important; }
        .mc-btn-p:disabled { opacity:.6; cursor:not-allowed; }
        .mc-btn-g  { transition:all .2s; }
        .mc-btn-g:hover { border-color:#93c5fd !important; background:#f0f6ff !important; transform:translateY(-1px); }
        .mc-pill   { transition:transform .2s; }
        .mc-pill:hover { transform:translateX(5px); }

        .mc-blob-1 { animation: mc-pulse 8s ease-in-out infinite; }
        .mc-blob-2 { animation: mc-pulse 10s ease-in-out infinite 2s; }
        .mc-blob-3 { animation: mc-pulse 12s ease-in-out infinite 4s; }
        .mc-ring-1 { animation: mc-spin 40s linear infinite; }
        .mc-ring-2 { animation: mc-spinR 26s linear infinite; }
        .mc-ring-3 { animation: mc-spin 18s linear infinite; }
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
        .mc-spin-l { animation: mc-spin .8s linear infinite; }
        .mc-status { animation: mc-pulse 2s ease-in-out infinite; }
        .mc-shimmer {
          background: linear-gradient(90deg,#2563eb,#7c3aed,#2563eb);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: mc-shimmer 4s linear infinite;
        }
      `;
      if (!document.getElementById('medicore-login-styles')) {
        document.head.appendChild(el);
      }
      return () => {
        const existing = document.getElementById('medicore-login-styles');
        if (existing) existing.remove();
      };
    }, []);

    const getDashboardPath = (role) => {
      switch (role.toLowerCase()) {
        case 'admin':     return '/dashboard/admin';
        case 'doctor':    return '/dashboard/doctor';
        case 'secretary': return '/dashboard/secretary';
        default:          return '/dashboard/patient';
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError(''); setLoading(true);
      try {
        const data = await authApi.login(email, password);
        login(data.user, data.accessToken, data.refreshToken);
        navigate(getDashboardPath(data.user.role));
      } catch (err) {
        const msg = err.message || '';
        if (msg.toLowerCase().includes('pending'))       setError('__pending__');
        else if (msg.toLowerCase().includes('rejected')) setError('__rejected__');
        else setError(msg);
      } finally {
        setLoading(false);
      } 
    };

    const handleGoogleSignIn = () => {
      window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
    };

    const cloudPath = "M170 60H45C28 60 15 47 15 30C15 15 26 4 40 4C42 4 44 4 46 5C50 -1 58 -2 65 2C70 -4 80 -5 88 1C93 -3 101 -3 107 2C114 -2 124 0 128 8C140 6 152 14 154 26C162 26 170 34 170 43V60Z";

    return (
      <div style={{fontFamily:"'DM Sans','Segoe UI',sans-serif",minHeight:'100vh',background:'linear-gradient(160deg,#eef2ff 0%,#e0e7ff 40%,#dbeafe 70%,#ede9fe 100%)',display:'flex',flexDirection:'column',position:'relative',overflow:'hidden'}}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800;900&display=swap" rel="stylesheet"/>

        {/* ── Animated background ── */}
        <div className="mc-blob-1" style={{position:'absolute',width:700,height:700,borderRadius:'50%',background:'radial-gradient(circle,rgba(37,99,235,.13) 0%,transparent 70%)',top:-250,right:-150,pointerEvents:'none'}}/>
        <div className="mc-blob-2" style={{position:'absolute',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(124,58,237,.1) 0%,transparent 70%)',bottom:-150,left:-100,pointerEvents:'none'}}/>
        <div className="mc-blob-3" style={{position:'absolute',width:350,height:350,borderRadius:'50%',background:'radial-gradient(circle,rgba(16,185,129,.08) 0%,transparent 70%)',bottom:80,right:'22%',pointerEvents:'none'}}/>

        <div className="mc-ring-1" style={{position:'absolute',width:440,height:440,borderRadius:'50%',border:'1.5px solid rgba(37,99,235,.1)',top:'50%',right:'2%',marginTop:-220,pointerEvents:'none'}}/>
        <div className="mc-ring-2" style={{position:'absolute',width:290,height:290,borderRadius:'50%',border:'1px dashed rgba(124,58,237,.12)',top:'50%',right:'calc(2% + 75px)',marginTop:-145,pointerEvents:'none'}}/>
        <div className="mc-ring-3" style={{position:'absolute',width:160,height:160,borderRadius:'50%',border:'1px solid rgba(37,99,235,.08)',top:'50%',right:'calc(2% + 140px)',marginTop:-80,pointerEvents:'none'}}/>

        <div className="mc-sq-1" style={{position:'absolute',width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,rgba(37,99,235,.18),rgba(124,58,237,.12))',top:'12%',left:'4%',pointerEvents:'none',border:'1px solid rgba(255,255,255,.5)'}}/>
        <div className="mc-sq-2" style={{position:'absolute',width:38,height:38,borderRadius:10,background:'linear-gradient(135deg,rgba(16,185,129,.2),rgba(37,99,235,.1))',top:'32%',left:'8%',pointerEvents:'none',border:'1px solid rgba(255,255,255,.4)'}}/>
        <div className="mc-sq-3" style={{position:'absolute',width:26,height:26,borderRadius:8,background:'rgba(124,58,237,.15)',top:'60%',left:'5%',pointerEvents:'none',border:'1px solid rgba(255,255,255,.3)'}}/>
        <div className="mc-sq-4" style={{position:'absolute',width:46,height:46,borderRadius:14,background:'linear-gradient(135deg,rgba(37,99,235,.15),rgba(16,185,129,.1))',bottom:'22%',left:'12%',pointerEvents:'none',border:'1px solid rgba(255,255,255,.4)'}}/>

        <div className="mc-dot-1" style={{position:'absolute',width:10,height:10,borderRadius:'50%',background:'rgba(37,99,235,.35)',top:'18%',left:'16%',pointerEvents:'none'}}/>
        <div className="mc-dot-2" style={{position:'absolute',width:7,height:7,borderRadius:'50%',background:'rgba(124,58,237,.3)',top:'46%',left:'3%',pointerEvents:'none'}}/>
        <div className="mc-dot-3" style={{position:'absolute',width:12,height:12,borderRadius:'50%',background:'rgba(16,185,129,.3)',top:'72%',left:'18%',pointerEvents:'none'}}/>
        <div className="mc-dot-4" style={{position:'absolute',width:8,height:8,borderRadius:'50%',background:'rgba(37,99,235,.25)',bottom:'15%',left:'7%',pointerEvents:'none'}}/>

        <div className="mc-cl-1" style={{position:'absolute',top:'8%',left:'22%',opacity:.5,pointerEvents:'none'}}>
          <svg viewBox="0 0 200 80" fill="none" style={{width:180,height:72}}><path d={cloudPath} fill="white" fillOpacity="0.8"/></svg>
        </div>
        <div className="mc-cl-2" style={{position:'absolute',top:'16%',right:'36%',opacity:.4,pointerEvents:'none'}}>
          <svg viewBox="0 0 200 80" fill="none" style={{width:140,height:56}}><path d={cloudPath} fill="white" fillOpacity="0.8"/></svg>
        </div>
        <div className="mc-cl-3" style={{position:'absolute',bottom:'16%',left:'28%',opacity:.3,pointerEvents:'none'}}>
          <svg viewBox="0 0 200 80" fill="none" style={{width:160,height:64}}><path d={cloudPath} fill="white" fillOpacity="0.8"/></svg>
        </div>
        <div className="mc-cl-4" style={{position:'absolute',top:'55%',right:'4%',opacity:.25,pointerEvents:'none'}}>
          <svg viewBox="0 0 200 80" fill="none" style={{width:120,height:48}}><path d={cloudPath} fill="white" fillOpacity="0.8"/></svg>
        </div>

        {/* ── Navbar ── */}
        <nav style={{padding:'0 5%',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',position:'relative',zIndex:10}}>
          <div onClick={()=>navigate('/')} style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
            <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#2563eb,#1d4ed8)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:16,boxShadow:'0 4px 12px rgba(37,99,235,.3)'}}>M</div>
            <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:'#0f172a',letterSpacing:'-0.3px'}}>Medi<span style={{color:'#2563eb'}}>Core</span></span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,.75)',backdropFilter:'blur(12px)',borderRadius:100,padding:'6px 16px',border:'1px solid rgba(255,255,255,.9)',boxShadow:'0 2px 12px rgba(37,99,235,.08)'}}>
            <div className="mc-status" style={{width:8,height:8,borderRadius:'50%',background:'#10b981'}}/>
            <span style={{fontSize:12,fontWeight:600,color:'#475569'}}>System Online</span>
          </div>
        </nav>

        {/* ── Main layout — centered, both panels side by side ── */}
        <div style={{
          flex:1,
          display:'flex',
          alignItems:'flex-start',
          justifyContent:'center',
          padding:'20px 5%',
          position:'relative',
          zIndex:10,
        }}>
          <div style={{
            display:'flex',
            alignItems:'flex-start',
            justifyContent:'center',
            gap:48,
            width:'100%',
            maxWidth:920,
            flexWrap:'wrap',
          }}>

            {/* ── Left panel ── */}
            <div style={{flex:'1 1 300px',maxWidth:400}}>

              <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:'clamp(1.9rem,3.5vw,2.8rem)',fontWeight:900,color:'#0f172a',lineHeight:1.1,marginBottom:14,letterSpacing:'-1px'}}>
                Welcome to<br/>
                <span className="mc-shimmer">MediCore</span>
              </h1>

              <p style={{color:'#64748b',fontSize:14.5,lineHeight:1.75,marginBottom:24,maxWidth:360}}>
                Access your healthcare dashboard to manage appointments, schedules, and patient care — all in one place.
              </p>

              <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:24}}>
                {[
                  {text:'Secure & encrypted connection',bg:'#eff6ff',border:'#bfdbfe',tc:'#1d4ed8'},
                  {text:'Real-time appointment updates',bg:'#f0fdf4',border:'#bbf7d0',tc:'#065f46'},
                  {text:'Multi-device accessibility',bg:'#f5f3ff',border:'#ddd6fe',tc:'#5b21b6'},
                ].map((f,i)=>(
                  <div key={i} className="mc-pill" style={{display:'flex',alignItems:'center',gap:12,background:f.bg,borderRadius:12,padding:'10px 14px',border:`1px solid ${f.border}`,boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
                    <span style={{fontSize:16}}>{f.icon}</span>
                    <span style={{fontSize:13,fontWeight:600,color:f.tc}}>{f.text}</span>
                    <svg style={{marginLeft:'auto'}} viewBox="0 0 24 24" fill="none" stroke={f.border} strokeWidth="2" width="13" height="13"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                ))}
              </div>

              <div style={{borderRadius:16,padding:'16px 20px',background:'linear-gradient(135deg,#1e3a8a,#1d4ed8)',color:'#fff',position:'relative',overflow:'hidden',boxShadow:'0 8px 28px rgba(37,99,235,.3)'}}>
                <div style={{position:'absolute',top:-18,right:-8,width:80,height:80,borderRadius:'50%',background:'rgba(255,255,255,.07)'}}/>
                <div style={{fontWeight:700,fontSize:13,marginBottom:3,position:'relative'}}>Making Healthcare Scheduling Easier</div>
                <div style={{fontSize:12,opacity:.8,position:'relative'}}>Connecting patients and clinics seamlessly.</div>
              </div>
            </div>

            {/* ── Right login card with animated border ── */}
            <div className="mc-card" style={{flex:'1 1 300px',maxWidth:400}}>

              {/* Animated border wrapper */}
              <div className="mc-border-wrap">
                <div className="mc-card-inner">

                  {/* Card header */}
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:registeredMessage?10:18}}>
                    <div>
                      <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:900,color:'#0f172a',marginBottom:3,letterSpacing:'-0.5px'}}>Sign In</h2>
                      <p style={{color:'#94a3b8',fontSize:12}}>Welcome back! Please enter your details.</p>
                    </div>
                  </div>

                  {/* Success banner */}
                  {registeredMessage && (
                    <div style={{background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',border:'1px solid #bbf7d0',borderRadius:10,padding:'8px 11px',marginBottom:10,display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:20,height:20,borderRadius:6,flexShrink:0,background:'linear-gradient(135deg,#10b981,#059669)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <div>
                        <span style={{fontSize:11,color:'#059669'}}>{registeredMessage}</span>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>

                    {/* Email */}
                    <div style={{marginBottom:12}}>
                      <label style={{display:'block',fontSize:12,fontWeight:700,color:'#374151',marginBottom:6}}>Email Address</label>
                      <div style={{position:'relative'}}>
                        <div style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',width:28,height:28,borderRadius:8,background:focused==='email'?'linear-gradient(135deg,#eff6ff,#dbeafe)':'#f8fafc',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s',pointerEvents:'none'}}>
                          <svg viewBox="0 0 24 24" fill="none" stroke={focused==='email'?'#2563eb':'#94a3b8'} strokeWidth="2" width="13" height="13"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        </div>
                        <input className="mc-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="your.email@example.com"
                          onFocus={()=>setFocused('email')} onBlur={()=>setFocused('')}
                          style={{width:'100%',padding:'11px 12px 11px 48px',borderRadius:10,fontSize:13,color:'#0f172a',boxSizing:'border-box'}}/>
                      </div>
                    </div>

                    {/* Password */}
                    <div style={{marginBottom:12}}>
                      <label style={{display:'block',fontSize:12,fontWeight:700,color:'#374151',marginBottom:6}}>Password</label>
                      <div style={{position:'relative'}}>
                        <div style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',width:28,height:28,borderRadius:8,background:focused==='password'?'linear-gradient(135deg,#eff6ff,#dbeafe)':'#f8fafc',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s',pointerEvents:'none'}}>
                          <svg viewBox="0 0 24 24" fill="none" stroke={focused==='password'?'#2563eb':'#94a3b8'} strokeWidth="2" width="13" height="13"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        </div>
                        <input className="mc-input" type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Enter your password"
                          onFocus={()=>setFocused('password')} onBlur={()=>setFocused('')}
                          style={{width:'100%',padding:'11px 42px 11px 48px',borderRadius:10,fontSize:13,color:'#0f172a',boxSizing:'border-box'}}/>
                        <button type="button" onClick={()=>setShowPassword(!showPassword)}
                          style={{position:'absolute',right:11,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#94a3b8',padding:4,display:'flex',alignItems:'center'}}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                      </div>
                    </div>

                    {/* Remember / Forgot */}
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                      <label style={{display:'flex',alignItems:'center',gap:7,cursor:'pointer',fontSize:12,color:'#475569',fontWeight:500}}>
                        <input type="checkbox" checked={rememberMe} onChange={e=>setRememberMe(e.target.checked)} style={{accentColor:'#2563eb',width:14,height:14}}/>
                        Remember me
                      </label>
                      <button type="button" style={{background:'none',border:'none',color:'#2563eb',fontSize:12,fontWeight:700,cursor:'pointer'}}>Forgot password?</button>
                    </div>

                    {/* Errors */}
                    {error && (
                      <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'10px 12px',marginBottom:14}}>
                        {error==='__pending__' ? (
                          <div style={{display:'flex',alignItems:'flex-start',gap:8}}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" width="14" height="14" style={{flexShrink:0,marginTop:1}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            <div style={{color:'#92400e'}}><strong style={{fontSize:12}}>Account Pending Approval</strong><br/><span style={{fontSize:11}}>Your registration is being reviewed. You'll be able to login once approved.</span></div>
                          </div>
                        ) : error==='__rejected__' ? (
                          <div style={{display:'flex',alignItems:'flex-start',gap:8}}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" width="14" height="14" style={{flexShrink:0,marginTop:1}}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                            <div style={{color:'#dc2626'}}><span style={{fontSize:11}}>Your registration was rejected. Please contact support.</span></div>
                          </div>
                        ) : <span style={{color:'#dc2626',fontSize:12}}>{error}</span>}
                      </div>
                    )}

                    {/* Sign in button */}
                    <button className="mc-btn-p" type="submit" disabled={loading}
                      style={{width:'100%',padding:'12px 0',borderRadius:11,border:'none',background:'linear-gradient(135deg,#2563eb,#1d4ed8)',color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer',boxShadow:'0 6px 20px rgba(37,99,235,.35)'}}>
                      {loading ? (
                        <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                          <svg className="mc-spin-l" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                          Signing in…
                        </span>
                      ) : 'Sign In →'}
                    </button>

                    {/* Divider */}
                    <div style={{display:'flex',alignItems:'center',gap:10,margin:'14px 0'}}>
                      <div style={{flex:1,height:1,background:'linear-gradient(90deg,transparent,#e2e8f0)'}}/>
                      <span style={{fontSize:11,color:'#94a3b8',fontWeight:600}}>or continue with</span>
                      <div style={{flex:1,height:1,background:'linear-gradient(90deg,#e2e8f0,transparent)'}}/>
                    </div>

                    {/* Google button */}
                    <button type="button" className="mc-btn-g" onClick={handleGoogleSignIn}
                      style={{width:'100%',padding:'11px 16px',borderRadius:11,border:'1.5px solid #e2e8f0',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',gap:10,cursor:'pointer',fontSize:13,fontWeight:600,color:'#374151',boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
                      <svg width="16" height="16" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        <path fill="none" d="M0 0h48v48H0z"/>
                      </svg>
                      Continue with Google
                    </button>
                  </form>

                  <p style={{textAlign:'center',marginTop:16,fontSize:12,color:'#94a3b8'}}>
                    Don't have an account?
                    <button onClick={()=>navigate('/register')} style={{background:'none',border:'none',color:'#2563eb',fontWeight:700,cursor:'pointer',fontSize:12}}>Register</button>
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    );
  }