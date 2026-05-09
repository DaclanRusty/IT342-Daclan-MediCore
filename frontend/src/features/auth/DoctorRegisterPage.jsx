import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../shared/api';
import { useGoogleLogin } from '@react-oauth/google';

const SPECS = ['General Medicine','Cardiology','Dermatology','Endocrinology','Gastroenterology','Neurology','Obstetrics & Gynecology','Oncology','Ophthalmology','Orthopedics','Pediatrics','Psychiatry','Pulmonology','Radiology','Surgery','Urology','Other'];

function formatPHPhone(raw) {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('63')) digits = digits.slice(2);
  if (digits.startsWith('0'))  digits = digits.slice(1);
  digits = digits.slice(0, 10);
  let display = '+63 ';
  if (digits.length === 0) return { display: '+63 ', raw: '' };
  if (digits.length <= 3)  return { display: '+63 ' + digits, raw: digits };
  if (digits.length <= 6)  return { display: `+63 ${digits.slice(0,3)} ${digits.slice(3)}`, raw: digits };
  return { display: `+63 ${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6)}`, raw: digits };
}

export default function DoctorRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstname:'', lastname:'', email:'', password:'', confirmPassword:'', phoneNumber:'', specialization:'', licenseNumber:'' });
  const [phoneDisplay, setPhoneDisplay]     = useState('+63 ');
  const [picPreview, setPicPreview]         = useState(null);
  const [agreedTerms, setAgreedTerms]       = useState(false);
  const [agreedAcc, setAgreedAcc]           = useState(false);
  const [showPw, setShowPw]                 = useState(false);
  const [showCpw, setShowCpw]               = useState(false);
  const [loading, setLoading]               = useState(false);
  const [googleLoading, setGoogleLoading]   = useState(false);
  const [error, setError]                   = useState('');
  const [fe, setFe]                         = useState({});
  const [googleVerified, setGoogleVerified] = useState(false);
  const [googleEmail, setGoogleEmail]       = useState('');

  const upd = (f, v) => { setForm(p => ({...p, [f]: v})); setFe(p => ({...p, [f]: ''})); setError(''); };

  const handlePhoneChange = (e) => {
    const { display, raw } = formatPHPhone(e.target.value);
    setPhoneDisplay(display);
    const fullNumber = raw.length > 0 ? `+63${raw}` : '';
    setForm(p => ({ ...p, phoneNumber: fullNumber }));
    setFe(p => ({ ...p, phoneNumber: '' }));
    setError('');
  };

  const handlePic = (e) => {
    const file = e.target.files[0];
    if (file) setPicPreview(URL.createObjectURL(file));
  };

  const handleGoogleVerify = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await res.json();
        setGoogleVerified(true);
        setGoogleEmail(userInfo.email);
        setForm(p => ({
          ...p,
          email:     userInfo.email,
          firstname: userInfo.given_name  || p.firstname,
          lastname:  userInfo.family_name || p.lastname,
        }));
        setFe(p => ({ ...p, email: '' }));
      } catch {
        setError('Failed to verify Google account. Please try again.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => setError('Google verification was cancelled. Please try again.'),
    scope: 'email profile',
  });

  const removeGoogleVerification = () => {
    setGoogleVerified(false);
    setGoogleEmail('');
    setForm(p => ({ ...p, email: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstname.trim())   e.firstname   = 'Required';
    if (!form.lastname.trim())    e.lastname    = 'Required';
    if (!form.email.trim())       e.email       = 'Required';
    else if (!googleVerified)     e.email       = 'Please verify your email using Google first';
    if (form.password.length < 8) e.password    = 'Min 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    const digits = form.phoneNumber.replace(/\D/g,'').replace(/^63/,'');
    if (digits.length !== 10)     e.phoneNumber = 'Enter a valid 10-digit PH number';
    if (!form.specialization)     e.specialization = 'Required';
    if (!form.licenseNumber.trim()) e.licenseNumber = 'Required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFe(errs); return; }
    if (!agreedTerms || !agreedAcc) { setError('Please check both agreement boxes'); return; }
    setLoading(true); setError('');
    try {
      const result = await authApi.registerDoctor({
        firstname:      form.firstname,
        lastname:       form.lastname,
        email:          form.email,
        password:       form.password,
        phoneNumber:    form.phoneNumber,
        specialization: form.specialization,
        licenseNumber:  form.licenseNumber,
      });
      navigate('/login', {
        state: {
          registered: true,
          role: 'doctor',
          message: result?.message || 'Registration submitted! Please wait for secretary approval.',
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inp = (f, ex = {}) => ({
    width: '100%', padding: '11px 12px 11px 38px', borderRadius: 10,
    border: `1.5px solid ${fe[f] ? '#ef4444' : '#e2e8f0'}`,
    fontSize: 14, color: '#0f172a', background: '#fff', boxSizing: 'border-box', ...ex,
  });
  const lbl = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };
  const ic  = { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' };

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", minHeight: '100vh', background: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 40%,#d1fae5 100%)' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap" rel="stylesheet"/>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        .rc { animation: fadeUp .5s ease forwards; }
        input:focus, select:focus { outline: none; border-color: #10b981 !important; }
        .breg { transition: all .2s; }
        .breg:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(16,185,129,.4) !important; }
        .breg:disabled { opacity: .6; cursor: not-allowed; }
        .upl { transition: all .2s; cursor: pointer; }
        .upl:hover { border-color: #10b981 !important; background: rgba(16,185,129,.04) !important; }
        .gvbtn { transition: all .2s; }
        .gvbtn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.15) !important; }
        .gvbtn:disabled { opacity: .6; cursor: not-allowed; }
      `}</style>

      <nav style={{ padding: '0 5%', height: 60, display: 'flex', alignItems: 'center' }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15 }}>M</div>
          <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 17, color: '#1e293b' }}>Medi<span style={{ color: '#10b981' }}>Core</span></span>
        </div>
      </nav>

      <div style={{ padding: '20px 5% 60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,.1)', borderRadius: 20, padding: '5px 14px', color: '#059669', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          Doctor Registration
        </div>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: 8 }}>
          Join Our <span style={{ color: '#10b981' }}>Medical Team</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: 15, marginBottom: 32, textAlign: 'center' }}>
          Register as a healthcare professional and start managing your patient appointments
        </p>

        <div className="rc" style={{ background: '#fff', borderRadius: 24, boxShadow: '0 24px 64px rgba(16,185,129,.13)', padding: 36, width: '100%', maxWidth: 620 }}>
          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 20, color: '#dc2626', fontSize: 13 }}>{error}</div>}

          <form onSubmit={handleSubmit}>

            {/* ── Google Email Verification ──────────────────────────── */}
            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>
                Verify Email with Google <span style={{ color: '#ef4444' }}>*</span>
              </label>
              {!googleVerified ? (
                <>
                  <button
                    type="button"
                    className="gvbtn"
                    onClick={() => handleGoogleVerify()}
                    disabled={googleLoading}
                    style={{
                      width: '100%', padding: '11px 16px', borderRadius: 10,
                      border: `1.5px solid ${fe.email ? '#ef4444' : '#e2e8f0'}`,
                      background: '#fff', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 10, cursor: 'pointer',
                      fontSize: 14, fontWeight: 600, color: '#374151',
                      boxShadow: '0 1px 4px rgba(0,0,0,.08)',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {googleLoading ? 'Verifying…' : 'Continue with Google to verify email'}
                  </button>
                  {fe.email && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{fe.email}</p>}
                  <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 6 }}>
                    This verifies your email is a real Google account. You'll still set your own password below.
                  </p>
                </>
              ) : (
                <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#166534' }}>Google Email Verified</div>
                      <div style={{ fontSize: 12, color: '#16a34a' }}>{googleEmail}</div>
                    </div>
                  </div>
                  <button type="button" onClick={removeGoogleVerification} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* ── Profile Picture ───────────────────────────────────── */}
            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>Profile Picture</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 72, height: 72, borderRadius: 14, border: '1.5px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {picPreview
                    ? <img src={picPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" width="28" height="28"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  }
                </div>
                <div>
                  <label className="upl" htmlFor="pic" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: 13, fontWeight: 600 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Upload Picture
                  </label>
                  <input id="pic" type="file" accept="image/jpeg,image/png" onChange={handlePic} style={{ display: 'none' }}/>
                  <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 5 }}>JPG or PNG</p>
                </div>
              </div>
            </div>

            {/* ── Name ──────────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>First Name <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input value={form.firstname} onChange={e => upd('firstname', e.target.value)} placeholder="Dr. First Name" style={inp('firstname')}/>
                </div>
                {fe.firstname && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{fe.firstname}</p>}
              </div>
              <div>
                <label style={lbl}>Last Name <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input value={form.lastname} onChange={e => upd('lastname', e.target.value)} placeholder="Last Name" style={inp('lastname')}/>
                </div>
                {fe.lastname && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{fe.lastname}</p>}
              </div>
            </div>

            {/* ── Email (read-only after Google verify) ─────────────── */}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input
                  type="email"
                  value={form.email}
                  readOnly={googleVerified}
                  onChange={e => !googleVerified && upd('email', e.target.value)}
                  placeholder={googleVerified ? '' : 'Verify with Google above first'}
                  style={{
                    ...inp('email'),
                    background: googleVerified ? '#f0fdf4' : '#f8fafc',
                    color: googleVerified ? '#166534' : '#94a3b8',
                    cursor: googleVerified ? 'default' : 'not-allowed',
                  }}
                />
                {googleVerified && (
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 700, color: '#16a34a' }}>✓ Verified</span>
                )}
              </div>
            </div>

            {/* ── Passwords ─────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>Password <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => upd('password', e.target.value)} placeholder="Min. 8 characters" style={inp('password', { paddingRight: 38 })}/>
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
                {fe.password && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{fe.password}</p>}
              </div>
              <div>
                <label style={lbl}>Confirm Password <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input type={showCpw ? 'text' : 'password'} value={form.confirmPassword} onChange={e => upd('confirmPassword', e.target.value)} placeholder="Repeat password" style={inp('confirmPassword', { paddingRight: 38 })}/>
                  <button type="button" onClick={() => setShowCpw(!showCpw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
                {fe.confirmPassword && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{fe.confirmPassword}</p>}
              </div>
            </div>

            {/* ── Specialization + License ──────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>Specialization <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  <select value={form.specialization} onChange={e => upd('specialization', e.target.value)}
                    style={{ ...inp('specialization'), paddingRight: 32, appearance: 'none', cursor: 'pointer' }}>
                    <option value="">Select specialization</option>
                    {SPECS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                {fe.specialization && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{fe.specialization}</p>}
              </div>
              <div>
                <label style={lbl}>Medical License No. <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/></svg>
                  <input value={form.licenseNumber} onChange={e => upd('licenseNumber', e.target.value)} placeholder="E.G., MD123456" style={inp('licenseNumber')}/>
                </div>
                {fe.licenseNumber && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{fe.licenseNumber}</p>}
              </div>
            </div>

            {/* ── Phone ─────────────────────────────────────────────── */}
            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>Phone Number <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.1a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/></svg>
                <input
                  type="tel"
                  value={phoneDisplay}
                  onChange={handlePhoneChange}
                  placeholder="+63 9xx xxx xxxx"
                  maxLength={17}
                  style={inp('phoneNumber')}
                />
              </div>
              {fe.phoneNumber
                ? <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{fe.phoneNumber}</p>
                : <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Format: +63 9xx xxx xxxx</p>
              }
            </div>

            {/* ── Checkboxes ────────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)} style={{ accentColor: '#10b981', width: 16, height: 16, marginTop: 2, flexShrink: 0 }}/>
                <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                  I agree to the <button type="button" style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: 0 }}>Terms & Conditions</button> and <button type="button" style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: 0 }}>Privacy Policy</button>
                </span>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={agreedAcc} onChange={e => setAgreedAcc(e.target.checked)} style={{ accentColor: '#10b981', width: 16, height: 16, marginTop: 2, flexShrink: 0 }}/>
                <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                  I confirm that all information provided is accurate and I am a licensed medical professional.
                </span>
              </label>
            </div>

            {/* ── Role notice ───────────────────────────────────────── */}
            <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1px solid #bbf7d0', borderRadius: 10, padding: '11px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" width="15" height="15"><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ fontSize: 13, color: '#059669' }}>Your account will be automatically registered with the <strong>Doctor</strong> role</span>
            </div>

            <button
              className="breg"
              type="submit"
              disabled={loading || !googleVerified}
              style={{
                width: '100%', padding: 14, borderRadius: 11, border: 'none',
                background: googleVerified ? 'linear-gradient(135deg,#10b981,#059669)' : '#e2e8f0',
                color: googleVerified ? '#fff' : '#94a3b8',
                fontWeight: 700, fontSize: 15,
                cursor: googleVerified ? 'pointer' : 'not-allowed',
                boxShadow: googleVerified ? '0 6px 20px rgba(16,185,129,.3)' : 'none',
              }}
            >
              {loading ? 'Creating Account…' : googleVerified ? 'Create Doctor Account →' : 'Verify Google Email First'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#94a3b8' }}>
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}
