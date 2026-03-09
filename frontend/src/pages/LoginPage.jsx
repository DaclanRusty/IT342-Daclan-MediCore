import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { key:'patient', label:'Patient', color:'#2563eb', activeGrad:'linear-gradient(135deg,#eff6ff,#dbeafe)', btnGrad:'linear-gradient(135deg,#2563eb,#1d4ed8)' },
  { key:'doctor',  label:'Doctor',  color:'#10b981', activeGrad:'linear-gradient(135deg,#f0fdf4,#dcfce7)', btnGrad:'linear-gradient(135deg,#10b981,#059669)' },
  { key:'secretary', label:'Secretary', color:'#a855f7', activeGrad:'linear-gradient(135deg,#faf5ff,#ede9fe)', btnGrad:'linear-gradient(135deg,#a855f7,#9333ea)' },
];

const RoleIcon = ({ roleKey }) => {
  if (roleKey === 'patient') return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  if (roleKey === 'doctor') return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const activeRole = ROLES.find(r => r.key === role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await authApi.login(email, password);
      const serverRole = data.user.role.toLowerCase();
      if (serverRole !== role) { setError(`This account is a ${data.user.role}. Please select the correct role.`); return; }
      login(data.user, data.accessToken, data.refreshToken);
      navigate(`/dashboard/${role}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{fontFamily:"'DM Sans','Segoe UI',sans-serif",minHeight:'100vh',background:'linear-gradient(135deg,#f0f4ff 0%,#e8f0fe 60%,#dbeafe 100%)',display:'flex',flexDirection:'column'}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.lc{animation:fadeUp .5s ease forwards;}input:focus{outline:none;}.rt{transition:all .2s;cursor:pointer;}.rt:hover{transform:translateY(-2px);}.bl{transition:all .2s;}.bl:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.07);}.bl:disabled{opacity:.6;cursor:not-allowed;}`}</style>

      <nav style={{padding:'0 5%',height:60,display:'flex',alignItems:'center'}}>
        <div onClick={()=>navigate('/')} style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
          <div style={{width:34,height:34,borderRadius:9,background:'linear-gradient(135deg,#2563eb,#1d4ed8)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15}}>M</div>
          <span style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:17,color:'#1e293b'}}>Medi<span style={{color:'#2563eb'}}>Core</span></span>
        </div>
      </nav>

      <div style={{flex:1,display:'flex',alignItems:'center',padding:'20px 5%',gap:60,maxWidth:1100,margin:'0 auto',width:'100%',flexWrap:'wrap'}}>
        <div style={{flex:'1 1 340px'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(37,99,235,.1)',borderRadius:20,padding:'4px 12px',color:'#2563eb',fontSize:12,fontWeight:600,marginBottom:24}}>
            <span style={{width:6,height:6,background:'#2563eb',borderRadius:'50%'}}/>Secure Login
          </div>
          <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:'clamp(2rem,4vw,2.8rem)',fontWeight:800,color:'#0f172a',lineHeight:1.2,marginBottom:16}}>Welcome to<br/><span style={{color:'#2563eb'}}>MediCore</span></h1>
          <p style={{color:'#64748b',fontSize:15,lineHeight:1.7,marginBottom:28,maxWidth:380}}>Access your healthcare dashboard to manage appointments, schedules, and patient care all in one place.</p>
          {['Secure & encrypted connection','Real-time appointment updates','Multi-device accessibility'].map(item=>(
            <div key={item} style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
              <div style={{width:26,height:26,borderRadius:8,background:'linear-gradient(135deg,#2563eb,#1d4ed8)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" width="13" height="13"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <span style={{color:'#475569',fontSize:14,fontWeight:500}}>{item}</span>
            </div>
          ))}
          <div style={{marginTop:32,borderRadius:16,padding:'20px 24px',background:'linear-gradient(135deg,#1e40af,#2563eb)',color:'#fff'}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>Making Healthcare Scheduling Easier</div>
            <div style={{fontSize:13,opacity:.85}}>Connecting patients and clinics through one seamless platform.</div>
          </div>
        </div>

        <div className="lc" style={{flex:'1 1 360px',maxWidth:440,background:'#fff',borderRadius:24,boxShadow:'0 24px 64px rgba(37,99,235,.13)',padding:36}}>
          <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:'#0f172a',marginBottom:6}}>Sign In</h2>
          <p style={{color:'#94a3b8',fontSize:13,marginBottom:24}}>Select your role and enter your credentials</p>

          <div style={{display:'flex',gap:10,marginBottom:26}}>
            {ROLES.map(r => {
              const isActive = role === r.key;
              return (
                <button key={r.key} className="rt" onClick={()=>{setRole(r.key);setError('');}}
                  style={{flex:1,padding:'11px 8px',borderRadius:12,border:`2px solid ${isActive?r.color:'#e2e8f0'}`,background:isActive?r.activeGrad:'#f8fafc',color:isActive?r.color:'#94a3b8',display:'flex',flexDirection:'column',alignItems:'center',gap:5,fontWeight:isActive?600:500,fontSize:12,cursor:'pointer'}}>
                  <RoleIcon roleKey={r.key}/>{r.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{marginBottom:16}}>
              <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:6}}>Email Address</label>
              <div style={{position:'relative'}}>
                <svg style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'#94a3b8'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="your.email@example.com"
                  style={{width:'100%',padding:'11px 12px 11px 38px',borderRadius:10,border:'1.5px solid #e2e8f0',fontSize:14,color:'#0f172a',boxSizing:'border-box'}}
                  onFocus={e=>e.target.style.borderColor=activeRole.color} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
              </div>
            </div>

            <div style={{marginBottom:16}}>
              <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:6}}>Password</label>
              <div style={{position:'relative'}}>
                <svg style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'#94a3b8'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Enter your password"
                  style={{width:'100%',padding:'11px 40px 11px 38px',borderRadius:10,border:'1.5px solid #e2e8f0',fontSize:14,color:'#0f172a',boxSizing:'border-box'}}
                  onFocus={e=>e.target.style.borderColor=activeRole.color} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
                <button type="button" onClick={()=>setShowPassword(!showPassword)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#94a3b8',padding:2}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>

            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <label style={{display:'flex',alignItems:'center',gap:7,cursor:'pointer',fontSize:13,color:'#475569'}}>
                <input type="checkbox" checked={rememberMe} onChange={e=>setRememberMe(e.target.checked)} style={{accentColor:activeRole.color,width:15,height:15}}/>Remember me
              </label>
              <button type="button" style={{background:'none',border:'none',color:activeRole.color,fontSize:13,fontWeight:600,cursor:'pointer'}}>Forgot password?</button>
            </div>

            {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'10px 14px',marginBottom:16,color:'#dc2626',fontSize:13}}>{error}</div>}

            {role==='secretary' && (
              <div style={{background:'#faf5ff',border:'1px solid #e9d5ff',borderRadius:10,padding:'12px 14px',marginBottom:16,fontSize:13,color:'#7c3aed'}}>
                <strong>Secretary accounts</strong> are created by hospital administrators. Please contact your administrator for access credentials.
              </div>
            )}

            <button className="bl" type="submit" disabled={loading}
              style={{width:'100%',padding:13,borderRadius:11,border:'none',background:activeRole.btnGrad,color:'#fff',fontWeight:700,fontSize:15,cursor:'pointer',boxShadow:`0 6px 20px ${activeRole.color}30`}}>
              {loading?'Signing in…':`Sign In as ${activeRole.label} →`}
            </button>
          </form>

          <p style={{textAlign:'center',marginTop:20,fontSize:13,color:'#94a3b8'}}>
            Don't have an account?{' '}
            <button onClick={()=>navigate(role==='doctor'?'/register/doctor':'/register/patient')} style={{background:'none',border:'none',color:activeRole.color,fontWeight:600,cursor:'pointer',fontSize:13}}>Register</button>
          </p>
        </div>
      </div>
    </div>
  );
}