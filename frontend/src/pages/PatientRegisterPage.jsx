import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

const GENDERS = ['Male', 'Female', 'Other'];

export default function PatientRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({firstname:'',lastname:'',email:'',password:'',confirmPassword:'',phoneNumber:'',dateOfBirth:'',gender:'',address:''});
  const [agreed, setAgreed] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fe, setFe] = useState({});

  const upd = (f,v) => { setForm(p=>({...p,[f]:v})); setFe(p=>({...p,[f]:''})); setError(''); };

  const validate = () => {
    const e={};
    if(!form.firstname.trim()) e.firstname='Required';
    if(!form.lastname.trim()) e.lastname='Required';
    if(!form.email.trim()) e.email='Required';
    if(form.password.length<8) e.password='Min 8 characters';
    if(form.password!==form.confirmPassword) e.confirmPassword='Passwords do not match';
    if(!form.phoneNumber.trim()) e.phoneNumber='Required';
    if(!form.dateOfBirth) e.dateOfBirth='Required';
    if(!form.gender) e.gender='Select a gender';
    if(!form.address.trim()) e.address='Required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs=validate();
    if(Object.keys(errs).length>0){setFe(errs);return;}
    if(!agreed){setError('Please agree to the Terms & Conditions');return;}
    setLoading(true); setError('');
    try {
      await authApi.registerPatient({
        firstname:form.firstname, lastname:form.lastname, email:form.email,
        password:form.password, phoneNumber:form.phoneNumber,
        dateOfBirth:form.dateOfBirth, gender:form.gender.toUpperCase(), address:form.address,
      });
      navigate('/login',{state:{registered:true}});
    } catch(err){ setError(err.message); }
    finally{ setLoading(false); }
  };

  const inp=(f,ex={})=>({width:'100%',padding:'11px 12px 11px 38px',borderRadius:10,border:`1.5px solid ${fe[f]?'#ef4444':'#e2e8f0'}`,fontSize:14,color:'#0f172a',background:'#fff',boxSizing:'border-box',...ex});
  const lbl={display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:6};
  const ic={position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'#94a3b8',pointerEvents:'none'};

  return (
    <div style={{fontFamily:"'DM Sans','Segoe UI',sans-serif",minHeight:'100vh',background:'linear-gradient(135deg,#f0f4ff 0%,#e8f0fe 60%,#dbeafe 100%)'}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.rc{animation:fadeUp .5s ease forwards;}input:focus,textarea:focus{outline:none;border-color:#2563eb!important;}.breg{transition:all .2s;}.breg:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px rgba(37,99,235,.35)!important;}.breg:disabled{opacity:.6;cursor:not-allowed;}.gbtn{transition:border-color .2s,background .2s;cursor:pointer;}.gbtn:hover{border-color:#2563eb!important;}`}</style>

      <nav style={{padding:'0 5%',height:60,display:'flex',alignItems:'center'}}>
        <div onClick={()=>navigate('/')} style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
          <div style={{width:34,height:34,borderRadius:9,background:'linear-gradient(135deg,#2563eb,#1d4ed8)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15}}>M</div>
          <span style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:17,color:'#1e293b'}}>Medi<span style={{color:'#2563eb'}}>Core</span></span>
        </div>
      </nav>

      <div style={{padding:'20px 5% 60px',display:'flex',flexDirection:'column',alignItems:'center'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(37,99,235,.1)',borderRadius:20,padding:'5px 14px',color:'#2563eb',fontSize:13,fontWeight:600,marginBottom:20}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Patient Registration
        </div>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:'clamp(1.8rem,4vw,2.4rem)',fontWeight:800,color:'#0f172a',textAlign:'center',marginBottom:8}}>Create Your <span style={{color:'#2563eb'}}>Account</span></h1>
        <p style={{color:'#64748b',fontSize:15,marginBottom:32,textAlign:'center'}}>Healthcare Scheduling Made Easy.</p>

        <div className="rc" style={{background:'#fff',borderRadius:24,boxShadow:'0 24px 64px rgba(37,99,235,.13)',padding:36,width:'100%',maxWidth:620}}>
          {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'10px 14px',marginBottom:20,color:'#dc2626',fontSize:13}}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div>
                <label style={lbl}>First Name <span style={{color:'#ef4444'}}>*</span></label>
                <div style={{position:'relative'}}>
                  <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input value={form.firstname} onChange={e=>upd('firstname',e.target.value)} placeholder="First name" style={inp('firstname')}/>
                </div>
                {fe.firstname && <p style={{color:'#ef4444',fontSize:12,marginTop:4}}>{fe.firstname}</p>}
              </div>
              <div>
                <label style={lbl}>Last Name <span style={{color:'#ef4444'}}>*</span></label>
                <div style={{position:'relative'}}>
                  <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input value={form.lastname} onChange={e=>upd('lastname',e.target.value)} placeholder="Last name" style={inp('lastname')}/>
                </div>
                {fe.lastname && <p style={{color:'#ef4444',fontSize:12,marginTop:4}}>{fe.lastname}</p>}
              </div>
            </div>

            <div style={{marginBottom:16}}>
              <label style={lbl}>Email Address <span style={{color:'#ef4444'}}>*</span></label>
              <div style={{position:'relative'}}>
                <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input type="email" value={form.email} onChange={e=>upd('email',e.target.value)} placeholder="your.email@example.com" style={inp('email')}/>
              </div>
              {fe.email && <p style={{color:'#ef4444',fontSize:12,marginTop:4}}>{fe.email}</p>}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div>
                <label style={lbl}>Password <span style={{color:'#ef4444'}}>*</span></label>
                <div style={{position:'relative'}}>
                  <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input type={showPw?'text':'password'} value={form.password} onChange={e=>upd('password',e.target.value)} placeholder="Min. 8 characters" style={inp('password',{paddingRight:38})}/>
                  <button type="button" onClick={()=>setShowPw(!showPw)} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#94a3b8'}}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
                {fe.password && <p style={{color:'#ef4444',fontSize:12,marginTop:4}}>{fe.password}</p>}
              </div>
              <div>
                <label style={lbl}>Confirm Password <span style={{color:'#ef4444'}}>*</span></label>
                <div style={{position:'relative'}}>
                  <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input type={showCpw?'text':'password'} value={form.confirmPassword} onChange={e=>upd('confirmPassword',e.target.value)} placeholder="Repeat password" style={inp('confirmPassword',{paddingRight:38})}/>
                  <button type="button" onClick={()=>setShowCpw(!showCpw)} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#94a3b8'}}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
                {fe.confirmPassword && <p style={{color:'#ef4444',fontSize:12,marginTop:4}}>{fe.confirmPassword}</p>}
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div>
                <label style={lbl}>Phone Number <span style={{color:'#ef4444'}}>*</span></label>
                <div style={{position:'relative'}}>
                  <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.1a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/></svg>
                  <input value={form.phoneNumber} onChange={e=>upd('phoneNumber',e.target.value)} placeholder="+63 900 000 0000" style={inp('phoneNumber')}/>
                </div>
                {fe.phoneNumber && <p style={{color:'#ef4444',fontSize:12,marginTop:4}}>{fe.phoneNumber}</p>}
              </div>
              <div>
                <label style={lbl}>Date of Birth <span style={{color:'#ef4444'}}>*</span></label>
                <div style={{position:'relative'}}>
                  <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <input type="date" value={form.dateOfBirth} onChange={e=>upd('dateOfBirth',e.target.value)} style={inp('dateOfBirth')}/>
                </div>
                {fe.dateOfBirth && <p style={{color:'#ef4444',fontSize:12,marginTop:4}}>{fe.dateOfBirth}</p>}
              </div>
            </div>

            <div style={{marginBottom:16}}>
              <label style={lbl}>Sex <span style={{color:'#ef4444'}}>*</span></label>
              <div style={{display:'flex',gap:10}}>
                {GENDERS.map(g=>(
                  <button key={g} type="button" className="gbtn" onClick={()=>upd('gender',g)}
                    style={{flex:1,padding:10,borderRadius:10,fontSize:14,fontWeight:500,border:`1.5px solid ${form.gender===g?'#2563eb':'#e2e8f0'}`,background:form.gender===g?'linear-gradient(135deg,#eff6ff,#dbeafe)':'#f8fafc',color:form.gender===g?'#2563eb':'#64748b'}}>
                    {form.gender===g?'✓ ':''}{g}
                  </button>
                ))}
              </div>
              {fe.gender && <p style={{color:'#ef4444',fontSize:12,marginTop:4}}>{fe.gender}</p>}
            </div>

            <div style={{marginBottom:20}}>
              <label style={lbl}>Address <span style={{color:'#ef4444'}}>*</span></label>
              <div style={{position:'relative'}}>
                <svg style={{...ic,top:14,transform:'none'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <textarea value={form.address} onChange={e=>upd('address',e.target.value)} placeholder="Street, Barangay, City, Province" rows={2}
                  style={{...inp('address'),paddingTop:11,paddingBottom:11,resize:'none',fontFamily:'inherit'}}/>
              </div>
              {fe.address && <p style={{color:'#ef4444',fontSize:12,marginTop:4}}>{fe.address}</p>}
            </div>

            <label style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:24,cursor:'pointer'}}>
              <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{accentColor:'#2563eb',width:16,height:16,marginTop:2,flexShrink:0}}/>
              <span style={{fontSize:13,color:'#475569',lineHeight:1.5}}>I agree to the <button type="button" style={{background:'none',border:'none',color:'#2563eb',fontWeight:600,cursor:'pointer',fontSize:13,padding:0}}>Terms & Conditions</button></span>
            </label>

            <button className="breg" type="submit" disabled={loading}
              style={{width:'100%',padding:14,borderRadius:11,border:'none',background:'linear-gradient(135deg,#2563eb,#1d4ed8)',color:'#fff',fontWeight:700,fontSize:15,cursor:'pointer',boxShadow:'0 6px 20px rgba(37,99,235,.3)'}}>
              {loading?'Creating Account…':'Create Patient Account →'}
            </button>
          </form>

          <p style={{textAlign:'center',marginTop:20,fontSize:13,color:'#94a3b8'}}>
            Already have an account?{' '}
            <button onClick={()=>navigate('/login')} style={{background:'none',border:'none',color:'#2563eb',fontWeight:600,cursor:'pointer',fontSize:13}}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}